# Everybody Codes 2026

My solutions for [Everybody Codes 2026](https://everybody.codes/event/2026/quests).

## Requirements

- [Node.js](https://nodejs.org/) 24 or later. It runs the TypeScript files directly, so there's no build step.

## Setup

Install the dependencies (TypeScript and Node type definitions, used for type checking):

```sh
npm i
```

## Running a solution

Each quest lives in its own folder (`q1`, `q2`, ...) with one script per part (`part1.ts`, `part2.ts`, `part3.ts`). Each script reads its input file from the current directory, so `cd` into the quest folder before you run it:

```sh
cd q1
node part1.ts            # runs on input1.txt
node part1.ts --sample   # runs on sample1.txt
```

The `--sample` flag runs the script on the sample input (`sampleN.txt`) instead of your puzzle input (`inputN.txt`).

## Type checking

```sh
npm run typecheck
```

## Explanations

Each quest folder has an `explanation.pdf`: a step-by-step guide to the puzzle and a walkthrough of the solution, using the sample data.

`CLAUDE.md` describes how Claude Code works in this repo: it gives hints only, without editing the solutions, and produces new explanation PDFs in this format.
