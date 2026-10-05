async function fetchLichessPerf(username, perf) {
  const url =
    `https://lichess.org/api/user/${encodeURIComponent(username)}/perf/${encodeURIComponent(perf)}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Lichess API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  const value = data?.perf?.glicko?.rating;
  const deviation = data?.perf?.glicko?.deviation;

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    typeof deviation !== "number" ||
    !Number.isFinite(deviation)
  ) {
    throw new Error("Invalid Glicko data returned by Lichess API");
  }

  return {
    value,
    deviation,
  };
}