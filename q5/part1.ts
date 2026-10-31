import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const totalRows = INPUTS.length;
const totalCols = INPUTS[0]?.length || 0;

INPUTS[Math.floor(totalRows / 2)]![Math.floor(totalCols / 2)] = "#";

const isValidLand = (row: number, col: number) => {
  let good = 0;
  let land = 0;

  for (let r = row - 1; r <= row + 1; r++) {
    if (r < 0 || r >= totalRows) continue;

    for (let c = col - 1; c <= col + 1; c++) {
      if (c < 0 || c >= totalCols || (r === row && c === col)) continue;
      if (INPUTS[r]![c] === "#") land++;
      if (INPUTS[r]![c] === "1" || INPUTS[r]![c] === "#") good++;
    }
  }

  return land >= 1 && good >= 5;
};

let changed = 1;

while (changed != 0) {
  changed = 0;

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      if (INPUTS[row]![col] === "#") continue;

      if (isValidLand(row, col)) {
        INPUTS[row]![col] = "#";
        changed++;
      }
    }
  }
}

let sum = 0;

for (let row = 0; row < totalRows; row++) {
  for (let col = 0; col < totalCols; col++) {
    if (INPUTS[row]![col] === "#") sum++;
  }
}

console.log(sum);
