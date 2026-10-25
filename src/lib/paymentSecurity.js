import crypto from "crypto";
import Listing from "@/models/ListingModel";
import Login from "@/models/LoginModel";
import PaymentTransaction from "@/models/PaymentTransactionModel";

export async function getApprovedPaymentContext(listingId, user) {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    return { error: { message: "Listing not found.", status: 404 } };
  }
  if (listing.status !== "sold" || !listing.approvedBid) {
    return { error: { message: "A bid must be approved before payment.", status: 400 } };
  }
  if (listing.payment?.status === "paid") {
    return { error: { message: "This listing is already paid.", status: 409 } };
  }

  const approvedBid = listing.bids.id(listing.approvedBid);
  if (!approvedBid || approvedBid.status !== "approved") {
    return { error: { message: "Approved bid could not be verified.", status: 400 } };
  }
  if (approvedBid.bidderEmail !== user.email) {
    return { error: { message: "Only the approved bidder can pay for this listing.", status: 403 } };
  }

  const receiver = await Login.findById(listing.sellerId);
  if (!receiver) {
    return { error: { message: "Seller account not found.", status: 404 } };
  }

  return {
    listing,
    approvedBid,
    receiver,
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

export async function createTokenBlockHash(payload) {
  const lastTokenPayment = await PaymentTransaction.findOne({
    method: "token",
    status: "paid",
    hash: { $ne: null },
  }).sort({ blockIndex: -1 });

  const blockIndex = lastTokenPayment ? lastTokenPayment.blockIndex + 1 : 1;
  const previousHash = lastTokenPayment?.hash || "GENESIS";
  const nonce = crypto.randomBytes(16).toString("hex");
  const createdAt = new Date();
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ ...payload, blockIndex, previousHash, nonce, createdAt: createdAt.toISOString() }))
    .digest("hex");

  return { blockIndex, previousHash, hash, nonce, createdAt };
}
