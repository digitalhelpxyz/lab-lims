// Email OTP system — generates 6-digit codes, stores in memory with expiry
// For production, use Redis or DB instead of in-memory Map

import nodemailer from "nodemailer";
import { ENV } from "./env";

const otpStore = new Map<string, { code: string; expiresAt: number }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTransporter() {
  return nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpPort === 465,
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPass,
    },
  });
}

export async function sendOTP(email: string): Promise<void> {
  const code = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email.toLowerCase(), { code, expiresAt });

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Pathology Lab Portal" <${ENV.smtpFrom}>`,
    to: email,
    subject: "Your Login Code — Pathology Lab Portal",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Pathology Lab Portal</h2>
        <p>Aapka login code:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">Yeh code 10 minutes mein expire ho jayega.</p>
        <p style="color: #64748b; font-size: 14px;">Agar aapne login nahi kiya to is email ko ignore karein.</p>
      </div>
    `,
  });
}

export function verifyOTP(email: string, code: string): boolean {
  const stored = otpStore.get(email.toLowerCase());

  if (!stored) return false;
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  if (stored.code !== code) return false;

  otpStore.delete(email.toLowerCase()); // one-time use
  return true;
}
