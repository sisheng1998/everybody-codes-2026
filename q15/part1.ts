import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const DIRS: [number, number][] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

const rows = INPUTS.length;
const cols = INPUTS[0]!.length;

let start: [number, number] = [0, 0];
let end: [number, number] = [0, 0];
const deposits = new Map<string, number>();

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const ch = INPUTS[r]![c];
    if (ch === "S") start = [r, c];
    else if (ch === "E") end = [r, c];
    else if (ch === "@") deposits.set(`${r},${c}`, deposits.size);
  }
}

const fullMask = (1 << deposits.size) - 1;

type State = [number, number, number, number];

const queue: State[] = [[start[0], start[1], -1, 0]];
const visited = new Set<string>([`${start[0]},${start[1]},-1,0`]);
let steps = 0;
let answer = -1;

search: while (queue.length > 0) {
  const level = queue.splice(0, queue.length);

  for (const [r, c, dir, mask] of level) {
    if (r === end[0] && c === end[1] && mask === fullMask) {
      answer = steps;
      break search;
    }

    for (let d = 0; d < 4; d++) {
      if (dir !== -1 && d === (dir + 2) % 4) continue;

      const [dr, dc] = DIRS[d]!;
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (INPUTS[nr]![nc] === "#") continue;

      const deposit = deposits.get(`${nr},${nc}`);
      const newMask = deposit === undefined ? mask : mask | (1 << deposit);

      const key = `${nr},${nc},${d},${newMask}`;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push([nr, nc, d, newMask]);
    }
  }

  steps++;
}

console.log(answer);
