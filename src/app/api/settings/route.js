import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const email = session.user.email?.toLowerCase().trim();
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                address: true,
                city: true,
                pincode: true,
                state: true,
                tokenBalance: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ ...user, _id: user.id });
    } catch (error) {
        console.error("Settings GET Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        
        // Prevent role, password, and email updates through this general settings route
        const { role, password, email, id, _id, ...safeUpdates } = body;

        const user = await prisma.user.update({
            where: { email: session.user.email.toLowerCase().trim() },
            data: safeUpdates,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                address: true,
                city: true,
                pincode: true,
                state: true,
                tokenBalance: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json({ ...user, _id: user.id });
    } catch (error) {
        console.error("Settings PATCH Error:", error);
        return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
    }
}
