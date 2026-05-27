import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ message: "Payment gateway is not configured." }, { status: 503 });
  }

  const body = await req.json();
  const amount = Number(body.amount);
  const currency = body.currency || "INR";

  if (!amount || amount <= 0) {
    return NextResponse.json({ message: "Valid amount is required." }, { status: 400 });
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: `ewm_${Date.now()}`,
  });

  return NextResponse.json({ orderId: order.id });
}
