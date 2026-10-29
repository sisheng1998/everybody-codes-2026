import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: number[] = readFileSync(file, "utf8")
  .trim()
  .split(/[\s,]+/)
  .map(Number);

const getAnswer = (num: number) => {
  let n = 1;

  while (n * n < num) n++;

  return n * n - num;
};

let sum = 0;

INPUTS.forEach((n) => {
  sum += getAnswer(n);
});

console.log(sum);
