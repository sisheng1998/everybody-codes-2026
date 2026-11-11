import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const TOTAL_ROW = INPUTS.length;
const TOTAL_COL = INPUTS[0]?.length || 0;

const visited = new Set<string>();
const key = (row: number, col: number) => `${row},${col}`;
const isBlock = (row: number, col: number): boolean =>
  INPUTS[row]?.[col] === "#";

const getStack = (row: number, col: number): Set<string> => {
  const cells = new Set<string>();
  const queue: [number, number][] = [[row, col]];
  visited.add(key(row, col));

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    cells.add(key(r, c));

    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nr = r + dr;
      const nc = c + dc;
      if (isBlock(nr, nc) && !visited.has(key(nr, nc))) {
        visited.add(key(nr, nc));
        queue.push([nr, nc]);
      }
    }
  }

  return cells;
};

const getSpells = (cells: Set<string>): number => {
  let top = Infinity;
  let bottom = -Infinity;
  let left = Infinity;
  let right = -Infinity;

  cells.forEach((cell) => {
    const [r = 0, c = 0] = cell.split(",").map(Number);
    top = Math.min(top, r);
    bottom = Math.max(bottom, r);
    left = Math.min(left, c);
    right = Math.max(right, c);
  });

  const height = bottom - top + 1;
  const width = right - left + 1;

  if (cells.size === height * width) return Math.min(height, width);

  const corners: [number, number, number, number][] = [
    [top, left, 1, 1],
    [top, right, 1, -1],
    [bottom, left, -1, 1],
    [bottom, right, -1, -1],
  ];

  const [cr, cc, dr, dc] = corners.find(([r, c]) => !cells.has(key(r, c)))!;

  let missingRows = 0;
  while (!cells.has(key(cr + dr * missingRows, cc))) missingRows++;

  let missingCols = 0;
  while (!cells.has(key(cr, cc + dc * missingCols))) missingCols++;

  const verticalArm = width - missingCols;
  const horizontalArm = height - missingRows;

  const cutVertical =
    Math.min(height, verticalArm) + Math.min(horizontalArm, missingCols);

  const cutHorizontal =
    Math.min(horizontalArm, width) + Math.min(missingRows, verticalArm);

  return Math.min(cutVertical, cutHorizontal);
};

let minSpells = 0;

for (let row = 0; row < TOTAL_ROW; row++) {
  for (let col = 0; col < TOTAL_COL; col++) {
    if (isBlock(row, col) && !visited.has(key(row, col)))
      minSpells += getSpells(getStack(row, col));
  }
}

console.log(minSpells);
