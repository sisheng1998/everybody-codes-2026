import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
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

  for (let a = 1; a <= MAX; a++) {
    for (let b = a + 1; b <= MAX; b++) {
      for (let c = 1; c <= MAX; c++) {
        if (c === a || c === b) continue;

        if (pairs.includes(`${a}>${c}`) && pairs.includes(`${c}>${b}`))
          pairs.push(`${a}>${b}`);

        if (pairs.includes(`${b}>${c}`) && pairs.includes(`${c}>${a}`))
          pairs.push(`${b}>${a}`);
      }
    }
  }

  const wins = Array(MAX).fill(0);

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
