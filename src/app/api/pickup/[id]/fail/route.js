import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const FAILABLE_STATUSES = ["scheduled", "in_progress", "picked_up"];

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const pickup = await prisma.pickup.findUnique({
    where: { id },
    include: { order: true }
  });
  if (!pickup) return NextResponse.json({ message: "Pickup not found" }, { status: 404 });

  const isSeller = pickup.sellerEmail === session.user.email;
  const isRecycler = pickup.recyclerEmail === session.user.email;
  if (!isSeller && !isRecycler) return NextResponse.json({ message: "Access denied" }, { status: 403 });

  if (!FAILABLE_STATUSES.includes(pickup.status)) return NextResponse.json({ message: "Invalid status" }, { status: 400 });

  const { reason } = await req.json();
  if (!reason) return NextResponse.json({ message: "Reason required" }, { status: 400 });

  await prisma.pickup.update({
    where: { id },
    data: {
      status: "failed",
      failureReason: reason.trim(),
      arrivalOtp: null,
      otpExpiresAt: null,
    }
  });

  const order = pickup.order;
  let refundTriggered = false;

  if (order?.orderId && order.status === "paid") {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/paytm/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
        },
        body: JSON.stringify({ orderId: order.orderId, reason: `Pickup failed: ${reason}`, _internal: true }),
      });
      refundTriggered = res.ok;
    } catch (err) {
      console.error("[Pickup Fail] Refund trigger failed:", err.message);
    }
  }

  return NextResponse.json({ message: "Failed", refundTriggered });
}
