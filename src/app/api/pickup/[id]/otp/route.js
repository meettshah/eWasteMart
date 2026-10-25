/**
 * POST /api/pickup/[id]/otp
 */
import crypto from "crypto";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Pickup from "@/models/Pickup";
import { sendOtp } from "@/lib/sms";

const OTP_TTL_MS = 15 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 3;

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  await mongooseConnect();
  const { id } = await params;
  const pickup = await Pickup.findById(id).select("+otpHash");
  if (!pickup) return NextResponse.json({ message: "Pickup not found" }, { status: 404 });

  const { action, otp: submittedOtp } = await req.json();

  if (action === "generate") {
    if (pickup.recyclerEmail !== session.user.email) return NextResponse.json({ message: "Only recycler can generate OTP" }, { status: 403 });
    if (!["scheduled", "in_progress"].includes(pickup.status)) return NextResponse.json({ message: "Invalid status" }, { status: 400 });

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS);

    pickup.otpHash = otpHash;
    pickup.otpExpiry = otpExpiry;
    pickup.otpVerified = false;
    pickup.otpAttempts = 0;
    pickup.status = "in_progress";
    pickup.inProgressAt = pickup.inProgressAt || new Date();

    // TEMPORARY: Save plain-text OTP so the seller UI can display it during local testing
    if (process.env.NODE_ENV !== "production") {
      pickup.set("mockOtp", otp, { strict: false });
    }

    await pickup.save();

    if (pickup.sellerPhone) {
      try { await sendOtp(pickup.sellerPhone, otp, pickup.sellerName); } catch (e) {}
    }

    return NextResponse.json({ message: "OTP generated", expiresAt: otpExpiry });
  }

  if (action === "verify") {
    if (pickup.sellerEmail !== session.user.email) return NextResponse.json({ message: "Only seller can verify OTP" }, { status: 403 });
    if (pickup.status !== "in_progress") return NextResponse.json({ message: "Invalid status" }, { status: 400 });

    if (!pickup.otpHash || !pickup.otpExpiry || new Date() > pickup.otpExpiry) {
      pickup.otpHash = null; pickup.otpExpiry = null; pickup.otpAttempts = 0; await pickup.save();
      return NextResponse.json({ message: "OTP expired" }, { status: 410 });
    }

    if (pickup.otpAttempts >= OTP_MAX_ATTEMPTS) {
      pickup.otpHash = null; pickup.otpExpiry = null; pickup.otpAttempts = 0; await pickup.save();
      return NextResponse.json({ message: "Too many failed attempts" }, { status: 429 });
    }

    if (!submittedOtp) return NextResponse.json({ message: "OTP required" }, { status: 400 });

    const isCorrect = await bcrypt.compare(submittedOtp.trim(), pickup.otpHash);
    if (!isCorrect) {
      pickup.otpAttempts += 1;
      await pickup.save();
      return NextResponse.json({ message: "Incorrect OTP" }, { status: 400 });
    }

    pickup.otpHash = null; pickup.otpExpiry = null; pickup.otpAttempts = 0;
    pickup.otpVerified = true;
    pickup.status = "picked_up";
    pickup.pickedUpAt = new Date();
    await pickup.save();

    return NextResponse.json({ message: "OTP verified", status: "picked_up" });
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
