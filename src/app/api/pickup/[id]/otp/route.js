import crypto from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendOtp } from "@/lib/sms";

const OTP_TTL_MS = 15 * 60 * 1000;

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const pickup = await prisma.pickup.findUnique({ where: { id } });
  if (!pickup) return NextResponse.json({ message: "Pickup not found" }, { status: 404 });

  const { action, otp: submittedOtp } = await req.json();

  if (action === "generate") {
    if (pickup.recyclerEmail !== session.user.email) return NextResponse.json({ message: "Only recycler can generate OTP" }, { status: 403 });
    if (!["scheduled", "in_progress"].includes(pickup.status)) return NextResponse.json({ message: "Invalid status" }, { status: 400 });

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS);

    await prisma.pickup.update({
      where: { id },
      data: {
        arrivalOtp: otp,
        otpExpiresAt: otpExpiry,
        status: "in_progress",
      }
    });

    if (pickup.sellerPhone) {
      try { await sendOtp(pickup.sellerPhone, otp, "Seller"); } catch (e) {}
    }

    return NextResponse.json({ message: "OTP generated", expiresAt: otpExpiry });
  }

  if (action === "verify") {
    if (pickup.sellerEmail !== session.user.email) return NextResponse.json({ message: "Only seller can verify OTP" }, { status: 403 });
    if (pickup.status !== "in_progress") return NextResponse.json({ message: "Invalid status" }, { status: 400 });

    if (!pickup.arrivalOtp || !pickup.otpExpiresAt || new Date() > pickup.otpExpiresAt) {
      await prisma.pickup.update({
        where: { id },
        data: { arrivalOtp: null, otpExpiresAt: null }
      });
      return NextResponse.json({ message: "OTP expired" }, { status: 410 });
    }

    if (!submittedOtp) return NextResponse.json({ message: "OTP required" }, { status: 400 });

    if (submittedOtp.trim() !== pickup.arrivalOtp) {
      return NextResponse.json({ message: "Incorrect OTP" }, { status: 400 });
    }

    await prisma.pickup.update({
      where: { id },
      data: {
        arrivalOtp: null,
        otpExpiresAt: null,
        status: "picked_up",
      }
    });

    return NextResponse.json({ message: "OTP verified", status: "picked_up" });
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
