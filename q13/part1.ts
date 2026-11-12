import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const totalHands = INPUTS[0]?.split(":").length || 0;

const clocks = Array.from({ length: totalHands }).map((_) => ({
  hands: 0,
  direction: "",
  current: 0,
  move: 0,
  stepSize: 0,
}));

INPUTS.forEach((i) => {
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

const MAX_MOVE = Math.max(...clocks.map((c) => c.move));

const moves: { step: number; positions: number[]; deltas: number[] }[] = [
  {
    step: 0,
    positions: clocks.map((c) => c.current),
    deltas: clocks.map(() => 0),
  },
];

for (let step = 1; step <= MAX_MOVE; step++) {
  const positions: number[] = [];
  const deltas: number[] = [];

  clocks.forEach((c, idx) => {
    const delta =
      c.move < step ? 0 : c.direction === "CW" ? c.stepSize : -c.stepSize;
    const position = (c.current + delta + LCM) % LCM;

    clocks[idx]!.current = position;
    positions.push(position);
    deltas.push(delta);
  });

  moves.push({
    step,
    positions,
    deltas,
  });
}

let signal = 0;

moves.forEach(({ step, deltas }, idx) => {
  if (step === 0) return;

  const start = moves[idx - 1]!.positions;

  for (let a = 0; a < clocks.length; a++) {
    for (let b = a + 1; b < clocks.length; b++) {
      const gap = (((start[b]! - start[a]!) % LCM) + LCM) % LCM;
      const change = deltas[b]! - deltas[a]!;

      if (change > 0) {
        signal += Math.floor((gap + change) / LCM);
      } else if (change < 0) {
        signal += Math.ceil(gap / LCM) - Math.ceil((gap + change) / LCM);
      }
    }
  }
});

console.log(signal);
