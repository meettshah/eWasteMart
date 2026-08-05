/**
 * POST /api/paytm/payout
 * Internal route to trigger payout to seller. Called when pickup is completed.
 * Secured by INTERNAL_API_SECRET.
 */
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export async function POST(req) {
  const internalSecret = req.headers.get("x-internal-secret");
  
  if (internalSecret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { orderId, pickupId } = await req.json();
  
  if (!orderId) {
    return NextResponse.json({ message: "orderId required" }, { status: 400 });
  }

  await mongooseConnect();
  
  const order = await Order.findOne({ paytmOrderId: orderId });
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  
  if (order.status !== "paid") {
    return NextResponse.json({ message: "Order not paid" }, { status: 400 });
  }

  // Real world: Integration with Paytm Payouts API goes here.
  // We'll mark it as processing.
  order.payoutStatus = "processing";
  order.payoutAt = new Date();
  await order.save();
  
  console.log(`[Payout] Processing payout for order ${orderId}, pickup ${pickupId}. Payee: ${order.payeeName} (${order.payeeEmail})`);
  
  return NextResponse.json({ message: "Payout initiated", status: "processing" });
}
