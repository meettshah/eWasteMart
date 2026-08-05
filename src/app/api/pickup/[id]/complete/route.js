/**
 * POST /api/pickup/[id]/complete
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Pickup from "@/models/Pickup";
import { Order } from "@/models/Order";

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

  if (pickup.status !== "picked_up") return NextResponse.json({ message: "Invalid status" }, { status: 400 });

  pickup.status = "completed";
  pickup.completedAt = new Date();
  await pickup.save();

  const order = await Order.findById(pickup.orderId).lean();
  if (order?.paytmOrderId) {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/paytm/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
        },
        body: JSON.stringify({ orderId: order.paytmOrderId, pickupId: pickup._id.toString() }),
      });
    } catch (err) {
      console.error("[Pickup Complete] Payout trigger failed:", err.message);
    }
  }

  try {
    const { dispatchNotification } = await import("@/lib/notifications");
    await dispatchNotification({
      userId: pickup.sellerId,
      userEmail: pickup.sellerEmail,
      title: "Pickup Completed",
      message: `${pickup.recyclerName} has successfully completed the pickup for "${pickup.listingTitle}". The payment will be transferred to your account shortly.`,
      type: "PICKUP",
      link: `/pickups`,
      channels: ["IN_APP", "EMAIL"]
    });
  } catch (err) {
    console.error("Notification error:", err);
  }

  return NextResponse.json({ message: "Completed", status: "completed" });
}
