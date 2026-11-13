import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const TOTAL_ROWS = INPUTS.length;
const TOTAL_COLS = INPUTS[0]?.length || 0;

let bindings = TOTAL_ROWS * 2 + TOTAL_COLS * 2;

for (let row = 0; row < TOTAL_ROWS; row++) {
  for (let col = 0; col < TOTAL_COLS; col++) {
    if (col - 1 >= 0 && INPUTS[row]![col] !== INPUTS[row]![col - 1]) bindings++;
    if (row - 1 >= 0 && INPUTS[row]![col] !== INPUTS[row - 1]![col]) bindings++;
  }
}

console.log(bindings);
