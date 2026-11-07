import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const MAX_COLLISION = 1000000000000;

const opposite: Record<string, string> = {
  ">": "<",
  "<": ">",
  "^": "v",
  v: "^",
};

type Coordinate = { row: number; col: number; direction: string };
type Ghost = Coordinate & { hits: number };

const getCoordinate = (
  inputs: string[][],
  coordinate: Coordinate,
): {
  coordinate: Coordinate;
  collisions: number;
} => {
  let collisions = 0;

  let row = coordinate.row;
  let col = coordinate.col;
  let direction = coordinate.direction;

  switch (direction) {
    case ">":
      if (inputs[row]![col + 1] === "#") {
        direction = "v";
        collisions++;
      } else col++;
      break;
    case "<":
      if (inputs[row]![col - 1] === "#") {
        direction = "^";
        collisions++;
      } else col--;
      break;
    case "^":
      if (inputs[row - 1]![col] === "#") {
        direction = ">";
        collisions++;
      } else row--;
      break;
    case "v":
      if (inputs[row + 1]![col] === "#") {
        direction = "<";
        collisions++;
      } else row++;
      break;
  }

  return {
    coordinate: {
      row,
      col,
      direction,
    },
    collisions,
  };
};

let ghosts: Ghost[] = [];

for (let row = 0; row < INPUTS.length; row++) {
  for (let col = 0; col < INPUTS[row]!.length; col++) {
    const cell = INPUTS[row]![col]!;
    if (cell in opposite) {
      ghosts.push({ row, col, direction: cell, hits: 0 });
      INPUTS[row]![col] = ".";
    }
  }
}

const isAlive = (g: Ghost) => g.hits < MAX_COLLISION;

let round = 0;

const step = (): boolean => {
  round++;
  const before = ghosts.length;

  ghosts = ghosts.map((g) => {
    const { coordinate, collisions } = getCoordinate(INPUTS, g);
    return { ...coordinate, hits: g.hits + collisions };
  });

  ghosts = ghosts.filter(isAlive);

  const groups = new Map<string, Ghost[]>();

  for (const g of ghosts) {
    const key = `${g.row},${g.col}`;
    groups.set(key, [...(groups.get(key) ?? []), g]);
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    for (const g of group) {
      g.direction = opposite[g.direction]!;
      g.hits++;
    }
  }

  ghosts = ghosts.filter(isAlive);

  return ghosts.length !== before;
};

const stateKey = () =>
  ghosts.map((g) => `${g.row},${g.col},${g.direction}`).join("|");

let seen = new Map<string, number>();

while (ghosts.length > 0) {
  if (step()) {
    seen = new Map();
    continue;
  }

  const key = stateKey();
  const firstSeen = seen.get(key);

  if (firstSeen === undefined) {
    seen.set(key, round);
    continue;
  }

  const period = round - firstSeen;
  const hitsBefore = ghosts.map((g) => g.hits);

  let died = false;

  for (let i = 0; i < period && !died; i++) died = step();

  seen = new Map();
  if (died) continue;

  const delta = ghosts.map((g, i) => g.hits - hitsBefore[i]!);

  let cycles = Infinity;

  ghosts.forEach((g, i) => {
    if (delta[i]! > 0)
      cycles = Math.min(
        cycles,
        Math.floor((MAX_COLLISION - 1 - g.hits) / delta[i]!),
      );
  });

  if (cycles === Infinity) throw new Error("ghosts never take damage");

  round += cycles * period;
  ghosts.forEach((g, i) => (g.hits += cycles * delta[i]!));
}

console.log(round);
