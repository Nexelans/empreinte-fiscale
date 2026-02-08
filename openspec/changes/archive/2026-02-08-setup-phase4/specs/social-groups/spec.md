## Purpose

Enable users to create groups (family, colleagues, custom) to compare fiscal situations within a defined community. Groups provide collaborative comparison tools and shared insights while maintaining individual privacy controls.

## ADDED Requirements

### Requirement: Group creation

The system SHALL allow users to create groups with custom names and member management.

#### Scenario: Create new group
- **WHEN** user clicks "Create group" and provides group name
- **THEN** system creates group with user as owner and generates shareable invitation link

#### Scenario: Group name validation
- **WHEN** user attempts to create group with name longer than 50 characters
- **THEN** system rejects creation with validation error

#### Scenario: Group type selection
- **WHEN** user creates group
- **THEN** system allows selection of group type: "Family", "Colleagues", "Friends", or "Custom"

### Requirement: Group membership management

The system SHALL allow group owners to invite members and manage membership.

#### Scenario: Invite member to group
- **WHEN** group owner generates invitation link
- **THEN** system creates time-limited invitation (valid 7 days) with group context

#### Scenario: Accept group invitation
- **WHEN** invited user accepts group invitation
- **THEN** system adds user to group and notifies all members of new addition

#### Scenario: Remove group member
- **WHEN** group owner removes a member
- **THEN** system terminates that user's access to group data and notifies the removed user

#### Scenario: Leave group voluntarily
- **WHEN** group member clicks "Leave group" and confirms
- **THEN** system removes user from group and stops sharing their data with group

### Requirement: Group data sharing

The system SHALL aggregate member fiscal data for group comparison while respecting individual privacy settings.

#### Scenario: View group comparison table
- **WHEN** user views group page
- **THEN** system displays comparison table with columns: Name, Solde Net, Ratio, Total Payé, Total Reçu (based on each member's sharing settings)

#### Scenario: Respect member privacy settings
- **WHEN** group member has set sharing to "Score only"
- **THEN** system displays only soldeNet and ratio in group comparison, showing "—" for restricted fields

#### Scenario: Anonymous comparison mode
- **WHEN** group owner enables "Anonymous mode"
- **THEN** system displays all members as "Member 1", "Member 2" etc. without names

### Requirement: Comparative visualizations

The system SHALL provide visual tools for comparing group members' fiscal situations.

#### Scenario: Radar chart visualization
- **WHEN** user clicks "View radar chart" on group page
- **THEN** system displays radar chart with axes: Total Payé, Total Reçu, Solde Net, Ratio, Confidence Score

#### Scenario: Bar chart comparison
- **WHEN** user selects bar chart view
- **THEN** system displays grouped bar chart comparing all members across selected fiscal metrics

#### Scenario: Filter visualization by metric
- **WHEN** user selects specific metrics to display
- **THEN** system updates visualization to show only selected metrics for all members

### Requirement: Group statistics

The system SHALL calculate aggregate statistics for the group.

#### Scenario: View group averages
- **WHEN** user views group statistics
- **THEN** system displays median and mean values for each shared fiscal metric

#### Scenario: Percentile calculation
- **WHEN** user views their position in group
- **THEN** system displays user's percentile rank for each metric (e.g., "Top 25% for Ratio")

#### Scenario: Group trends
- **WHEN** group has 3+ months of data
- **THEN** system displays trend chart showing group average evolution over time

### Requirement: Group ownership transfer

The system SHALL allow group ownership to be transferred to another member.

#### Scenario: Transfer ownership
- **WHEN** current owner selects new owner and confirms transfer
- **THEN** system transfers all administrative privileges to new owner and notifies all members

#### Scenario: Owner leaves group
- **WHEN** group owner leaves without transferring ownership
- **THEN** system automatically assigns ownership to longest-standing member or prompts for selection

### Requirement: Group archival and deletion

The system SHALL allow groups to be archived or permanently deleted.

#### Scenario: Archive group
- **WHEN** group owner archives group
- **THEN** system preserves all data but prevents new activity, with option to reactivate later

#### Scenario: Delete group
- **WHEN** group owner deletes group after confirmation
- **THEN** system permanently removes group, all comparison data, and notifies all members

#### Scenario: Auto-deletion of inactive groups
- **WHEN** group has no activity for 12 months and only 1 remaining member
- **THEN** system sends deletion warning and auto-deletes after 30 days if no response
