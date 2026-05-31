import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { sendOTP, verifyOTP } from "./_core/otp";
import { createSessionToken } from "./_core/auth";
import { upsertUser } from "./db";
import { z } from "zod";
import {
  createPatient,
  getPatientById,
  getAllPatients,
  searchPatients,
  updatePatient,
  createLabTest,
  getLabTestById,
  getAllLabTests,
  getLabTestsByCategory,
  updateLabTest,
  createTestOrder,
  getTestOrderById,
  getPatientOrders,
  updateTestOrderStatus,
  addTestToOrder,
  getOrderTests,
  createTestResult,
  getTestResult,
  getOrderResults,
  updateTestResult,
  createReport,
  getReportById,
  getReportByOrderId,
  getPatientReports,
  getAllReports,
  updateReport,
  getLabConfig,
  updateLabConfig,
  addToSyncQueue,
  getUnsyncedItems,
  markSyncedItem,
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "./db";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";

// Role-based procedure guards
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const labTechnicianProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "lab_technician" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Lab technician access required" });
  }
  return next({ ctx });
});

const receptionistProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "receptionist" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Receptionist access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    // Step 1: Send OTP to email
    sendOtp: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await sendOTP(input.email);
        return { success: true };
      }),

    // Step 2: Verify OTP and create session
    verifyOtp: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string().length(6) }))
      .mutation(async ({ input, ctx }) => {
        const valid = verifyOTP(input.email, input.code);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired OTP" });
        }

        // Create or update user in DB
        const openId = `email_${input.email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        await upsertUser({
          openId,
          email: input.email,
          name: input.email.split("@")[0],
          loginMethod: "email_otp",
          lastSignedIn: new Date(),
        });

        const token = await createSessionToken(openId, input.email);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ PATIENT ROUTERS ============
  patients: router({
    create: receptionistProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          sampleId: z.string().min(1),
          age: z.number().optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          address: z.string().optional(),
          doctorName: z.string().optional(),
          doctorPhone: z.string().optional(),
          doctorEmail: z.string().email().optional(),
          referralNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createPatient(input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getPatientById(input.id);
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return getAllPatients(input.limit, input.offset);
      }),

    search: protectedProcedure
      .input(z.object({ term: z.string().min(1) }))
      .query(async ({ input }) => {
        return searchPatients(input.term);
      }),

    update: receptionistProcedure
      .input(
        z.object({
          id: z.number(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          age: z.number().optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          address: z.string().optional(),
          doctorName: z.string().optional(),
          doctorPhone: z.string().optional(),
          doctorEmail: z.string().email().optional(),
          referralNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updatePatient(id, data);
      }),
  }),

  // ============ LAB TEST ROUTERS ============
  labTests: router({
    create: adminProcedure
      .input(
        z.object({
          testName: z.string().min(1),
          testCode: z.string().min(1),
          category: z.string().min(1),
          description: z.string().optional(),
          unit: z.string().optional(),
          referenceRangeMin: z.number().optional(),
          referenceRangeMax: z.number().optional(),
          referenceRangeText: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const data: any = { ...input };
        if (data.referenceRangeMin !== undefined) {
          data.referenceRangeMin = String(data.referenceRangeMin);
        }
        if (data.referenceRangeMax !== undefined) {
          data.referenceRangeMax = String(data.referenceRangeMax);
        }
        return createLabTest(data);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getLabTestById(input.id);
      }),

    list: protectedProcedure
      .input(z.object({ active: z.boolean().default(true) }))
      .query(async ({ input }) => {
        return getAllLabTests(input.active);
      }),

    listByCategory: protectedProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return getLabTestsByCategory(input.category);
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          testName: z.string().optional(),
          category: z.string().optional(),
          description: z.string().optional(),
          unit: z.string().optional(),
          referenceRangeMin: z.number().optional(),
          referenceRangeMax: z.number().optional(),
          referenceRangeText: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.referenceRangeMin !== undefined) {
          updateData.referenceRangeMin = String(data.referenceRangeMin);
        }
        if (data.referenceRangeMax !== undefined) {
          updateData.referenceRangeMax = String(data.referenceRangeMax);
        }
        return updateLabTest(id, updateData);
      }),
  }),

  // ============ TEST ORDER ROUTERS ============
  testOrders: router({
    create: receptionistProcedure
      .input(
        z.object({
          patientId: z.number(),
          visitNotes: z.string().optional(),
          testIds: z.array(z.number()),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createTestOrder({
          patientId: input.patientId,
          visitNotes: input.visitNotes,
          createdBy: ctx.user.id,
        });

        // Extract orderId from result
        const orderId = typeof result === 'object' && 'insertId' in result 
          ? (result.insertId as number)
          : (result as any).insertId || 0;

        if (!orderId) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create order' });

        for (const testId of input.testIds) {
          await addTestToOrder(orderId, testId);
          // Create pending result entry
          await createTestResult({
            orderId,
            testId,
            status: "pending",
          });
        }

        return { orderId };
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getTestOrderById(input.id);
      }),

    getByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return getPatientOrders(input.patientId);
      }),

    updateStatus: labTechnicianProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "in_progress", "completed", "cancelled"]) }))
      .mutation(async ({ input }) => {
        return updateTestOrderStatus(input.id, input.status);
      }),

    getTests: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return getOrderTests(input.orderId);
      }),
  }),

  // ============ TEST RESULTS ROUTERS ============
  testResults: router({
    create: labTechnicianProcedure
      .input(
        z.object({
          orderId: z.number(),
          testId: z.number(),
          resultValue: z.string().optional(),
          resultNumeric: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createTestResult({
          orderId: input.orderId,
          testId: input.testId,
          resultValue: input.resultValue,
          resultNumeric: input.resultNumeric ? String(input.resultNumeric) : undefined,
          status: "completed",
          notes: input.notes,
          enteredBy: ctx.user.id,
          enteredAt: new Date(),
        });
      }),

    get: protectedProcedure
      .input(z.object({ orderId: z.number(), testId: z.number() }))
      .query(async ({ input }) => {
        return getTestResult(input.orderId, input.testId);
      }),

    getByOrder: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return getOrderResults(input.orderId);
      }),

    update: labTechnicianProcedure
      .input(
        z.object({
          id: z.number(),
          resultValue: z.string().optional(),
          resultNumeric: z.number().optional(),
          status: z.enum(["pending", "completed", "flagged"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return updateTestResult(id, {
          ...data,
          resultNumeric: data.resultNumeric ? String(data.resultNumeric) : undefined,
          enteredBy: ctx.user.id,
          enteredAt: new Date(),
        });
      }),
  }),

  // ============ REPORT ROUTERS ============
  reports: router({
    create: labTechnicianProcedure
      .input(
        z.object({
          orderId: z.number(),
          patientId: z.number(),
          doctorRemarks: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createReport({
          orderId: input.orderId,
          patientId: input.patientId,
          doctorRemarks: input.doctorRemarks,
          status: "draft",
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getReportById(input.id);
      }),

    getByOrder: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return getReportByOrderId(input.orderId);
      }),

    getByPatient: protectedProcedure
      .input(z.object({ patientId: z.number(), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return getPatientReports(input.patientId, input.limit, input.offset);
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return getAllReports(input.limit, input.offset);
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          doctorRemarks: z.string().optional(),
          pdfUrl: z.string().optional(),
          pdfStorageKey: z.string().optional(),
          status: z.enum(["draft", "pending_approval", "approved", "finalized"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };

        if (data.status === "finalized") {
          updateData.approvedBy = ctx.user.id;
          updateData.approvedAt = new Date();

          // Send notification to owner
          const report = await getReportById(id);
          if (report) {
            const patient = await getPatientById(report.patientId);
            if (patient) {
              await notifyOwner({
                title: "Lab Report Ready",
                content: `Report for patient ${patient.firstName} ${patient.lastName} (Sample ID: ${patient.sampleId}) has been finalized and is ready for delivery.`,
              });
            }
          }
        }

        return updateReport(id, updateData);
      }),
  }),

  // ============ LAB CONFIG ROUTERS ============
  labConfig: router({
    get: protectedProcedure.query(async () => {
      return getLabConfig();
    }),

    update: adminProcedure
      .input(
        z.object({
          labName: z.string().optional(),
          labAddress: z.string().optional(),
          labPhone: z.string().optional(),
          labEmail: z.string().email().optional(),
          logoUrl: z.string().optional(),
          headerText: z.string().optional(),
          footerText: z.string().optional(),
          licenseNumber: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return updateLabConfig(input);
      }),
  }),

  // ============ SYNC QUEUE ROUTERS ============
  sync: router({
    addToQueue: protectedProcedure
      .input(
        z.object({
          action: z.enum(["create", "update", "delete"]),
          entityType: z.string(),
          entityId: z.number().optional(),
          payload: z.any().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return addToSyncQueue({
          userId: ctx.user.id,
          action: input.action as any,
          entityType: input.entityType,
          entityId: input.entityId,
          payload: input.payload,
        });
      }),

    getUnsynced: protectedProcedure.query(async ({ ctx }) => {
      return getUnsyncedItems(ctx.user.id);
    }),

    markSynced: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return markSyncedItem(input.id);
      }),
  }),

  // ============ NOTIFICATION ROUTERS ============
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input, ctx }) => {
        return getUserNotifications(ctx.user.id, input.limit);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return markNotificationAsRead(input.id);
      }),
  }),

  // ============ DASHBOARD ROUTERS ============
  dashboard: router({
    getDailySummary: protectedProcedure.query(async () => {
      // This would typically query for today's data
      // For now, returning structure
      return {
        totalPatients: 0,
        pendingTests: 0,
        completedReports: 0,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
