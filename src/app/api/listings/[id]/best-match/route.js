import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { findBestBidGA } from "@/lib/genetic/recyclerMatcher";

export async function POST(req, { params }) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { bids: true }
  });

  if (!listing) {
    return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  }

  let candidateBids = (listing.bids || [])
    .filter((b) => b.status === "pending")
    .map((b) => ({ ...b, _id: b.id }));

  let isDemoSimulation = false;

  // If fewer than 2 pending bids exist on this listing, generate candidate bids from live PostgreSQL recycler profiles
  if (candidateBids.length < 2) {
    isDemoSimulation = true;
    const basePrice = Number(listing.askingPrice) || 24000;

    const realRecyclers = await prisma.recyclerProfile.findMany({
      take: 6,
      orderBy: { createdAt: "desc" }
    });

    if (realRecyclers.length >= 2) {
      const multipliers = [0.95, 1.08, 0.88, 1.02, 1.12, 0.92];
      candidateBids = realRecyclers.map((r, idx) => ({
        id: `rec-sim-${r.id}`,
        _id: `rec-sim-${r.id}`,
        bidderName: r.name,
        bidderEmail: r.email,
        bidderRole: "recycler",
        amount: Math.round(basePrice * (multipliers[idx % multipliers.length])),
        message: `${r.description || 'Govt-authorized recycling facility'} — Specialization: ${r.typeWaste || 'Mixed e-waste'} with verified circular recovery.`,
      }));
    } else {
      candidateBids = [
        {
          id: "sim-1",
          _id: "sim-1",
          bidderName: "EcoTech Recyclers Pvt Ltd (Certified R2)",
          bidderRole: "recycler",
          amount: Math.round(basePrice * 0.96),
          message: "Govt-authorized e-waste recycler with zero-landfill certification and 48-hour door pickup.",
        },
        {
          id: "sim-2",
          _id: "sim-2",
          bidderName: "Apex Precious Metal Refiners",
          bidderRole: "enterprise",
          amount: Math.round(basePrice * 1.08),
          message: "High-volume precious metal recovery center. Instant escrow settlement.",
        },
        {
          id: "sim-3",
          _id: "sim-3",
          bidderName: "Urban Miners Hub (ISO 14001)",
          bidderRole: "recycler",
          amount: Math.round(basePrice * 0.99),
          message: "Certified PCB dismantling facility providing verified carbon credit redemption.",
        },
        {
          id: "sim-4",
          _id: "sim-4",
          bidderName: "GreenFuture Scrap Aggregator",
          bidderRole: "bulk_seller",
          amount: Math.round(basePrice * 0.85),
          message: "Regional scrap collector with self-arranged transport.",
        },
      ];
    }
  }

  try {
    const result = findBestBidGA(candidateBids, {
      populationSize: 50,
      generations: 100,
      mutationRate: 0.15,
      crossoverRate: 0.85,
      tournamentK: 3,
    });

    return NextResponse.json({
      bestBid: result.bestBid,
      bestBidId: result.bestBidId,
      bestFitness: result.bestFitness,
      score: result.score,
      breakdown: result.breakdown,
      generationsRun: result.generationsRun,
      algorithm: result.algorithm,
      totalBidsConsidered: candidateBids.length,
      history: result.history,
      populationSample: result.populationSample,
      isDemoSimulation,
    });
  } catch (err) {
    console.error("GA matching error:", err);
    return NextResponse.json({ message: "Genetic algorithm execution failed." }, { status: 500 });
  }
}
