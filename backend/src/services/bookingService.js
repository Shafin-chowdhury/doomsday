function calculateOptimalBundles(bundleSizes, groupSize) {
  if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 10000) {
    throw new Error("groupSize must be an integer between 1 and 10000");
  }

  const validSizes = [...new Set(bundleSizes)]
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 500)
    .sort((a, b) => a - b);

  if (validSizes.length === 0) {
    return {
      possible: false,
      groupSize,
      totalBundles: 0,
      breakdown: [],
      message: "Not possible",
    };
  }

  const INF = Infinity;
  const dp = new Array(groupSize + 1).fill(INF);
  const usedBundle = new Array(groupSize + 1).fill(-1);
  dp[0] = 0;

  for (let sum = 1; sum <= groupSize; sum++) {
    for (const size of validSizes) {
      if (sum >= size && dp[sum - size] !== INF) {
        if (dp[sum - size] + 1 < dp[sum]) {
          dp[sum] = dp[sum - size] + 1;
          usedBundle[sum] = size;
        }
      }
    }
  }

  if (dp[groupSize] === INF) {
    return {
      possible: false,
      groupSize,
      totalBundles: 0,
      breakdown: [],
      message: "Not possible",
    };
  }

  // Reconstruct counts per bundle size
  const countsMap = new Map();
  let current = groupSize;
  while (current > 0) {
    const size = usedBundle[current];
    countsMap.set(size, (countsMap.get(size) || 0) + 1);
    current -= size;
  }

  // Sort larger bundle sizes first for readable quote display
  const breakdown = Array.from(countsMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([bundleSize, count]) => ({
      bundleSize,
      count,
      subtotalSeats: bundleSize * count,
    }));

  return {
    possible: true,
    groupSize,
    totalBundles: dp[groupSize],
    breakdown,
  };
}

module.exports = {
  calculateOptimalBundles,
};