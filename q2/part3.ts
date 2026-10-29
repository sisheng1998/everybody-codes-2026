import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map(String);

const MAX = isSample ? 5 : 9;

const getAnswer = (input: string) => {
  const pairs = input
    .split(" ")
    .map((v) =>
      v.includes("<") ? [...v].reverse().join("").replace("<", ">") : v,
    );

  const known = new Set(pairs);

  for (let c = 1; c <= MAX; c++) {
    for (let a = 1; a <= MAX; a++) {
      if (!known.has(`${a}>${c}`)) continue;

      for (let b = 1; b <= MAX; b++) {
        if (known.has(`${c}>${b}`)) known.add(`${a}>${b}`);
      }
    }
  }

  const wins = Array(MAX).fill(0);

  known.forEach((p) => wins[Number(p[0]) - 1]++);

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
