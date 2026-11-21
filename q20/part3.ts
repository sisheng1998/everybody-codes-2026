import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const getDecimal = (str: string): number => parseInt(str, 11);

const getTotal = (str: string): number => {
  const [first = "", operator = "", second = ""] = str.split(" ");
  return eval(`${getDecimal(first)} ${operator} ${getDecimal(second)}`);
};

const isCorrect = (equation: string): boolean => {
  const [first = "", second = ""] = equation.split(" = ");
  return getTotal(first) === getTotal(second);
};

const DIGIT_SEGMENTS = "abcdefg";
const OPERATOR_SEGMENTS = "hv";

const SHAPES: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abdeg",
  "3": "abcdg",
  "4": "bcfg",
  "5": "acdfg",
  "6": "acdefg",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
  A: "abcefg",
  "+": "hv",
  "-": "h",
};

const sortLetters = (shape: string): string => shape.split("").sort().join("");

const symbolWithShape = (shape: string): string | undefined =>
  Object.keys(SHAPES).find((symbol) => SHAPES[symbol] === sortLetters(shape));

const allSegmentsOf = (symbol: string): string =>
  symbol === "+" || symbol === "-" ? OPERATOR_SEGMENTS : DIGIT_SEGMENTS;

const isValidSymbol = (symbol: string | undefined): symbol is string =>
  symbol !== undefined;

const removeOneSegment = (symbol: string): string[] => {
  const shape = SHAPES[symbol]!;
  return shape
    .split("")
    .map((segment) => symbolWithShape(shape.replace(segment, "")))
    .filter(isValidSymbol);
};

const addOneSegment = (symbol: string): string[] => {
  const shape = SHAPES[symbol]!;
  return allSegmentsOf(symbol)
    .split("")
    .filter((segment) => !shape.includes(segment))
    .map((segment) => symbolWithShape(shape + segment))
    .filter(isValidSymbol);
};

const moveOneSegmentInside = (symbol: string): string[] => {
  const results: string[] = [];
  const shape = SHAPES[symbol]!;

  for (const removed of shape) {
    const smallerShape = shape.replace(removed, "");
    for (const added of allSegmentsOf(symbol)) {
      if (shape.includes(added)) continue;
      const newSymbol = symbolWithShape(smallerShape + added);
      if (newSymbol) results.push(newSymbol);
    }
  }

  return results;
};

const replaceAt = (chars: string[], changes: Record<number, string>): string =>
  chars.map((char, index) => changes[index] ?? char).join("");

const isRepairable = (equation: string): boolean => {
  const chars = equation.split("");
  const movable = chars
    .map((_, index) => index)
    .filter((index) => chars[index]! in SHAPES);

  for (const index of movable) {
    for (const newSymbol of moveOneSegmentInside(chars[index]!)) {
      if (isCorrect(replaceAt(chars, { [index]: newSymbol }))) return true;
    }
  }

  for (const from of movable) {
    for (const to of movable) {
      if (from === to) continue;

      for (const smaller of removeOneSegment(chars[from]!)) {
        for (const bigger of addOneSegment(chars[to]!)) {
          if (isCorrect(replaceAt(chars, { [from]: smaller, [to]: bigger }))) return true;
        }
      }
    }
  }

  return false;
};

const countSegments = (equation: string): number =>
  equation
    .split("")
    .filter((char) => char !== " ")
    .reduce((total, char) => total + (char === "=" ? 2 : SHAPES[char]!.length), 0);

let totalSegments = 0;

INPUTS.forEach((equation) => {
  if (isCorrect(equation) || isRepairable(equation)) {
    totalSegments += countSegments(equation);
  }
});

console.log(totalSegments.toString(11));
