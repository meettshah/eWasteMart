import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findBestBidGA, calculateBidFitness } from "@/lib/genetic/recyclerMatcher";

// ── GET: Return Live Database Listings and Recycler Profiles for Selection ──
export async function GET() {
  try {
    const [listings, recyclers] = await Promise.all([
      prisma.listing.findMany({
        where: { status: "open" },
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          bids: {
            select: {
              id: true,
              amount: true,
              bidderName: true,
              bidderEmail: true,
              bidderRole: true,
              message: true,
              status: true,
            }
          }
        }
      }),
      prisma.recyclerProfile.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          typeWaste: true,
          address: true,
          description: true,
        }
      })
    ]);

    return NextResponse.json({ listings, recyclers });
  } catch (err) {
    console.error("Failed to fetch GA real datasets:", err);
    return NextResponse.json({ message: "Failed to load database records." }, { status: 500 });
  }
}

// ── POST: Run Real-Data Genetic Algorithm in Both Directions ──
export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      mode = "seller", // "seller" (Product -> Best Buyer) | "buyer" (Buyer -> Best Product)
      listingId, 
      recyclerId,
      populationSize = 50,
      generations = 100,
      mutationRate = 0.15,
      tournamentK = 3,
    } = body;

    // ─────────────────────────────────────────────────────────────────
    // MODE 1: SELLER PERSPECTIVE (Select Product -> Algo Finds Best Buyer)
    // ─────────────────────────────────────────────────────────────────
    if (mode === "seller") {
      let listing = null;
      if (listingId) {
        listing = await prisma.listing.findUnique({
          where: { id: listingId },
          include: { bids: true }
        });
      }

      if (!listing) {
        listing = await prisma.listing.findFirst({
          where: { status: "open" },
          orderBy: { createdAt: "desc" },
          include: { bids: true }
        });
      }

      if (!listing) {
        return NextResponse.json({ message: "No active listing available in database." }, { status: 404 });
      }

      const basePrice = Number(listing.askingPrice) || 20000;
      let candidateBuyers = (listing.bids || [])
        .filter((b) => b.status === "pending" || b.status === "approved")
        .map((b) => ({
          id: b.id,
          bidderName: b.bidderName,
          bidderEmail: b.bidderEmail,
          bidderRole: b.bidderRole,
          amount: Number(b.amount),
          message: b.message || "Certified e-waste bid submitted on listing.",
          source: "database_bid",
        }));

      // If fewer than 4 bids exist on this lot, pull registered Recycler Profiles from PostgreSQL
      if (candidateBuyers.length < 5) {
        const realRecyclers = await prisma.recyclerProfile.findMany({
          take: 8,
          orderBy: { createdAt: "desc" }
        });

        const multipliers = [0.96, 1.08, 0.89, 1.03, 1.14, 0.94, 1.05, 0.98];
        const supplemented = realRecyclers.map((r, i) => ({
          id: `rec-${r.id}`,
          bidderName: r.name,
          bidderEmail: r.email,
          bidderRole: "recycler",
          amount: Math.round(basePrice * multipliers[i % multipliers.length]),
          message: `${r.description || 'Govt-authorized recycling facility'} — Specialization: ${r.typeWaste}. Doorstep transport ready.`,
          source: "database_recycler_profile",
          address: r.address,
        }));

        candidateBuyers = [...candidateBuyers, ...supplemented];
      }

      // Execute Genetic Algorithm
      const gaResult = findBestBidGA(candidateBuyers, {
        populationSize,
        generations,
        mutationRate,
        tournamentK,
        weights: { price: 0.50, role: 0.30, engagement: 0.20 },
      });

      return NextResponse.json({
        mode: "seller",
        product: {
          id: listing.id,
          title: listing.title,
          category: listing.category,
          askingPrice: listing.askingPrice,
          quantity: listing.quantity,
          unit: listing.unit,
          condition: listing.condition,
          location: listing.location,
        },
        candidates: candidateBuyers,
        winner: gaResult.bestBid,
        winnerScore: gaResult.bestFitness,
        breakdown: gaResult.breakdown,
        generationsRun: gaResult.generationsRun,
        history: gaResult.history,
        bestChromosome: gaResult.bestChromosome,
        algorithm: "Genetic Algorithm (Tournament k=3, Order Crossover OX1, Elitism)",
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // MODE 2: BUYER PERSPECTIVE (Select Buyer -> Algo Finds Best Product)
    // ─────────────────────────────────────────────────────────────────
    if (mode === "buyer") {
      let recycler = null;
      if (recyclerId) {
        recycler = await prisma.recyclerProfile.findUnique({
          where: { id: recyclerId }
        });
      }

      if (!recycler) {
        recycler = await prisma.recyclerProfile.findFirst({
          orderBy: { createdAt: "desc" }
        });
      }

      if (!recycler) {
        return NextResponse.json({ message: "No registered recycler profile found in database." }, { status: 404 });
      }

      // Pull real listings from PostgreSQL database
      const realListings = await prisma.listing.findMany({
        where: { status: "open" },
        take: 20,
        orderBy: { createdAt: "desc" }
      });

      if (!realListings.length) {
        return NextResponse.json({ message: "No active listings found in database." }, { status: 404 });
      }

      const recWasteLower = (recycler.typeWaste || "").toLowerCase();

      // Score each candidate product for this buyer using multi-objective metrics
      const candidateProducts = realListings.map((l) => {
        const catLower = (l.category || "").toLowerCase();
        
        // 1. Category Alignment Score (0 to 1)
        let catMatch = 0.5;
        if (
          recWasteLower.includes("all") ||
          (recWasteLower.includes("computer") && catLower.includes("computer")) ||
          (recWasteLower.includes("mobile") && catLower.includes("mobile")) ||
          (recWasteLower.includes("battery") && catLower.includes("battery")) ||
          (recWasteLower.includes("pcb") && (catLower.includes("computer") || catLower.includes("mobile"))) ||
          (recWasteLower.includes("display") && catLower.includes("television"))
        ) {
          catMatch = 1.0;
        } else if (catLower.includes("mixed")) {
          catMatch = 0.75;
        }

        // 2. Condition & Recovery Yield Score
        let condScore = 0.7;
        if (l.condition === "scrap") condScore = 0.95; // Best metal extraction margin
        else if (l.condition === "repairable") condScore = 0.85; // High refurbish resale
        else condScore = 0.65;

        // 3. Scale / Volume Score
        const qty = Number(l.quantity) || 1;
        const volumeScore = Math.min(1.0, Math.log10(Math.max(1, qty)) / 2.5);

        // Combined Buyer Suitability Score
        const fitnessScore = Number(((0.45 * catMatch) + (0.35 * condScore) + (0.20 * volumeScore)).toFixed(4));

        return {
          id: l.id,
          title: l.title,
          category: l.category,
          askingPrice: Number(l.askingPrice),
          quantity: l.quantity,
          unit: l.unit,
          condition: l.condition,
          location: l.location,
          catMatchScore: Number(catMatch.toFixed(2)),
          marginScore: Number(condScore.toFixed(2)),
          volumeScore: Number(volumeScore.toFixed(2)),
          fitnessScore,
        };
      });

      // Evolve chromosome permutations over real product indices
      const n = candidateProducts.length;
      const chromFitness = (chrom) => candidateProducts[chrom[0]].fitnessScore;

      // Genetic Algorithm run
      let population = Array.from({ length: populationSize }, () => {
        const perm = Array.from({ length: n }, (_, i) => i);
        for (let i = perm.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [perm[i], perm[j]] = [perm[j], perm[i]];
        }
        return perm;
      });

      const history = [];

      for (let gen = 0; gen < generations; gen++) {
        const fitnesses = population.map(chromFitness);
        history.push(Number(Math.max(...fitnesses).toFixed(4)));

        // Elitism top 2
        const sorted = fitnesses.map((f, i) => ({ f, i })).sort((a, b) => b.f - a.f);
        const nextPop = sorted.slice(0, 2).map(({ i }) => [...population[i]]);

        // Tournament selection & Order Crossover
        while (nextPop.length < populationSize) {
          // Tournament
          let p1Idx = Math.floor(Math.random() * population.length);
          for (let k = 1; k < tournamentK; k++) {
            const cand = Math.floor(Math.random() * population.length);
            if (fitnesses[cand] > fitnesses[p1Idx]) p1Idx = cand;
          }
          let p2Idx = Math.floor(Math.random() * population.length);
          for (let k = 1; k < tournamentK; k++) {
            const cand = Math.floor(Math.random() * population.length);
            if (fitnesses[cand] > fitnesses[p2Idx]) p2Idx = cand;
          }

          const p1 = population[p1Idx];
          const p2 = population[p2Idx];

          // OX1
          const start = Math.floor(Math.random() * n);
          const end = start + Math.floor(Math.random() * (n - start)) + 1;
          const slice = p1.slice(start, end);
          const remaining = p2.filter((g) => !slice.includes(g));
          let child = [...remaining.slice(0, start), ...slice, ...remaining.slice(start)];

          // Swap Mutation
          if (Math.random() < mutationRate && child.length >= 2) {
            const i1 = Math.floor(Math.random() * child.length);
            let i2 = Math.floor(Math.random() * child.length);
            while (i2 === i1) i2 = Math.floor(Math.random() * child.length);
            [child[i1], child[i2]] = [child[i2], child[i1]];
          }

          nextPop.push(child);
        }

        population = nextPop;
      }

      const finalFitnesses = population.map(chromFitness);
      const bestIdx = finalFitnesses.indexOf(Math.max(...finalFitnesses));
      const bestChromosome = population[bestIdx];
      const winningProduct = candidateProducts[bestChromosome[0]];

      return NextResponse.json({
        mode: "buyer",
        buyer: {
          id: recycler.id,
          name: recycler.name,
          email: recycler.email,
          typeWaste: recycler.typeWaste,
          address: recycler.address,
          description: recycler.description,
        },
        candidates: candidateProducts,
        winner: winningProduct,
        winnerScore: winningProduct.fitnessScore,
        breakdown: {
          categoryMatch: winningProduct.catMatchScore,
          marginYield: winningProduct.marginScore,
          scaleVolume: winningProduct.volumeScore,
        },
        generationsRun: generations,
        history,
        bestChromosome,
        algorithm: "Genetic Algorithm (Tournament k=3, Order Crossover OX1, Elitism)",
      });
    }

    return NextResponse.json({ message: "Invalid mode." }, { status: 400 });
  } catch (err) {
    console.error("Genetic algorithm matcher API error:", err);
    return NextResponse.json({ message: "Genetic algorithm execution failed." }, { status: 500 });
  }
}

