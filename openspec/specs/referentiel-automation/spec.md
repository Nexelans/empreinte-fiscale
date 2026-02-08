## Purpose

Automate the collection and integration of fiscal reference data from official French government sources (data.gouv.fr, INSEE, Legifrance) while maintaining data quality through staging review and admin approval workflows.

## Requirements

### Requirement: Automated data source polling

The system SHALL periodically check official sources for new or updated fiscal data.

#### Scenario: Daily source polling
- **WHEN** scheduled job runs daily at 2 AM
- **THEN** system queries data.gouv.fr, INSEE API, and RSS feeds for fiscal data updates

#### Scenario: Detect new data publication
- **WHEN** polling detects new dataset version or publication
- **THEN** system creates ReferentielUpdate record with status "DETECTED" and notifies admins

#### Scenario: Source availability failure
- **WHEN** data source is unreachable for 3 consecutive attempts
- **THEN** system creates alert and notifies admin of source failure

### Requirement: Data extraction and transformation

The system SHALL parse source data into standardized Referentiel format.

#### Scenario: Parse CSV data from data.gouv.fr
- **WHEN** system downloads fiscal CSV file
- **THEN** system validates schema, transforms to Referentiel format, and stages for review

#### Scenario: Parse JSON from INSEE API
- **WHEN** system fetches statistics from INSEE API
- **THEN** system extracts relevant fields, applies unit conversions, and maps to Referentiel categories

#### Scenario: Handle parsing errors
- **WHEN** source data format doesn't match expected schema
- **THEN** system logs error with diff details, marks update as "FAILED", and notifies admin

### Requirement: Staging environment for updates

The system SHALL stage all automated updates for admin review before production.

#### Scenario: Create staging update
- **WHEN** pipeline successfully extracts and transforms data
- **THEN** system creates staging Referentiel entry with status "PENDING_REVIEW"

#### Scenario: Preview staged changes
- **WHEN** admin views pending update
- **THEN** system displays side-by-side comparison: current production value vs. proposed staged value

#### Scenario: Bulk staging review
- **WHEN** admin accesses staging dashboard
- **THEN** system displays all pending updates grouped by source and category

### Requirement: Admin approval workflow

The system SHALL require explicit admin approval before applying staged updates to production.

#### Scenario: Approve staged update
- **WHEN** admin clicks "Approve" on staged update
- **THEN** system applies update to production Referentiel and marks as "APPROVED"

#### Scenario: Reject staged update
- **WHEN** admin clicks "Reject" and provides reason
- **THEN** system marks update as "REJECTED", logs reason, and optionally creates correction task

#### Scenario: Bulk approval
- **WHEN** admin selects multiple staged updates and clicks "Approve all"
- **THEN** system applies all selected updates atomically and creates audit log entry

### Requirement: Data source configuration

The system SHALL allow admins to configure data sources and polling schedules.

#### Scenario: Add new data source
- **WHEN** admin creates new data source configuration
- **THEN** system validates URL, authentication, and schedules first polling run

#### Scenario: Configure polling frequency
- **WHEN** admin sets source polling interval
- **THEN** system updates cron schedule (options: hourly, daily, weekly, monthly)

#### Scenario: Disable data source
- **WHEN** admin disables a data source
- **THEN** system stops polling and marks all pending updates from that source as "SOURCE_DISABLED"

### Requirement: Manual data entry interface

The system SHALL provide admin interface for manual Referentiel entry when automation isn't possible.

#### Scenario: Create manual Referentiel entry
- **WHEN** admin uses manual entry form
- **THEN** system displays validated form for: millesime, categorie, cle, valeur, unite, source, urlSource, statut

#### Scenario: Manual entry validation
- **WHEN** admin submits manual entry
- **THEN** system validates required fields, checks for duplicates, and requires source URL

#### Scenario: Manual entry audit trail
- **WHEN** manual entry is created
- **THEN** system logs admin user, timestamp, and entry details in AdminLog table

### Requirement: Update notification system

The system SHALL notify admins and users about reference data updates.

#### Scenario: Admin notification for new data
- **WHEN** automated pipeline stages updates
- **THEN** system sends email to admins: "5 new fiscal data updates pending review"

#### Scenario: User notification for approved updates
- **WHEN** admin approves update affecting user calculations
- **THEN** system creates in-app notification: "New 2027 tax brackets available. Recalculate your score?"

#### Scenario: Notification suppression for minor updates
- **WHEN** update affects only non-user-facing reference data
- **THEN** system skips user notifications but maintains admin visibility

### Requirement: Audit trail for all changes

The system SHALL maintain complete history of all Referentiel modifications.

#### Scenario: Log every change
- **WHEN** any Referentiel entry is created, updated, or deleted
- **THEN** system creates audit record with: admin user, timestamp, operation, old value, new value, reason

#### Scenario: View audit history
- **WHEN** admin views Referentiel entry detail page
- **THEN** system displays chronological audit trail with all modifications

#### Scenario: Filter audit log
- **WHEN** admin accesses audit log page
- **THEN** system allows filtering by: admin user, date range, category, operation type

### Requirement: Data quality validation

The system SHALL validate all updates against business rules before staging.

#### Scenario: Validate data types
- **WHEN** system processes update
- **THEN** system checks valeur field matches expected type (number, percentage, JSON object)

#### Scenario: Validate reference integrity
- **WHEN** update references another Referentiel entry
- **THEN** system verifies referenced entry exists and is valid

#### Scenario: Validate source credibility
- **WHEN** update comes from unknown source
- **THEN** system flags for manual review and requires admin verification of source legitimacy

### Requirement: Rollback capability

The system SHALL allow admins to rollback erroneous updates.

#### Scenario: Rollback single update
- **WHEN** admin clicks "Rollback" on approved update
- **THEN** system restores previous value and creates audit entry with rollback reason

#### Scenario: Rollback batch update
- **WHEN** admin selects multiple updates and clicks "Rollback batch"
- **THEN** system reverts all selected changes atomically

#### Scenario: User notification after rollback
- **WHEN** rollback affects user-visible data
- **THEN** system notifies affected users: "Recent data update was corrected. Please recalculate your score."

### Requirement: Source health monitoring

The system SHALL monitor the health and reliability of data sources.

#### Scenario: Track source uptime
- **WHEN** system polls data sources
- **THEN** system records success/failure status and calculates uptime percentage

#### Scenario: Alert on source degradation
- **WHEN** source uptime drops below 90% over 7 days
- **THEN** system creates alert for admin review and investigation

#### Scenario: Display source health dashboard
- **WHEN** admin views monitoring dashboard
- **THEN** system displays: source uptime, last successful poll, pending updates, error rate
