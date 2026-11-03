import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input1.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const items: {
  [key: string]: string[];
} = {};

INPUTS.forEach((i) => {
  const [item = "", ingredients = ""] = i.split(":");
  items[item] = ingredients.split(",");
});

let added = true;

while (added) {
  added = false;

  const originalLength = items["NULL"]?.length || 0;

  items["NULL"]?.forEach((i) => {
    if (i !== "NULL") items["NULL"]?.push(...(items[i] || []));
  });

  items["NULL"] = [
    ...new Set((items["NULL"] || []).filter((i) => i !== "NULL" && i)),
  ];

  added = originalLength != (items["NULL"]?.length || 0);
}

console.log(items["NULL"]?.length || 0);
