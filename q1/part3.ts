import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input3.txt";
const INPUTS: number[] = readFileSync(file, "utf8")
  .trim()
  .split(/[\s,]+/)
  .map(Number);

const getAnswer = (num: number) => {
  let n = 3;

  while (n * n - 1 < num) n += 2;

  return n * n - 1 - num;
};

let sum = 0;

INPUTS.forEach((n) => {
  sum += getAnswer(n);
});

console.log(sum);
