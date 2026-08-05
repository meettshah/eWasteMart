/**
 * POST /api/pickup
 * Creates a new pickup schedule.
 * Only the approved recycler can schedule a pickup.
 * 
 * GET /api/pickup
 * Returns all pickups involving the logged-in user (as seller or recycler).
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Listing from "@/models/ListingModel";
import { Order } from "@/models/Order";
import Pickup from "@/models/Pickup";
import Login from "@/models/LoginModel";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  await mongooseConnect();
  const { listingId, scheduledDate, scheduledTimeSlot, pickupNotes } = await req.json();
  
  if (!listingId || !scheduledDate || !scheduledTimeSlot) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const listing = await Listing.findById(listingId);
  if (!listing) return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  
  if (listing.paymentStatus !== "paid" || !listing.orderId) {
    return NextResponse.json({ message: "Listing must be paid to schedule pickup" }, { status: 400 });
  }

  const order = await Order.findById(listing.orderId);
  if (!order || order.payerEmail !== session.user.email) {
    return NextResponse.json({ message: "Unauthorized. You are not the buyer." }, { status: 403 });
  }

  const recycler = await Login.findOne({ email: session.user.email });
  if (!recycler) return NextResponse.json({ message: "Recycler profile not found" }, { status: 500 });
  
  const sellerProfile = await Login.findById(listing.sellerId);

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  const reqDate = new Date(scheduledDate);
  if (reqDate < minDate) {
    return NextResponse.json({ message: "Pickup must be scheduled at least 24 hours in advance." }, { status: 400 });
  }

  const pickup = await Pickup.create({
    listingId,
    orderId: listing.orderId,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    sellerEmail: listing.sellerEmail,
    sellerPhone: sellerProfile?.contactNumber || null,
    recyclerId: recycler._id,
    recyclerName: recycler.name,
    recyclerEmail: recycler.email,
    listingTitle: listing.title,
    scheduledDate: reqDate,
    scheduledTimeSlot,
    pickupAddress: listing.location,
    pickupNotes: pickupNotes || "",
    status: "scheduled",
    recyclerConfirmed: true, 
    recyclerConfirmedAt: new Date()
  });

  listing.pickupId = pickup._id;
  await listing.save();

  console.log(`[Pickup] Scheduled pickup ${pickup._id} for listing ${listingId}. Notify seller: ${pickup.sellerEmail}`);
  
  return NextResponse.json({ message: "Pickup scheduled", pickupId: pickup._id });
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Not logged in" }, { status: 401 });

  await mongooseConnect();
  const email = session.user.email;
  
  const pickups = await Pickup.find({
    $or: [{ sellerEmail: email }, { recyclerEmail: email }]
  }).sort({ createdAt: -1 });

  return NextResponse.json(pickups);
}
