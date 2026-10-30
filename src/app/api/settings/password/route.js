import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: "Both current and new passwords are required." }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ message: "New password must be at least 6 characters." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email.toLowerCase().trim() }
        });
        
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isCorrect = await bcrypt.compare(currentPassword, user.password || "");
        if (!isCorrect) {
            return NextResponse.json({ message: "Incorrect current password." }, { status: 403 });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword }
        });

        return NextResponse.json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Password PATCH Error:", error);
        return NextResponse.json({ message: "Failed to update password." }, { status: 500 });
    }
}
