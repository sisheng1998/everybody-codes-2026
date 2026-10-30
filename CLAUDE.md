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
- Use `cat -n` so line numbers in the walkthrough are exact.

### 3. Write and build

Create `tools/explanation-pdf/qN.py` and keep it in the repo, so the PDF can be rebuilt later. Model it closely on the
existing `tools/explanation-pdf/q*.py` scripts (read at least one or two in full first). They all have this shape:

```python
"""Builds qN/explanation.pdf. Run: python3 tools/explanation-pdf/qN.py"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from pdfkit import *  # noqa: F401,F403

doc = page("Quest N: <Title>", "<event name> · <one-line subtitle>", f"""...""")
doc = inject(doc, "<h3>My solution</h3>", [[...steps for part I...], [...part II...], [...part III...]])

if __name__ == "__main__":
    build(N, doc)
```

Run it from the repo root with `python3 tools/explanation-pdf/qN.py`.

Helpers: `page`, `src(path, start, end, hl=(changed lines))`, `walk([(lines, explanation), ...])`,
`table(head, rows, num=(numeric cols))`, `steps`/`inject` (green "Step-by-step solution" boxes), `grid` (SVG grids), `build`. Add a new helper to `pdfkit.py` only if it's generally useful, and make sure the existing scripts still build.
CSS classes: `glance`, `box`, `note`, `warn`, `h2.part` (starts a new page). Rendering needs `weasyprint`
(installed via Homebrew).

### 4. Required structure (same as the existing ones)

1. **At a glance** box: the question in one sentence, the input, the output, and what changes between parts.
2. **The story**: a 2–3 sentence summary in my own words. Don't copy the puzzle prose.
3. **Understanding the question**: the rules in plain words, with small extra examples of your own.
4. **Shared code** section, if the parts share parsing or helpers.
5. **One section per part**, each on a new page (`<h2 class="part">`):
   - The question (what's new in this part)
   - **Step-by-step solution**: a numbered plan in plain English (the `inject` box)
   - Worked examples: the official ones plus a couple of extra ones (edge cases)
   - My solution: the real code via `src(...)`, with changed lines highlighted from Part II onward
   - A line-by-line `walk(...)` table, then a trace table of real values on a small example
   - A `warn` box for any bug, fragile code, or lucky behaviour you find. Explain it; don't fix my code.
6. **Summary** table comparing the parts.

### 5. Rules for the PDF

- Only explain **solutions I've already written**. If a part has no solution yet, explain the question and add a
  hints-only section ("Things to think about"), with no step-by-step solution and no code.
- Don't include my real puzzle inputs or my real answers. Use only the sample data. (The site asks people not to
  redistribute inputs.)
- After building, render a page or two to PNG (`pdftoppm -r 55 -png`) and look at it to check the layout.
- Don't commit unless I ask.
