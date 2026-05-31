import { eq, and, desc, asc, like, between, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  patients,
  labTests,
  testOrders,
  orderLineItems,
  testResults,
  reports,
  labConfig,
  syncQueue,
  notifications,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ PATIENT QUERIES ============

export async function createPatient(data: typeof patients.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(patients).values(data);
  return result;
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result[0];
}

export async function getAllPatients(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(patients).orderBy(desc(patients.createdAt)).limit(limit).offset(offset);
}

export async function searchPatients(searchTerm: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select()
    .from(patients)
    .where(
      or(
        like(patients.firstName, `%${searchTerm}%`),
        like(patients.lastName, `%${searchTerm}%`),
        like(patients.sampleId, `%${searchTerm}%`),
        like(patients.email, `%${searchTerm}%`)
      )
    )
    .orderBy(desc(patients.createdAt));
}

export async function updatePatient(id: number, data: Partial<typeof patients.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(patients).set(data).where(eq(patients.id, id));
}

// ============ LAB TEST QUERIES ============

export async function createLabTest(data: typeof labTests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(labTests).values(data);
}

export async function getLabTestById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(labTests).where(eq(labTests.id, id)).limit(1);
  return result[0];
}

export async function getAllLabTests(active = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const query = active ? db.select().from(labTests).where(eq(labTests.isActive, true)) : db.select().from(labTests);
  return query.orderBy(asc(labTests.category), asc(labTests.testName));
}

export async function getLabTestsByCategory(category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(labTests).where(eq(labTests.category, category)).orderBy(asc(labTests.testName));
}

export async function updateLabTest(id: number, data: Partial<typeof labTests.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(labTests).set(data).where(eq(labTests.id, id));
}

// ============ TEST ORDER QUERIES ============

export async function createTestOrder(data: typeof testOrders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(testOrders).values(data);
}

export async function getTestOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(testOrders).where(eq(testOrders.id, id)).limit(1);
  return result[0];
}

export async function getPatientOrders(patientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(testOrders).where(eq(testOrders.patientId, patientId)).orderBy(desc(testOrders.orderDate));
}

export async function updateTestOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(testOrders).set({ status: status as any }).where(eq(testOrders.id, id));
}

// ============ ORDER LINE ITEMS QUERIES ============

export async function addTestToOrder(orderId: number, testId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(orderLineItems).values({ orderId, testId });
}

export async function getOrderTests(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select({
      lineItem: orderLineItems,
      test: labTests,
    })
    .from(orderLineItems)
    .innerJoin(labTests, eq(orderLineItems.testId, labTests.id))
    .where(eq(orderLineItems.orderId, orderId));
}

// ============ TEST RESULTS QUERIES ============

export async function createTestResult(data: typeof testResults.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(testResults).values(data);
}

export async function getTestResult(orderId: number, testId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(testResults)
    .where(and(eq(testResults.orderId, orderId), eq(testResults.testId, testId)))
    .limit(1);
  
  return result[0];
}

export async function getOrderResults(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select({
      result: testResults,
      test: labTests,
    })
    .from(testResults)
    .innerJoin(labTests, eq(testResults.testId, labTests.id))
    .where(eq(testResults.orderId, orderId));
}

export async function updateTestResult(id: number, data: Partial<typeof testResults.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(testResults).set(data).where(eq(testResults.id, id));
}

// ============ REPORT QUERIES ============

export async function createReport(data: typeof reports.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(reports).values(data);
}

export async function getReportById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return result[0];
}

export async function getReportByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(reports).where(eq(reports.orderId, orderId)).limit(1);
  return result[0];
}

export async function getPatientReports(patientId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select()
    .from(reports)
    .where(eq(reports.patientId, patientId))
    .orderBy(desc(reports.reportDate))
    .limit(limit)
    .offset(offset);
}

export async function getAllReports(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select()
    .from(reports)
    .orderBy(desc(reports.reportDate))
    .limit(limit)
    .offset(offset);
}

export async function updateReport(id: number, data: Partial<typeof reports.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(reports).set(data).where(eq(reports.id, id));
}

// ============ LAB CONFIG QUERIES ============

export async function getLabConfig() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(labConfig).limit(1);
  return result[0];
}

export async function updateLabConfig(data: Partial<typeof labConfig.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getLabConfig();
  if (existing) {
    return db.update(labConfig).set(data).where(eq(labConfig.id, existing.id));
  } else {
    return db.insert(labConfig).values(data as any);
  }
}

// ============ SYNC QUEUE QUERIES ============

export async function addToSyncQueue(data: typeof syncQueue.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(syncQueue).values(data);
}

export async function getUnsyncedItems(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(syncQueue).where(and(eq(syncQueue.userId, userId), eq(syncQueue.synced, false)));
}

export async function markSyncedItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(syncQueue).set({ synced: true, syncedAt: new Date() }).where(eq(syncQueue.id, id));
}

// ============ NOTIFICATION QUERIES ============

export async function createNotification(data: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}

// Helper function for OR conditions
function or(...conditions: any[]) {
  return conditions.reduce((acc, cond) => acc || cond);
}
