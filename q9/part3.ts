import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const plants: {
  id: number;
  growth: bigint;
  limit: bigint;
}[] = [];

INPUTS.forEach((i) => {
  const [id = "", growth = "", limit = ""] = i
    .split(", ")
    .map((s) => s.split("=").slice(1).join("="));

  plants.push({
    id: Number(id),
    growth: BigInt(growth),
    limit: BigInt(limit),
  });
});

const getTime = (plant: (typeof plants)[number]): bigint => {
  let groups = new Map<bigint, bigint>([[1n, 1n]]);
  let second = 1n;
  let leaves = 1n;

  const half = (plant.growth - 1n) / 2n;

  while (leaves < plant.limit) {
    let longest = 0n;

    for (const len of groups.keys()) if (len > longest) longest = len;

    const jump = plant.growth - longest;
    second += jump;

    const next = new Map<bigint, bigint>();
    const add = (len: bigint, count: bigint) =>
      next.set(len, (next.get(len) ?? 0n) + count);

    for (const [len, count] of groups) {
      const grown = len + jump;

      if (grown === plant.growth) {
        leaves += count;
        add(half, 2n * count);
        add(1n, count);
      } else {
        add(grown, count);
      }
    }

    groups = next;
  }

  return second;
};

let totalTime = 0n;

plants.forEach((p) => {
  totalTime += getTime(p);
});

console.log(totalTime.toString());
