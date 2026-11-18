import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const rowCount = INPUTS.length;
const colCount = INPUTS[0]!.length;

const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

let exposedEdges = 0;

for (let row = 0; row < rowCount; row++) {
  for (let col = 0; col < colCount; col++) {
    if (INPUTS[row]![col] !== "#") continue;

    for (const [rowOffset, colOffset] of directions) {
      const nextRow = row + rowOffset!;
      const nextCol = col + colOffset!;

      const isOutside =
        nextRow < 0 ||
        nextRow >= rowCount ||
        nextCol < 0 ||
        nextCol >= colCount;
      const isGap = !isOutside && INPUTS[nextRow]![nextCol] !== "#";

      if (isOutside || isGap) exposedEdges++;
    }
  }
}

console.log(exposedEdges);
