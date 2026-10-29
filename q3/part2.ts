import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
const INPUTS: string[] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map(String);

const getAnswer = (input: string) => {
  const [first = "", second = ""] = input.replace("ISO-", "").split(" ");

  let answer = 0;
  let updatedFirst = "";

  if (first.length !== second.length) {
    for (let i = 0; i < second.length; i++) {
      updatedFirst =
        first[first.length - 1 - (i % first.length)] + updatedFirst;
    }
  } else updatedFirst = first;

  for (let i = 0; i < second.length; i++) {
    answer +=
      Number(second[i]) * Number(updatedFirst[i]) ** (second.length - 1 - i);
  }

  return answer;
};

let sum = 0;

INPUTS.forEach((i) => {
  sum += getAnswer(i);
});

console.log(sum);
