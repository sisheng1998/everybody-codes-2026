import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
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

const INITIAL_ENERGY = 5;

let connections: number[] = mostConnectionsCloud!.connections;
mostConnectionsCloud!.energy += INITIAL_ENERGY;

for (let i = INITIAL_ENERGY - 1; i > 0; i--) {
  const newConnections: number[] = [];

  connections.forEach((c) => {
    const idx = clouds.findIndex((cloud) => cloud.id === c);

    if (idx < 0) return;

    clouds[idx]!.energy += i;
    newConnections.push(...clouds[idx]!.connections);
  });

  connections = newConnections;
}

const totalEnergy = clouds.reduce((prev, current) => prev + current.energy, 0);

console.log(totalEnergy);
