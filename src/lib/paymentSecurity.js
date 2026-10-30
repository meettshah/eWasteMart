import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function getApprovedPaymentContext(listingId, user) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { bids: true }
  });

  if (!listing) {
    return { error: { message: "Listing not found.", status: 404 } };
  }
  if (listing.status !== "sold" || !listing.approvedBidId) {
    return { error: { message: "A bid must be approved before payment.", status: 400 } };
  }
  if (listing.payment?.status === "paid") {
    return { error: { message: "This listing is already paid.", status: 409 } };
  }

  const approvedBid = (listing.bids || []).find((b) => b.id === listing.approvedBidId);
  if (!approvedBid || approvedBid.status !== "approved") {
    return { error: { message: "Approved bid could not be verified.", status: 400 } };
  }
  if (approvedBid.bidderEmail !== user.email) {
    return { error: { message: "Only the approved bidder can pay for this listing.", status: 403 } };
  }

  const receiver = await prisma.user.findFirst({
    where: {
      OR: [
        { id: listing.sellerId || "" },
        { email: listing.sellerEmail }
      ]
    }
  });

  if (!receiver) {
    return { error: { message: "Seller account not found.", status: 404 } };
  }

  return {
    listing: { ...listing, _id: listing.id, approvedBid: listing.approvedBidId },
    approvedBid: { ...approvedBid, _id: approvedBid.id },
    receiver: { ...receiver, _id: receiver.id },
    amount: Number(approvedBid.amount),
  };
}

export function jsonError(NextResponse, error) {
  return NextResponse.json({ message: error.message }, { status: error.status });
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Payment gateway is not configured.");
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature || "");

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

export function createTokenBlockHash({ blockIndex, previousHash, payload, timestamp }) {
  return crypto
    .createHash("sha256")
    .update(`${blockIndex}:${previousHash}:${JSON.stringify(payload)}:${timestamp}`)
    .digest("hex");
}
