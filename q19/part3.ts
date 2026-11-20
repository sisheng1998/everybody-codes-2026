import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUT: string = readFileSync(file, "utf8").trim();

type FirstLayerColor = "C" | "M" | "Y" | "K";
type Color = FirstLayerColor | "R" | "G" | "B";

const ALL_COLORS: Color[] = ["C", "M", "Y", "K", "R", "G", "B"];

const POSSIBLE_RESULTS: Record<FirstLayerColor, Color[]> = {
  C: ["C", "B", "G"],
  M: ["M", "B", "R"],
  Y: ["Y", "G", "R"],
  K: ["K"],
};

const SQUARE_COUNT: Record<FirstLayerColor, number> = {
  C: 0,
  M: 0,
  Y: 0,
  K: 0,
};

for (const color of INPUT.replaceAll("\n", "")) {
  SQUARE_COUNT[color as FirstLayerColor]++;
}

const countSquaresThatCanBecome = (targets: Color[]): number => {
  let total = 0;

  for (const color of ["C", "M", "Y", "K"] as FirstLayerColor[]) {
    const canBecomeTarget = POSSIBLE_RESULTS[color].some((result) =>
      targets.includes(result),
    );

    if (canBecomeTarget) total += SQUARE_COUNT[color];
  }

  return total;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const getBestProduct = (first: Color, second: Color, third: Color): number => {
  const total = countSquaresThatCanBecome([first, second, third]);

  const onlyFirstCanTake = total - countSquaresThatCanBecome([second, third]);
  const onlySecondCanTake = total - countSquaresThatCanBecome([first, third]);

  const maxFirst = countSquaresThatCanBecome([first]);
  const maxSecond = countSquaresThatCanBecome([second]);
  const maxThird = countSquaresThatCanBecome([third]);
  const maxFirstAndSecond = countSquaresThatCanBecome([first, second]);

  let best = 0;

  for (
    let firstCount = onlyFirstCanTake;
    firstCount <= maxFirst;
    firstCount++
  ) {
    const remaining = total - firstCount;

    const minSecond = Math.max(onlySecondCanTake, remaining - maxThird);
    const maxSecondNow = Math.min(maxSecond, maxFirstAndSecond - firstCount);

    if (minSecond > maxSecondNow) continue;

    const secondCount = clamp(
      Math.floor(remaining / 2),
      minSecond,
      maxSecondNow,
    );
    const thirdCount = remaining - secondCount;

    best = Math.max(best, firstCount * secondCount * thirdCount);
  }

  return best;
};

let maxResult = 0;

for (let i = 0; i < ALL_COLORS.length; i++) {
  for (let j = i + 1; j < ALL_COLORS.length; j++) {
    for (let k = j + 1; k < ALL_COLORS.length; k++) {
      const product = getBestProduct(
        ALL_COLORS[i]!,
        ALL_COLORS[j]!,
        ALL_COLORS[k]!,
      );

      maxResult = Math.max(maxResult, product);
    }
  }
}

console.log(maxResult);
