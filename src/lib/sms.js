/**
 * src/lib/sms.js
 * SMS utility — MSG91 in production, mock (console.log) in development.
 *
 * Set SMS_PROVIDER=msg91 in .env and provide MSG91_AUTH_KEY + MSG91_SENDER_ID
 * to enable real SMS. Leave SMS_PROVIDER=mock (or unset) for local dev.
 *
 * MSG91 OTP API docs: https://msg91.com/help/send-otp
 */

const MOCK_MODE = !process.env.MSG91_AUTH_KEY || process.env.SMS_PROVIDER === "mock";

/**
 * Send a 6-digit OTP to a phone number.
 * @param {string} phone  - E.164 format preferred (91XXXXXXXXXX for India)
 * @param {string} otp    - The plaintext 6-digit OTP to deliver
 * @param {string} name   - Recipient name for message personalisation
 */
export async function sendOtp(phone, otp, name = "user") {
  if (MOCK_MODE) {
    console.log(
      `[SMS MOCK] OTP for ${name} (${phone}): ${otp}  — set MSG91_AUTH_KEY in .env to enable real SMS`
    );
    return { success: true, mock: true };
  }

  // Sanitise phone — strip leading +, spaces, dashes
  const mobile = phone.replace(/\D/g, "");

  const url = "https://api.msg91.com/api/v5/otp";
  const payload = {
    template_id: process.env.MSG91_OTP_TEMPLATE_ID,
    mobile,
    authkey: process.env.MSG91_AUTH_KEY,
    otp,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.type !== "success") {
    console.error("[SMS] MSG91 error:", data);
    throw new Error("Failed to send OTP via MSG91.");
  }

  return { success: true, mock: false };
}

/**
 * Send a plain notification SMS (non-OTP).
 * @param {string} phone
 * @param {string} message  - Plain text message body
 */
export async function sendSms(phone, message) {
  if (MOCK_MODE) {
    console.log(`[SMS MOCK] → ${phone}: ${message}`);
    return { success: true, mock: true };
  }

  const mobile = phone.replace(/\D/g, "");

  const url = `https://api.msg91.com/api/sendhttp.php`;
  const params = new URLSearchParams({
    authkey: process.env.MSG91_AUTH_KEY,
    mobiles: mobile,
    message,
    sender: process.env.MSG91_SENDER_ID || "EWMART",
    route: "4",
    country: "91",
  });

  const res = await fetch(`${url}?${params}`);
  const text = await res.text();

  if (!res.ok) {
    console.error("[SMS] MSG91 notification error:", text);
    throw new Error("Failed to send SMS via MSG91.");
  }

  return { success: true, mock: false };
}
