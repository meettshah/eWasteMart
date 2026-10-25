import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import Pickup from "@/models/Pickup";
import Listing from "@/models/ListingModel";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await mongooseConnect();
  const { id } = await params;

  const order = await Order.findById(id).lean();
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  // Ensure user is payer or payee
  if (order.payerEmail !== session.user.email && order.payeeEmail !== session.user.email) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const listing = await Listing.findById(order.listingId).select("title category condition").lean();
  const pickup = await Pickup.findOne({ orderId: id }).lean();

  return NextResponse.json({
    order,
    listing,
    pickup
  });
}
