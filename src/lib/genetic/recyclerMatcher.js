// =====================================================================
// Genetic Algorithm — Optimal Recycler/Bid Matching
// Subject: Soft Computing
//
// Academic Concepts Demonstrated:
//   - Chromosome encoding (permutation representation)
//   - Fitness function (weighted multi-objective)
//   - Tournament selection
//   - Single-point crossover (Order Crossover / OX1)
//   - Bit-flip mutation (swap mutation for permutations)
//   - Elitism (preserve best individual across generations)
//   - Convergence via generation count
//
// References:
//   - Goldberg, D.E. (1989). Genetic Algorithms in Search, Optimization, 
//     and Machine Learning. Addison-Wesley.
//   - Holland, J.H. (1975). Adaptation in Natural and Artificial Systems.
// =====================================================================

// -------------------------------------------------------------------
// FITNESS FUNCTION
// Evaluates how good a single bid is as a match for the seller.
// Weights: price (50%), role reliability (30%), message quality (20%)
// Returns a score in [0, 1]
// -------------------------------------------------------------------

const ROLE_SCORE = { enterprise: 1.0, recycler: 0.75 };
const ROLE_WEIGHT     = 0.30;
const PRICE_WEIGHT    = 0.50;
const MESSAGE_WEIGHT  = 0.20;

/**
 * Compute normalized fitness for a single bid.
 * @param {Object} bid - a bid object from Listing.bids
 * @param {number} maxAmount - max bid amount in the pool (for normalization)
 * @param {number} minAmount - min bid amount in the pool
 * @returns {number} fitness in [0, 1]
 */
function bidFitness(bid, maxAmount, minAmount) {
  const range = maxAmount - minAmount || 1;

  // 1. Normalized price score (higher bid = better for seller)
  const priceScore = (bid.amount - minAmount) / range;

  // 2. Role reliability score
  const roleScore = ROLE_SCORE[bid.bidderRole] ?? 0.5;

  // 3. Message quality score (has meaningful message = better engagement)
  const messageScore = bid.message && bid.message.trim().length > 20 ? 1.0
    : bid.message && bid.message.trim().length > 5 ? 0.5
    : 0.0;

  return PRICE_WEIGHT * priceScore + ROLE_WEIGHT * roleScore + MESSAGE_WEIGHT * messageScore;
}

// -------------------------------------------------------------------
// GENETIC OPERATORS
// -------------------------------------------------------------------

/**
 * Tournament selection: pick the fitter of K randomly chosen individuals.
 * @param {number[]} population - array of bid indices (chromosomes)
 * @param {number[]} fitnesses  - fitness score for each individual
 * @param {number}   k          - tournament size
 * @returns {number} selected individual (bid index)
 */
function tournamentSelect(population, fitnesses, k = 3) {
  let best = null;
  let bestFitness = -Infinity;
  for (let i = 0; i < k; i++) {
    const candidate = population[Math.floor(Math.random() * population.length)];
    if (fitnesses[candidate] > bestFitness) {
      bestFitness = fitnesses[candidate];
      best = candidate;
    }
  }
  return best;
}

/**
 * Order Crossover (OX1) for permutation chromosomes.
 * Preserves relative order from parent2 after taking a slice from parent1.
 * @param {number[]} parent1
 * @param {number[]} parent2
 * @returns {number[]} child chromosome
 */
function orderCrossover(parent1, parent2) {
  const n = parent1.length;
  if (n < 2) return [...parent1];

  const start = Math.floor(Math.random() * n);
  const end   = start + Math.floor(Math.random() * (n - start)) + 1;

  const slice = parent1.slice(start, end);
  const remaining = parent2.filter((gene) => !slice.includes(gene));
  return [...remaining.slice(0, start), ...slice, ...remaining.slice(start)];
}

/**
 * Swap mutation: randomly swap two genes in the chromosome.
 * @param {number[]} chromosome
 * @param {number}   mutationRate - probability of mutation [0,1]
 * @returns {number[]} mutated chromosome
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

// -------------------------------------------------------------------
// GENETIC ALGORITHM — MAIN FUNCTION
// -------------------------------------------------------------------

/**
 * Run a Genetic Algorithm to find the optimal bid for a seller.
 *
 * The GA evolves a population of permutations over bid indices.
 * The first gene of the fittest individual in the final generation
 * is the recommended bid.
 *
 * @param {Object[]} bids        - array of pending bid objects
 * @param {Object}   options     - GA hyperparameters
 * @returns {{ 
 *   bestBidId: string,
 *   bestBidIndex: number,
 *   score: number,
 *   generations: number,
 *   convergenceHistory: number[] 
 * }}
 */
export function findBestBidGA(bids, options = {}) {
  const {
    populationSize = 40,
    generations    = 80,
    mutationRate   = 0.15,
    elitismCount   = 2,
    tournamentSize = 3,
  } = options;

  const n = bids.length;
  if (n === 0) throw new Error("No bids to evaluate.");
  if (n === 1) return { bestBidId: bids[0]._id, bestBidIndex: 0, score: 1.0, generations: 0, convergenceHistory: [1.0] };

  // Pre-compute fitness inputs
  const amounts = bids.map((b) => b.amount);
  const maxAmt = Math.max(...amounts);
  const minAmt = Math.min(...amounts);

  // Pre-compute fitness for each bid (individual, not chromosome)
  const bidFitnessScores = bids.map((bid) => bidFitness(bid, maxAmt, minAmt));

  // Chromosome fitness = fitness of the first gene (the recommended bid)
  const chromFitness = (chromosome) => bidFitnessScores[chromosome[0]];

  // Initialize population: random permutations of bid indices
  const indices = Array.from({ length: n }, (_, i) => i);
  let population = Array.from({ length: populationSize }, () => {
    const perm = [...indices];
    for (let i = perm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    return perm;
  });

  const convergenceHistory = [];
  let eliteChromosomes = [];

  for (let gen = 0; gen < generations; gen++) {
    // Evaluate fitness for all chromosomes
    const fitnesses = population.map(chromFitness);

    // Track best fitness this generation
    const genBest = Math.max(...fitnesses);
    convergenceHistory.push(Number(genBest.toFixed(4)));

    // Elitism: carry forward top `elitismCount` individuals unchanged
    const indexed = fitnesses.map((f, i) => ({ f, i })).sort((a, b) => b.f - a.f);
    eliteChromosomes = indexed.slice(0, elitismCount).map(({ i }) => [...population[i]]);

    // Build next generation
    const nextPopulation = [...eliteChromosomes];

    while (nextPopulation.length < populationSize) {
      const p1 = tournamentSelect(indices, bidFitnessScores, tournamentSize);
      const p2 = tournamentSelect(indices, bidFitnessScores, tournamentSize);
      // Use actual chromosomes for crossover
      const chromP1 = population[fitnesses.indexOf(bidFitnessScores[p1])] || population[0];
      const chromP2 = population[fitnesses.indexOf(bidFitnessScores[p2])] || population[1 % populationSize];

      let child = orderCrossover(chromP1, chromP2);
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

  return {
    bestBidId:          bids[bestBidIndex]._id,
    bestBidIndex,
    score:              Number(bidFitnessScores[bestBidIndex].toFixed(4)),
    breakdown: {
      priceScore:       Number((PRICE_WEIGHT * ((bids[bestBidIndex].amount - minAmt) / (maxAmt - minAmt || 1))).toFixed(3)),
      roleScore:        Number((ROLE_WEIGHT * (ROLE_SCORE[bids[bestBidIndex].bidderRole] ?? 0.5)).toFixed(3)),
      messageScore:     Number((MESSAGE_WEIGHT * (bids[bestBidIndex].message?.length > 20 ? 1 : bids[bestBidIndex].message?.length > 5 ? 0.5 : 0)).toFixed(3)),
    },
    generations,
    convergenceHistory,
  };
}
