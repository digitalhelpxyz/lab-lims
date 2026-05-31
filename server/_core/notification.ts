// Notification system — Manus ki jagah simple console log + email
// Production mein aap yahan email/SMS/webhook add kar sakte hain

import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  console.log(`[Notification] ${payload.title}: ${payload.content}`);
  // TODO: Production mein yahan admin ko email bhejo
  // Example: await sendEmail(adminEmail, payload.title, payload.content)
  return true;
}
