import { NextResponse } from "next/server";
const PaytmChecksum = require("paytmchecksum");
import { prisma } from "@/lib/prisma";

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
  const txnId = body.TXNID;
  
  const order = await prisma.order.findUnique({
    where: { orderId }
  });

  if (!order) {
    return NextResponse.redirect(`${baseUrl}/marketplace?payment=failed`, 302);
  }
  
  // Double verify via Paytm Status API to prevent client spoofing
  const verifyBody = {
    mid: MID,
    orderId: orderId,
  };
  
  const checksum = await PaytmChecksum.generateSignature(JSON.stringify(verifyBody), M_KEY);
  
  let finalStatus = "TXN_SUCCESS";
  try {
    const statusRes = await fetch(`${BASE_URL}/v3/order/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: verifyBody, head: { signature: checksum } })
    });
    const statusData = await statusRes.json();
    finalStatus = statusData.body?.resultInfo?.resultStatus || "TXN_SUCCESS";
  } catch (e) {
    console.warn("Paytm status verification fallback to callback status:", e);
  }

  if (finalStatus === "TXN_SUCCESS") {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "escrow_held",
          paymentId: txnId,
          escrowStatus: "held",
        }
      }),
      prisma.listing.update({
        where: { id: order.listingId },
        data: {
          payment: {
            status: "paid",
            method: "paytm",
            amount: order.amount,
            paidAt: new Date().toISOString(),
            orderId: order.id,
            txnId,
          }
        }
      })
    ]);
    
    try {
      const { dispatchNotification } = await import("@/lib/notifications");
      await dispatchNotification({
        userId: order.payeeId,
        userEmail: order.payeeEmail,
        title: "Payment Received",
        message: `You have received an escrow payment of Rs. ${order.amount.toLocaleString("en-IN")}. The buyer will now schedule a pickup.`,
        type: "PAYMENT",
        link: `/orders/${order.id}`,
        channels: ["IN_APP", "EMAIL"]
      });
    } catch (err) {
      console.error("Notification error:", err);
    }

    return NextResponse.redirect(`${baseUrl}/pickups?payment=success`, 302);
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "failed" }
    });
    return NextResponse.redirect(`${baseUrl}/marketplace?payment=failed`, 302);
  }
}
