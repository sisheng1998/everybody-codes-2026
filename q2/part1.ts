import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map(String);

const getAnswer = (input: string) => {
  const pairs = input
    .split(" ")
    .map((v) =>
      v.includes("<") ? [...v].reverse().join("").replace("<", ">") : v,
    );

  const wins = Array(5).fill(0);

  pairs.forEach((p) => wins[Number(p[0]) - 1]++);

  const nums: {
    [key: number]: number;
  } = {};

  wins.forEach((w, index) => {
    nums[Number(index + 1)] = w;
  });

  const answer = Number(
    Object.entries(nums)
      .sort(([, a], [, b]) => b - a)
      .map(([v]) => v)
      .join(""),
  );

  return answer;
};

let sum = 0;

INPUTS.forEach((i) => {
  sum += getAnswer(i);
});

console.log(sum);
