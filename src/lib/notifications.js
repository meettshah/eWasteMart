/**
 * src/lib/notifications.js
 * Centralized Notification Dispatcher for IN_APP, EMAIL, SMS, and WHATSAPP.
 * Backed by PostgreSQL via Prisma ORM.
 */
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";

/**
 * Dispatch a notification across multiple channels.
 * 
 * @param {Object} params
 * @param {string} params.userId - Recipient user ID
 * @param {string} params.userEmail - Recipient email address
 * @param {string} params.userPhone - Recipient phone number (optional)
 * @param {string} params.title - Short title of the notification
 * @param {string} params.message - Full body of the notification
 * @param {string} params.type - "BID" | "PAYMENT" | "PICKUP" | "SYSTEM"
 * @param {string} params.link - (Optional) URL to redirect to
 * @param {string[]} params.channels - Array of channels: ["IN_APP", "EMAIL", "SMS"]
 */
export async function dispatchNotification({
  userId,
  userEmail,
  userPhone,
  title,
  message,
  type = "SYSTEM",
  link = null,
  channels = ["IN_APP", "EMAIL"]
}) {
  try {
    let resolvedUserId = userId;

    if (!resolvedUserId && userEmail) {
      const u = await prisma.user.findUnique({
        where: { email: userEmail.toLowerCase().trim() },
        select: { id: true, phone: true }
      });
      if (u) {
        resolvedUserId = u.id;
        if (!userPhone && u.phone) userPhone = u.phone;
      }
    }

    // 1. IN_APP Notification in PostgreSQL
    if (channels.includes("IN_APP") && resolvedUserId) {
      await prisma.notification.create({
        data: {
          userId: resolvedUserId,
          title,
          message,
          type,
          link
        }
      });
    }

    // 2. EMAIL Notification
    if (channels.includes("EMAIL") && userEmail) {
      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2e7d32;">eWasteMart Notification</h2>
          <h3>${title}</h3>
          <p style="color: #444; line-height: 1.5;">${message}</p>
          ${link ? `<div style="margin-top: 20px;"><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${link}" style="display: inline-block; padding: 10px 20px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px;">View in App</a></div>` : ''}
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">This is an automated notification from eWasteMart Circular Economy Hub.</p>
        </div>
      `;
      sendEmail({ to: userEmail, subject: `eWasteMart: ${title}`, html: htmlBody }).catch(e => console.error("Email send failed:", e));
    }

    // 3. SMS Notification
    if (channels.includes("SMS") && userPhone) {
      sendSms(userPhone, `${title}: ${message}`).catch(e => console.error("SMS send failed:", e));
    }

  } catch (error) {
    console.error("Centralized Notification Error:", error);
  }
}
