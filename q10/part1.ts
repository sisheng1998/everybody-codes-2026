import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const opposite: Record<string, string> = {
  ">": "<",
  "<": ">",
  "^": "v",
  v: "^",
};

type Coordinate = { row: number; col: number; direction: string };
let COORDINATES: Coordinate[] = [];

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

const getCollisions = (inputs: string[][]): number => {
  let totalCollisions = 0;
  let coordinates = [];

  for (let row = 0; row < inputs.length; row++) {
    for (let col = 0; col < inputs[0]!.length; col++) {
      if (inputs[row]![col] === "#" || inputs[row]![col] === ".") continue;

      let direction = inputs[row]![col] || "";

      if (!isNaN(Number(direction))) {
        const foundCoordinates = COORDINATES.filter(
          (c) => c.row === row && c.col === col,
        );

        foundCoordinates.forEach((c) => {
          const { coordinate, collisions } = getCoordinate(inputs, c);

          coordinates.push(coordinate);
          totalCollisions += collisions;
        });

        inputs[row]![col] = ".";
        continue;
      }

      const { coordinate, collisions } = getCoordinate(inputs, {
        row,
        col,
        direction,
      });

      coordinates.push(coordinate);
      totalCollisions += collisions;

      inputs[row]![col] = ".";
    }
  }

  coordinates.forEach(({ row, col, direction }) => {
    if (inputs[row]![col] !== ".") {
      if (!isNaN(Number(inputs[row]![col]))) {
        totalCollisions++;
        inputs[row]![col] = String(Number(inputs[row]![col]) + 1);
      } else {
        totalCollisions += 2;
        inputs[row]![col] = "2";
      }
    } else inputs[row]![col] = direction;
  });

  coordinates.forEach((c) => {
    if (!isNaN(Number(inputs[c.row]![c.col])))
      c.direction = opposite[c.direction]!;
  });

  COORDINATES = coordinates;

  return totalCollisions;
};

let totalCollisions = 0;

for (let i = 1; i <= 10; i++) {
  totalCollisions += getCollisions(INPUTS);
}

console.log(totalCollisions);
