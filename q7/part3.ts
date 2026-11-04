import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const MAX_ENERGY = isSample ? 100 : 1000000;

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

const INITIAL_ENERGY = 10;

const addImpulse = (
  map: Map<string, number>,
  id: number,
  strength: number,
  count: number,
) => {
  const key = `${id}:${strength}`;
  map.set(key, (map.get(key) || 0) + count);
};

const getTotalEnergy = (initialCloudId: number, allClouds: typeof clouds) => {
  let connectionCounts: Map<string, number> = new Map();

  const initialCloud = allClouds.find((c) => c.id === initialCloudId);
  if (!initialCloud) return 0;

  initialCloud.connections.forEach((c) => {
    addImpulse(connectionCounts, c, INITIAL_ENERGY - 1, 1);
  });

  initialCloud.energy += INITIAL_ENERGY;

  while (connectionCounts.size > 0) {
    const newConnectionCounts: Map<string, number> = new Map();
    const hitClouds: Set<number> = new Set();

    for (const [key, count] of connectionCounts) {
      const [id = 0, strength = 0] = key.split(":").map(Number);
      const cloud = allClouds.find((cloud) => cloud.id === id);

      if (!cloud) continue;

      cloud.energy += strength * count;
      hitClouds.add(id);

      if (strength - 1 > 0) {
        cloud.connections.forEach((c) => {
          addImpulse(newConnectionCounts, c, strength - 1, count);
        });
      }
    }

    for (const id of hitClouds) {
      const idx = allClouds.findIndex((cloud) => cloud.id === id);

      if (allClouds[idx]!.energy < MAX_ENERGY) continue;

      allClouds[idx]!.connections.forEach((c) => {
        addImpulse(newConnectionCounts, c, INITIAL_ENERGY, 1);
      });

      allClouds.splice(idx, 1);
    }

    connectionCounts = newConnectionCounts;
  }

  const totalEnergy = allClouds.reduce(
    (prev, current) => prev + current.energy,
    0,
  );

  return totalEnergy;
};

let highestTotalEnergy = 0;

clouds.forEach((c) => {
  const totalEnergy = getTotalEnergy(c.id, JSON.parse(JSON.stringify(clouds)));

  if (totalEnergy > highestTotalEnergy) highestTotalEnergy = totalEnergy;
});

console.log(highestTotalEnergy);
