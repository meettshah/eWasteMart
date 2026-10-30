import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getApprovedPaymentContext, jsonError, verifyRazorpaySignature } from "@/lib/paymentSecurity";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  const { id } = await params;
  const context = await getApprovedPaymentContext(id, session.user);
  if (context.error) return jsonError(NextResponse, context.error);

  const body = await req.json();
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ message: "Payment verification payload is incomplete." }, { status: 400 });
  }

  const transaction = await prisma.paymentTransaction.findFirst({
    where: {
      listingId: context.listing.id,
      method: "currency",
      providerOrderId: razorpayOrderId,
      status: "initiated",
    }
  });

  if (!transaction) {
    return NextResponse.json({ message: "Payment order was not found or already processed." }, { status: 404 });
  }

  const signatureValid = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!signatureValid) {
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "failed",
        metadata: { ...((transaction.metadata && typeof transaction.metadata === "object") ? transaction.metadata : {}), failedReason: "signature_mismatch" }
      }
    });
    return NextResponse.json({ message: "Payment signature verification failed." }, { status: 400 });
  }

  const paidAt = new Date();
  await prisma.paymentTransaction.update({
    where: { id: transaction.id },
    data: {
      status: "paid",
      providerPaymentId: razorpayPaymentId,
      paidAt,
      metadata: { ...((transaction.metadata && typeof transaction.metadata === "object") ? transaction.metadata : {}), verifiedAt: paidAt.toISOString() }
    }
  });

  const updatedListing = await prisma.listing.update({
    where: { id: context.listing.id },
    data: {
      payment: {
        status: "paid",
        method: "currency",
        amount: transaction.amount,
        paidAt: paidAt.toISOString(),
        transactionId: transaction.id,
      }
    },
    include: { bids: true }
  });

  return NextResponse.json({
    message: "Currency payment verified.",
    listing: { ...updatedListing, _id: updatedListing.id, bids: (updatedListing.bids || []).map(b => ({ ...b, _id: b.id })) }
  });
}
