import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .filter((i) => i);

const TOTAL_PORTAL = Number(INPUTS[0]!.split(" ")[1]);

INPUTS.shift();

const SHORTCUTS: [number, number][] = INPUTS.map((line) => {
  const [a, b] = line.trim().split(/\s+/).map(Number);
  return [a!, b!];
});

const buildGraph = (withShortcuts: boolean): number[][] => {
  const graph: number[][] = Array.from({ length: TOTAL_PORTAL + 1 }, () => []);

  for (let p = 0; p < TOTAL_PORTAL; p++) {
    for (let k = 1; k <= 3; k++) {
      const next = ((p + k) % TOTAL_PORTAL) + 1;

      graph[p + 1]!.push(next);
      graph[next]!.push(p + 1);
    }
  }

  if (withShortcuts) {
    for (const [a, b] of SHORTCUTS) {
      graph[a]!.push(b);
      graph[b]!.push(a);
    }
  }

  return graph;
};

const routeSum = (graph: number[][], start: number): number => {
  const dist = new Array<number>(TOTAL_PORTAL + 1).fill(-1);
  dist[start] = 0;
  const queue = [start];
  let sum = 0;

  for (let head = 0; head < queue.length; head++) {
    const current = queue[head]!;

    for (const next of graph[current]!) {
      if (dist[next] !== -1) continue;

      dist[next] = dist[current]! + 1;
      sum += dist[next]!;
      queue.push(next);
    }
  }

  return sum;
};

const strain = (graph: number[][]): number => {
  let total = 0;
  for (let p = 1; p <= TOTAL_PORTAL; p++) total += routeSum(graph, p);
  return total;
};

const before = strain(buildGraph(false));

const graph = buildGraph(true);

let best = strain(graph);

const CRYSTALS = 8;
const GAP = TOTAL_PORTAL / CRYSTALS;

const tryPairings = (left: number[]): void => {
  if (left.length === 0) {
    best = Math.min(best, strain(graph));
    return;
  }

  const [first, ...rest] = left;
  const a = first!;

  for (let i = 0; i < rest.length; i++) {
    const b = rest[i]!;

    graph[a]!.push(b);
    graph[b]!.push(a);

    tryPairings([...rest.slice(0, i), ...rest.slice(i + 1)]);

    graph[a]!.pop();
    graph[b]!.pop();
  }
};

for (let start = 1; start <= GAP; start++) {
  const crystals = Array.from({ length: CRYSTALS }, (_, i) => start + i * GAP);
  tryPairings(crystals);
}

console.log(before - best);
