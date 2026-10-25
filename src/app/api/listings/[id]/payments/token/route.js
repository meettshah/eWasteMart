import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import { createTokenBlockHash, getApprovedPaymentContext, jsonError } from "@/lib/paymentSecurity";
import Listing from "@/models/ListingModel";
import Login from "@/models/LoginModel";
import PaymentTransaction from "@/models/PaymentTransactionModel";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  await mongooseConnect();
  const context = await getApprovedPaymentContext(params.id, session.user);
  if (context.error) return jsonError(NextResponse, context.error);

  const { listing, approvedBid, receiver, amount } = context;
  const existingPaid = await PaymentTransaction.findOne({ listingId: listing._id, status: "paid" });
  if (existingPaid) {
    return NextResponse.json({ message: "This listing is already paid." }, { status: 409 });
  }

  const block = await createTokenBlockHash({
    listingId: listing._id.toString(),
    bidId: approvedBid._id.toString(),
    payerId: session.user.id,
    receiverId: receiver._id.toString(),
    amount,
  });

  const dbSession = await mongoose.startSession();
  try {
    let savedTransaction;
    await dbSession.withTransaction(async () => {
      const debit = await Login.updateOne(
        { _id: session.user.id, tokenBalance: { $gte: amount } },
        { $inc: { tokenBalance: -amount } },
        { session: dbSession }
      );
      if (debit.modifiedCount !== 1) {
        throw new Error("Insufficient EWM token balance.");
      }

      await Login.updateOne(
        { _id: receiver._id },
        { $inc: { tokenBalance: amount } },
        { session: dbSession }
      );

      const [transaction] = await PaymentTransaction.create(
        [
          {
            listingId: listing._id,
            bidId: approvedBid._id,
            payerId: session.user.id,
            payerEmail: session.user.email,
            receiverId: receiver._id,
            receiverEmail: receiver.email,
            method: "token",
            amount,
            currency: "EWM",
            status: "paid",
            provider: "ewm-token",
            blockIndex: block.blockIndex,
            previousHash: block.previousHash,
            hash: block.hash,
            metadata: { nonce: block.nonce },
            paidAt: block.createdAt,
          },
        ],
        { session: dbSession }
      );
      savedTransaction = transaction;

      const updatedListing = await Listing.updateOne(
        { _id: listing._id, "payment.status": { $ne: "paid" } },
        {
          $set: {
            "payment.status": "paid",
            "payment.method": "token",
            "payment.amount": amount,
            "payment.paidAt": block.createdAt,
            "payment.transactionId": transaction._id,
          },
        },
        { session: dbSession }
      );

      if (updatedListing.modifiedCount !== 1) {
        throw new Error("Listing was already paid.");
      }
    });

    const updatedListing = await Listing.findById(listing._id);
    return NextResponse.json({
      message: "Token payment completed.",
      listing: updatedListing,
      transaction: savedTransaction,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Token payment failed." }, { status: 400 });
  } finally {
    await dbSession.endSession();
  }
}
