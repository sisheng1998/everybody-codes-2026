import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const TOTAL_ROW = INPUTS.length;
const TOTAL_COL = INPUTS[0]?.length || 0;

const isBlock = (row: number, col: number): boolean =>
  INPUTS[row]?.[col] === "#";

const horizontalId: number[][] = INPUTS.map((line) => line.map(() => -1));
const verticalId: number[][] = INPUTS.map((line) => line.map(() => -1));

let horizontalCount = 0;
let verticalCount = 0;

for (let row = 0; row < TOTAL_ROW; row++) {
  for (let col = 0; col < TOTAL_COL; col++) {
    if (!isBlock(row, col)) continue;

    horizontalId[row]![col] = isBlock(row, col - 1)
      ? horizontalId[row]![col - 1]!
      : horizontalCount++;

    verticalId[row]![col] = isBlock(row - 1, col)
      ? verticalId[row - 1]![col]!
      : verticalCount++;
  }
}

const edges: Set<number>[] = Array.from(
  { length: horizontalCount },
  () => new Set<number>(),
);

for (let row = 0; row < TOTAL_ROW; row++) {
  for (let col = 0; col < TOTAL_COL; col++) {
    if (isBlock(row, col))
      edges[horizontalId[row]![col]!]!.add(verticalId[row]![col]!);
  }
}

const matchedTo: number[] = new Array(verticalCount).fill(-1);

const tryMatch = (horizontal: number, seen: boolean[]): boolean => {
  for (const vertical of edges[horizontal]!) {
    if (seen[vertical]) continue;
    seen[vertical] = true;

    if (matchedTo[vertical] === -1 || tryMatch(matchedTo[vertical]!, seen)) {
      matchedTo[vertical] = horizontal;
      return true;
    }
  }

  return false;
};

let minSpells = 0;

for (let horizontal = 0; horizontal < horizontalCount; horizontal++) {
  if (tryMatch(horizontal, new Array(verticalCount).fill(false))) minSpells++;
}

console.log(minSpells);
