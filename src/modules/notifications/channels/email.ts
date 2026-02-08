import type { NotificationPayload, NotificationDeliveryResult } from "../types";

/**
 * Email notification channel
 * Sends emails via SendGrid or Resend
 *
 * Setup:
 * 1. Install: npm install @sendgrid/mail OR npm install resend
 * 2. Add to .env: SENDGRID_API_KEY or RESEND_API_KEY
 * 3. Add to .env: EMAIL_FROM="noreply@empreinte-fiscale.fr"
 */

interface EmailProvider {
  send(options: EmailOptions): Promise<void>;
}

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Initialize email provider based on environment variables
 */
function getEmailProvider(): EmailProvider | null {
  const sendGridKey = process.env.SENDGRID_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  // For MVP: Email packages not installed yet
  // Return null to use in-app notifications only
  if (sendGridKey || resendKey) {
    console.warn(
      "[EmailChannel] Email providers not installed. Install @sendgrid/mail or resend to enable email notifications."
    );
  }

  return null;
}

/**
 * SendGrid provider implementation (STUB - package not installed)
 * To enable: npm install @sendgrid/mail
 */
function getSendGridProvider(apiKey: string): EmailProvider {
  throw new Error("SendGrid not installed. Run: npm install @sendgrid/mail");
}

/**
 * Resend provider implementation (STUB - package not installed)
 * To enable: npm install resend
 */
function getResendProvider(apiKey: string): EmailProvider {
  throw new Error("Resend not installed. Run: npm install resend");
}

/**
 * Send email notification
 */
export async function sendEmailNotification(
  payload: NotificationPayload,
  userEmail: string
): Promise<NotificationDeliveryResult> {
  const startTime = new Date();

  try {
    const provider = getEmailProvider();

    if (!provider) {
      return {
        success: false,
        channel: "email",
        error: "No email provider configured",
        timestamp: startTime,
      };
    }

    const emailFrom = process.env.EMAIL_FROM || "noreply@empreinte-fiscale.fr";

    // Generate HTML email body
    const html = generateEmailHTML(payload);

    await provider.send({
      to: userEmail,
      from: emailFrom,
      subject: payload.title,
      text: payload.body,
      html,
    });

    return {
      success: true,
      channel: "email",
      timestamp: startTime,
    };
  } catch (error) {
    console.error("[EmailChannel] Failed to send email:", error);
    return {
      success: false,
      channel: "email",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: startTime,
    };
  }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(payload: NotificationPayload): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(payload.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    .logo {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .title {
      color: #1f2937;
      font-size: 24px;
      font-weight: 700;
      margin: 10px 0;
    }
    .body {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.8;
      margin: 20px 0;
    }
    .cta {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(to right, #3b82f6, #6366f1);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 14px;
    }
    .footer a {
      color: #6366f1;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏛️</div>
      <h1 class="title">${escapeHtml(payload.title)}</h1>
    </div>

    <div class="body">
      ${escapeHtml(payload.body).replace(/\n/g, "<br>")}
    </div>

    ${
      payload.data?.actionUrl
        ? `
    <div class="cta">
      <a href="${escapeHtml(payload.data.actionUrl)}" class="button">
        ${escapeHtml(payload.data.actionLabel || "Voir plus")}
      </a>
    </div>
    `
        : ""
    }

    <div class="footer">
      <p>
        <strong>Empreinte Fiscale</strong><br>
        Transparence fiscale pour tous les citoyens français
      </p>
      <p>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/settings/notifications">
          Gérer mes préférences de notification
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}
