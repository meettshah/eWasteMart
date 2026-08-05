/**
 * GET /api/paytm/status?orderId=EWM-123
 * Allows frontend to poll payment status after modal closes.
 */
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const paytmOrderId = searchParams.get("orderId");
  
  if (!paytmOrderId) {
    return NextResponse.json({ message: "orderId required" }, { status: 400 });
  }

  await mongooseConnect();
  
  const order = await Order.findOne({ paytmOrderId });
  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }
  
  return NextResponse.json({ status: order.status });
}
