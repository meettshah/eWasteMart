import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["user", "bulk_seller", "recycler", "enterprise"];

export async function POST(req) {
    try {
        const { name, email, password, role = "user" } = await req.json();
        const normalizedEmail = email?.toLowerCase().trim();

        if (!name || !normalizedEmail || !password || !VALID_ROLES.includes(role)) {
            return NextResponse.json(
                { message: "Please provide a valid name, email, password and role." },
                { status: 400 }
            );
        }

        const exists = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (exists) {
            return NextResponse.json(
                { message: "Email already exists. Please try again with different email." },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate verification token
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                role,
                password: hashedPassword,
                verifyToken,
                verifyTokenExpiry
            }
        });

        // Send verification email
        const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verifyToken}`;
        const html = `
            <h2>Welcome to E-WasteMart, ${name}!</h2>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verifyUrl}">Verify Email</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
        `;

        await sendEmail({
            to: normalizedEmail,
            subject: "Verify your E-WasteMart Email",
            html
        });

        return NextResponse.json({
            message: "Registration successful. Please check your email to verify your account.",
            user: { id: user.id, _id: user.id, email: user.email, name: user.name, role: user.role }
        }, { status: 201 });
    } catch (error) {
        console.error("Registration Error: ", error);
        return NextResponse.json({ message: error.message || "Failed to register user." }, { status: 500 });
    }
}
