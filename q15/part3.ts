import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
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

const TARGET = 202620262026n;

const rows = INPUTS.length;
const cols = INPUTS[0]!.length;

const isOpen = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols && INPUTS[r]![c] !== "#";

const junctionId = new Map<number, number>();
let startJunction = -1;
let endJunction = -1;
let totalDeposits = 0;

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const ch = INPUTS[r]![c];
    if (ch === "#") continue;
    if (ch === "@") totalDeposits++;
    const degree = DIRS.filter(([dr, dc]) => isOpen(r + dr, c + dc)).length;
    if (degree >= 3 || ch === "S" || ch === "E") {
      const id = junctionId.size;
      junctionId.set(r * cols + c, id);
      if (ch === "S") startJunction = id;
      if (ch === "E") endJunction = id;
    }
  }
}

const junctionCells = [...junctionId.keys()];
const START = junctionCells.length * 4;
const N = START + 1;

type Edge = { to: number; len: number; gain: number };

const trace = (cell: number, dir: number): Edge | null => {
  let r = Math.floor(cell / cols);
  let c = cell % cols;
  let d = dir;
  let len = 0;
  let gain = 0;

  while (true) {
    const [dr, dc] = DIRS[d]!;
    if (!isOpen(r + dr, c + dc)) return null;
    r += dr;
    c += dc;
    len++;
    if (INPUTS[r]![c] === "@") gain++;

    const j = junctionId.get(r * cols + c);
    if (j !== undefined) return { to: j * 4 + d, len, gain };

    const next = [d, (d + 1) % 4, (d + 3) % 4].find((nd) => isOpen(r + DIRS[nd]![0], c + DIRS[nd]![1]));
    if (next === undefined) return null;
    d = next;
  }
};

const edges: Edge[][] = Array.from({ length: N }, () => []);

junctionCells.forEach((cell, j) => {
  for (let arrived = 0; arrived < 4; arrived++) {
    for (let d = 0; d < 4; d++) {
      if (d === (arrived + 2) % 4) continue;
      const e = trace(cell, d);
      if (e) edges[j * 4 + arrived]!.push(e);
    }
  }
});

for (let d = 0; d < 4; d++) {
  const e = trace(junctionCells[startJunction]!, d);
  if (e) edges[START]!.push(e);
}

const isEnd = (node: number) => node < START && Math.floor(node / 4) === endJunction;

const forward = new Uint8Array(N);
forward[START] = 1;
const stack = [START];
while (stack.length > 0) {
  const u = stack.pop()!;
  for (const e of edges[u]!) {
    if (!forward[e.to]) {
      forward[e.to] = 1;
      stack.push(e.to);
    }
  }
}

const reverse: number[][] = Array.from({ length: N }, () => []);
for (let u = 0; u < N; u++) for (const e of edges[u]!) reverse[e.to]!.push(u);

const backward = new Uint8Array(N);
for (let u = 0; u < N; u++) {
  if (isEnd(u)) {
    backward[u] = 1;
    stack.push(u);
  }
}
while (stack.length > 0) {
  const u = stack.pop()!;
  for (const v of reverse[u]!) {
    if (!backward[v]) {
      backward[v] = 1;
      stack.push(v);
    }
  }
}

const useful = (u: number) => forward[u] === 1 && backward[u] === 1;

class MinHeap {
  private items: [number, number][] = [];

  get size() {
    return this.items.length;
  }

  push(item: [number, number]) {
    const a = this.items;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p]![0] <= a[i]![0]) break;
      [a[p], a[i]] = [a[i]!, a[p]!];
      i = p;
    }
  }

  pop(): [number, number] {
    const a = this.items;
    const top = a[0]!;
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      while (true) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l]![0] < a[m]![0]) m = l;
        if (r < a.length && a[r]![0] < a[m]![0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i]!, a[m]!];
        i = m;
      }
    }
    return top;
  }
}

const maxGain = totalDeposits * 2;
const width = maxGain + 1;

const bestCycle = (source: number): { len: number; gain: number } | null => {
  const dist = new Float64Array(N * width).fill(Infinity);
  const heap = new MinHeap();
  let best: { len: number; gain: number } | null = null;

  const relax = (from: number, g: number, len: number) => {
    for (const e of edges[from]!) {
      if (!useful(e.to)) continue;
      const ng = g + e.gain;
      if (ng > maxGain) continue;
      const nl = len + e.len;
      const id = e.to * width + ng;
      if (nl < dist[id]!) {
        dist[id] = nl;
        heap.push([nl, id]);
      }
    }
  };

  relax(source, 0, 0);

  while (heap.size > 0) {
    const [len, id] = heap.pop();
    if (len > dist[id]!) continue;
    const u = Math.floor(id / width);
    const g = id % width;

    if (u === source) {
      if (g > 0 && (!best || len * best.gain < best.len * g)) best = { len, gain: g };
      continue;
    }

    relax(u, g, len);
  }

  return best;
};

const cycles: { node: number; len: number; gain: number }[] = [];
for (let u = 0; u < START; u++) {
  if (!useful(u)) continue;
  const c = bestCycle(u);
  if (c) cycles.push({ node: u, ...c });
}

const ratioCompare = (a: { len: number; gain: number }, b: { len: number; gain: number }) =>
  a.len * b.gain - b.len * a.gain;

const best = cycles.reduce((a, b) => (ratioCompare(b, a) < 0 ? b : a));
const anchors = cycles.filter((c) => ratioCompare(c, best) === 0);

let answer: bigint | null = null;

for (const { node: anchor, len: cycleLen, gain: cycleGain } of anchors) {
  const target = Number(TARGET % BigInt(cycleGain));
  const states = N * cycleGain * 2;
  const dist = new Float64Array(states).fill(Infinity);
  const inQueue = new Uint8Array(states);
  const encode = (u: number, residue: number, phase: number) => (u * cycleGain + residue) * 2 + phase;

  const queue: number[] = [];
  const startId = encode(START, 0, 0);
  dist[startId] = 0;
  queue.push(startId);
  inQueue[startId] = 1;

  for (let head = 0; head < queue.length; head++) {
    const id = queue[head]!;
    inQueue[id] = 0;
    const phase = id % 2;
    const residue = ((id - phase) / 2) % cycleGain;
    const u = Math.floor(id / 2 / cycleGain);

    for (const e of edges[u]!) {
      if (!useful(e.to)) continue;
      const nr = (residue + e.gain) % cycleGain;
      const np = phase === 1 || e.to === anchor ? 1 : 0;
      const nid = encode(e.to, nr, np);
      const nd = dist[id]! + e.len * cycleGain - e.gain * cycleLen;
      if (nd < dist[nid]!) {
        dist[nid] = nd;
        if (!inQueue[nid]) {
          inQueue[nid] = 1;
          queue.push(nid);
        }
      }
    }
  }

  for (let u = 0; u < START; u++) {
    if (!isEnd(u)) continue;
    const d = dist[encode(u, target, 1)]!;
    if (d === Infinity) continue;
    const total = (BigInt(d) + TARGET * BigInt(cycleLen)) / BigInt(cycleGain);
    if (answer === null || total < answer) answer = total;
  }
}

console.log(answer?.toString());
