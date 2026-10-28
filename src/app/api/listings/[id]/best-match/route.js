import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Listing from "@/models/ListingModel";
import { findBestBidGA } from "@/lib/genetic/recyclerMatcher";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);

  await mongooseConnect();
  const { id } = await params;
  const listing = await Listing.findById(id).lean();

  if (!listing) {
    return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  }

  let pendingBids = (listing.bids || []).filter((b) => b.status === "pending");
  let isDemoSimulation = false;

  // If fewer than 2 bids exist, synthesize 4 realistic candidate recycler bids so faculty can inspect the GA
  if (pendingBids.length < 2) {
    isDemoSimulation = true;
    const basePrice = Number(listing.askingPrice) || 24000;
    pendingBids = [
      {
        _id: "demo-bid-1",
        bidderName: "EcoTech Recyclers Pvt Ltd (Certified R2)",
        bidderRole: "recycler",
        amount: Math.round(basePrice * 0.94),
        message: "Govt-authorized e-waste recycler with zero-landfill certification and 48-hour door pickup.",
      },
      {
        _id: "demo-bid-2",
        bidderName: "Apex Precious Metal Refiners",
        bidderRole: "enterprise",
        amount: Math.round(basePrice * 1.08),
        message: "High-volume precious metal recovery center. Instant Razorpay escrow settlement.",
      },
      {
        _id: "demo-bid-3",
        bidderName: "GreenFuture Scrap Aggregator",
        bidderRole: "bulk_seller",
        amount: Math.round(basePrice * 0.81),
        message: "Regional scrap collector with self-arranged transport.",
      },
      {
        _id: "demo-bid-4",
        bidderName: "Urban Miners Hub (ISO 14001)",
        bidderRole: "recycler",
        amount: Math.round(basePrice * 0.99),
        message: "Certified PCB dismantling facility providing verified carbon credit redemption.",
      },
    ];
  }

  try {
    const result = findBestBidGA(pendingBids, {
      populationSize: 50,
      generations:    100,
      mutationRate:   0.15,
      elitismCount:   2,
      tournamentSize: 3,
    });

    const bestBid = pendingBids.find((b) => String(b._id) === String(result.bestBidId)) || pendingBids[0];

    return NextResponse.json({
      bestBid: {
        _id:        bestBid._id,
        bidderName: bestBid.bidderName,
        bidderRole: bestBid.bidderRole,
        amount:     bestBid.amount,
        message:    bestBid.message,
      },
      ga: {
        score:              result.score,
        breakdown:          result.breakdown,
        generations:        result.generations,
        convergenceHistory: result.convergenceHistory,
        totalBidsEvaluated: pendingBids.length,
        isDemoSimulation,
      },
    });
  } catch (error) {
    console.error("GA matching error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
