/**
 * POST /api/pickup/[id]/fail
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Pickup from "@/models/Pickup";
import { Order } from "@/models/Order";

const FAILABLE_STATUSES = ["scheduled", "in_progress", "picked_up"];

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  await mongooseConnect();
  const { id } = await params;
  const pickup = await Pickup.findById(id).select("-otpHash");
  if (!pickup) return NextResponse.json({ message: "Pickup not found" }, { status: 404 });

  const isSeller = pickup.sellerEmail === session.user.email;
  const isRecycler = pickup.recyclerEmail === session.user.email;
  if (!isSeller && !isRecycler) return NextResponse.json({ message: "Access denied" }, { status: 403 });

  if (!FAILABLE_STATUSES.includes(pickup.status)) return NextResponse.json({ message: "Invalid status" }, { status: 400 });

  const { reason } = await req.json();
  if (!reason) return NextResponse.json({ message: "Reason required" }, { status: 400 });

  pickup.status = "failed";
  pickup.failedAt = new Date();
  pickup.failureReason = reason.trim();
  pickup.otpHash = null;
  pickup.otpExpiry = null;
  await pickup.save();

  const order = await Order.findById(pickup.orderId).lean();
  let refundTriggered = false;

  if (order?.paytmOrderId && order.status === "paid") {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/paytm/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
        },
        body: JSON.stringify({ orderId: order.paytmOrderId, reason: `Pickup failed: ${reason}`, _internal: true }),
      });
      refundTriggered = res.ok;
    } catch (err) {
      console.error("[Pickup Fail] Refund trigger failed:", err.message);
    }
  }

  return NextResponse.json({ message: "Failed", refundTriggered });
}
