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
  | "REFERENTIEL_UPDATE";

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
  emailChannel: boolean;
  pushChannel: boolean;
  inAppChannel: boolean;
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
