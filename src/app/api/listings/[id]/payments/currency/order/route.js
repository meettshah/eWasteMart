import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getApprovedPaymentContext, jsonError } from "@/lib/paymentSecurity";

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

  const { id } = await params;
  const context = await getApprovedPaymentContext(id, session.user);
  if (context.error) return jsonError(NextResponse, context.error);

  const { listing, approvedBid, receiver, amount } = context;
  const existingPaid = await prisma.paymentTransaction.findFirst({
    where: { listingId: listing.id, status: "paid" }
  });
  if (existingPaid) {
    return NextResponse.json({ message: "This listing is already paid." }, { status: 409 });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `ewm_${listing.id.slice(-10)}_${Date.now()}`,
    notes: {
      listingId: listing.id,
      bidId: approvedBid.id,
      payerEmail: session.user.email,
      receiverEmail: receiver.email,
    },
  });

  const existingTx = await prisma.paymentTransaction.findFirst({
    where: { listingId: listing.id, method: "currency", status: "initiated" }
  });

  if (existingTx) {
    await prisma.paymentTransaction.update({
      where: { id: existingTx.id },
      data: {
        bidId: approvedBid.id,
        payerId: session.user.id,
        payerEmail: session.user.email,
        receiverId: receiver.id,
        receiverEmail: receiver.email,
        amount,
        currency: "INR",
        provider: "razorpay",
        providerOrderId: order.id,
        metadata: { order },
      }
    });
  } else {
    await prisma.paymentTransaction.create({
      data: {
        listingId: listing.id,
        bidId: approvedBid.id,
        payerId: session.user.id,
        payerEmail: session.user.email,
        receiverId: receiver.id,
        receiverEmail: receiver.email,
        method: "currency",
        amount,
        currency: "INR",
        status: "initiated",
        provider: "razorpay",
        providerOrderId: order.id,
        metadata: { order },
      }
    });
  }

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  });
}
