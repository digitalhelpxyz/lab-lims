import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  datetime,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role field for role-based access control.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "lab_technician", "receptionist"]).default("receptionist").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Lab configuration table for storing lab branding and metadata
 */
export const labConfig = mysqlTable("lab_config", {
  id: int("id").autoincrement().primaryKey(),
  labName: varchar("labName", { length: 255 }).notNull(),
  labAddress: text("labAddress"),
  labPhone: varchar("labPhone", { length: 20 }),
  labEmail: varchar("labEmail", { length: 320 }),
  logoUrl: text("logoUrl"),
  headerText: text("headerText"),
  footerText: text("footerText"),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LabConfig = typeof labConfig.$inferSelect;
export type InsertLabConfig = typeof labConfig.$inferInsert;

/**
 * Patients table for storing patient information
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  sampleId: varchar("sampleId", { length: 100 }).notNull().unique(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  dateOfBirth: timestamp("dateOfBirth"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  doctorName: varchar("doctorName", { length: 100 }),
  doctorPhone: varchar("doctorPhone", { length: 20 }),
  doctorEmail: varchar("doctorEmail", { length: 320 }),
  referralNotes: text("referralNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Lab tests catalog table for storing available tests
 */
export const labTests = mysqlTable("lab_tests", {
  id: int("id").autoincrement().primaryKey(),
  testName: varchar("testName", { length: 255 }).notNull(),
  testCode: varchar("testCode", { length: 50 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  unit: varchar("unit", { length: 50 }),
  referenceRangeMin: decimal("referenceRangeMin", { precision: 10, scale: 2 }),
  referenceRangeMax: decimal("referenceRangeMax", { precision: 10, scale: 2 }),
  referenceRangeText: varchar("referenceRangeText", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LabTest = typeof labTests.$inferSelect;
export type InsertLabTest = typeof labTests.$inferInsert;

/**
 * Test orders table for tracking which tests are ordered for which patients
 */
export const testOrders = mysqlTable("test_orders", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  orderDate: timestamp("orderDate").defaultNow().notNull(),
  visitNotes: text("visitNotes"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TestOrder = typeof testOrders.$inferSelect;
export type InsertTestOrder = typeof testOrders.$inferInsert;

/**
 * Order line items table - many-to-many relationship between orders and tests
 */
export const orderLineItems = mysqlTable("order_line_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  testId: int("testId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderLineItem = typeof orderLineItems.$inferSelect;
export type InsertOrderLineItem = typeof orderLineItems.$inferInsert;

/**
 * Test results table for storing individual test results
 */
export const testResults = mysqlTable("test_results", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  testId: int("testId").notNull(),
  resultValue: varchar("resultValue", { length: 255 }),
  resultNumeric: decimal("resultNumeric", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["pending", "completed", "flagged"]).default("pending").notNull(),
  notes: text("notes"),
  enteredBy: int("enteredBy"),
  enteredAt: timestamp("enteredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = typeof testResults.$inferInsert;

/**
 * Reports table for storing generated lab reports
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  patientId: int("patientId").notNull(),
  reportDate: timestamp("reportDate").defaultNow().notNull(),
  doctorRemarks: text("doctorRemarks"),
  pdfUrl: text("pdfUrl"),
  pdfStorageKey: varchar("pdfStorageKey", { length: 500 }),
  status: mysqlEnum("status", ["draft", "pending_approval", "approved", "finalized"]).default("draft").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Sync queue table for tracking offline changes that need to be synced
 */
export const syncQueue = mysqlTable("sync_queue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId"),
  payload: json("payload"),
  synced: boolean("synced").default(false).notNull(),
  syncedAt: timestamp("syncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SyncQueueItem = typeof syncQueue.$inferSelect;
export type InsertSyncQueueItem = typeof syncQueue.$inferInsert;

/**
 * Notifications table for storing notifications sent to users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  type: mysqlEnum("type", ["report_ready", "order_pending", "system", "alert"]).default("system").notNull(),
  relatedOrderId: int("relatedOrderId"),
  relatedReportId: int("relatedReportId"),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
