import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createTokenBlockHash, getApprovedPaymentContext, jsonError } from "@/lib/paymentSecurity";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
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

  const payer = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!payer || (payer.tokenBalance || 0) < amount) {
    return NextResponse.json({ message: "Insufficient EWM token balance." }, { status: 400 });
  }

  const lastTx = await prisma.paymentTransaction.findFirst({
    orderBy: { createdAt: "desc" }
  });

  const blockIndex = (lastTx?.blockIndex || 0) + 1;
  const previousHash = lastTx?.hash || "0000000000000000000000000000000000000000000000000000000000000000";
  const paidAt = new Date();
  const hash = createTokenBlockHash({
    blockIndex,
    previousHash,
    payload: {
      listingId: listing.id,
      bidId: approvedBid.id,
      payerId: session.user.id,
      receiverId: receiver.id,
      amount,
    },
    timestamp: paidAt.toISOString()
  });

  try {
    const [debitUser, creditUser, transaction, updatedListing] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { tokenBalance: { decrement: amount } }
      }),
      prisma.user.update({
        where: { id: receiver.id },
        data: { tokenBalance: { increment: amount } }
      }),
      prisma.paymentTransaction.create({
        data: {
          listingId: listing.id,
          bidId: approvedBid.id,
          payerId: session.user.id,
          payerEmail: session.user.email,
          receiverId: receiver.id,
          receiverEmail: receiver.email,
          method: "token",
          amount,
          currency: "EWM",
          status: "paid",
          provider: "ewm-token",
          blockIndex,
          previousHash,
          hash,
          paidAt,
        }
      }),
      prisma.listing.update({
        where: { id: listing.id },
        data: {
          payment: {
            status: "paid",
            method: "token",
            amount,
            paidAt: paidAt.toISOString(),
            blockIndex,
            hash,
          }
        },
        include: { bids: true }
      })
    ]);

    return NextResponse.json({
      message: "Token payment completed.",
      listing: { ...updatedListing, _id: updatedListing.id, bids: (updatedListing.bids || []).map(b => ({ ...b, _id: b.id })) },
      transaction: { ...transaction, _id: transaction.id },
    });
  } catch (error) {
    console.error("Token payment error:", error);
    return NextResponse.json({ message: error.message || "Token payment failed." }, { status: 400 });
  }
}
