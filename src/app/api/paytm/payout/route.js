import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const configuredSecret = process.env.INTERNAL_API_SECRET;
  if (!configuredSecret) {
    return NextResponse.json({ message: "Internal secret is not configured" }, { status: 503 });
  }

  const internalSecret = req.headers.get("x-internal-secret");
  
  if (!internalSecret || internalSecret !== configuredSecret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { orderId, pickupId } = await req.json();
  
  if (!orderId) {
    return NextResponse.json({ message: "orderId required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ orderId }, { id: orderId }]
    }
  });
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  
  await prisma.order.update({
    where: { id: order.id },
    data: {
      escrowStatus: "released",
      status: "released",
      releasedAt: new Date(),
    }
  });
  
  return NextResponse.json({ message: "Payout initiated", status: "released" });
}
