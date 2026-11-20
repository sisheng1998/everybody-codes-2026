import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n\n");

type Color = "C" | "M" | "Y" | "K" | "R" | "G" | "B" | "";

const FIRST_LAYER = INPUTS[0]!.split("\n").map((i) => i.split("")) as Color[][];
const SECOND_LAYER = INPUTS[1]!
  .split("\n")
  .map((i) => i.split("")) as Color[][];

const TOTAL_ROWS = FIRST_LAYER.length;
const TOTAL_COLS = FIRST_LAYER[0]!.length;

const RESULTS: Color[][] = Array.from({ length: TOTAL_ROWS }).map(
  (_) => Array.from({ length: TOTAL_COLS }).fill("") as Color[],
);

const getColor = (first: Color, second: Color): Color => {
  if (first === second) return first;
  else if (first === "K" || second === "K") return "K";
  else if (
    (first === "C" && second === "M") ||
    (first === "M" && second === "C")
  )
    return "B";
  else if (
    (first === "C" && second === "Y") ||
    (first === "Y" && second === "C")
  )
    return "G";
  else if (
    (first === "M" && second === "Y") ||
    (first === "Y" && second === "M")
  )
    return "R";
  else return "";
};

for (let row = 0; row < TOTAL_ROWS; row++) {
  for (let col = 0; col < TOTAL_COLS; col++) {
    RESULTS[row]![col] = getColor(
      FIRST_LAYER[row]![col]!,
      SECOND_LAYER[row]![col]!,
    );
  }
}

const CMYK_RGB_COUNT: number[] = Array.from({ length: 7 }).fill(0) as number[];

for (let row = 0; row < TOTAL_ROWS; row++) {
  for (let col = 0; col < TOTAL_COLS; col++) {
    const color = RESULTS[row]![col]!;

    switch (color) {
      case "C":
        CMYK_RGB_COUNT[0]!++;
        break;
      case "M":
        CMYK_RGB_COUNT[1]!++;
        break;
      case "Y":
        CMYK_RGB_COUNT[2]!++;
        break;
      case "K":
        CMYK_RGB_COUNT[3]!++;
        break;
      case "R":
        CMYK_RGB_COUNT[4]!++;
        break;
      case "G":
        CMYK_RGB_COUNT[5]!++;
        break;
      case "B":
        CMYK_RGB_COUNT[6]!++;
        break;
    }
  }
}

console.log(
  CMYK_RGB_COUNT.sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((prev, curr) => prev * curr, 1),
);
