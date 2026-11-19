import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const inputs: { x: number; y: number; width: number }[] = [];

INPUTS.forEach((i) => {
  const [x = "", y = "", width = ""] = i.split(" ");

  inputs.push({
    x: Number(x.split("=")[1]),
    y: Number(y.split("=")[1]),
    width: Number(width.split("=")[1]),
  });
});

const n = inputs.length;

const prefixMax: number[] = new Array(n).fill(0);
const suffixMax: number[] = new Array(n).fill(0);

for (let i = 0; i < n; i++) {
  prefixMax[i] = Math.max(inputs[i]!.y, i > 0 ? prefixMax[i - 1]! : 0);
}
for (let i = n - 1; i >= 0; i--) {
  suffixMax[i] = Math.max(inputs[i]!.y, i < n - 1 ? suffixMax[i + 1]! : 0);
}

let total = 0;

for (let i = 0; i < n; i++) {
  const { x, y, width } = inputs[i]!;

  const left = i > 0 ? prefixMax[i - 1]! : 0;
  const right = i < n - 1 ? suffixMax[i + 1]! : 0;

  total += Math.max(y, Math.min(left, right)) * width;

  if (i < n - 1) {
    const gap = inputs[i + 1]!.x - (x + width);

    if (gap > 0) total += Math.min(prefixMax[i]!, suffixMax[i + 1]!) * gap;
  }
}

if (!Number.isSafeInteger(total))
  throw new Error("total exceeds safe integer range");

console.log(total);
