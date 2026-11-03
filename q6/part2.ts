import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample2.txt" : "input2.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const items: {
  [key: string]: string[];
} = {};

INPUTS.forEach((i) => {
  const [item = "", ingredients = ""] = i.split(":");
  items[item] = ingredients.split(",");
});

const getFullIngredients = (ingredients: string[]) => {
  let added = true;

  while (added) {
    added = false;

    const originalLength = ingredients?.length || 0;

    ingredients?.forEach((i) => {
      if (i !== "NULL") ingredients?.push(...(items[i] || []));
    });

    ingredients = [...new Set((ingredients || []).filter((i) => i))];

    added = originalLength != (ingredients?.length || 0);
  }

  return ingredients;
};

let noOfNullProduct = 0;

Object.entries(items).forEach(([item, ingredients]) => {
  if (item === "NULL") return;

  if (getFullIngredients([...ingredients]).includes("NULL")) noOfNullProduct++;
});

console.log(noOfNullProduct);
