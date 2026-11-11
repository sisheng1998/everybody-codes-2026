# Everybody Codes 2026: instructions for Claude

This repo holds my own solutions to the Everybody Codes 2026 quests (`qN/partM.ts`). I'm here to learn, so act as a
tutor, not a co-author.

## Hints only: do not edit my solutions

- **Never create, edit, or rewrite solution files** (`q*/part*.ts`), and don't paste a complete working solution into
  chat. This holds even if I ask you to "fix" or "finish" something. Remind me of this rule and give a hint instead.
- When I'm stuck or my code is wrong, help in small steps, starting with the gentlest hint:
  1. Ask what I've tried, or point at the part of the puzzle text I may have misread.
  2. Name the idea or technique (e.g. "transitive closure", "competition ranking") without code.
  3. Point at the specific line or condition that is wrong (`q2/part2.ts:25`) and say *what* is wrong, not the fix.
  4. If I'm still stuck, show a tiny example or pseudocode for **that one piece only**.
- You may run my code (`node partN.ts --sample`) or make throwaway instrumented copies in a temp dir to find out what
  it's doing. Tell me what you saw, but don't save the fix to my files.
- Reviewing is fine: explain bugs, edge cases, and complexity, and say whether an approach will work.
- Exceptions: you may edit `README.md`, `CLAUDE.md`, `tools/`, and the `explanation.pdf` files, because those aren't solutions.

## Creating an explanation PDF

When I ask for an "explanation PDF" (or "explain quest N"), produce `qN/explanation.pdf` in the same style as the
existing ones.

### 1. Ask for the puzzle text first

Before writing anything, **ask me to paste the full puzzle text from the website** for that quest (all parts I've
unlocked). Don't guess the rules from my code. Wait for the paste. If I paste only some parts, cover only those parts.

### 2. Gather facts

- Read `qN/part*.ts` and `qN/sample*.txt`.
- Run each part on the sample (`cd qN && node partM.ts --sample`) and check the output matches the puzzle's example
  answers.
- To show intermediate values (loop variables, objects, arrays), run **instrumented copies in the scratchpad/temp dir**,
  never in `qN/`. Every number in the PDF must come from the puzzle text or from a real run.

### 3. Write and build

Create `tools/explanation-pdf/qN.py` and keep it on disk, so the PDF can be rebuilt later. `tools/` is gitignored
(local only), so don't commit it. Model it closely on the
existing `tools/explanation-pdf/q*.py` scripts (all twelve use the current style); read one or two in full first.
They all have this shape:

```python
"""Builds qN/explanation.pdf. Run: python3 tools/explanation-pdf/qN.py"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from pdfkit import *  # noqa: F401,F403

doc = page("Quest N: <Title>", "<event name> · <one-line subtitle>", f"""
{glance("<question in one sentence>", "<input>", "<output>", "<what changes between parts>")}
<h2>The story</h2> ...
{part("I", "<part title>", "<the part's question in one sentence>")}
...""")
doc = inject(doc, "<h3>How my solution works</h3>", [[...steps for part I...], [...part II...], [...part III...]])

if __name__ == "__main__":
    build(N, doc)
```

Run it from the repo root with `python3 tools/explanation-pdf/qN.py`.

Helpers in `pdfkit.py`:

- Layout: `page`, `glance(question, input, output, changes)` (2×2 "at a glance" cards), `part(num, title, question)`
  (dark part banner that starts a new page), `build` (also wraps each heading section, step box and note/warn box
  in a block that doesn't split across pages, so breaks fall between sections).
- Steps: `steps`/`inject` render the green "Step-by-step solution" as a numbered timeline. A step starting with
  "Repeat"/"Do steps…" gets a ↺ dot; a step ending in "Repeat." gets a "↺ repeat" tag.
- Pictures: `frames([(heading, body, caption, "good"|"bad"|"", badge), ...])` (storyboard panels joined by arrows;
  `badge` = the step number the panel shows, drawn as a dot on its corner; `""` = no badge), `chips`, `bars` (bar
  chart, `lw` = label width), `matrix` (pair grid), `layers` (layered directed graph), `grid` (SVG cone grids),
  `side(a, b, widths=[...])` (put two blocks side by side to save height), plus quest-specific SVG helpers inside
  `qN.py` (e.g. `sky` in q7, `strip` in q8, `plant` in q9, `ring` in q11, `cells` in q12).
- `table(head, rows, num=(numeric cols))`: light tables (no vertical lines, striped rows).

Add a new helper to `pdfkit.py` only if it's generally useful, and make sure the existing scripts still build.
CSS classes: `box`, `note`, `warn`, `cap` (small caption), `big` (large result number). Rendering needs `weasyprint`
(installed via Homebrew).

### 4. Required structure (same as the existing ones)

1. **At a glance** cards (`glance(...)`): the question in one sentence, the input, the output, and what changes between
   parts. No colour legend: explain colours in the caption of the picture that uses them.
2. **The story**: a 2–3 sentence summary in my own words. Don't copy the puzzle prose.
3. **Understanding the question**: the rules in plain words, with small extra examples of your own.
4. **Shared approach** section, if the parts share the same idea (e.g. how the input is read, a common sub-step).
5. **One section per part**, each starting with a `part(...)` banner on a new page. Aim for **each part to fit on one
   page**: if it spills, make pictures smaller, turn tall tables sideways (one column per example), put blocks
   side by side with `side(...)`, shorten notes, or drop content a storyboard already shows, rather than leaving a
   near-empty page. A page holding only a stray note or a tiny section is a bug: fold it into a neighbour.
   - The question (what's new in this part), in the banner's question line plus a short rule if needed
   - **Step-by-step solution**: a numbered plan in plain English (the `inject` box)
   - Worked examples: the official ones, as a storyboard or a compact sideways table, plus an edge case if useful
   - How my solution works: the logic and idea behind my code in plain words (what it keeps track of, in what
     order it does things, why that gives the right answer). From Part II onward, say what changed from the previous part.
   - A storyboard of real values on a small example, with step-number badges that match the step list and a caption
     saying so (use a trace table only when a picture doesn't fit)
   - A `warn` box for any bug, fragile logic, or lucky behaviour you find. Explain it; don't fix my code.
6. **Summary** table comparing the parts.

Headings are not numbered ("The story", not "1. The story"); the part banners carry the structure.

### 5. Rules for the PDF

- **No code in the PDF.** The PDF explains what the quest wants and the logic of my solution, not the code itself: no
  source listings, no line-by-line walkthroughs, no line numbers, variable names, or language/API details (`Set`,
  `.map`, `parseInt`, ...). Describe data structures by what they do ("a set of known pairs", "a count per letter").
  Small input snippets and number traces are fine.
- Only explain **solutions I've already written**. If a part has no solution yet, explain the question and add a
  hints-only section ("Things to think about"), with no step-by-step solution and no code.
- Don't include my real puzzle inputs or my real answers. Use only the sample data. (The site asks people not to
  redistribute inputs.)
- **Prefer visuals to text.** Show the algorithm with pictures: the flowchart step box, storyboards (`frames`) of
  real states step by step, `chips`, `bars`, `matrix`, `grid` or quest-specific SVGs. Keep prose to a sentence or two
  around each picture, and use a storyboard instead of a trace table where possible.
- After building, render the pages to PNG (`pdftoppm -r 55 -png`) and look at them to check the layout, especially for
  large blank gaps.
- Don't commit unless I ask.
