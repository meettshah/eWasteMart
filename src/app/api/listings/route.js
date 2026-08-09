import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Listing from "@/models/ListingModel";

const SELLER_ROLES = ["user", "bulk_seller", "enterprise"];

function unauthenticated() {
  return NextResponse.json({ message: "Please login first." }, { status: 401 });
}

function forbidden(message = "You do not have access to this action.") {
  return NextResponse.json({ message }, { status: 403 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthenticated();

  await mongooseConnect();
  const listings = await Listing.find().sort({ createdAt: -1 }).lean();
  
  const userEmail = session.user.email;

  // Scrub PII for non-participants
  for (let listing of listings) {
    const isSeller = listing.sellerEmail === userEmail;
    const approvedBid = listing.bids?.find(b => b.status === "approved");
    const isApprovedBuyer = approvedBid?.bidderEmail === userEmail;

    // 1. Scrub Seller info if not the approved buyer
    if (!isSeller && !isApprovedBuyer) {
      delete listing.sellerEmail;
      delete listing.sellerPhone;
    }

    // 2. Scrub Bids info
    if (listing.bids && Array.isArray(listing.bids)) {
      for (let bid of listing.bids) {
        const isMyBid = bid.bidderEmail === userEmail;
        if (!isSeller && !isMyBid) {
          delete bid.bidderEmail;
        }
      }
    }

    // 3. Hide approved buyer name if user is not participant
    if (listing.status === "sold" && !isSeller && !isApprovedBuyer) {
      if (approvedBid) {
        approvedBid.bidderName = "Anonymous Buyer";
      }
    }
    
    // Hide exact pickupId to prevent guessing
    if (!isSeller && !isApprovedBuyer) {
      delete listing.pickupId;
    }
  }

  listings.sort((a, b) => {
    if (a.paymentStatus === "paid" && b.paymentStatus !== "paid") return 1;
    if (a.paymentStatus !== "paid" && b.paymentStatus === "paid") return -1;
    return 0;
  });

  return NextResponse.json(listings);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthenticated();
  if (!SELLER_ROLES.includes(session.user.role)) {
    return forbidden("Only users, bulk sellers and enterprises can create e-waste listings.");
  }

  await mongooseConnect();
  const body = await req.json();
  const quantity = Number(body.quantity);
  const askingPrice = Number(body.askingPrice || 0);

  if (!body.title || !body.category || !quantity || !body.location || !body.description) {
    return NextResponse.json({ message: "Please fill all required listing fields." }, { status: 400 });
  }

  const listing = await Listing.create({
    sellerId: session.user.id,
    sellerName: session.user.name,
    sellerEmail: session.user.email,
    sellerRole: session.user.role,
    title: body.title,
    category: body.category,
    quantity,
    unit: body.unit || "items",
    condition: body.condition || "mixed",
    location: body.location,
    description: body.description,
    askingPrice,
    impact: body.impact || undefined,
  });

  return NextResponse.json(listing, { status: 201 });
}
