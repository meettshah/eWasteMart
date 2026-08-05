/**
 * POST /api/paytm/refund
 * Initiates a refund. Can be called manually by seller, or auto-triggered via internal call.
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
const PaytmChecksum = require("paytmchecksum");
import crypto from "crypto";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

const MID = process.env.PAYTM_MID;
const M_KEY = process.env.PAYTM_MERCHANT_KEY;
const BASE_URL = process.env.PAYTM_BASE_URL;

export async function POST(req) {
  const session = await getServerSession(authOptions);
  
  const internalSecret = req.headers.get("x-internal-secret");
  const isInternal = internalSecret === process.env.INTERNAL_API_SECRET;
  
  if (!session?.user && !isInternal) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }

  await mongooseConnect();
  const { orderId, reason } = await req.json();

  if (!orderId) return NextResponse.json({ message: "orderId required" }, { status: 400 });

  const order = await Order.findOne({ paytmOrderId: orderId });
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  if (order.status !== "paid") {
    return NextResponse.json({ message: "Order not in paid state" }, { status: 400 });
  }

  // Generate unique refund ID per attempt
  const refId = `REF-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  
  const refundBody = {
    mid: MID,
    txnType: "REFUND",
    orderId: orderId,
    txnId: order.paytmTxnId,
    refId: refId,
    refundAmount: order.amount.toString(),
  };

  try {
    const checksum = await PaytmChecksum.generateSignature(JSON.stringify(refundBody), M_KEY);
    
    const post_data = JSON.stringify({
      body: refundBody,
      head: { signature: checksum }
    });
    
    const res = await fetch(`${BASE_URL}/refund/api/v1/async/refund?mid=${MID}&orderId=${orderId}&refId=${refId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: post_data,
    });
    
    const data = await res.json();
    const resultStatus = data.body?.resultInfo?.resultStatus;
    
    if (["PENDING", "TXN_SUCCESS"].includes(resultStatus)) {
      order.status = "refund_requested";
      order.refundId = refId;
      order.refundAmount = order.amount;
      order.refundStatus = resultStatus === "TXN_SUCCESS" ? "success" : "pending";
      order.refundReason = reason || "Pickup failed";
      order.refundInitiatedAt = new Date();
      await order.save();
      
      return NextResponse.json({ message: "Refund initiated", refId, status: order.refundStatus });
    } else {
      console.error("Refund err:", data.body?.resultInfo);
      return NextResponse.json({ message: "Failed to initiate refund from Paytm" }, { status: 500 });
    }
  } catch (error) {
    console.error("Refund generation err:", error);
    return NextResponse.json({ message: "Server error initiating refund" }, { status: 500 });
  }
}
