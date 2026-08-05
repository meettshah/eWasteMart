import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Listing from "@/models/ListingModel";
import { dispatchNotification } from "@/lib/notifications";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await mongooseConnect();
  const { id, bidId } = await params;
  
  const listing = await Listing.findById(id);
  if (!listing) return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  if (listing.status !== "open") return NextResponse.json({ message: "Listing is no longer open" }, { status: 400 });

  const bid = listing.bids.id(bidId);
  if (!bid) return NextResponse.json({ message: "Bid not found" }, { status: 404 });

  const body = await req.json();

  const isSeller = session.user.email === listing.sellerEmail;
  const isBidder = session.user.email === bid.bidderEmail;

  if (isSeller) {
    // Seller proposes a counter offer
    const { amount, message } = body;
    if (!amount || amount <= 0) return NextResponse.json({ message: "Invalid counter offer amount" }, { status: 400 });

    bid.counterOffer = { amount, message: message || "", status: "pending" };
    await listing.save();

    await dispatchNotification({
      userId: bid.bidderId,
      userEmail: bid.bidderEmail,
      title: "Counter Offer Received",
      message: `The seller of "${listing.title}" countered your bid with a new offer of Rs. ${amount.toLocaleString("en-IN")}.`,
      type: "BID",
      link: "/marketplace",
      channels: ["IN_APP", "EMAIL"]
    });

    return NextResponse.json({ message: "Counter offer sent successfully" });
  } 
  
  if (isBidder) {
    // Bidder responds to a counter offer
    const { action } = body; // "accept" or "reject"
    if (!bid.counterOffer || bid.counterOffer.status !== "pending") {
      return NextResponse.json({ message: "No pending counter offer found" }, { status: 400 });
    }

    if (action === "accept") {
      bid.amount = bid.counterOffer.amount;
      bid.counterOffer.status = "accepted";
      
      await dispatchNotification({
        userId: listing.sellerId,
        userEmail: listing.sellerEmail,
        title: "Counter Offer Accepted",
        message: `${session.user.name} accepted your counter offer of Rs. ${bid.amount.toLocaleString("en-IN")} on "${listing.title}". You can now approve this bid!`,
        type: "BID",
        link: "/marketplace",
        channels: ["IN_APP", "EMAIL"]
      });
    } else {
      bid.counterOffer.status = "rejected";
      
      await dispatchNotification({
        userId: listing.sellerId,
        userEmail: listing.sellerEmail,
        title: "Counter Offer Rejected",
        message: `${session.user.name} rejected your counter offer on "${listing.title}".`,
        type: "BID",
        link: "/marketplace",
        channels: ["IN_APP", "EMAIL"]
      });
    }

    await listing.save();
    return NextResponse.json({ message: `Counter offer ${action}ed` });
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}
