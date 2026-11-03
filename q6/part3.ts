import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[] = readFileSync(file, "utf8").trim().split("\n");

const items: {
  [key: string]: string[];
} = {};

INPUTS.forEach((i) => {
  const [item = "", ingredients = ""] = i.split(":");
  items[item] = ingredients.split(",");
});

const NULLs = ["NULLv1", "NULLv2", "NULLv3"];

const getFullIngredients = (ingredients: string[]) => {
  let added = true;

  while (added) {
    added = false;

    const originalLength = ingredients?.length || 0;

    ingredients?.forEach((i) => {
      if (!NULLs.includes(i)) ingredients?.push(...(items[i] || []));
    });

    ingredients = [...new Set((ingredients || []).filter((i) => i))];

    added = originalLength != (ingredients?.length || 0);
  }

  return ingredients;
};

let noOfNullProduct = 0;

Object.entries(items).forEach(([item, ingredients]) => {
  if (NULLs.includes(item)) return;

  let noOfNullVersion = 0;

  getFullIngredients([...ingredients]).forEach((i) => {
    if (NULLs.includes(i)) noOfNullVersion++;
  });

  if (noOfNullVersion >= 2) noOfNullProduct++;
});

console.log(noOfNullProduct);
