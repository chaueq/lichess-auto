const LICHESS_RATING_CONFIG = Object.freeze({
  glicko: Object.freeze({
    // Glicko-2 conversion
    baseRating: 1500.0,
    scale: 173.7178,

    // Glicko-2 algorithm
    tau: 0.75,
    convergenceTolerance: 1e-6,
    maxIterations: 1000,

    // Lichess rating-period progression
    ratingPeriodsPerDay: 0.21436,

    // Public API does NOT expose a player's actual volatility.
    // Use Lichess's default as the estimator assumption.
    assumedVolatility: 0.09,
    defaultVolatility: 0.09,
    maxVolatility: 0.1,

    // Lichess caps
    minRating: 400,
    minDeviation: 45,
    maxDeviation: 500,

    // This exists upstream as a sanity/rating-system limit.
    // Do not automatically clamp every calculated rating to this.
    sanityMaxRating: 4000,

    // Maximum single-game rating delta used by Lichess.
    maxRatingDelta: 700,

    // Display semantics
    integerConversion: "trunc",

    // Glicko classifications
    provisionalDeviation: 110,
    cluelessDeviation: 230,

    // Rankability thresholds
    standardRankableDeviation: 75,
    variantRankableDeviation: 65,
  }),

  colorAdvantage: Object.freeze({
    none: 0.0,

    // Rating points, NOT already Glicko-2-scaled values.
    standard: 11.782457,
    crazyhouse: 20.30966,
  }),

  regulatorFactors: Object.freeze({
    ultraBullet: 1.013,
    bullet: 1.010,
    blitz: 1.005,
    rapid: 1.015,
    classical: 1.010,

    atomic: 1.020,
    antichess: 1.020,

    // No current positive-gain regulator:
    correspondence: 1.0,
    chess960: 1.0,
    crazyhouse: 1.0,
    horde: 1.0,
    kingOfTheHill: 1.0,
    racingKings: 1.0,
    threeCheck: 1.0,
  }),

  bot: Object.freeze({
    // For a HUMAN playing against a BOT, Lichess averages the
    // regulated result with the human's old Glicko state.
    // At weight 0.5 this effectively halves movement.
    humanAgainstBotAverageWeight: 0.5,
  }),

  defaults: Object.freeze({
    normal: Object.freeze({
      rating: 1500,
      deviation: 500,
      volatility: 0.09,
    }),

    // Virtual first-pairing rating; not the actual initial rating.
    pairing: Object.freeze({
      rating: 1450,
      deviation: 500,
      volatility: 0.09,
    }),

    bot: Object.freeze({
      rating: 3000,
      deviation: 500,
      volatility: 0.09,
    }),

    managed: Object.freeze({
      rating: 800,
      deviation: 400,
      volatility: 0.09,
    }),
  }),
});