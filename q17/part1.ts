import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const rowCount = INPUTS.length;
const colCount = INPUTS[0]!.length;
const [targetRow, targetCol] = [rowCount - 1, colCount - 1];

const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
const visited: boolean[][] = INPUTS.map((row) => row.map(() => false));

const queue: [number, number, number][] = [[0, 0, 0]];
visited[0]![0] = true;

let shortestSteps = -1;
for (let queueIndex = 0; queueIndex < queue.length; queueIndex++) {
  const [row, col, steps] = queue[queueIndex]!;

  if (row === targetRow && col === targetCol) {
    shortestSteps = steps;
    break;
  }

  for (const [rowOffset, colOffset] of directions) {
    const nextRow = row + rowOffset!;
    const nextCol = col + colOffset!;

    const isOutside =
      nextRow < 0 || nextRow >= rowCount || nextCol < 0 || nextCol >= colCount;
    if (isOutside) continue;

    const isGap = INPUTS[nextRow]![nextCol] !== "#";
    if (isGap || visited[nextRow]![nextCol]) continue;

    visited[nextRow]![nextCol] = true;
    queue.push([nextRow, nextCol, steps + 1]);
  }
}

console.log(shortestSteps);
