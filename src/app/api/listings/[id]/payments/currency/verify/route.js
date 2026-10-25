import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import { getApprovedPaymentContext, jsonError, verifyRazorpaySignature } from "@/lib/paymentSecurity";
import Listing from "@/models/ListingModel";
import PaymentTransaction from "@/models/PaymentTransactionModel";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  await mongooseConnect();
  const context = await getApprovedPaymentContext(params.id, session.user);
  if (context.error) return jsonError(NextResponse, context.error);

  const body = await req.json();
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ message: "Payment verification payload is incomplete." }, { status: 400 });
  }

  const transaction = await PaymentTransaction.findOne({
    listingId: context.listing._id,
    method: "currency",
    providerOrderId: razorpayOrderId,
    status: "initiated",
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
    transaction.status = "failed";
    transaction.metadata = { ...transaction.metadata, failedReason: "signature_mismatch" };
    await transaction.save();
    return NextResponse.json({ message: "Payment signature verification failed." }, { status: 400 });
  }

  const paidAt = new Date();
  transaction.status = "paid";
  transaction.providerPaymentId = razorpayPaymentId;
  transaction.paidAt = paidAt;
  transaction.metadata = { ...transaction.metadata, verifiedAt: paidAt.toISOString() };
  await transaction.save();

  const updatedListing = await Listing.findOneAndUpdate(
    {
      _id: context.listing._id,
      "payment.status": { $ne: "paid" },
    },
    {
      $set: {
        "payment.status": "paid",
        "payment.method": "currency",
        "payment.amount": transaction.amount,
        "payment.paidAt": paidAt,
        "payment.transactionId": transaction._id,
      },
    },
    { new: true }
  );

  if (!updatedListing) {
    return NextResponse.json({ message: "Listing was already paid." }, { status: 409 });
  }

  return NextResponse.json({ message: "Currency payment verified.", listing: updatedListing });
}
