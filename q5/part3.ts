import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample1.txt" : "input3.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const totalRows = INPUTS.length;
const totalCols = INPUTS[0]?.length || 0;

INPUTS[Math.floor(totalRows / 2)]![Math.floor(totalCols / 2)] = "#";

const isValidLand = (row: number, col: number) => {
  let good = 0;
  let land = 0;

  for (let r = row - 1; r <= row + 1; r++) {
    if (r < 0 || r >= totalRows) continue;

    for (let c = col - 1; c <= col + 1; c++) {
      if (c < 0 || c >= totalCols || (r === row && c === col)) continue;
      if (INPUTS[r]![c] === "#") land++;
      if (INPUTS[r]![c] === "1" || INPUTS[r]![c] === "#") good++;
    }
  }

  return land >= 1 && good >= 5;
};

let changed = 1;

while (changed != 0) {
  changed = 0;

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      if (INPUTS[row]![col] === "#") continue;

      if (isValidLand(row, col)) {
        INPUTS[row]![col] = "#";
        changed++;
      }
    }
  }
}

const isTouchesWater = (row: number, col: number) => {
  for (let r = row - 1; r <= row + 1; r++) {
    if (r < 0 || r >= totalRows) return true;
    for (let c = col - 1; c <= col + 1; c++) {
      if (c < 0 || c >= totalCols) return true;
      if (INPUTS[r]![c] === "0" || INPUTS[r]![c] === "1") return true;
    }
  }

  return false;
};

for (let row = 0; row < totalRows; row++) {
  for (let col = 0; col < totalCols; col++) {
    if (INPUTS[row]![col] !== "#") continue;

    if (isTouchesWater(row, col)) INPUTS[row]![col] = "=";
  }
}

const isValidSand = (row: number, col: number) => {
  let sand = 0;

  for (let r = row - 1; r <= row + 1; r++) {
    if (r < 0 || r >= totalRows) continue;

    for (let c = col - 1; c <= col + 1; c++) {
      if (c < 0 || c >= totalCols || (r === row && c === col)) continue;
      if (INPUTS[r]![c] === "=") sand++;
    }
  }

  return sand >= 5;
};

changed = 1;

while (changed != 0) {
  changed = 0;

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      if (INPUTS[row]![col] !== "#") continue;

      if (isValidSand(row, col)) {
        INPUTS[row]![col] = "=";
        changed++;
      }
    }
  }
}

const isValidTree = (row: number, col: number) => {
  let tree = 0;

  for (let r = row - 2; r <= row + 2; r++) {
    if (r < 0 || r >= totalRows) continue;

    for (let c = col - 2; c <= col + 2; c++) {
      if (c < 0 || c >= totalCols || (r === row && c === col)) continue;
      if ((r === row - 2 || r === row + 2) && (c === col - 2 || c === col + 2))
        continue;
      if (INPUTS[r]![c] === "#" || INPUTS[r]![c] === "@") tree++;
    }
  }

  return tree === 20;
};

for (let row = 0; row < totalRows; row++) {
  for (let col = 0; col < totalCols; col++) {
    if (INPUTS[row]![col] !== "#") continue;
    if (isValidTree(row, col)) INPUTS[row]![col] = "@";
  }
}

const canGrowTree = (row: number, col: number) => {
  let tree = 0;

  for (let r = row - 1; r <= row + 1; r++) {
    if (r < 0 || r >= totalRows) continue;

    for (let c = col - 1; c <= col + 1; c++) {
      if (c < 0 || c >= totalCols || (r === row && c === col)) continue;
      if (INPUTS[r]![c] === "=") return false;
      if (INPUTS[r]![c] === "@") tree++;
    }
  }

  return tree >= 4;
};

for (let i = 0; i < 2; i++) {
  const positions: { row: number; col: number }[] = [];

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      if (INPUTS[row]![col] !== "#") continue;
      if (canGrowTree(row, col)) positions.push({ row, col });
    }
  }

  positions.forEach(({ row, col }) => (INPUTS[row]![col] = "@"));
}

let sum = 0;

for (let row = 0; row < totalRows; row++) {
  for (let col = 0; col < totalCols; col++) {
    if (INPUTS[row]![col] === "@") sum++;
  }
}

console.log(sum);
