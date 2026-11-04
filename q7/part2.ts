import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const clouds: {
  id: number;
  energy: number;
  connections: number[];
}[] = [];

INPUTS.forEach((i) => {
  const [id = "", energy = "", connections = ""] = i
    .split(" ")
    .map((s) => s.split("=").slice(1).join("=").replace(/,$/, ""));

  clouds.push({
    id: Number(id),
    energy: Number(energy),
    connections: connections.split(",").map((c) => Number(c)),
  });
});

const mostConnectionsCloud = clouds.sort(
  (a, b) => b.connections.length - a.connections.length,
)[0];

const INITIAL_ENERGY = 10;

let connectionCounts: Map<number, number> = new Map();

mostConnectionsCloud!.connections.forEach((c) => {
  const currentCount = connectionCounts.get(c) || 0;
  connectionCounts.set(c, currentCount + 1);
});

mostConnectionsCloud!.energy += INITIAL_ENERGY;

for (let i = INITIAL_ENERGY - 1; i > 0; i--) {
  const newConnectionCounts: Map<number, number> = new Map();

  for (let [id, count] of connectionCounts) {
    const idx = clouds.findIndex((cloud) => cloud.id === id);

    if (idx < 0) continue;

    clouds[idx]!.energy += i * count;
    clouds[idx]!.connections.forEach((c) => {
      const currentCount = newConnectionCounts.get(c) || 0;
      newConnectionCounts.set(c, currentCount + count);
    });
  }

  connectionCounts = newConnectionCounts;
}

const totalEnergy = clouds.reduce((prev, current) => prev + current.energy, 0);

console.log(totalEnergy);
