/**
 * Type definitions for the Smart Notifications system
 */

export type NotificationType =
  | "DAILY_FACT"
  | "FISCAL_ALERT"
  | "WEEKLY_DIGEST"
  | "EVENT_TRIGGERED"
  | "BADGE_EARNED"
  | "CHALLENGE_COMPLETED"
  | "LEVEL_UP"
  | "STREAK_REMINDER"
  | "SCORE_RECALCULATION_AVAILABLE"
  | "REFERENTIEL_UPDATE"
  | "FRIEND_REQUEST"
  | "GROUP_INVITE"
  | "LEADERBOARD_CHANGE"
  | "SOCIAL_DIGEST";

export type NotificationChannel = "email" | "push" | "in-app";

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  scheduledFor?: Date; // For delayed notifications
}

export interface NotificationPreferences {
  dailyFactsEnabled: boolean;
  fiscalAlertsEnabled: boolean;
  weeklyDigestEnabled: boolean;
  socialNotificationsEnabled: boolean; // Master toggle for social features
  socialDigestMode: boolean; // Group 5+ social notifications into daily summary
  emailChannel: boolean;
  pushChannel: boolean;
  inAppChannel: boolean;
  socialEmailChannel: boolean; // Separate email toggle for social notifications
  socialPushChannel: boolean; // Separate push toggle for social notifications
  quietHoursStart: number; // 0-23
  quietHoursEnd: number; // 0-23
  timezone: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  titleTemplate: string;
  bodyTemplate: string;
  channels: NotificationChannel[];
  requiresUserPreference?: keyof NotificationPreferences;
}

export interface NotificationDeliveryResult {
  success: boolean;
  channel: NotificationChannel;
  error?: string;
  timestamp: Date;
}

export interface SendNotificationResult {
  notificationId: string;
  deliveryResults: NotificationDeliveryResult[];
  allSuccessful: boolean;
}

export interface DailyFactContext {
  userName: string;
  contribution?: number;
  serviceName?: string;
  factText: string;
}

export interface FiscalAlertContext {
  alertType: "deadline" | "update" | "threshold";
  title: string;
  description: string;
  deadline?: Date;
  actionUrl?: string;
}

export interface WeeklyDigestContext {
  weekStart: Date;
  weekEnd: Date;
  entriesCount: number;
  taxesPaid: number;
  servicesReceived: number;
  streakDays: number;
  badgesEarned: number;
  challengesCompleted: number;
}

export interface EventTriggeredContext {
  eventType: string;
  title: string;
  description: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface ReferentielUpdateContext {
  millesime: string;
  categoriesUpdated: number;
  impactDescription: string;
  recalculationUrl: string;
}

export interface FriendRequestContext {
  fromUserId: string;
  fromUserName: string;
  message?: string;
  acceptUrl: string;
  declineUrl: string;
}

export interface GroupInviteContext {
  groupId: string;
  groupName: string;
  invitedBy: string;
  memberCount: number;
  joinUrl: string;
}

export interface LeaderboardChangeContext {
  previousPosition: number;
  newPosition: number;
  leaderboardType: 'friends' | 'group' | 'national';
  leaderboardName?: string;
  leaderboardUrl: string;
}

export interface SocialDigestContext {
  friendRequests: number;
  groupInvites: number;
  leaderboardChanges: number;
  totalNotifications: number;
  periodStart: Date;
  periodEnd: Date;
}
