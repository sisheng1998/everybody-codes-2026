import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n\n");

const CLOCKS = INPUTS.map((i) => i.split("\n"));

const getSignal = (input: string[]) => {
  const totalHands = input[0]?.split(":").length || 0;

  const clocks = Array.from({ length: totalHands }).map((_) => ({
    hands: 0,
    direction: "",
    current: 0,
    move: 0,
    stepSize: 0,
  }));

  input.forEach((i) => {
    const [_key = "", values = ""] = i.split(" ");
    const key = _key as keyof (typeof clocks)[number];

    values.split(":").forEach((v, idx) => {
      if (key === "direction") clocks[idx]![key] = v;
      else clocks[idx]![key] = Number(v);
    });
  });

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const lcm = (a: number, b: number): number =>
    a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b);

  const LCM = clocks
    .map((c) => c.hands)
    .reduce((acc, current) => lcm(acc, current));

  clocks.forEach((c, idx) => {
    const stepSize = LCM / c.hands;

    clocks[idx]!.hands = LCM;
    clocks[idx]!.current = c.current * stepSize;
    clocks[idx]!.stepSize = stepSize;
  });

  const times = [0, ...clocks.map((c) => c.move)].sort((a, b) => a - b);

  let signal = 0;

  for (let t = 1; t < times.length; t++) {
    const length = times[t]! - times[t - 1]!;
    if (length === 0) continue;

    const deltas = clocks.map((c) =>
      c.move < times[t]!
        ? 0
        : (c.direction === "CW" ? c.stepSize : -c.stepSize) * length,
    );

    for (let a = 0; a < clocks.length; a++) {
      for (let b = a + 1; b < clocks.length; b++) {
        const gap =
          (((clocks[b]!.current - clocks[a]!.current) % LCM) + LCM) % LCM;
        const change = deltas[b]! - deltas[a]!;

        if (change > 0) {
          signal += Math.floor((gap + change) / LCM);
        } else if (change < 0) {
          signal += Math.ceil(gap / LCM) - Math.ceil((gap + change) / LCM);
        }
      }
    }

    clocks.forEach((c, idx) => {
      c.current = (((c.current + deltas[idx]!) % LCM) + LCM) % LCM;
    });
  }

  return signal;
};

const totalSignal = CLOCKS.map((c) => getSignal(c)).reduce(
  (prev, curr) => prev + curr,
  0,
);

console.log(totalSignal);
