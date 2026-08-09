/**
 * GET /api/paytm/status?orderId=EWM-123
 * Allows frontend to poll payment status after modal closes.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

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
  if (order.payerEmail !== session.user.email && order.payeeEmail !== session.user.email) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  
  return NextResponse.json({ status: order.status });
}
