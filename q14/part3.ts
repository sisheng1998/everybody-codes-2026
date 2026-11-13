import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[][] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map((i) => i.split(""));

const TOTAL_ROWS = INPUTS.length;
const TOTAL_COLS = INPUTS[0]?.length || 0;

const bindings: { link: string; cost: number }[] = [];

const setBinding = (a: string = "", b: string = "") => {
  const link = `${a} ${b}`;

  const index = bindings.findIndex(
    (b) => b.link === link || b.link === link.split("").reverse().join(""),
  );

  if (index >= 0) {
    bindings[index] = {
      link: bindings[index]?.link || link,
      cost: (bindings[index]?.cost || 0) + 1,
    };
  } else bindings.push({ link, cost: 1 });
};

for (let row = 0; row < TOTAL_ROWS; row++) {
  setBinding("###", INPUTS[row]![0]);
  setBinding("###", INPUTS[row]![TOTAL_COLS - 1]);
}

for (let col = 0; col < TOTAL_COLS; col++) {
  setBinding("###", INPUTS[0]![col]);
  setBinding("###", INPUTS[TOTAL_ROWS - 1]![col]);
}

for (let row = 0; row < TOTAL_ROWS; row++) {
  for (let col = 0; col < TOTAL_COLS; col++) {
    if (col - 1 >= 0 && INPUTS[row]![col] !== INPUTS[row]![col - 1])
      setBinding(INPUTS[row]![col - 1], INPUTS[row]![col]);

    if (row - 1 >= 0 && INPUTS[row]![col] !== INPUTS[row - 1]![col])
      setBinding(INPUTS[row - 1]![col], INPUTS[row]![col]);
  }
}

const getMinimumBindings = (charged: Set<string>) => {
  const labels: Record<string, string> = {};
  let minimumBindings = 0;

  bindings
    .map(({ link, cost }) => {
      const [a = "", b = ""] = link.split(" ");

      return { a, b, cost: charged.has(a) || charged.has(b) ? 0 : cost };
    })
    .sort((x, y) => x.cost - y.cost)
    .forEach(({ a, b, cost }) => {
      labels[a] ??= a;
      labels[b] ??= b;

      if (labels[a] === labels[b]) return;

      const oldLabel = labels[b];
      for (const piece in labels) {
        if (labels[piece] === oldLabel) labels[piece] = labels[a]!;
      }

      minimumBindings += cost;
    });

  return minimumBindings;
};

const pieces = [...new Set(INPUTS.flat())];
let best = Infinity;

for (let i = 0; i < pieces.length; i++) {
  for (let j = i + 1; j < pieces.length; j++) {
    best = Math.min(
      best,
      getMinimumBindings(new Set([pieces[i]!, pieces[j]!])),
    );
  }
}

console.log(best);
