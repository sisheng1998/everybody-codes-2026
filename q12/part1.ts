import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const TOTAL_ROW = INPUTS.length;
const TOTAL_COL = INPUTS[0]?.length || 0;

const stacks: string[] = [];

const isTopLeftCorner = (row: number, col: number): boolean => {
  const isAboveClear = row === 0 || INPUTS[row - 1]?.[col] === ".";
  const isLeftClear = col === 0 || INPUTS[row]?.[col - 1] === ".";

  return isAboveClear && isLeftClear;
};

const getStacks = (row: number, col: number): string => {
  let currentRow = row;
  let currentCol = col;

  let rows = 0;
  let cols = 0;

  while (currentRow < TOTAL_ROW && INPUTS[currentRow]![col] === "#") {
    currentRow++;
    rows++;
  }

  while (currentCol < TOTAL_COL && INPUTS[row]![currentCol] === "#") {
    currentCol++;
    cols++;
  }

  return `${rows}x${cols}`;
};

for (let row = 0; row < TOTAL_ROW; row++) {
  for (let col = 0; col < TOTAL_COL; col++) {
    if (INPUTS[row]![col] === "#" && isTopLeftCorner(row, col))
      stacks.push(getStacks(row, col));
  }
}

let minSpells = 0;

stacks.forEach((stack) => {
  const [row = 0, col = 0] = stack.split("x").map((s) => Number(s));

  if (row < col) minSpells += row;
  else minSpells += col;
});

console.log(minSpells);
