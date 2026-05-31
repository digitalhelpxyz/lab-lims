CREATE TABLE `lab_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`labName` varchar(255) NOT NULL,
	`labAddress` text,
	`labPhone` varchar(20),
	`labEmail` varchar(320),
	`logoUrl` text,
	`headerText` text,
	`footerText` text,
	`licenseNumber` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lab_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lab_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testName` varchar(255) NOT NULL,
	`testCode` varchar(50) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`unit` varchar(50),
	`referenceRangeMin` decimal(10,2),
	`referenceRangeMax` decimal(10,2),
	`referenceRangeText` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lab_tests_id` PRIMARY KEY(`id`),
	CONSTRAINT `lab_tests_testCode_unique` UNIQUE(`testCode`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`type` enum('report_ready','order_pending','system','alert') NOT NULL DEFAULT 'system',
	`relatedOrderId` int,
	`relatedReportId` int,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_line_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`testId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_line_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sampleId` varchar(100) NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`age` int,
	`gender` enum('male','female','other'),
	`dateOfBirth` timestamp,
	`phone` varchar(20),
	`email` varchar(320),
	`address` text,
	`doctorName` varchar(100),
	`doctorPhone` varchar(20),
	`doctorEmail` varchar(320),
	`referralNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_sampleId_unique` UNIQUE(`sampleId`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`patientId` int NOT NULL,
	`reportDate` timestamp NOT NULL DEFAULT (now()),
	`doctorRemarks` text,
	`pdfUrl` text,
	`pdfStorageKey` varchar(500),
	`status` enum('draft','pending_approval','approved','finalized') NOT NULL DEFAULT 'draft',
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` enum('create','update','delete') NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`payload` json,
	`synced` boolean NOT NULL DEFAULT false,
	`syncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sync_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`orderDate` timestamp NOT NULL DEFAULT (now()),
	`visitNotes` text,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `test_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`testId` int NOT NULL,
	`resultValue` varchar(255),
	`resultNumeric` decimal(10,2),
	`status` enum('pending','completed','flagged') NOT NULL DEFAULT 'pending',
	`notes` text,
	`enteredBy` int,
	`enteredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `test_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','lab_technician','receptionist') NOT NULL DEFAULT 'receptionist';