import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import { getApprovedPaymentContext, jsonError } from "@/lib/paymentSecurity";
import PaymentTransaction from "@/models/PaymentTransactionModel";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ message: "Currency payment gateway is not configured." }, { status: 503 });
  }

  await mongooseConnect();
  const context = await getApprovedPaymentContext(params.id, session.user);
  if (context.error) return jsonError(NextResponse, context.error);

  const { listing, approvedBid, receiver, amount } = context;
  const existingPaid = await PaymentTransaction.findOne({ listingId: listing._id, status: "paid" });
  if (existingPaid) {
    return NextResponse.json({ message: "This listing is already paid." }, { status: 409 });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `ewm_${listing._id.toString().slice(-10)}_${Date.now()}`,
    notes: {
      listingId: listing._id.toString(),
      bidId: approvedBid._id.toString(),
      payerEmail: session.user.email,
      receiverEmail: receiver.email,
    },
  });

  await PaymentTransaction.findOneAndUpdate(
    { listingId: listing._id, method: "currency", status: "initiated" },
    {
      listingId: listing._id,
      bidId: approvedBid._id,
      payerId: session.user.id,
      payerEmail: session.user.email,
      receiverId: receiver._id,
      receiverEmail: receiver.email,
      method: "currency",
      amount,
      currency: "INR",
      status: "initiated",
      provider: "razorpay",
      providerOrderId: order.id,
      metadata: { order },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  listing.payment.status = "processing";
  listing.payment.method = "currency";
  listing.payment.amount = amount;
  await listing.save();

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
    listingId: listing._id,
  });
}
