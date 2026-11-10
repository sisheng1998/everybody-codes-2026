import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
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

  for (let p = 1; p <= TOTAL_PORTAL; p++) {
    const next = (p % TOTAL_PORTAL) + 1;

    graph[p]!.push(next);
    graph[next]!.push(p);
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
const after = strain(buildGraph(true));

console.log(before - after);
