/**
 * POST /api/paytm/callback
 * Paytm redirects/POSTs here after payment modal closes.
 */
import { NextResponse } from "next/server";
const PaytmChecksum = require("paytmchecksum");

import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import Listing from "@/models/ListingModel";

const M_KEY = process.env.PAYTM_MERCHANT_KEY;
const MID = process.env.PAYTM_MID;
const BASE_URL = process.env.PAYTM_BASE_URL;

export async function POST(req) {
  const formData = await req.formData();
  const body = {};
  for (const [key, value] of formData.entries()) {
    body[key] = value;
  }
  
  const paytmChecksum = body.CHECKSUMHASH;
  delete body.CHECKSUMHASH;
  
  const isVerifySignature = PaytmChecksum.verifySignature(body, M_KEY, paytmChecksum);
  
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  if (!isVerifySignature) {
    console.error("[Paytm] Checksum mismatch!");
    return NextResponse.redirect(`${baseUrl}/marketplace?payment=tampered`, 302);
  }

  const orderId = body.ORDERID;
  const txnStatus = body.STATUS;
  const txnId = body.TXNID;
  
  await mongooseConnect();
  const order = await Order.findOne({ paytmOrderId: orderId });
  if (!order) {
    return NextResponse.redirect(`${baseUrl}/marketplace?payment=failed`, 302);
  }
  
  // Double verify via Paytm Status API to prevent client spoofing
  const verifyBody = {
    mid: MID,
    orderId: orderId,
  };
  
  const checksum = await PaytmChecksum.generateSignature(JSON.stringify(verifyBody), M_KEY);
  
  const statusRes = await fetch(`${BASE_URL}/v3/order/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: verifyBody, head: { signature: checksum } })
  });
  
  const statusData = await statusRes.json();
  const finalStatus = statusData.body?.resultInfo?.resultStatus;
  
  order.paytmRawCallback = body;
  order.paytmTxnId = txnId;

  if (finalStatus === "TXN_SUCCESS") {
    order.status = "paid";
    await order.save();
    
    // Update listing
    const listing = await Listing.findById(order.listingId);
    if (listing) {
      listing.paymentStatus = "paid";
      listing.orderId = order._id;
      await listing.save();
    }
    
    try {
      const { dispatchNotification } = await import("@/lib/notifications");
      await dispatchNotification({
        userId: order.payeeId,
        userEmail: order.payeeEmail,
        title: "Payment Received",
        message: `You have received a payment of Rs. ${order.amount.toLocaleString("en-IN")} from ${order.payerName}. The buyer will now schedule a pickup.`,
        type: "PAYMENT",
        link: `/orders/${order._id}`,
        channels: ["IN_APP", "EMAIL"]
      });
    } catch (err) {
      console.error("Notification error:", err);
    }

    return NextResponse.redirect(`${baseUrl}/pickups?payment=success`, 302);
  } else {
    order.status = "failed";
    await order.save();
    return NextResponse.redirect(`${baseUrl}/marketplace?payment=failed`, 302);
  }
}
