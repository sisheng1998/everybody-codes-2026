import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const rowCount = INPUTS.length;
const colCount = INPUTS[0]!.length;

const [startRow, startCol] = [0, 0];
const [targetRow, targetCol] = [rowCount, colCount];

const isCrust = (row: number, col: number) =>
  row >= 0 &&
  row < rowCount &&
  col >= 0 &&
  col < colCount &&
  INPUTS[row]![col] === "#";

const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const directions = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

const canWalk = (row: number, col: number, direction: number) => {
  let rightSquare: [number, number];
  let leftSquare: [number, number];

  if (direction === UP) {
    rightSquare = [row - 1, col];
    leftSquare = [row - 1, col - 1];
  } else if (direction === RIGHT) {
    rightSquare = [row, col];
    leftSquare = [row - 1, col];
  } else if (direction === DOWN) {
    rightSquare = [row, col - 1];
    leftSquare = [row, col];
  } else {
    rightSquare = [row - 1, col - 1];
    leftSquare = [row, col - 1];
  }

  return isCrust(...rightSquare) && !isCrust(...leftSquare);
};

const turnOrder = [1, 0, 3];

let row = startRow;
let col = startCol;
let direction = RIGHT;
let loopLength = 0;
let stepsToTarget = -1;

do {
  const [rowOffset, colOffset] = directions[direction]!;

  row += rowOffset!;
  col += colOffset!;
  loopLength++;

  if (row === targetRow && col === targetCol && stepsToTarget === -1) {
    stepsToTarget = loopLength;
  }

  for (const turn of turnOrder) {
    const nextDirection = (direction + turn) % 4;

    if (canWalk(row, col, nextDirection)) {
      direction = nextDirection;
      break;
    }
  }
} while (row !== startRow || col !== startCol);

const otherWay = loopLength - stepsToTarget;
console.log(Math.min(stepsToTarget, otherWay));
