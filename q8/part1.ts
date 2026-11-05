import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const HEIGHTS: string[][] = (
  JSON.parse(JSON.stringify(INPUTS)) as string[][]
).map((i) => i.fill("."));

const getHeight = (row: number, col: number) => {
  if (INPUTS[row - 1]![col - 1] === ".") return INPUTS[row]![col] || ".";

  const currentHeight = Number(INPUTS[row]![col]);
  const prevHeight = Number(HEIGHTS[row - 1]![col - 1]);
  let height = 0;

  if (currentHeight > prevHeight - 1) height = currentHeight;
  else height = prevHeight - 1;

  return String(height);
};

for (let row = 0; row < INPUTS.length; row++) {
  for (let col = 0; col < INPUTS[0]!.length; col++) {
    if (INPUTS[row]![col] === ".") continue;

    if (row === 0 || col === 0) HEIGHTS[row]![col] = INPUTS[row]![col] || ".";
    else HEIGHTS[row]![col] = getHeight(row, col);
  }
}

for (let row = 0; row < INPUTS.length; row++) {
  for (let col = 0; col < INPUTS[0]!.length; col++) {
    if (
      row === 0 ||
      col === 0 ||
      INPUTS[row]![col] === "." ||
      HEIGHTS[row - 1]![col - 1] === "."
    )
      continue;

    if (Number(INPUTS[row]![col]) < Number(HEIGHTS[row - 1]![col - 1]))
      INPUTS[row]![col] = ".";
  }
}

let energyRequired = 0;

INPUTS.forEach((row) => {
  row.forEach((col) => {
    if (col !== ".") energyRequired++;
  });
});

console.log(energyRequired);
