import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
let INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const MIN_ENT = 100000;

const getEnergyRequired = (
  inputs: string[][],
  top: number = 1,
  left: number = 1,
) => {
  const heights: string[][] = (
    JSON.parse(JSON.stringify(inputs)) as string[][]
  ).map((i) => i.fill("."));

  const isOutside = (row: number, col: number) => {
    const prevRow = row - top;
    const prevCol = col - left;

    return (
      prevRow < 0 ||
      prevRow >= inputs.length ||
      prevCol < 0 ||
      prevCol >= inputs[0]!.length
    );
  };

  const getHeight = (row: number, col: number) => {
    const currentHeight =
      inputs[row]![col] === "x" ? 0 : Number(inputs[row]![col]);

    if (inputs[row - top]![col - left] === ".") return String(currentHeight);

    const prevHeight = Number(heights[row - top]![col - left]);
    let height = 0;

    if (currentHeight > prevHeight - 1) height = currentHeight;
    else height = prevHeight - 1;

    return String(height);
  };

  for (let row = 0; row < inputs.length; row++) {
    for (let col = 0; col < inputs[0]!.length; col++) {
      if (inputs[row]![col] === ".") continue;

      if (isOutside(row, col))
        heights[row]![col] =
          inputs[row]![col] === "x" ? "0" : inputs[row]![col]!;
      else heights[row]![col] = getHeight(row, col);
    }
  }

  for (let row = 0; row < inputs.length; row++) {
    for (let col = 0; col < inputs[0]!.length; col++) {
      if (
        isOutside(row, col) ||
        inputs[row]![col] === "." ||
        inputs[row]![col] === "x" ||
        heights[row - top]![col - left] === "." ||
        heights[row - top]![col - left] === "x"
      )
        continue;

      if (Number(inputs[row]![col]) < Number(heights[row - top]![col - left]))
        inputs[row]![col] = ".";
    }
  }

  let energyRequired = 0;
  let newWarriors = 0;

  inputs.forEach((row) => {
    row.forEach((col) => {
      if (col !== "." && col !== "x") energyRequired++;
      if (col === "9") newWarriors++;
    });
  });

  return { energyRequired, newWarriors, inputs };
};

const sprout = (field: string[][]) =>
  field.map((row) =>
    row.map((cell) => {
      if (!cell.startsWith("x")) return cell;
      const left = Number(cell.slice(1)) - 1;
      return left === 0 ? "1" : `x${left}`;
    }),
  );

const seedsAsX = (field: string[][]) =>
  field.map((row) => row.map((cell) => (cell.startsWith("x") ? "x" : cell)));

let totalEnergy = 0;
let totalEnt = 0;
let i = 1;

while (totalEnt < MIN_ENT) {
  INPUTS = sprout(INPUTS);

  let result = {
    energyRequired: 0,
    newWarriors: 0,
    inputs: INPUTS,
  };

  switch ((i - 1) % 6) {
    case 0:
      // Direction: ↘
      result = getEnergyRequired(seedsAsX(INPUTS));
      break;
    case 1:
      // Direction: ↙
      INPUTS = (JSON.parse(JSON.stringify(INPUTS)) as string[][]).map((i) =>
        i.reverse(),
      );
      result = getEnergyRequired(seedsAsX(INPUTS));
      break;
    case 2:
      // Direction: ←
      result = getEnergyRequired(seedsAsX(INPUTS), 0, 2);
      break;
    case 3:
      // Direction: ↖
      INPUTS = (JSON.parse(JSON.stringify(INPUTS)) as string[][]).reverse();
      result = getEnergyRequired(seedsAsX(INPUTS));
      break;
    case 4:
      // Direction: ↗
      INPUTS = (JSON.parse(JSON.stringify(INPUTS)) as string[][]).map((i) =>
        i.reverse(),
      );
      result = getEnergyRequired(seedsAsX(INPUTS));
      break;
    case 5:
      // Direction: →
      INPUTS = (JSON.parse(JSON.stringify(INPUTS)) as string[][]).reverse();
      result = getEnergyRequired(seedsAsX(INPUTS), 0, 2);
      break;
  }

  result.inputs.forEach((row, rowIdx) =>
    row.forEach((col, colIdx) => {
      if (col === "." || col === "x") return;

      if (col === "9") INPUTS[rowIdx]![colIdx] = "x4";
      else
        INPUTS[rowIdx]![colIdx] = String(Number(INPUTS[rowIdx]![colIdx]) + 1);
    }),
  );

  totalEnergy += result.energyRequired;
  totalEnt += result.newWarriors;
  i++;
}

console.log(totalEnergy);
