import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
const PaytmChecksum = require("paytmchecksum");
import crypto from "crypto";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const MID = process.env.PAYTM_MID;
const M_KEY = process.env.PAYTM_MERCHANT_KEY;
const BASE_URL = process.env.PAYTM_BASE_URL;

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const configuredSecret = process.env.INTERNAL_API_SECRET;
  const internalSecret = req.headers.get("x-internal-secret");
  const isInternal = Boolean(configuredSecret) && Boolean(internalSecret) && internalSecret === configuredSecret;
  
  if (!session?.user && !isInternal) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }

  const { orderId, reason } = await req.json();

  if (!orderId) return NextResponse.json({ message: "orderId required" }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ orderId }, { id: orderId }]
    }
  });
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  const refId = `REF-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "refunded",
      escrowStatus: "refunded",
      refundedAt: new Date(),
    }
  });

  return NextResponse.json({ message: "Refund processed", refId, status: "success" });
}
