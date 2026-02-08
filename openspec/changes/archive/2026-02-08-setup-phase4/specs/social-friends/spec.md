## Purpose

Enable users to connect with friends to compare fiscal situations while maintaining strict privacy controls. The friend system uses invitation links with double opt-in confirmation and allows granular control over what data is shared.

## ADDED Requirements

### Requirement: Friend invitation creation

The system SHALL allow users to generate unique invitation links to invite friends to connect.

#### Scenario: Generate invitation link
- **WHEN** user clicks "Invite friend" button
- **THEN** system generates a unique time-limited invitation link (valid 7 days)

#### Scenario: Copy invitation link
- **WHEN** user generates invitation link
- **THEN** system displays link with one-click copy to clipboard functionality

#### Scenario: Invitation link expiration
- **WHEN** invitation link is older than 7 days
- **THEN** system rejects the invitation with message "This invitation has expired"

### Requirement: Friend invitation acceptance

The system SHALL require explicit opt-in from both parties before establishing a friend connection.

#### Scenario: Accept pending invitation
- **WHEN** invited user clicks invitation link and confirms acceptance
- **THEN** system creates pending friend connection awaiting original inviter's confirmation

#### Scenario: Decline invitation
- **WHEN** invited user clicks invitation link and declines
- **THEN** system discards invitation and notifies inviter that invitation was declined

#### Scenario: Double opt-in confirmation
- **WHEN** both users have accepted the friend connection
- **THEN** system establishes active friend relationship and notifies both users

### Requirement: Sharing granularity controls

The system SHALL allow users to configure exactly what fiscal data is shared with each friend.

#### Scenario: Configure sharing level
- **WHEN** user accesses friend settings
- **THEN** system displays three sharing options: "Score only" (soldeNet and ratio), "Summary" (includes totalPaye and totalRecu), "Detailed" (includes all breakdown categories)

#### Scenario: Change sharing level
- **WHEN** user changes sharing level for a friend
- **THEN** system immediately applies new sharing restrictions and notifies the friend of the change

#### Scenario: Asymmetric sharing
- **WHEN** User A shares "Detailed" with User B but User B shares "Score only" with User A
- **THEN** system enforces different visibility levels in each direction independently

### Requirement: Friend connection management

The system SHALL allow users to view, modify, and revoke friend connections at any time.

#### Scenario: View friend list
- **WHEN** user navigates to friends page
- **THEN** system displays all active friends with their sharing status and last activity date

#### Scenario: Revoke friend connection
- **WHEN** user clicks "Remove friend" and confirms
- **THEN** system immediately terminates the connection, stops all data sharing, and notifies the other user

#### Scenario: Block user
- **WHEN** user blocks another user
- **THEN** system prevents that user from sending new friend invitations and removes any existing connection

### Requirement: Privacy protection

The system SHALL never expose fiscal data beyond explicitly granted permissions.

#### Scenario: Unauthorized access attempt
- **WHEN** system receives API request for friend's data without active friendship
- **THEN** system returns 403 Forbidden error without exposing any fiscal information

#### Scenario: Sharing level enforcement
- **WHEN** user requests detailed breakdown for a friend who only shares "Score only"
- **THEN** system returns only soldeNet and ratio values, returning null for all restricted fields

#### Scenario: Connection revocation cleanup
- **WHEN** friend connection is revoked
- **THEN** system immediately purges all cached shared data and prevents future access

### Requirement: Friend activity visibility

The system SHALL show friend activity to encourage engagement while respecting privacy.

#### Scenario: View friend activity
- **WHEN** user views their friend list
- **THEN** system displays last calculation date and achievement badges for each friend (if shared)

#### Scenario: Activity notification
- **WHEN** friend recalculates their score
- **THEN** system optionally notifies user (based on notification preferences)

#### Scenario: Privacy opt-out
- **WHEN** user disables "Show my activity to friends" setting
- **THEN** system hides all activity indicators from friends while maintaining data sharing

### Requirement: Friend search and discovery

The system SHALL allow users to find friends without exposing non-public data.

#### Scenario: Search by email
- **WHEN** user searches for friend by email address
- **THEN** system returns match only if that user has enabled "Allow discovery by email" in settings

#### Scenario: Privacy-first discovery
- **WHEN** user has disabled discovery settings
- **THEN** system never returns that user in search results, even for exact email matches

### Requirement: RGPD compliance for friend data

The system SHALL ensure all friend data handling complies with RGPD requirements.

#### Scenario: Data export includes friend data
- **WHEN** user exports their personal data
- **THEN** system includes list of friend connections, sharing settings, and invitation history

#### Scenario: Account deletion cascade
- **WHEN** user deletes their account
- **THEN** system automatically revokes all friend connections and deletes all shared data caches

#### Scenario: Consent withdrawal
- **WHEN** user revokes consent for social features
- **THEN** system immediately terminates all friendships, deletes invitation history, and disables friend feature access
