import Login from "@/models/LoginModel";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt"

const { mongooseConnect } = require("@/lib/mongoose")

const VALID_ROLES = ["user", "bulk_seller", "recycler", "enterprise"];

const registerHandler = async (req) => {
    try {
        await mongooseConnect();
    }
    catch (error) {
        console.error("MongoConnection Failed: ", error);
    }

    if (req.method === "POST") {
        try {
            const { name, email, password, role = "user" } = await req.json();
            const normalizedEmail = email?.toLowerCase().trim();

            if (!name || !normalizedEmail || !password || !VALID_ROLES.includes(role)) {
                return NextResponse.json(
                    { message: "Please provide a valid name, email, password and role." },
                    { status: 400 }
                );
            }

            const exists = await Login.findOne({ email: normalizedEmail });
            if (exists) {
                return NextResponse.json(
                    { message: "Email already exists. Please try again with different email." },
                    { status: 409 }
                );
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await Login.create({ name, email: normalizedEmail, role, password: hashedPassword });

            return NextResponse.json({ message: "Successfully Registered !" }, { status: 201 });
        } catch (error) {
            return NextResponse.json({ message: 'Error while registering user.' }, { status: 500 });
        }

    }

}

export { registerHandler as POST }
