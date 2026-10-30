import { readFileSync } from "node:fs";

const isSample = process.argv.includes("--sample");
const file = isSample ? "sample3.txt" : "input3.txt";
const INPUTS: string[] = readFileSync(file, "utf8")
  .trim()
  .split("\n")
  .map(String);

const inputObjs: { [key: string]: number }[] = INPUTS.map((i) =>
  Object.fromEntries(
    i.split(" ").map((s) => {
      const [key, value] = s.split("=");
      return [key, Number(value)];
    }),
  ),
);

const ranks: { [quest: string]: { [id: string]: number[] } } = {};

inputObjs.forEach((i) => {
  const id = i["id"] ?? 0;
  const quest = i["quest"] ?? 0;
  const time = i["time"] ?? 0;
  const part = i["part"] ?? 0;

  const prevQuest = ranks[quest] ?? {};
  const prevId = prevQuest[id] ?? [];
  prevId[part - 1] = time;

  ranks[quest] = { ...prevQuest, [id]: prevId };
});

const scores: Record<string, number> = {};

Object.values(ranks).forEach((r) => {
  for (let i = 0; i < 3; i++) {
    const list = Object.entries(r)
      .filter(([, times]) => times[i] !== undefined)
      .map(([id, times]) => [
        id,
        times.slice(0, i + 1).reduce((a, b) => a + b, 0),
      ]) as [string, number][];

    if (list.length === 0) continue;

    list.sort((a, b) => a[1] - b[1]);

    let rank = 0;

    list.forEach(([id, time], j) => {
      if (j === 0 || time !== list[j - 1]?.[1]) rank = j + 1;

      const points = Math.max(50 * (i + 1) - (rank - 1), 0);
      scores[id] = (scores[id] ?? 0) + points;
    });
  }
});

let rank = 0;

const result = Object.entries(scores)
  .sort((a, b) => b[1] - a[1])
  .map(([, i]) => i)
  .reduce((a, b, idx, arr) => {
    if (idx === 0 || b !== arr[idx - 1]) rank = idx + 1;
    return a + b * rank;
  }, 0);

console.log(result);
