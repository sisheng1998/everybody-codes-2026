import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const equations: string[] = [];

const getDecimal = (str: string): number => parseInt(str, 11);

const getTotal = (str: string): number => {
  const [first = "", operator = "", second = ""] = str.split(" ");
  return eval(`${getDecimal(first)} ${operator} ${getDecimal(second)}`);
};

INPUTS.forEach((i) => {
  const [first = "", second = ""] = i.split(" = ");
  if (getTotal(first) === getTotal(second)) equations.push(i);
});

const SEGMENT = {
  "0": 6,
  "1": 2,
  "2": 5,
  "3": 5,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 3,
  "8": 7,
  "9": 6,
  A: 6,
  "+": 2,
  "-": 1,
  "=": 2,
};

let totalSegments = 0;

equations.forEach((e) => {
  totalSegments += e
    .split("")
    .filter((c) => c !== " ")
    .reduce((prev, curr) => prev + SEGMENT[curr as keyof typeof SEGMENT], 0);
});

console.log(totalSegments.toString(11));
