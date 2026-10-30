import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  // Only allow mock callbacks in staging/development mode
  if (process.env.NEXT_PUBLIC_PAYTM_ENV === "production") {
    return NextResponse.json({ message: "Mock disabled in production" }, { status: 403 });
  }

  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { orderId }
    });
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    const mockTxnId = "MOCK_TXN_" + Date.now();

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "escrow_held",
          paymentId: mockTxnId,
          escrowStatus: "held",
        }
      }),
      prisma.listing.update({
        where: { id: order.listingId },
        data: {
          payment: {
            status: "paid",
            method: "paytm_mock",
            amount: order.amount,
            paidAt: new Date().toISOString(),
            orderId: order.id,
            txnId: mockTxnId,
          }
        }
      })
    ]);

    try {
      const { dispatchNotification } = await import("@/lib/notifications");
      await dispatchNotification({
        userId: order.payeeId,
        userEmail: order.payeeEmail,
        title: "Payment Received",
        message: `You have received an escrow payment of Rs. ${order.amount.toLocaleString("en-IN")}. The buyer will now schedule a pickup.`,
        type: "PAYMENT",
        link: `/orders/${order.id}`,
        channels: ["IN_APP", "EMAIL"]
      });
    } catch (err) {
      console.error("Notification error:", err);
    }

    return NextResponse.json({ success: true, message: "Mock payment successful" });
  } catch (error) {
    console.error("Mock callback error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
