## Purpose

Extend smart notifications to include alerts for reference data updates and social interactions (friend requests, group invitations, leaderboard changes).

## ADDED Requirements

### Requirement: Reference data update notifications

The system SHALL notify users when fiscal reference data affecting their calculations is updated.

#### Scenario: Notify on approved Referentiel update
- **WHEN** admin approves Referentiel update that affects user's score calculation
- **THEN** system sends notification: "New 2027 tax brackets available. Recalculate your score to see the impact."

#### Scenario: Opt-in for Referentiel notifications
- **WHEN** user accesses notification preferences
- **THEN** system displays toggle: "Notify me when tax data is updated"

#### Scenario: Batch Referentiel update notifications
- **WHEN** multiple related updates are approved simultaneously
- **THEN** system sends single grouped notification instead of multiple individual alerts

### Requirement: Social interaction notifications

The system SHALL notify users of friend requests, group invitations, and social activity.

#### Scenario: Friend request notification
- **WHEN** user receives friend invitation
- **THEN** system sends in-app and optional push notification with inviter's name and accept/decline actions

#### Scenario: Friend acceptance notification
- **WHEN** friend accepts connection
- **THEN** system notifies both users: "You're now connected with [Name]. Start comparing your fiscal scores!"

#### Scenario: Group invitation notification
- **WHEN** user is invited to group
- **THEN** system sends notification with group name, inviter, member count, and join/decline buttons

#### Scenario: Group activity notification
- **WHEN** new member joins user's group
- **THEN** system notifies all members: "[Name] joined [Group Name]"

### Requirement: Leaderboard position notifications

The system SHALL notify users of significant leaderboard ranking changes.

#### Scenario: Rank improvement notification
- **WHEN** user's leaderboard position improves by 5+ ranks
- **THEN** system sends optional notification: "You moved up to #3 in the friend leaderboard! 🎉"

#### Scenario: Friend surpassed notification
- **WHEN** friend's score surpasses user's score
- **THEN** system sends playful notification: "[Friend] just passed you on the leaderboard. Time to recalculate?"

#### Scenario: Leaderboard opt-out for notifications
- **WHEN** user finds leaderboard notifications annoying
- **THEN** system provides granular toggle: "Notify me about leaderboard changes"

### Requirement: Social notification channels

The system SHALL respect user's channel preferences for social notifications.

#### Scenario: Social notification channel selection
- **WHEN** user configures social notification preferences
- **THEN** system allows separate channel selection for: friend requests, group invites, leaderboard updates

#### Scenario: In-app only for sensitive social
- **WHEN** user enables "In-app only" for social notifications
- **THEN** system never sends email or push for social events, only in-app notifications

### Requirement: Social notification digest

The system SHALL group multiple social notifications to avoid overwhelming users.

#### Scenario: Daily social digest
- **WHEN** user receives 5+ social notifications in a day
- **THEN** system switches to digest mode: single notification summarizing all social activity

#### Scenario: Digest opt-in
- **WHEN** user prefers fewer notifications
- **THEN** system offers "Social digest" mode: single daily summary instead of real-time alerts
