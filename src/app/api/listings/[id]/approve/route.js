import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Listing from "@/models/ListingModel";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  await mongooseConnect();
  const { id } = await params;
  const listing = await Listing.findById(id);
  if (!listing) return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  if (listing.sellerEmail !== session.user.email) {
    return NextResponse.json({ message: "Only the listing owner can approve a bid." }, { status: 403 });
  }
  if (listing.status !== "open") {
    return NextResponse.json({ message: "This listing already has an approved buyer." }, { status: 400 });
  }

  const { bidId } = await req.json();
  const bid = listing.bids.id(bidId);
  if (!bid) return NextResponse.json({ message: "Bid not found." }, { status: 404 });

  listing.bids.forEach((currentBid) => {
    currentBid.status = currentBid._id.equals(bid._id) ? "approved" : "rejected";
  });
  listing.approvedBid = bid._id;
  listing.status = "sold";
  await listing.save();

  return NextResponse.json(listing);
}
