import { mongooseConnect } from "@/lib/mongoose";
import Login from "@/models/LoginModel";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(new URL('/login?error=InvalidVerificationToken', req.url));
        }

        await mongooseConnect();

        const user = await Login.findOne({
            verifyToken: token,
            verifyTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.redirect(new URL('/login?error=TokenExpiredOrInvalid', req.url));
        }

        user.isEmailVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;
        await user.save();

        return NextResponse.redirect(new URL('/login?verified=true', req.url));

    } catch (error) {
        console.error("Email verification error:", error);
        return NextResponse.redirect(new URL('/login?error=VerificationFailed', req.url));
    }
}
