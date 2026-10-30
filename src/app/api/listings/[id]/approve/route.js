import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }

  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { bids: true }
  });

  if (!listing) return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  if (listing.sellerEmail !== session.user.email) {
    return NextResponse.json({ message: "Only the listing owner can approve a bid." }, { status: 403 });
  }
  if (listing.status !== "open") {
    return NextResponse.json({ message: "This listing already has an approved buyer." }, { status: 400 });
  }

  const { bidId } = await req.json();
  const bid = (listing.bids || []).find((b) => b.id === bidId);
  if (!bid) return NextResponse.json({ message: "Bid not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.bid.updateMany({
      where: { listingId: id, id: { not: bidId } },
      data: { status: "rejected" }
    }),
    prisma.bid.update({
      where: { id: bidId },
      data: { status: "approved" }
    }),
    prisma.listing.update({
      where: { id },
      data: { status: "sold", approvedBidId: bidId }
    })
  ]);

  try {
    const { dispatchNotification } = await import("@/lib/notifications");
    await dispatchNotification({
      userId: bid.bidderId,
      userEmail: bid.bidderEmail,
      title: "Bid Approved! Action Required",
      message: `Congratulations! Your bid of Rs. ${bid.amount.toLocaleString("en-IN")} for "${listing.title}" was approved. Please complete the payment to schedule the pickup.`,
      type: "PAYMENT",
      link: "/marketplace",
      channels: ["IN_APP", "EMAIL"]
    });
  } catch (err) {
    console.error("Notification error:", err);
  }

  const updated = await prisma.listing.findUnique({
    where: { id },
    include: { bids: true }
  });

  return NextResponse.json({
    ...updated,
    _id: updated.id,
    approvedBid: bidId,
    bids: (updated.bids || []).map((b) => ({ ...b, _id: b.id }))
  });
}
