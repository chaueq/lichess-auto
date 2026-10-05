function calculateRatingStakes(
  white,
  black,
  perf = "bullet"
) {
  const cfg = LICHESS_RATING_CONFIG;
  const G = cfg.glicko;

  const whiteRating = white.value;
  const whiteRD = white.deviation;

  const blackRating = black.value;
  const blackRD = black.deviation;

  if (
    !Number.isFinite(whiteRating) ||
    !Number.isFinite(whiteRD) ||
    !Number.isFinite(blackRating) ||
    !Number.isFinite(blackRD)
  ) {
    throw new TypeError("Invalid rating or deviation");
  }

  const sigmaWhite = G.assumedVolatility;
  const sigmaBlack = G.assumedVolatility;

  const colorAdvantage =
    perf === "crazyhouse"
      ? cfg.colorAdvantage.crazyhouse
      : isStandardPerf(perf)
        ? cfg.colorAdvantage.standard
        : cfg.colorAdvantage.none;

  const advantageWhite = colorAdvantage / 2;
  const advantageBlack = -colorAdvantage / 2;

  function isStandardPerf(perf) {
    return (
      perf === "ultraBullet" ||
      perf === "bullet" ||
      perf === "blitz" ||
      perf === "rapid" ||
      perf === "classical" ||
      perf === "correspondence"
    );
  }

  function toMu(rating) {
    return (rating - G.baseRating) / G.scale;
  }

  function toPhi(rd) {
    return rd / G.scale;
  }

  function fromMu(mu) {
    return mu * G.scale + G.baseRating;
  }

  function g(phi) {
    return 1 / Math.sqrt(
      1 + (3 * phi * phi) / (Math.PI * Math.PI)
    );
  }

  function expectedScore(
    playerRating,
    opponentRating,
    opponentPhi,
    playerAdvantage,
    opponentAdvantage
  ) {
    const playerMu = toMu(
      playerRating + playerAdvantage
    );

    const opponentMu = toMu(
      opponentRating + opponentAdvantage
    );

    return (
      1 /
      (
        1 +
        Math.exp(
          -g(opponentPhi) *
          (playerMu - opponentMu)
        )
      )
    );
  }

  function volatilityF(x, delta, phi, v, a) {
    const ex = Math.exp(x);

    return (
      (
        ex *
        (delta * delta - phi * phi - v - ex)
      ) /
        (
          2 *
          Math.pow(phi * phi + v + ex, 2)
        ) -
      (x - a) / (G.tau * G.tau)
    );
  }

  function calculateNewSigma(phi, sigma, delta, v) {
    const a = Math.log(sigma * sigma);

    let A = a;
    let B;

    if (delta * delta > phi * phi + v) {
      B = Math.log(
        delta * delta - phi * phi - v
      );
    } else {
      let k = 1;

      B = a - k * Math.abs(G.tau);

      while (
        volatilityF(B, delta, phi, v, a) < 0
      ) {
        k += 1;
        B = a - k * Math.abs(G.tau);

        if (k > G.maxIterations) {
          throw new Error(
            "Glicko volatility search failed"
          );
        }
      }
    }

    let fA = volatilityF(A, delta, phi, v, a);
    let fB = volatilityF(B, delta, phi, v, a);

    let iterations = 0;

    while (
      Math.abs(B - A) >
        G.convergenceTolerance &&
      iterations < G.maxIterations
    ) {
      iterations += 1;

      const C =
        A +
        ((A - B) * fA) /
          (fB - fA);

      const fC =
        volatilityF(C, delta, phi, v, a);

      if (fC * fB <= 0) {
        A = B;
        fA = fB;
      } else {
        fA /= 2;
      }

      B = C;
      fB = fC;
    }

    if (iterations >= G.maxIterations) {
      throw new Error(
        "Glicko volatility calculation did not converge"
      );
    }

    return Math.min(
      Math.exp(A / 2),
      G.maxVolatility
    );
  }

  function calculateOnePlayer({
    rating,
    rd,
    sigma,
    opponentRating,
    opponentRD,
    score,
    advantage,
    opponentAdvantage
  }) {
    const mu = toMu(rating);
    const phi = toPhi(rd);
    const opponentPhi = toPhi(opponentRD);

    const E = expectedScore(
      rating,
      opponentRating,
      opponentPhi,
      advantage,
      opponentAdvantage
    );

    const gOpp = g(opponentPhi);

    const v =
      1 /
      (
        gOpp *
        gOpp *
        E *
        (1 - E)
      );

    const outcomeTerm =
      gOpp * (score - E);

    const delta =
      v * outcomeTerm;

    const newSigma =
      calculateNewSigma(
        phi,
        sigma,
        delta,
        v
      );

    const elapsedRatingPeriods = 1;

    const phiStar = Math.sqrt(
      phi * phi +
      elapsedRatingPeriods *
        newSigma *
        newSigma
    );

    const newPhi =
      1 /
      Math.sqrt(
        1 / (phiStar * phiStar) +
        1 / v
      );

    const newMu =
      mu +
      newPhi *
        newPhi *
        outcomeTerm;

    return {
      rating: Math.max(
        G.minRating,
        fromMu(newMu)
      ),

      deviation: Math.min(
        G.maxDeviation,
        Math.max(
          G.minDeviation,
          newPhi * G.scale
        )
      ),

      volatility: newSigma
    };
  }

  function regulatorFactor(perf) {
    return cfg.regulatorFactors[perf] ?? 1;
  }

  function regulate(beforeRating, afterRating) {
    if (afterRating <= beforeRating) {
      return afterRating;
    }

    const factor =
      regulatorFactor(perf);

    return (
      beforeRating +
      (afterRating - beforeRating) *
        factor
    );
  }

  function displayedDelta(
    beforeRating,
    afterRating
  ) {
    return (
      Math.trunc(afterRating) -
      Math.trunc(beforeRating)
    );
  }

  function calculateOutcome(whiteScore) {
    const blackScore = 1 - whiteScore;

    const whiteAfter = calculateOnePlayer({
      rating: whiteRating,
      rd: whiteRD,
      sigma: sigmaWhite,

      opponentRating: blackRating,
      opponentRD: blackRD,

      score: whiteScore,

      advantage: advantageWhite,
      opponentAdvantage: advantageBlack
    });

    const blackAfter = calculateOnePlayer({
      rating: blackRating,
      rd: blackRD,
      sigma: sigmaBlack,

      opponentRating: whiteRating,
      opponentRD: whiteRD,

      score: blackScore,

      advantage: advantageBlack,
      opponentAdvantage: advantageWhite
    });

    const regulatedWhiteRating =
      regulate(
        whiteRating,
        whiteAfter.rating
      );

    const regulatedBlackRating =
      regulate(
        blackRating,
        blackAfter.rating
      );

    return {
      white: displayedDelta(
        whiteRating,
        regulatedWhiteRating
      ),

      black: displayedDelta(
        blackRating,
        regulatedBlackRating
      )
    };
  }

  const whiteWin = calculateOutcome(1);
  const draw = calculateOutcome(0.5);
  const blackWin = calculateOutcome(0);

  return {
    white: {
      win: whiteWin.white,
      draw: draw.white,
      loss: blackWin.white
    },

    black: {
      win: blackWin.black,
      draw: draw.black,
      loss: whiteWin.black
    }
  };
}