## Purpose

Provide comprehensive administrative dashboard for system monitoring, user support, reference data management, and analytics. The interface is role-protected and maintains audit trails for all sensitive operations.

## ADDED Requirements

### Requirement: Admin authentication and authorization

The system SHALL restrict admin interface access to authorized personnel only.

#### Scenario: Admin role assignment
- **WHEN** user is assigned admin role
- **THEN** system grants access to `/admin` routes and displays admin navigation option

#### Scenario: Role-based access control
- **WHEN** non-admin user attempts to access `/admin` routes
- **THEN** system returns 403 Forbidden and logs unauthorized access attempt

#### Scenario: Admin activity logging
- **WHEN** admin performs any action
- **THEN** system logs admin ID, action type, timestamp, and affected resources in AdminLog table

### Requirement: System monitoring dashboard

The system SHALL display real-time system health and performance metrics.

#### Scenario: View system overview
- **WHEN** admin accesses dashboard home
- **THEN** system displays: active users count, API response times, database connection status, job queue length

#### Scenario: Error rate monitoring
- **WHEN** error rate exceeds threshold (5% of requests)
- **THEN** system displays prominent warning with link to error log

#### Scenario: Job execution status
- **WHEN** admin views scheduled jobs section
- **THEN** system displays: last run time, next scheduled time, success/failure status for all cron jobs

### Requirement: User management interface

The system SHALL allow admins to view and manage user accounts.

#### Scenario: Search users
- **WHEN** admin enters search query
- **THEN** system searches by email, name, or user ID and displays matching accounts

#### Scenario: View user details
- **WHEN** admin clicks on user
- **THEN** system displays: account info, profile completion, score history, activity log, linked friends/groups

#### Scenario: Suspend user account
- **WHEN** admin clicks "Suspend" and provides reason
- **THEN** system disables account, logs suspension reason, and notifies user via email

#### Scenario: Delete user account (RGPD compliance)
- **WHEN** admin initiates user deletion
- **THEN** system executes full RGPD deletion process and logs permanent deletion

### Requirement: Reference data management

The system SHALL provide interface for reviewing and managing Referentiel entries.

#### Scenario: Browse Referentiel entries
- **WHEN** admin accesses Referentiel management
- **THEN** system displays filterable table: millesime, categorie, cle, valeur, source, statut

#### Scenario: Edit Referentiel entry
- **WHEN** admin modifies entry and saves
- **THEN** system creates new version with updated millesime, preserves history, and logs change

#### Scenario: Review staged updates
- **WHEN** admin views pending updates section
- **THEN** system displays all staged automated updates with approve/reject actions

### Requirement: Analytics and usage metrics

The system SHALL display application usage statistics and trends.

#### Scenario: View user growth metrics
- **WHEN** admin accesses analytics dashboard
- **THEN** system displays: new signups per day, active users, retention rate, churn rate

#### Scenario: Feature usage statistics
- **WHEN** admin views feature analytics
- **THEN** system displays usage counts: score calculations, document uploads, simulations run, quiz attempts

#### Scenario: Export analytics data
- **WHEN** admin clicks "Export analytics"
- **THEN** system generates CSV with daily metrics for selected date range

### Requirement: Support ticket system

The system SHALL allow admins to view and respond to user support requests.

#### Scenario: View support queue
- **WHEN** admin accesses support dashboard
- **THEN** system displays all open tickets sorted by priority and creation date

#### Scenario: Assign ticket to admin
- **WHEN** admin clicks "Assign to me" on ticket
- **THEN** system updates ticket owner and notifies team of assignment

#### Scenario: Respond to support ticket
- **WHEN** admin submits response
- **THEN** system sends email to user, updates ticket status, and logs response in ticket history

#### Scenario: Close support ticket
- **WHEN** admin marks ticket as resolved
- **THEN** system archives ticket, sends closure notification to user, and updates support metrics

### Requirement: Notification management

The system SHALL allow admins to send system-wide or targeted notifications.

#### Scenario: Create system notification
- **WHEN** admin composes notification and selects target audience
- **THEN** system previews notification and requires confirmation before sending

#### Scenario: Schedule notification
- **WHEN** admin sets future send time
- **THEN** system queues notification for specified time and displays in scheduled notifications list

#### Scenario: Cancel scheduled notification
- **WHEN** admin cancels scheduled notification before send time
- **THEN** system removes from queue and logs cancellation reason

### Requirement: Security audit log

The system SHALL maintain searchable log of all security-relevant events.

#### Scenario: View security events
- **WHEN** admin accesses security log
- **THEN** system displays: failed login attempts, unauthorized access, privilege changes, data exports

#### Scenario: Filter security log
- **WHEN** admin applies filters
- **THEN** system filters by: event type, user, IP address, date range, severity level

#### Scenario: Alert on suspicious activity
- **WHEN** system detects pattern like 10+ failed logins from same IP
- **THEN** system creates high-priority alert visible in admin dashboard

### Requirement: Database maintenance tools

The system SHALL provide tools for database health and maintenance.

#### Scenario: View database statistics
- **WHEN** admin accesses database tools
- **THEN** system displays: table sizes, row counts, index usage, query performance stats

#### Scenario: Run data integrity check
- **WHEN** admin clicks "Check data integrity"
- **THEN** system validates foreign keys, checks for orphaned records, and reports issues

#### Scenario: Schedule database backup
- **WHEN** admin configures backup schedule
- **THEN** system creates automated backup job and notifies admin of success/failure

### Requirement: Feature flag management

The system SHALL allow admins to enable/disable features globally or for specific users.

#### Scenario: Toggle global feature flag
- **WHEN** admin disables feature flag
- **THEN** system immediately hides feature from all users and returns "Feature unavailable" message

#### Scenario: Enable feature for beta users
- **WHEN** admin enables feature for specific user group
- **THEN** system grants access only to users in beta group

#### Scenario: View feature flag status
- **WHEN** admin accesses feature flags page
- **THEN** system displays all flags with: current status, affected users count, last modified date

### Requirement: Admin role delegation

The system SHALL support multiple admin roles with different permission levels.

#### Scenario: Create admin role
- **WHEN** super admin creates new role
- **THEN** system allows selection of permissions: user management, referentiel editing, system config, analytics view

#### Scenario: Assign role to admin
- **WHEN** super admin assigns role to user
- **THEN** system grants specified permissions and logs role assignment

#### Scenario: Audit admin permissions
- **WHEN** super admin views admin list
- **THEN** system displays each admin's roles, permissions, and recent activity

### Requirement: Performance optimization tools

The system SHALL provide tools for identifying and resolving performance issues.

#### Scenario: View slow queries
- **WHEN** admin accesses performance dashboard
- **THEN** system displays queries exceeding 1 second with execution time and frequency

#### Scenario: Cache management
- **WHEN** admin clicks "Clear cache"
- **THEN** system flushes application cache and logs cache clear event

#### Scenario: API endpoint monitoring
- **WHEN** admin views API metrics
- **THEN** system displays: endpoint URL, avg response time, request count, error rate
