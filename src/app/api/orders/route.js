import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }
  
  const email = session.user.email?.toLowerCase().trim();
  
  // Fetch orders where the user is either the payer or the payee
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { payerEmail: email },
        { payeeEmail: email }
      ]
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          category: true,
        }
      },
      pickup: true
    },
    orderBy: { createdAt: "desc" }
  });

  const formatted = orders.map((order) => {
    let lifecycleStatus = order.status;
    if (order.pickup) {
      if (order.pickup.status === "scheduled") lifecycleStatus = "pickup scheduled";
      else if (order.pickup.status === "in_progress" || order.pickup.status === "picked_up") lifecycleStatus = "in transit";
      else if (order.pickup.status === "completed") lifecycleStatus = "completed";
    }

    return {
      ...order,
      _id: order.id,
      listingTitle: order.listing?.title || "Unknown Listing",
      listingCategory: order.listing?.category || "",
      lifecycleStatus,
    };
  });

  return NextResponse.json(formatted);
}
