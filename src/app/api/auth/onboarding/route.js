import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Login from "@/models/LoginModel";

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

        await mongooseConnect();
        
        // We only allow setting the role if it's currently "pending"
        const user = await Login.findOne({ email: session.user.email });
        
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.role !== "pending") {
            return NextResponse.json({ message: "Role is already set" }, { status: 403 });
        }

        user.role = role;
        await user.save();

        return NextResponse.json({ message: "Role updated successfully", user });
    } catch (error) {
        console.error("Onboarding Error:", error);
        return NextResponse.json({ message: "Failed to set role" }, { status: 500 });
    }
}
