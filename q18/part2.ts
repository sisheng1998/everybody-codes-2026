import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
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

const MAX_ROW = Math.max(...inputs.map((i) => i.y));
const MAX_COL = Math.max(...inputs.map((i) => i.x)) + 1;

const maps: string[][] = Array.from({ length: MAX_ROW }).map(
  (_) => Array.from({ length: MAX_COL }).fill(".") as string[],
);

inputs.forEach(({ x, y, width }) => {
  for (let row = 1; row <= y; row++) {
    for (let col = 0; col < width; col++) {
      maps[MAX_ROW - row]![x + col] = "#";
    }
  }
});

const isValidEqual = (row: number, col: number) => {
  let isHasLeftHash = false;
  let isHasRightHash = false;

  for (let i = col - 1; i >= 0; i--) {
    if (maps[row]![i] === "#") {
      isHasLeftHash = true;
      break;
    }
  }

  for (let i = 1; i < MAX_COL; i++) {
    if (maps[row]![col + i] === "#") {
      isHasRightHash = true;
      break;
    }
  }

  return isHasLeftHash && isHasRightHash;
};

for (let row = 0; row < MAX_ROW; row++) {
  for (let col = 0; col < MAX_COL; col++) {
    if (maps[row]![col] === "#") continue;

    if (isValidEqual(row, col)) maps[row]![col] = "=";
  }
}

console.log(
  maps.flatMap((row) => row.filter((col) => col === "#" || col === "=")).length,
);
