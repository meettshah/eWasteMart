import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const paytmOrderId = searchParams.get("orderId");
  
  if (!paytmOrderId) {
    return NextResponse.json({ message: "orderId required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ orderId: paytmOrderId }, { id: paytmOrderId }]
    }
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }
  if (order.payerEmail !== session.user.email && order.payeeEmail !== session.user.email) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  
  return NextResponse.json({ status: order.status });
}
