## Purpose

Système de notifications intelligentes pour maintenir l'engagement via des faits fiscaux quotidiens, alertes calendrier et insights personnalisés.

## Requirements

### Requirement: Notification preferences
The system SHALL allow users to configure their notification preferences with granular control.

#### Scenario: Enable daily facts
- **WHEN** user enables "Fait fiscal du jour" in notification settings
- **THEN** system schedules daily notification at user's preferred time (default: 9am)

#### Scenario: Enable fiscal alerts
- **WHEN** user enables "Alertes calendrier fiscal"
- **THEN** system subscribes user to deadline notifications (tax declaration, taxe foncière, etc.)

#### Scenario: Enable weekly digest
- **WHEN** user enables "Digest hebdomadaire"
- **THEN** system schedules weekly summary email/push on user's preferred day (default: Sunday 6pm)

#### Scenario: Notification channels
- **WHEN** user configures notification preferences
- **THEN** system allows selection of channels: in-app only, email, push notifications, or combinations

### Requirement: Daily tax facts
The system SHALL send opt-in daily notifications with pedagogical fiscal facts personalized to user's profile.

#### Scenario: Daily fact generation
- **WHEN** daily notification job runs
- **THEN** system selects relevant tax fact based on user's profile (e.g., if user has children, prioritize education facts)

#### Scenario: Personalized fact
- **WHEN** generating daily fact notification
- **THEN** system inserts user's actual data where applicable (e.g., "Votre contribution routes = 3,40€ aujourd'hui = prix d'un café ☕")

#### Scenario: Fact variety
- **WHEN** system sends daily facts over multiple days
- **THEN** system ensures no fact is repeated within 30 days

### Requirement: Fiscal calendar alerts
The system SHALL notify users of upcoming fiscal deadlines and important dates.

#### Scenario: Tax declaration reminder
- **WHEN** tax declaration period approaches (30 days, 7 days, 1 day before deadline)
- **THEN** system sends reminder notification with deadline date and link to tax authority website

#### Scenario: Taxe foncière alert
- **WHEN** user is marked as proprietaire and taxe foncière payment date approaches
- **THEN** system sends reminder 15 days and 3 days before payment deadline

#### Scenario: Barème update notification
- **WHEN** new fiscal year barèmes are published in Référentiel
- **THEN** system notifies user that updated calculation is available with link to recalculate score

### Requirement: Event-triggered notifications
The system SHALL send contextual notifications based on user actions or detected events.

#### Scenario: Profile change detection
- **WHEN** user updates situation fields (marital status, children, location)
- **THEN** system sends notification: "Votre situation a changé. Recalculer votre score ?"

#### Scenario: Confidence score improvement
- **WHEN** user uploads document that improves confidence score by >10%
- **THEN** system sends congratulatory notification showing before/after confidence percentage

#### Scenario: Milestone crossed
- **WHEN** user's score changes status (from beneficiary to contributor or vice versa)
- **THEN** system sends notification explaining the milestone with educational context

#### Scenario: Streak reminder
- **WHEN** user has active streak ≥7 days and hasn't logged today (at 8pm)
- **THEN** system sends gentle reminder: "📅 Ne perdez pas votre série de X jours !"

### Requirement: Weekly digest
The system SHALL compile a weekly personalized summary of fiscal activity and insights.

#### Scenario: Digest compilation
- **WHEN** weekly digest job runs for subscribed user
- **THEN** system compiles: journal entries count, total taxes paid this week, new badges/achievements, current streak, and one personalized insight

#### Scenario: Empty week handling
- **WHEN** user has no activity during week
- **THEN** system sends motivational digest: "Aucune activité cette semaine. Scannez un ticket pour suivre vos taxes quotidiennes !"

#### Scenario: Digest format
- **WHEN** sending weekly digest
- **THEN** system formats as visually appealing email/push with sections: "Cette semaine en chiffres", "Vos accomplissements", "Le saviez-vous ?"

### Requirement: Notification delivery
The system SHALL deliver notifications via selected channels with appropriate fallbacks.

#### Scenario: Push notification delivery
- **WHEN** push notification is enabled and device token is valid
- **THEN** system sends push notification via notification service (OneSignal/FCM)

#### Scenario: Email delivery
- **WHEN** email notifications are enabled
- **THEN** system sends formatted email via email service with unsubscribe link

#### Scenario: In-app notification
- **WHEN** any notification is triggered
- **THEN** system creates in-app notification record visible in notification center

#### Scenario: Delivery failure handling
- **WHEN** push notification fails (invalid token)
- **THEN** system falls back to email if enabled, otherwise marks as in-app only

### Requirement: Notification history
The system SHALL maintain a history of sent notifications for user reference.

#### Scenario: Notification center
- **WHEN** user opens notification center
- **THEN** system displays chronological list of all notifications (read/unread status)

#### Scenario: Mark as read
- **WHEN** user clicks on notification
- **THEN** system marks notification as read and navigates to relevant page

#### Scenario: Clear all notifications
- **WHEN** user clicks "Tout marquer comme lu"
- **THEN** system marks all notifications as read and updates UI

### Requirement: Notification timing
The system SHALL respect user's timezone and quiet hours.

#### Scenario: Timezone awareness
- **WHEN** sending scheduled notification
- **THEN** system uses user's configured timezone for delivery time

#### Scenario: Quiet hours
- **WHEN** notification is scheduled during user's quiet hours (default: 10pm-8am)
- **THEN** system queues notification for delivery at next allowed time (8am)

### Requirement: Unsubscribe
The system SHALL allow easy unsubscription from any notification type.

#### Scenario: Unsubscribe from email
- **WHEN** user clicks unsubscribe link in notification email
- **THEN** system disables that notification type and confirms via landing page

#### Scenario: Global opt-out
- **WHEN** user disables all notifications in settings
- **THEN** system stops all notification delivery except critical account security notifications

### Requirement: Notification testing
The system SHALL allow users to preview notifications before enabling.

#### Scenario: Send test notification
- **WHEN** user clicks "Envoyer un test" in notification settings
- **THEN** system immediately sends sample notification via selected channel

### Requirement: Rate limiting
The system SHALL limit notification frequency to prevent overwhelming users.

#### Scenario: Daily limit
- **WHEN** system attempts to send more than 5 notifications to user in one day
- **THEN** system batches additional notifications into next digest

#### Scenario: Duplicate prevention
- **WHEN** system detects duplicate notification within 24 hours
- **THEN** system skips sending duplicate and logs prevention

### Requirement: Notification analytics
The system SHALL track notification engagement for optimization.

#### Scenario: Engagement tracking
- **WHEN** user receives notification
- **THEN** system tracks: delivery status, open rate, click-through rate, action taken

#### Scenario: Opt-out analysis
- **WHEN** user unsubscribes from notification type
- **THEN** system records reason (if provided) for future optimization

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
