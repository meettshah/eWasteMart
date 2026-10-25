/**
 * src/lib/email.js
 * Email utility — mock (console.log) in development, ready for production integration.
 */

const MOCK_MODE = process.env.NODE_ENV !== "production" || !process.env.SMTP_HOST;

/**
 * Send an email notification.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 */
export async function sendEmail(to, subject, html) {
  if (MOCK_MODE) {
    console.log(`\n[EMAIL MOCK] To: ${to}\n[EMAIL MOCK] Subject: ${subject}\n[EMAIL MOCK] Body: ${html.replace(/<[^>]*>?/gm, '')}\n`);
    return { success: true, mock: true };
  }

  // TODO: In production, configure nodemailer or an API like Resend/SendGrid
  // const transporter = nodemailer.createTransport({ ... });
  // await transporter.sendMail({ from: '"E-WasteMart" <noreply@ewastemart.com>', to, subject, html });
  
  console.log(`[EMAIL PRODUCTION (Not configured)] To: ${to}, Subject: ${subject}`);
  return { success: true, mock: false };
}
