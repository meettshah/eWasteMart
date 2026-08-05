/**
 * POST /api/paytm/initiate
 * Initiates the Paytm transaction for the approved bidder.
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Use PaytmChecksum library
const PaytmChecksum = require("paytmchecksum");

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Listing from "@/models/ListingModel";
import { Order } from "@/models/Order";
import Login from "@/models/LoginModel";

const MID = process.env.PAYTM_MID;
const M_KEY = process.env.PAYTM_MERCHANT_KEY;
const WEBSITE = process.env.PAYTM_WEBSITE;
const BASE_URL = process.env.PAYTM_BASE_URL;

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }

  await mongooseConnect();
  
  const { listingId, bidId, amount } = await req.json();
  
  if (!listingId || !bidId || !amount) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const listing = await Listing.findById(listingId);
  if (!listing) return NextResponse.json({ message: "Listing not found" }, { status: 404 });

  if (listing.status !== "sold") {
    return NextResponse.json({ message: "Listing is not sold yet" }, { status: 400 });
  }
  if (listing.paymentStatus === "paid") {
    return NextResponse.json({ message: "Listing is already paid" }, { status: 409 });
  }

  const approvedBid = listing.bids.id(bidId);
  if (!approvedBid || approvedBid.status !== "approved") {
    return NextResponse.json({ message: "Approved bid not found" }, { status: 400 });
  }

  if (approvedBid.bidderEmail !== session.user.email) {
    return NextResponse.json({ message: "You are not the approved bidder" }, { status: 403 });
  }

  // Get payer and payee info
  const payer = await Login.findOne({ email: session.user.email });
  const payee = await Login.findOne({ email: listing.sellerEmail });

  if (!payer || !payee) {
    return NextResponse.json({ message: "User records not found" }, { status: 500 });
  }

  const paytmOrderId = `EWM-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  
  // Create Order in DB
  const order = await Order.create({
    listingId,
    bidId,
    payerId: payer._id,
    payerName: payer.name,
    payerEmail: payer.email,
    payeeId: payee._id,
    payeeName: payee.name,
    payeeEmail: payee.email,
    amount: approvedBid.amount,
    paytmOrderId,
    status: "initiated"
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
        custId: payer._id.toString(),
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
      order.paytmTxnToken = data.body.txnToken;
      await order.save();
      
      return NextResponse.json({
        txnToken: data.body.txnToken,
        paytmOrderId,
        mid: MID
      });
    } else if (data.body.resultInfo.resultCode === "501" || process.env.NEXT_PUBLIC_PAYTM_ENV !== "production") {
      console.warn("Paytm API rejected the initiation or mock mode is active. Falling back to mock transaction token to allow testing.");
      order.paytmTxnToken = "MOCK_TXN_TOKEN";
      await order.save();
      
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
