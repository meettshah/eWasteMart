import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { dispatchNotification } from "@/lib/notifications";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id, bidId } = await params;
  
  const listing = await prisma.listing.findUnique({
    where: { id }
  });
  if (!listing) return NextResponse.json({ message: "Listing not found" }, { status: 404 });
  if (listing.status !== "open") return NextResponse.json({ message: "Listing is no longer open" }, { status: 400 });

  const bid = await prisma.bid.findUnique({
    where: { id: bidId }
  });
  if (!bid) return NextResponse.json({ message: "Bid not found" }, { status: 404 });

  const body = await req.json();

  const isSeller = session.user.email === listing.sellerEmail;
  const isBidder = session.user.email === bid.bidderEmail;

  if (isSeller) {
    // Seller proposes a counter offer
    const { amount, message } = body;
    if (!amount || amount <= 0) return NextResponse.json({ message: "Invalid counter offer amount" }, { status: 400 });

    const counterOffer = { amount, message: message || "", status: "pending" };
    await prisma.bid.update({
      where: { id: bidId },
      data: { counterOffer }
    });

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
    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ message: "Invalid action. Use 'accept' or 'reject'." }, { status: 400 });
    }
    const counterOffer = bid.counterOffer;
    if (!counterOffer || counterOffer.status !== "pending") {
      return NextResponse.json({ message: "No pending counter offer found" }, { status: 400 });
    }

    if (action === "accept") {
      await prisma.bid.update({
        where: { id: bidId },
        data: {
          amount: counterOffer.amount,
          counterOffer: { ...counterOffer, status: "accepted" }
        }
      });

      await dispatchNotification({
        userId: listing.sellerId,
        userEmail: listing.sellerEmail,
        title: "Counter Offer Accepted!",
        message: `${session.user.name} accepted your counter offer of Rs. ${counterOffer.amount.toLocaleString("en-IN")} on "${listing.title}". You can now approve this bid!`,
        type: "BID",
        link: "/marketplace",
        channels: ["IN_APP", "EMAIL"]
      });

      return NextResponse.json({ message: "Counter offer accepted successfully" });
    } else {
      await prisma.bid.update({
        where: { id: bidId },
        data: {
          counterOffer: { ...counterOffer, status: "rejected" }
        }
      });

      await dispatchNotification({
        userId: listing.sellerId,
        userEmail: listing.sellerEmail,
        title: "Counter Offer Declined",
        message: `${session.user.name} declined your counter offer on "${listing.title}". The original bid remains active.`,
        type: "BID",
        link: "/marketplace",
        channels: ["IN_APP", "EMAIL"]
      });

      return NextResponse.json({ message: "Counter offer rejected" });
    }
  }

  return NextResponse.json({ message: "Unauthorized action on this bid" }, { status: 403 });
}
