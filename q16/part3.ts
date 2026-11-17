import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
let INPUTS: string = readFileSync(file, "utf8").trim();

INPUTS = INPUTS.repeat(100);

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

  let low: number = firstIdx;
  let high: number = lastIdx;

  let backwards: boolean = false;
  let joined: number = 0;

  const setAside: string[] = [];

  while (low <= high) {
    totalFlip += high - low + 1;
    backwards = !backwards;

    if (backwards) {
      while (low <= high && INPUTS[high] === current) (high--, joined++);
      while (low <= high && INPUTS[low] !== current)
        setAside.push(INPUTS[low++]!);
    } else {
      while (low <= high && INPUTS[low] === current) (low++, joined++);
      while (low <= high && INPUTS[high] !== current)
        setAside.push(INPUTS[high--]!);
    }
  }

  const flip = current.repeat(joined) + setAside.reverse().join("");
  INPUTS = replaceSubstring(INPUTS, firstIdx, lastIdx + 1, flip);

  while (INPUTS[i] === current) i++;

  current = INPUTS[i]!;
}

console.log(totalFlip);
