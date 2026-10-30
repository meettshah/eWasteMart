import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(new URL('/login?error=InvalidVerificationToken', req.url));
        }

        const user = await prisma.user.findFirst({
            where: {
                verifyToken: token,
                verifyTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return NextResponse.redirect(new URL('/login?error=TokenExpiredOrInvalid', req.url));
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                verifyToken: null,
                verifyTokenExpiry: null
            }
        });

        return NextResponse.redirect(new URL('/login?verified=true', req.url));

    } catch (error) {
        console.error("Email verification error:", error);
        return NextResponse.redirect(new URL('/login?error=VerificationFailed', req.url));
    }
}
