import { Resend } from "resend";

/**
 * Email service for authentication-related emails
 * Uses Resend for email delivery
 */

// Lazy initialization to avoid errors during build
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResendClient();

    // If no API key configured, log to console (dev mode)
    if (!client) {
      console.log("\n========================================");
      console.log("📧 EMAIL DE VÉRIFICATION (MODE DEV)");
      console.log("========================================");
      console.log(`Pour: ${email}`);
      console.log(`Lien de vérification: ${baseUrl}/auth/verify-email?token=${token}`);
      console.log("========================================\n");

      return {
        success: true,
      };
    }

    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    await client.emails.send({
      from: fromEmail,
      to: email,
      subject: "Vérifiez votre email - Empreinte Fiscale",
      html: generateVerificationEmailHTML(email, verificationUrl),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResendClient();

    // If no API key configured, log to console (dev mode)
    if (!client) {
      console.log("\n========================================");
      console.log("📧 EMAIL DE RÉINITIALISATION (MODE DEV)");
      console.log("========================================");
      console.log(`Pour: ${email}`);
      console.log(`Lien de réinitialisation: ${baseUrl}/auth/reset-password?token=${token}`);
      console.log("========================================\n");

      return {
        success: true,
      };
    }

    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    await client.emails.send({
      from: fromEmail,
      to: email,
      subject: "Réinitialisez votre mot de passe - Empreinte Fiscale",
      html: generatePasswordResetEmailHTML(email, resetUrl),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate HTML for verification email
 */
function generateVerificationEmailHTML(email: string, verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérifiez votre email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 2px solid #e5e7eb;">
              <div style="font-size: 48px; margin-bottom: 16px;">🏛️</div>
              <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">Bienvenue sur Empreinte Fiscale</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bonjour,
              </p>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Merci de vous être inscrit sur <strong>Empreinte Fiscale</strong>. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Vérifier mon email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="margin: 8px 0 0; color: #6366f1; font-size: 14px; word-break: break-all;">
                ${verificationUrl}
              </p>

              <p style="margin: 30px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                <strong>Ce lien expire dans 24 heures.</strong>
              </p>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si vous n'avez pas créé de compte sur Empreinte Fiscale, vous pouvez ignorer cet email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #1f2937; font-weight: 600; font-size: 14px;">
                Empreinte Fiscale
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                Transparence fiscale pour tous les citoyens français
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML for password reset email
 */
function generatePasswordResetEmailHTML(email: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisez votre mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 2px solid #e5e7eb;">
              <div style="font-size: 48px; margin-bottom: 16px;">🏛️</div>
              <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">Réinitialisez votre mot de passe</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bonjour,
              </p>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>Empreinte Fiscale</strong>. Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="margin: 8px 0 0; color: #6366f1; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>

              <p style="margin: 30px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                <strong>Ce lien expire dans 1 heure.</strong>
              </p>

              <p style="margin: 20px 0 0; color: #dc2626; font-size: 14px; line-height: 1.6; padding: 16px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
                ⚠️ <strong>Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #1f2937; font-weight: 600; font-size: 14px;">
                Empreinte Fiscale
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                Transparence fiscale pour tous les citoyens français
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
