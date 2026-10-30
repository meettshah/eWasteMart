import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { evaluateBidFairness } from "@/lib/fuzzy/priceEvaluator";

const BIDDER_ROLES = ["recycler", "enterprise"];

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }
  if (!BIDDER_ROLES.includes(session.user.role)) {
    return NextResponse.json({ message: "Only recyclers and enterprises can bid on e-waste." }, { status: 403 });
  }

  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { bids: true }
  });

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

  // Soft Computing: Fuzzy Logic Fairness Evaluation (Feature 2A)
  const fairness = evaluateBidFairness(
    amount,
    listing.askingPrice,
    listing.condition,
    listing.quantity
  );

  const newBid = await prisma.bid.create({
    data: {
      listingId: id,
      bidderId: session.user.id,
      bidderName: session.user.name,
      bidderEmail: session.user.email,
      bidderRole: session.user.role,
      amount,
      message: body.message || "",
      fuzzyFairness: {
        score: fairness.score,
        label: fairness.label,
        color: fairness.color,
      },
    }
  });

  try {
    const { dispatchNotification } = await import("@/lib/notifications");
    await dispatchNotification({
      userId: listing.sellerId,
      userEmail: listing.sellerEmail,
      title: "New Bid Placed!",
      message: `${session.user.name} placed a bid of Rs. ${amount.toLocaleString("en-IN")} on your listing "${listing.title}". Fairness score: ${fairness.score}/100 (${fairness.label}).`,
      type: "BID",
      link: "/marketplace",
      channels: ["IN_APP", "EMAIL"]
    });
  } catch (err) {
    console.error("Notification error:", err);
  }

  const updatedListing = await prisma.listing.findUnique({
    where: { id },
    include: { bids: true }
  });

  return NextResponse.json({
    ...updatedListing,
    _id: updatedListing.id,
    bids: (updatedListing.bids || []).map((b) => ({ ...b, _id: b.id }))
  });
}
