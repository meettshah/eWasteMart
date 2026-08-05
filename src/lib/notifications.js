/**
 * src/lib/notifications.js
 * Centralized Notification Dispatcher for IN_APP, EMAIL, SMS, and WHATSAPP.
 */
import { mongooseConnect } from "@/lib/mongoose";
import { Notification } from "@/models/Notification";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";

/**
 * Dispatch a notification across multiple channels.
 * 
 * @param {Object} params
 * @param {string} params.userId - Recipient user ID (ObjectId)
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
    await mongooseConnect();

    // 1. IN_APP Notification
    if (channels.includes("IN_APP") && userId) {
      await Notification.create({
        userId,
        title,
        message,
        type,
        link
      });
    }

    // 2. EMAIL Notification
    if (channels.includes("EMAIL") && userEmail) {
      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #10b981;">E-WasteMart</h2>
          <h3 style="color: #111827;">${title}</h3>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">${message}</p>
          ${link ? `<a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${link}" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #10b981; color: #fff; text-decoration: none; border-radius: 5px;">View Details</a>` : ''}
          <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">Thank you for using E-WasteMart.</p>
        </div>
      `;
      await sendEmail(userEmail, title, htmlBody);
    }

    // 3. SMS Notification (Reserved for high-priority like Pickups)
    if (channels.includes("SMS") && userPhone) {
      const smsBody = `E-WasteMart: ${title} - ${message}`;
      await sendSms(userPhone, smsBody);
    }

  } catch (error) {
    console.error("[Notification Dispatcher] Error:", error);
  }
}
