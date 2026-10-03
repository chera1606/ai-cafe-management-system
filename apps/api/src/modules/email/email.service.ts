import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromAddress: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>(
      "RESEND_API_KEY",
      "re_placeholder",
    );
    this.fromAddress = this.configService.get<string>(
      "RESEND_FROM_EMAIL",
      "noreply@cafe.local",
    );
    this.appUrl = this.configService.get<string>(
      "APP_URL",
      "http://localhost:3000",
    );
    this.resend = new Resend(apiKey);
  }

  private async sendEmail(opts: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });
      this.logger.log(`Email sent to ${opts.to}: ${opts.subject}`);
    } catch (error) {
      // Never let a failed email crash the auth flow
      this.logger.error(`Failed to send email to ${opts.to}`, error);
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;
    await this.sendEmail({
      to,
      subject: "Reset your password — AI Cafe",
      html: this.buildPasswordResetTemplate(resetUrl),
    });
  }

  async sendMagicLinkEmail(to: string, token: string): Promise<void> {
    const loginUrl = `${this.appUrl}/auth/magic-link/verify?token=${token}`;
    await this.sendEmail({
      to,
      subject: "Your magic login link — AI Cafe",
      html: this.buildMagicLinkTemplate(loginUrl),
    });
  }

  async sendWelcomeVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${this.appUrl}/auth/verify-email?token=${token}`;
    await this.sendEmail({
      to,
      subject: "Verify your email — AI Cafe",
      html: this.buildWelcomeVerificationTemplate(verifyUrl),
    });
  }

  // ─── Email Templates ────────────────────────────────────────────────────────

  private buildPasswordResetTemplate(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:.5px;">☕ AI Cafe</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#111;font-size:20px;">Reset your password</h2>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">
            We received a request to reset your password. Click the button below to choose a new one.
            This link expires in <strong>15 minutes</strong>.
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td>
            <a href="${resetUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
              Reset Password
            </a>
          </td></tr></table>
          <p style="color:#999;font-size:13px;margin:24px 0 0;line-height:1.5;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;" />
          <p style="color:#bbb;font-size:12px;margin:0;">
            Or copy this link: <a href="${resetUrl}" style="color:#1a1a2e;word-break:break-all;">${resetUrl}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private buildMagicLinkTemplate(loginUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your magic login link</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:.5px;">☕ AI Cafe</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#111;font-size:20px;">Your magic login link ✨</h2>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">
            Click the button below to sign in instantly — no password needed.
            This link expires in <strong>15 minutes</strong> and can only be used once.
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td>
            <a href="${loginUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
              Sign In to AI Cafe
            </a>
          </td></tr></table>
          <p style="color:#999;font-size:13px;margin:24px 0 0;line-height:1.5;">
            If you didn't request this link, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;" />
          <p style="color:#bbb;font-size:12px;margin:0;">
            Or copy this link: <a href="${loginUrl}" style="color:#1a1a2e;word-break:break-all;">${loginUrl}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private buildWelcomeVerificationTemplate(verifyUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:.5px;">☕ AI Cafe</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#111;font-size:20px;">Welcome! Verify your email 🎉</h2>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">
            Thanks for joining AI Cafe! Click below to verify your email address and activate your account.
            This link expires in <strong>24 hours</strong>.
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td>
            <a href="${verifyUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
              Verify Email Address
            </a>
          </td></tr></table>
          <p style="color:#999;font-size:13px;margin:24px 0 0;line-height:1.5;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;" />
          <p style="color:#bbb;font-size:12px;margin:0;">
            Or copy this link: <a href="${verifyUrl}" style="color:#1a1a2e;word-break:break-all;">${verifyUrl}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }
}
