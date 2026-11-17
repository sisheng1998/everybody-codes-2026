import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
let INPUTS: string = readFileSync(file, "utf8").trim();

INPUTS = INPUTS.repeat(10);

const replaceSubstring = (
  str: string,
  startIdx: number,
  endIdx: number,
  replacement: string,
) => str.slice(0, startIdx) + replacement + str.slice(endIdx);

let totalFlip: number = 0;

let firstIdx: number = 0;
let lastIdx: number = INPUTS.length - 1;
let current: string = INPUTS[firstIdx]!;

for (let i = 0; i < INPUTS.length; i++) {
  if (INPUTS[i] === current) continue;

  firstIdx = i;
  lastIdx = INPUTS.length - 1;

  for (let j = lastIdx; j >= i; j--) {
    if (INPUTS[j] === current) break;
    lastIdx--;
  }

  const flip = INPUTS.substring(firstIdx, lastIdx + 1)
    .split("")
    .reverse()
    .join("");

  INPUTS = replaceSubstring(INPUTS, firstIdx, lastIdx + 1, flip);
  totalFlip += flip.length;

  while (INPUTS[i] === current) i++;

  lastIdx = INPUTS.length - 1;
  for (let j = lastIdx; j >= i - 1; j--) {
    if (INPUTS[j] === current) break;
    lastIdx--;
  }

  if (i - 1 === lastIdx) current = INPUTS[i]!;
  else i--;
}

console.log(totalFlip);
