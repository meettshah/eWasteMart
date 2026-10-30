import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id },
        { orderId: id }
      ]
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          category: true,
          condition: true,
        }
      },
      pickup: true
    }
  });

  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  // Ensure user is payer or payee
  if (order.payerEmail !== session.user.email && order.payeeEmail !== session.user.email) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    order: { ...order, _id: order.id },
    listing: order.listing ? { ...order.listing, _id: order.listing.id } : null,
    pickup: order.pickup ? { ...order.pickup, _id: order.pickup.id } : null,
  });
}
