import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input2.txt";
const INPUTS: number[] = readFileSync(file, "utf8")
  .trim()
  .split(/[\s,]+/)
  .map(Number);

const getAnswer = (num: number) => {
  let n = 3;

  while (4 * (n - 1) < num) n++;

  return 4 * (n - 1) - num;
};

let sum = 0;

INPUTS.forEach((n) => {
  sum += getAnswer(n);
});

console.log(sum);
