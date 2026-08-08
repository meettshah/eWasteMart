import { mongooseConnect } from "@/lib/mongoose";
import Login from "@/models/LoginModel";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
    try {
        const { email } = await req.json();
        const normalizedEmail = email?.toLowerCase().trim();

        if (!normalizedEmail) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        await mongooseConnect();
        const user = await Login.findOne({ email: normalizedEmail });

        // We don't want to reveal if a user exists or not for security, 
        // so we always return 200 even if user doesn't exist.
        if (user) {
            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
            await user.save();

            const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            const html = `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your E-WasteMart account.</p>
                <p>Click the link below to set a new password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link is valid for 1 hour. If you didn't request this, you can ignore this email.</p>
            `;
            await sendEmail(normalizedEmail, 'E-WasteMart Password Reset', html);
        }

        return NextResponse.json({ message: "If an account exists, a reset link was sent." }, { status: 200 });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
