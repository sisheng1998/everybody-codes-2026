import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map(String);

const getAnswer = (input: string, needChecking: boolean = true) => {
  const [first = "", second = ""] = input.replace("ISO2-", "").split(" ");

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

  if (needChecking) {
    for (let i = 0; i < Number(second); i++) {
      if (answer === getAnswer(`ISO2-${first} ${i}`, false)) return 0;
    }
  }

  return answer;
};

let sum = 0;

INPUTS.forEach((i) => {
  sum += getAnswer(i);
});

console.log(sum);
