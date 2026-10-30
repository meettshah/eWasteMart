import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const pickup = await prisma.pickup.findUnique({
    where: { id },
    include: { listing: true, order: true }
  });
  if (!pickup) return NextResponse.json({ message: "Pickup not found" }, { status: 404 });

  const isSeller = pickup.sellerEmail === session.user.email;
  const isRecycler = pickup.recyclerEmail === session.user.email;
  if (!isSeller && !isRecycler) return NextResponse.json({ message: "Access denied" }, { status: 403 });

  if (pickup.status !== "picked_up") return NextResponse.json({ message: "Invalid status" }, { status: 400 });

  await prisma.pickup.update({
    where: { id },
    data: {
      status: "completed",
      completedAt: new Date()
    }
  });

  const order = pickup.order;
  if (order?.orderId) {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/paytm/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
        },
        body: JSON.stringify({ orderId: order.orderId, pickupId: pickup.id }),
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
      message: `Pickup has been successfully completed for "${pickup.listing?.title || 'E-waste'}". The escrow payment will be released shortly.`,
      type: "PICKUP",
      link: `/pickups`,
      channels: ["IN_APP", "EMAIL"]
    });
  } catch (err) {
    console.error("Notification error:", err);
  }

  return NextResponse.json({ message: "Completed", status: "completed" });
}
