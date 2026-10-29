import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map(String);

const getAnswer = (input: string) => {
  const [first = "", second = ""] = input.replace("ISO-", "").split(" ");
  let answer = 0;

  for (let i = 0; i < first.length; i++) {
    answer += Number(second[i]) * Number(first[i]) ** (first.length - 1 - i);
  }

  return answer;
};

let sum = 0;

INPUTS.forEach((i) => {
  sum += getAnswer(i);
});

console.log(sum);
