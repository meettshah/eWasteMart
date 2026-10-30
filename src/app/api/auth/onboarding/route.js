import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { role } = await req.json();
        
        if (!["user", "bulk_seller", "recycler", "enterprise"].includes(role)) {
            return NextResponse.json({ message: "Invalid role selected" }, { status: 400 });
        }

        const email = session.user.email?.toLowerCase().trim();
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.role !== "pending") {
            return NextResponse.json({ message: "Role is already set" }, { status: 403 });
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { role }
        });

        return NextResponse.json({ message: "Role updated successfully", user: { ...updated, _id: updated.id } });
    } catch (error) {
        console.error("Onboarding Error:", error);
        return NextResponse.json({ message: "Failed to set role" }, { status: 500 });
    }
}
