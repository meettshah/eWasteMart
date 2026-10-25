import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Login from "@/models/LoginModel";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await mongooseConnect();
        const user = await Login.findOne({ email: session.user.email }).select("-password");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user);
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
        
        // Prevent role and password updates through this general settings route
        delete body.role;
        delete body.password;
        delete body.email; // Don't allow email change for now

        await mongooseConnect();
        const user = await Login.findOneAndUpdate(
            { email: session.user.email },
            { $set: body },
            { new: true }
        ).select("-password");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Settings PATCH Error:", error);
        return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
    }
}
