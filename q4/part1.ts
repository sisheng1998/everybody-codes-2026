import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map(String);

const inputObjs: { [key: string]: number }[] = INPUTS.map((i) =>
  Object.fromEntries(
    i.split(" ").map((s) => {
      const [key, value] = s.split("=");
      return [key, Number(value)];
    }),
  ),
);

const ranks: { [key: string]: number } = {};

inputObjs.forEach((i) => {
  const key = String(i["id"]);
  ranks[key] = (ranks[key] || 0) + (i["time"] ?? 0);
});

const result = Object.entries(ranks)
  .sort((a, b) => a[1] - b[1])
  .map(([, i]) => i)
  .reduce((a, b, idx) => a + b * (idx + 1), 0);

console.log(result);
