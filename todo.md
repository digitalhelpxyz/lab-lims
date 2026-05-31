# Pathology Lab Portal - Project TODO

## Phase 1: Project Planning & Schema Design
- [x] Design database schema for patients, tests, orders, results, reports
- [x] Plan role-based access control structure (Admin, Lab Technician, Receptionist)
- [x] Design offline sync strategy with IndexedDB
- [x] Plan PDF report generation with lab branding

## Phase 2: Database & Backend API
- [x] Create patients table (name, age, gender, contact, doctor referral, sample ID)
- [x] Create lab_tests table (test name, category, reference ranges, units)
- [x] Create test_orders table (patient, tests assigned, visit date)
- [x] Create test_results table (order, test, result value, timestamp)
- [x] Create reports table (order, PDF URL, status, created date)
- [x] Create lab_config table (lab name, logo URL, branding)
- [x] Create sync_queue table for offline sync tracking
- [x] Implement database migrations
- [x] Add query helpers in server/db.ts
- [x] Create tRPC procedures for all CRUD operations

## Phase 3: Authentication & Role-Based Access
- [x] Set up user roles (Admin, Lab Technician, Receptionist)
- [x] Implement role-based procedure guards
- [ ] Create admin setup/onboarding flow
- [ ] Add lab configuration management (name, logo, contact)
- [x] Implement role-based route protection in frontend

## Phase 4: UI Layout & Navigation
- [x] Design elegant color scheme and typography system
- [x] Create main dashboard layout with sidebar navigation
- [x] Implement role-specific navigation menus
- [x] Build responsive design for mobile/tablet
- [x] Create loading states and error boundaries
- [x] Add global theme provider (light/dark mode optional)

## Phase 5: Patient Registration & Test Catalog
- [x] Build patient registration form (name, age, gender, contact, doctor, sample ID)
- [x] Implement patient list view with search and filtering
- [x] Create test catalog management interface (Admin only)
- [x] Build test CRUD operations (create, edit, delete tests)
- [x] Add test category management
- [x] Implement reference range configuration

## Phase 6: Test Order Management & Result Entry
- [x] Build test order creation interface (assign tests to patient)
- [x] Create order status tracking (pending, in-progress, completed)
- [x] Build result entry interface for lab technicians
- [ ] Implement validation for result values against reference ranges
- [ ] Add result editing and audit trail
- [ ] Create order history view

## Phase 7: PDF Report Generation & Cloud Upload
- [x] Implement PDF report generation with lab header and branding
- [x] Add patient info, test results, reference ranges to report
- [x] Implement doctor remarks section
- [x] Set up cloud file storage integration (S3)
- [x] Implement automatic PDF upload on report generation
- [x] Save report URLs in database
- [x] Create report download/sharing functionality
- [x] Implement print-ready report view

## Phase 8: Offline PWA Support
- [x] Add PWA manifest and service worker
- [x] Implement IndexedDB for local data storage
- [x] Create offline data sync queue
- [x] Implement background sync when connection restored
- [x] Handle conflict resolution during sync
- [ ] Add offline indicator to UI
- [ ] Test offline functionality thoroughly

## Phase 9: Report History & Search
- [x] Build report history view with pagination
- [x] Implement search by patient name
- [ ] Add filtering by date range
- [ ] Add filtering by test type
- [x] Implement report status filtering (pending, completed, archived)
- [ ] Create report detail view
- [ ] Add export functionality

## Phase 10: Automated Notifications
- [x] Implement notification system for report finalization
- [x] Send notification to lab owner/admin when report is ready
- [x] Include patient name and test summary in notification
- [ ] Add notification history/log
- [ ] Implement notification preferences

## Phase 11: Testing & Optimization
- [ ] Write vitest unit tests for all procedures
- [ ] Write component tests for critical UI flows
- [ ] Test offline sync scenarios
- [ ] Test role-based access control
- [ ] Performance optimization
- [ ] Security audit
- [ ] Cross-browser testing

## Phase 12: Delivery
- [ ] Final integration testing
- [ ] Create checkpoint for deployment
- [ ] Document user guide
- [ ] Prepare deployment instructions

## Completed Features
(Items will be moved here as they are completed)
