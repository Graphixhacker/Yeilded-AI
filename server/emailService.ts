import nodemailer from 'nodemailer';

export interface SendEmailResult {
  success: boolean;
  provider: string;
  error?: string;
}

/**
 * Builds an accessible, professional diplomatic-themed email template
 * matching Yeilded's navy (#0B1F3A) & gold (#D4AF37) aesthetic.
 */
function buildPasswordResetEmailHtml(name: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Yeilded Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #071326; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #071326; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Container Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #0c1c33; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Navy & Gold Header -->
          <tr>
            <td style="background-color: #0B1F3A; padding: 32px 32px 28px 32px; border-bottom: 2px solid #D4AF37; text-align: center;">
              <div style="display: inline-block; padding: 8px 16px; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 9999px; background-color: rgba(11, 31, 58, 0.6); margin-bottom: 12px;">
                <span style="color: #D4AF37; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">YEILDED DIPLOMATIC SUITE</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Password Reset Request</h1>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #cbd5e1;">
                Hello <strong>${escapeHtml(name)}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                We received a request to reset the password for your Yeilded delegation account. Click the secure link below to choose a new password:
              </p>

              <!-- Call to Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #D4AF37; color: #0B1F3A; font-weight: 700; font-size: 15px; padding: 14px 32px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); letter-spacing: 0.3px;">
                      Reset Your Password
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #071326; border: 1px solid #1e3a5f; border-radius: 10px; padding: 14px 18px; margin: 24px 0;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #93c5fd;">
                  ⏳ <strong>Security Notice:</strong> This link is valid for <strong>30 minutes</strong> and can only be used once. After that, you will need to request a new link.
                </p>
              </div>

              <p style="margin: 24px 0 8px 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                If the button above does not work, copy and paste this secure link directly into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.4; color: #94a3b8; word-break: break-all;">
                <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">
                  ${resetLink}
                </a>
              </p>

              <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                If you did not request this password reset, please disregard this email. Your password remains safe and unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #081424; padding: 20px 32px; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Yeilded • Model United Nations Diplomatic AI Suite • Need help? Contact <a href="mailto:support@yeilded.com" style="color: #D4AF37; text-decoration: none;">support@yeilded.com</a>
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Parses the SMTP_SECURE environment variable.
 * Explicit string "false" is parsed to boolean false.
 * Explicit string "true" is parsed to boolean true.
 * If unset, defaults to true if port is 465, otherwise false.
 */
function parseSmtpSecure(secureEnv: string | undefined, port: number): boolean {
  if (secureEnv !== undefined && secureEnv !== '') {
    const normalized = secureEnv.trim().toLowerCase();
    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }
  }
  return port === 465;
}

/**
 * Sends any email through Nodemailer using SMTP credentials.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST;
  const rawPort = process.env.SMTP_PORT;
  const port = rawPort ? parseInt(rawPort, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = parseSmtpSecure(process.env.SMTP_SECURE, port);
  const fromAddress = process.env.EMAIL_FROM || (user ? `"Yeilded" <${user}>` : 'Yeilded <support@yeilded.com>');

  if (!host || !user || !pass) {
    console.warn(`[EMAIL SERVICE] SMTP credentials not fully configured (SMTP_HOST, SMTP_USER, or SMTP_PASS missing).`);
    return { success: false, provider: 'smtp', error: 'SMTP credentials missing' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    });

    await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });

    console.log(`[EMAIL SERVICE] Successfully sent email to ${options.to} via SMTP (${host}:${port})`);
    return { success: true, provider: 'smtp' };
  } catch (err: any) {
    // Log the actual SMTP error message on the server if sending fails
    console.error(`[EMAIL SERVICE] SMTP send failed to ${options.to}:`, err?.message || err);
    if (err?.code) {
      console.error(`[EMAIL SERVICE] SMTP error code: ${err.code} (command: ${err.command || 'N/A'})`);
    }
    if (err?.response) {
      console.error(`[EMAIL SERVICE] SMTP server response: ${err.response}`);
    }
    return { success: false, provider: 'smtp', error: err?.message || String(err) };
  }
}

/**
 * Sends a password reset email using Nodemailer and configured SMTP settings:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_SECURE (string "false" parsed to boolean false)
 * - SMTP_USER
 * - SMTP_PASS
 * - EMAIL_FROM (as the sender)
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetLink: string,
  name = 'Delegate'
): Promise<SendEmailResult> {
  const cleanEmail = toEmail.trim().toLowerCase();
  const htmlContent = buildPasswordResetEmailHtml(name, resetLink);
  const textContent = `Hello ${name},\n\nWe received a request to reset your Yeilded password.\n\nPlease visit the following link to choose a new password:\n${resetLink}\n\nThis link expires in 30 minutes.\n\nIf you did not make this request, you can safely ignore this email.\nIf you need assistance, contact our support team at support@yeilded.com.\n\n- Yeilded Diplomatic Suite`;

  // Always log in development/runtime for easy testing & inspection
  console.log(`[PASSWORD RESET] Link generated for ${cleanEmail}: ${resetLink}`);

  const host = process.env.SMTP_HOST;
  const rawPort = process.env.SMTP_PORT;
  const port = rawPort ? parseInt(rawPort, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = parseSmtpSecure(process.env.SMTP_SECURE, port);
  const fromAddress = process.env.EMAIL_FROM || (user ? `"Yeilded" <${user}>` : 'Yeilded <support@yeilded.com>');

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass
        }
      });

      await transporter.sendMail({
        from: fromAddress,
        to: cleanEmail,
        subject: 'Reset your Yeilded password',
        text: textContent,
        html: htmlContent
      });

      console.log(`[EMAIL SERVICE] Successfully sent password reset email to ${cleanEmail} via SMTP`);
      return { success: true, provider: 'smtp' };
    } catch (err: any) {
      // Log the actual SMTP error message on the server if sending fails
      console.error(`[EMAIL SERVICE] SMTP send failed for password reset to ${cleanEmail}:`, err?.message || err);
      if (err?.code) {
        console.error(`[EMAIL SERVICE] SMTP error code: ${err.code} (command: ${err.command || 'N/A'})`);
      }
      if (err?.response) {
        console.error(`[EMAIL SERVICE] SMTP server response: ${err.response}`);
      }
      return { success: false, provider: 'smtp', error: err?.message || String(err) };
    }
  }

  // Fallback if SMTP is not configured in local environment
  console.warn(`[EMAIL SERVICE] No SMTP credentials configured. Password reset link logged above.`);
  return { success: true, provider: 'console-fallback' };
}
