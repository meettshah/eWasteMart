/**
 * POST /api/paytm/initiate
 * Initiates the Paytm transaction for the approved bidder.
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import crypto from "crypto";
const PaytmChecksum = require("paytmchecksum");

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const MID = process.env.PAYTM_MID;
const M_KEY = process.env.PAYTM_MERCHANT_KEY;
const WEBSITE = process.env.PAYTM_WEBSITE;
const BASE_URL = process.env.PAYTM_BASE_URL;

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }
  
  const { listingId, bidId, amount } = await req.json();
  
  if (!listingId || !bidId || !amount) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { bids: true }
  });
  if (!listing) return NextResponse.json({ message: "Listing not found" }, { status: 404 });

  if (listing.status !== "sold") {
    return NextResponse.json({ message: "Listing is not sold yet" }, { status: 400 });
  }

  const approvedBid = (listing.bids || []).find((b) => b.id === bidId);
  if (!approvedBid || approvedBid.status !== "approved") {
    return NextResponse.json({ message: "Approved bid not found" }, { status: 400 });
  }

  if (approvedBid.bidderEmail !== session.user.email) {
    return NextResponse.json({ message: "You are not the approved bidder" }, { status: 403 });
  }

  // Get payer and payee info from PostgreSQL
  const payer = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase().trim() } });
  const payee = await prisma.user.findFirst({
    where: {
      OR: [
        { id: listing.sellerId || "" },
        { email: listing.sellerEmail }
      ]
    }
  });

  if (!payer || !payee) {
    return NextResponse.json({ message: "User records not found" }, { status: 500 });
  }

  const paytmOrderId = `EWM-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  
  // Create Order in PostgreSQL
  const order = await prisma.order.create({
    data: {
      orderId: paytmOrderId,
      listingId,
      payerId: payer.id,
      payerEmail: payer.email,
      payeeId: payee.id,
      payeeEmail: payee.email,
      amount: approvedBid.amount,
      status: "pending",
      paymentMethod: "paytm",
    }
  });

  // Prepare Paytm initiate transaction request
  const paytmParams = {
    body: {
      requestType: "Payment",
      mid: MID,
      websiteName: WEBSITE,
      orderId: paytmOrderId,
      callbackUrl: `${process.env.NEXTAUTH_URL?.replace(/\/$/, "")}/api/paytm/callback`,
      txnAmount: {
        value: approvedBid.amount.toString(),
        currency: "INR",
      },
      userInfo: {
        custId: payer.id,
        email: payer.email,
      },
    }
  };

  try {
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      M_KEY
    );
    
    paytmParams.head = {
      signature: checksum
    };

    const post_data = JSON.stringify(paytmParams);
    
    const res = await fetch(`${BASE_URL}/theia/api/v1/initiateTransaction?mid=${MID}&orderId=${paytmOrderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": post_data.length,
      },
      body: post_data,
    });
    
    const data = await res.json();
    
    if (data.body.resultInfo.resultStatus === "S") {
      return NextResponse.json({
        txnToken: data.body.txnToken,
        paytmOrderId,
        mid: MID
      });
    } else if (data.body.resultInfo.resultCode === "501" || process.env.NEXT_PUBLIC_PAYTM_ENV !== "production") {
      console.warn("Paytm API rejected the initiation or mock mode is active. Falling back to mock transaction token to allow testing.");
      return NextResponse.json({
        txnToken: "MOCK_TXN_TOKEN",
        paytmOrderId,
        mid: MID
      });
    } else {
      console.error("Paytm initiate err:", data.body.resultInfo);
      return NextResponse.json({ message: "Failed to initiate payment" }, { status: 500 });
    }
  } catch (error) {
    console.error("Paytm generation error:", error);
    return NextResponse.json({ message: "Server error initiating payment" }, { status: 500 });
  }
}
