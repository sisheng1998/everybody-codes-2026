import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const plants: {
  id: number;
  growth: number;
  limit: number;
}[] = [];

INPUTS.forEach((i) => {
  const [id = "", growth = "", limit = ""] = i
    .split(", ")
    .map((s) => s.split("=").slice(1).join("="));

  plants.push({
    id: Number(id),
    growth: Number(growth),
    limit: Number(limit),
  });
});

const getTime = (plant: (typeof plants)[number]): number => {
  let second = 1;
  let elements: number[] = [1];
  let branches = 0;

  while (
    elements.reduce((prev, curr) => prev + curr, 0) + branches <
    plant.limit
  ) {
    elements.forEach((e, idx) => {
      elements[idx] = e + 1;

      if (elements[idx] === plant.growth) {
        branches++;

        const splitted = (plant.growth - 1) / 2;
        elements[idx] = splitted;
        elements.push(splitted);
        elements.push(1);
      }
    });

    second++;
  }

  return second;
};

let totalTime = 0;

plants.forEach((p) => {
  totalTime += getTime(p);
});

console.log(totalTime);
