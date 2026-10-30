// =====================================================================
// Genetic Algorithm — Optimal Recycler/Bid Matching
// Subject: Soft Computing (Feature 2B)
//
// Academic Concepts Demonstrated:
//   - Chromosome encoding (permutation representation over candidates)
//   - Multi-objective fitness function (Price, Role Credential, Engagement)
//   - Tournament selection (k=3 tournament)
//   - Order Crossover (OX1) for permutation integrity without duplicates
//   - Swap Mutation operator
//   - Elitism preservation across generational convergence
//   - Live generational convergence tracking
//
// References:
//   - Goldberg, D.E. (1989). Genetic Algorithms in Search, Optimization, 
//     and Machine Learning. Addison-Wesley.
//   - Holland, J.H. (1975). Adaptation in Natural and Artificial Systems.
// =====================================================================

export const ROLE_SCORE = { enterprise: 1.0, recycler: 0.80, bulk_seller: 0.60, user: 0.40 };
export const DEFAULT_WEIGHTS = {
  price: 0.50,
  role: 0.30,
  engagement: 0.20,
};

/**
 * Compute normalized multi-objective fitness for an individual candidate bid.
 */
export function calculateBidFitness(bid, maxAmount, minAmount, weights = DEFAULT_WEIGHTS) {
  const range = maxAmount - minAmount || 1;
  const priceScore = Math.max(0, Math.min(1, (Number(bid.amount) - minAmount) / range));
  const roleScore = ROLE_SCORE[bid.bidderRole] ?? 0.5;
  
  const msgLen = (bid.message || "").trim().length;
  const messageScore = msgLen > 30 ? 1.0 : msgLen > 10 ? 0.6 : 0.2;

  const wPrice = weights.price ?? 0.50;
  const wRole = weights.role ?? 0.30;
  const wMsg = weights.engagement ?? 0.20;

  const total = (wPrice * priceScore) + (wRole * roleScore) + (wMsg * messageScore);
  
  return {
    total: Number(total.toFixed(4)),
    priceScore: Number(priceScore.toFixed(3)),
    roleScore: Number(roleScore.toFixed(3)),
    messageScore: Number(messageScore.toFixed(3)),
  };
}

/**
 * Tournament Selection: Select the highest-fitness chromosome among k randomly picked individuals.
 */
function tournamentSelect(population, fitnesses, k = 3) {
  let bestIdx = Math.floor(Math.random() * population.length);
  let bestFitness = fitnesses[bestIdx];
  for (let i = 1; i < k; i++) {
    const candidateIdx = Math.floor(Math.random() * population.length);
    if (fitnesses[candidateIdx] > bestFitness) {
      bestFitness = fitnesses[candidateIdx];
      bestIdx = candidateIdx;
    }
  }
  return [...population[bestIdx]];
}

/**
 * Order Crossover (OX1): Generates child permutation without duplicate genes.
 */
function orderCrossover(parent1, parent2) {
  const n = parent1.length;
  if (n < 2) return [...parent1];

  const start = Math.floor(Math.random() * n);
  const end = start + Math.floor(Math.random() * (n - start)) + 1;

  const slice = parent1.slice(start, end);
  const remaining = parent2.filter((gene) => !slice.includes(gene));
  return [...remaining.slice(0, start), ...slice, ...remaining.slice(start)];
}

/**
 * Swap Mutation: Randomly exchanges two gene positions with mutation probability.
 */
function swapMutate(chromosome, mutationRate = 0.15) {
  const child = [...chromosome];
  if (Math.random() < mutationRate && child.length >= 2) {
    const i = Math.floor(Math.random() * child.length);
    let j = Math.floor(Math.random() * child.length);
    while (j === i) j = Math.floor(Math.random() * child.length);
    [child[i], child[j]] = [child[j], child[i]];
  }
  return child;
}

/**
 * Run Genetic Algorithm to discover optimal recycler matching.
 */
export function findBestBidGA(bids, options = {}) {
  const {
    populationSize = 50,
    generations = 100,
    mutationRate = 0.15,
    crossoverRate = 0.85,
    elitismCount = 2,
    tournamentK = 3,
    weights = DEFAULT_WEIGHTS,
  } = options;

  if (!bids || bids.length === 0) {
    throw new Error("No bids available for genetic matching.");
  }

  const n = bids.length;
  const amounts = bids.map((b) => Number(b.amount) || 0);
  const maxAmt = Math.max(...amounts, 1);
  const minAmt = Math.min(...amounts, 0);

  // Precalculate fitness for each candidate
  const candidateScores = bids.map((b) => calculateBidFitness(b, maxAmt, minAmt, weights));

  if (n === 1) {
    const bestBid = bids[0];
    const scoreObj = candidateScores[0];
    return {
      bestBid,
      bestBidId: bestBid.id || bestBid._id,
      bestBidIndex: 0,
      bestFitness: scoreObj.total,
      score: scoreObj.total,
      breakdown: {
        priceScore: scoreObj.priceScore,
        roleScore: scoreObj.roleScore,
        messageScore: scoreObj.messageScore,
      },
      generationsRun: 1,
      generations: 1,
      history: [scoreObj.total],
      convergenceHistory: [scoreObj.total],
      algorithm: "Genetic Algorithm (OX1 + Tournament Selection k=3)",
    };
  }

  // Chromosome is a permutation of candidate indices 0..n-1
  // Fitness of chromosome is dominated by the top assigned match (gene 0)
  // with secondary weight on overall ordering efficiency
  const chromFitness = (chrom) => {
    const primary = candidateScores[chrom[0]].total;
    const secondary = chrom.length > 1 ? candidateScores[chrom[1]].total * 0.15 : 0;
    return Number((primary + secondary).toFixed(4));
  };

  // Initial population
  const indices = Array.from({ length: n }, (_, i) => i);
  let population = Array.from({ length: populationSize }, () => {
    const perm = [...indices];
    for (let i = perm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    return perm;
  });

  const history = [];

  for (let gen = 0; gen < generations; gen++) {
    const fitnesses = population.map(chromFitness);
    const genBest = Math.max(...fitnesses);
    history.push(Number(genBest.toFixed(4)));

    // Elitism
    const indexed = fitnesses.map((f, i) => ({ f, i })).sort((a, b) => b.f - a.f);
    const nextPopulation = indexed.slice(0, elitismCount).map(({ i }) => [...population[i]]);

    // Reproduction
    while (nextPopulation.length < populationSize) {
      const p1 = tournamentSelect(population, fitnesses, tournamentK);
      const p2 = tournamentSelect(population, fitnesses, tournamentK);

      let child = Math.random() < crossoverRate ? orderCrossover(p1, p2) : [...p1];
      child = swapMutate(child, mutationRate);
      nextPopulation.push(child);
    }

    population = nextPopulation;
  }

  // Final evaluation
  const finalFitnesses = population.map(chromFitness);
  const bestIdx = finalFitnesses.indexOf(Math.max(...finalFitnesses));
  const bestChromosome = population[bestIdx];
  const bestBidIndex = bestChromosome[0];
  const bestBid = bids[bestBidIndex];
  const scoreObj = candidateScores[bestBidIndex];

  return {
    bestBid,
    bestBidId: bestBid.id || bestBid._id,
    bestBidIndex,
    bestFitness: scoreObj.total,
    score: scoreObj.total,
    breakdown: {
      priceScore: scoreObj.priceScore,
      roleScore: scoreObj.roleScore,
      messageScore: scoreObj.messageScore,
    },
    bestChromosome,
    populationSample: population.slice(0, 8),
    generationsRun: generations,
    generations,
    history,
    convergenceHistory: history,
    algorithm: "Genetic Algorithm (OX1 + Tournament Selection k=3)",
  };
}
