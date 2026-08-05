import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import Listing from "@/models/ListingModel";
import Pickup from "@/models/Pickup";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  await mongooseConnect();
  
  const email = session.user.email;
  
  // Fetch orders where the user is either the payer or the payee
  const orders = await Order.find({
    $or: [{ payerEmail: email }, { payeeEmail: email }]
  }).sort({ createdAt: -1 }).lean();

  // Populate the listing title manually for each order to display in the UI
  for (let order of orders) {
    const listing = await Listing.findById(order.listingId).select("title category");
    if (listing) {
      order.listingTitle = listing.title;
      order.listingCategory = listing.category;
    } else {
      order.listingTitle = "Unknown Listing";
    }

    // Determine comprehensive lifecycle status
    const pickup = await Pickup.findOne({ orderId: order._id }).lean();
    
    let lifecycleStatus = order.status; // defaults to 'initiated' or 'paid'
    
    // If we have a pickup, that means the lifecycle has progressed beyond payment
    if (pickup) {
      if (pickup.status === "scheduled") lifecycleStatus = "pickup scheduled";
      else if (pickup.status === "in_progress" || pickup.status === "picked_up") lifecycleStatus = "in transit";
      else if (pickup.status === "completed") lifecycleStatus = "completed";
      
      // Auto-heal the order status if it was stuck on 'initiated' but a pickup exists
      if (order.status !== "paid") {
        await Order.updateOne({ _id: order._id }, { $set: { status: "paid" } });
      }
    }
    
    order.lifecycleStatus = lifecycleStatus;
  }

  return NextResponse.json(orders);
}
