import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Listing from "@/models/ListingModel";

const BIDDER_ROLES = ["recycler", "enterprise"];

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }
  if (!BIDDER_ROLES.includes(session.user.role)) {
    return NextResponse.json({ message: "Only recyclers and enterprises can bid on e-waste." }, { status: 403 });
  }

  await mongooseConnect();
  const { id } = await params;
  const listing = await Listing.findById(id);
  if (!listing) return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  if (listing.status !== "open") return NextResponse.json({ message: "This listing is already sold." }, { status: 400 });
  if (listing.sellerEmail === session.user.email) {
    return NextResponse.json({ message: "You cannot bid on your own listing." }, { status: 400 });
  }

  const body = await req.json();
  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    return NextResponse.json({ message: "Please enter a valid bid amount." }, { status: 400 });
  }

  listing.bids.push({
    bidderId: session.user.id,
    bidderName: session.user.name,
    bidderEmail: session.user.email,
    bidderRole: session.user.role,
    amount,
    message: body.message || "",
  });
  await listing.save();

  return NextResponse.json(listing, { status: 201 });
}
