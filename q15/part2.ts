import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
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

const TARGET = 2026;

const rows = INPUTS.length;
const cols = INPUTS[0]!.length;

let start: [number, number] = [0, 0];
let end: [number, number] = [0, 0];

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const ch = INPUTS[r]![c];
    if (ch === "S") start = [r, c];
    else if (ch === "E") end = [r, c];
  }
}

const levels = TARGET + 1;
const encode = (r: number, c: number, d: number, n: number) => ((r * cols + c) * 4 + d) * levels + n;

const visited = new Uint8Array(rows * cols * 4 * levels);
let queue: number[] = [];
let steps = 1;
let answer = -1;

const expand = (r: number, c: number, dir: number, count: number, next: number[]) => {
  for (let d = 0; d < 4; d++) {
    if (dir !== -1 && d === (dir + 2) % 4) continue;

    const [dr, dc] = DIRS[d]!;
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
    const ch = INPUTS[nr]![nc];
    if (ch === "#") continue;

    const n = ch === "@" ? Math.min(count + 1, TARGET) : count;
    const id = encode(nr, nc, d, n);
    if (visited[id]) continue;
    visited[id] = 1;
    next.push(id);
  }
};

expand(start[0], start[1], -1, 0, queue);

search: while (queue.length > 0) {
  const next: number[] = [];

  for (const id of queue) {
    const count = id % levels;
    const rest = (id - count) / levels;
    const dir = rest % 4;
    const cell = (rest - dir) / 4;
    const r = Math.floor(cell / cols);
    const c = cell % cols;

    if (r === end[0] && c === end[1] && count === TARGET) {
      answer = steps;
      break search;
    }

    expand(r, c, dir, count, next);
  }

  queue = next;
  steps++;
}

console.log(answer);
