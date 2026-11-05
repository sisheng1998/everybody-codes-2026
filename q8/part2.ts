import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const getEnergyRequired = (
  inputs: string[][],
  top: number = 1,
  left: number = 1,
): number => {
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
    if (inputs[row - top]![col - left] === ".") return inputs[row]![col] || ".";

    const currentHeight = Number(inputs[row]![col]);
    const prevHeight = Number(heights[row - top]![col - left]);
    let height = 0;

    if (currentHeight > prevHeight - 1) height = currentHeight;
    else height = prevHeight - 1;

    return String(height);
  };

  for (let row = 0; row < inputs.length; row++) {
    for (let col = 0; col < inputs[0]!.length; col++) {
      if (inputs[row]![col] === ".") continue;

      if (isOutside(row, col)) heights[row]![col] = inputs[row]![col] || ".";
      else heights[row]![col] = getHeight(row, col);
    }
  }

  for (let row = 0; row < inputs.length; row++) {
    for (let col = 0; col < inputs[0]!.length; col++) {
      if (
        isOutside(row, col) ||
        inputs[row]![col] === "." ||
        heights[row - top]![col - left] === "."
      )
        continue;

      if (Number(inputs[row]![col]) < Number(heights[row - top]![col - left]))
        inputs[row]![col] = ".";
    }
  }

  let energyRequired = 0;

  inputs.forEach((row) => {
    row.forEach((col) => {
      if (col !== ".") energyRequired++;
    });
  });

  return energyRequired;
};

let totalEnergy = 0;

// Direction: ↘
totalEnergy += getEnergyRequired(JSON.parse(JSON.stringify(INPUTS)));

// Direction: ↙
totalEnergy += getEnergyRequired(
  (JSON.parse(JSON.stringify(INPUTS)) as string[][]).map((i) => i.reverse()),
);

// Direction: ←
totalEnergy += getEnergyRequired(
  (JSON.parse(JSON.stringify(INPUTS)) as string[][]).map((i) => i.reverse()),
  0,
  2,
);

// Direction: ↖
totalEnergy += getEnergyRequired(
  (JSON.parse(JSON.stringify(INPUTS)) as string[][])
    .map((i) => i.reverse())
    .reverse(),
);

// Direction: ↗
totalEnergy += getEnergyRequired(
  (JSON.parse(JSON.stringify(INPUTS)) as string[][]).reverse(),
);

// Direction: →
totalEnergy += getEnergyRequired(JSON.parse(JSON.stringify(INPUTS)), 0, 2);

console.log(totalEnergy);
