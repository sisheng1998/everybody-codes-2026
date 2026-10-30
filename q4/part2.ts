import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
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

const ranks: { [key: string]: { time: number; parts: number } } = {};

inputObjs.forEach((i) => {
  const key = String(i["id"]);
  const time = i["time"] ?? 0;

  const prev = ranks[key] ?? { time: 0, parts: 0 };
  ranks[key] = {
    time: prev.time + time,
    parts: prev.parts + 1,
  };
});

const result = Object.entries(ranks)
  .sort((a, b) => b[1]["parts"] - a[1]["parts"] || a[1]["time"] - b[1]["time"])
  .map(([, i]) => i)
  .reduce((a, b, idx) => a + b.time * (idx + 1), 0);

console.log(result);
