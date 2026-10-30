import { prisma } from "@/lib/prisma";
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

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetPasswordExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpiry
                }
            });

            const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            const html = `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your E-WasteMart account.</p>
                <p>Click the link below to set a new password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link is valid for 1 hour. If you didn't request this, you can ignore this email.</p>
            `;
            await sendEmail({
                to: normalizedEmail,
                subject: 'E-WasteMart Password Reset',
                html
            });
        }

        return NextResponse.json({ message: "If an account exists, a reset link was sent." }, { status: 200 });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
