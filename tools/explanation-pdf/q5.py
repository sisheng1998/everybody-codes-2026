"""Builds q5/explanation.pdf. Run: python3 tools/explanation-pdf/q5.py"""
import sys, pathlib, html as _html
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from pdfkit import *  # noqa: F401,F403

MAP_CSS = """<style>
pre.map { display:inline-block; font-size:8pt; line-height:1.2; padding:5pt 7pt; margin:0; white-space:pre; }
pre.map .L { background:#e3d3b0; color:#6b4a12; font-weight:bold; }
pre.map .S { background:#fbe7a1; color:#8a6a00; font-weight:bold; }
pre.map .T { background:#b9e2bf; color:#1d6b35; font-weight:bold; }
pre.map .w { color:#a9adbd; }
pre.map .x { outline:1pt solid #d9534f; background:#fde0de; }
.figs .fig pre.map { margin-bottom:2pt; }
</style>"""

CLS = {"#": "L", "=": "S", "@": "T"}


def mp(text, cap="", mark=()):
    """A coloured map: land #, sand =, tree @; water 0/1/. greyed. mark = {(row, col)} cells to outline."""
    rows = []
    for r, line in enumerate(text.strip("\n").split("\n")):
        out = ""
        for c, ch in enumerate(line):
            cls = CLS.get(ch, "w")
            if (r, c) in mark:
                cls += " x"
            out += f'<span class="{cls}">{_html.escape(ch)}</span>'
        rows.append(out)
    body = f'<pre class="map">{chr(10).join(rows)}</pre>'
    return f'<div class="fig">{body}<div>{cap}</div></div>' if cap else body


def figs(*items):
    return f'<div class="figs">{"".join(items)}</div>'


SAMPLE = (pathlib.Path(__file__).resolve().parents[2] / "q5" / "sample1.txt").read_text()

LAND = """
01#100100100001101000
1########0000####0000
1#########00#####0011
00################000
000###############100
000###############000
101##############0000
00###############0011
00################001
10################101
0011001###10010010000"""

SAND0 = """
01=100100100001101000
1========0000====0000
1==#####==00==##=0011
00==#####====###==000
000=#############=100
000=############==000
101=############=0000
00==############=0011
00=#############==001
10======#=========101
0011001===10010010000"""

SAND = """
01=100100100001101000
1========0000====0000
1====###==00=====0011
00==#####====##===000
000=############==100
000=############==000
101=############=0000
00==############=0011
00===##########===001
10================101
0011001===10010010000"""

STAMPED = """
01=100100100001101000
1========0000====0000
1====###==00=====0011
00==#####====##===000
000=##@#########==100
000=##@@########==000
101=##@@@@@@@@##=0000
00==############=0011
00===##########===001
10================101
0011001===10010010000"""

FINAL = """
01=100100100001101000
1========0000====0000
1====###==00=====0011
00==#####====##===000
000=##@@########==100
000=##@@@@######==000
101=##@@@@@@@@##=0000
00==############=0011
00===##########===001
10================101
0011001===10010010000"""

doc = page("Quest 5: The Cartograffity", "Lord of the Wings · growing land, sand and trees on a grid", MAP_CSS + f"""
<div class="glance"><b>In one sentence:</b> start from the centre cell of a 0/1 grid, grow land outwards with a
neighbour-count rule, and count cells of one kind.<br>
<b>Input:</b> a grid of <code>0</code> (light) and <code>1</code> (dark) with an odd number of rows and columns.<br>
<b>Output:</b> a count of cells: land (Part I), sand (Part II) or trees (Part III).<br>
<b>What changes between parts:</b> each part keeps everything from the previous one and adds a layer: land → a
sandy coastline on the land → trees on the land that is left.</div>

<h2>1. The story</h2>
<p>Legolink has joined the expedition, and the Grand Council hands over maps to Nulldor. The maps look like static:
just light and dark patches. Legolink teaches everyone to read them: from the centre, the land "grows" over the dark
patches, then a beach forms around its edge, and finally trees get stamped onto the solid ground with a potato stamp.</p>

<h2>2. Understanding the question</h2>
<h3>The grid and the eight neighbours</h3>
<p>Every rule in this quest looks at a cell's <b>eight neighbours</b>: up, down, left, right and the four diagonals.
Rows and columns are counted from 0, so the sample (11 rows × 21 columns) has its centre at <b>row 5, column 10</b>.</p>
<pre>NW  N  NE
 W  X  E        X has 8 neighbours (fewer on the edge of the map,
SW  S  SE       only 3 in a corner)</pre>

<h3>Rule 1: growing land (all parts)</h3>
<ol>
<li>The centre cell is land <code>#</code>.</li>
<li>A cell that <b>touches the land</b> (including diagonally) becomes land if at least <b>5</b> of its 8 neighbours
are "good". A good neighbour is land <code>#</code> or a dark cell <code>1</code>.</li>
<li>Repeat until nothing changes.</li>
</ol>
<p>A small example of my own: the middle cell <code>?</code> below touches land (top right). Its good neighbours are
<code>1</code>, <code>#</code>, <code>1</code>, <code>1</code>, <code>1</code>, which makes 5, so it becomes land. If one of
those <code>1</code>s were a <code>0</code>, it would have only 4 and would stay water.</p>
<pre>1 0 #
1 ? 0
1 1 0</pre>
<p>Note that "touches the land" matters. A blob of <code>1</code>s far away from the centre never becomes land, however
dark it is.</p>

<h3>Rule 2: sand (Parts II and III)</h3>
<ol>
<li>Every land cell with at least one <b>water</b> neighbour (a <code>0</code> or <code>1</code> that didn't become land) becomes
sand <code>=</code>. The map counts as surrounded by water, so land on the map's edge becomes sand too.</li>
<li>Then, repeatedly, a land cell with at least <b>5</b> sand neighbours also becomes sand.</li>
</ol>

<h3>Rule 3: trees (Part III)</h3>
<p>The stamp is a 5×5 shape with its corners cut off. Every <code>+</code> must be land <code>#</code> or a tree <code>@</code>:</p>
<pre>. + + + .
+ + + + +
+ + X + +      20 cells marked +
+ + + + +
. + + + .</pre>
<p>Land cells are tried in reading order (top to bottom, left to right), and a new tree counts straight away for later
cells. After stamping, the forest grows <b>twice</b>: a land cell becomes a tree if it has at least <b>4</b> tree
neighbours and <b>no</b> sand neighbour. These two steps are <b>simultaneous</b>: a tree added in a step only counts in
the next step.</p>

<h3>Extra examples of my own (all run through the real code)</h3>
{table(["Map", "Land (I)", "Sand (II)", "Trees (III)", "Why it's interesting"], [
    ["5×5 all <code>0</code>", 1, 1, 0, "Nothing can grow. The single centre cell touches water, so it becomes sand."],
    ["5×5 all <code>1</code>", 21, 21, 0, "The 4 corners never become land: a corner has only 3 neighbours, so it can't reach 5. Everything else ends up sand."],
    ["9×9 all <code>1</code>", 77, 32, 9, "A thick enough island: a 3×3 block of trees in the middle."],
    ["11×11 all <code>1</code>", 117, 40, 25, "A 5×5 block of trees in the middle."],
], num=(1, 2, 3))}
{figs(mp('''
1###1
#####
#####
#####
1###1''', "5×5 all 1: land"), mp('''
1===1
=====
=====
=====
1===1''', "5×5 all 1: sand"), mp('''
1=======1
==#####==
=#######=
=##@@@##=
=##@@@##=
=##@@@##=
=#######=
==#####==
1=======1''', "9×9 all 1: final"))}

<h3>Shared code: reading the grid (identical in all three parts)</h3>
{src("q5/part1.ts", 3, 13)}
{walk([
    ("3–4", "<code>--sample</code> picks <code>sample1.txt</code>; otherwise the real input for that part."),
    ("5–8", "Reads the file, drops the trailing newline, splits it into rows, and splits each row into single characters. So <code>INPUTS[row][col]</code> is <code>\"0\"</code> or <code>\"1\"</code>. Using an array of arrays (not strings) means cells can be changed in place."),
    ("10–11", "Grid size: 11 rows × 21 columns for the sample."),
    ("13", "<code>Math.floor(11 / 2) = 5</code> and <code>Math.floor(21 / 2) = 10</code>: the centre cell becomes <code>#</code>."),
])}
<div class="warn"><b>Fragile, not wrong:</b> line 7 splits on <code>\\n</code> only. If an input file were ever saved with
Windows line endings (<code>\\r\\n</code>), every row except the last would end in a <code>\\r</code> character. Then
<code>totalCols</code> would be 22 instead of 21, and the "centre" would be in the wrong column. Your input files are fine,
so this doesn't affect your answers.</div>
<p>Lines 1–47 (reading the grid and growing the land) are the same in all three parts. Parts II and III paste them in
and add more code below.</p>

<h2 class="part">3. Part I: how much land?</h2>
<h3>The question</h3>
<p>Grow the land from the centre (Rule 1) until it stops, then count the <code>#</code> cells.</p>
<h3>Worked example (sample)</h3>
{figs(mp(SAMPLE, "the notes, centre outlined", mark={(5, 10)}), mp(LAND, "after growing: 137 land cells"))}
<p>The puzzle draws the growth in <b>rounds</b>: in every round, all cells that qualify are added together. A
round-by-round copy of your code shows that the sample needs 10 rounds after the centre, adding
4, 8, 17, 20, 22, 21, 20, 13, 8, 3 cells. That's 1 + 136 = <b>137</b>, matching the puzzle's 11 diagrams.</p>

<h3>My solution</h3>
{src("q5/part1.ts", 15, 57)}
{walk([
    ("15–17", "<code>isValidLand</code> counts two things around <code>(row, col)</code>: <code>land</code> (how many <code>#</code>) and <code>good</code> (how many <code>#</code> or <code>1</code>)."),
    ("19–23", "Visits the 3×3 block around the cell. Rows or columns outside the map are skipped (<code>continue</code>), and so is the cell itself (<code>r === row &amp;&amp; c === col</code>)."),
    ("24–25", "A <code>#</code> neighbour counts towards both totals. A <code>1</code> counts only as good."),
    ("29", "<code>land &gt;= 1</code> is the \"touches the land\" rule. <code>good &gt;= 5</code> is the 5-of-8 rule."),
    ("32–35", "Keeps sweeping the whole grid while the last sweep changed something."),
    ("39", "Cells that are already land are skipped."),
    ("41–44", "If the cell qualifies, it becomes <code>#</code> <b>immediately</b>, and the rest of this sweep already sees it."),
    ("49–57", "Counts the <code>#</code> cells and prints the total."),
])}

<h4>Trace: sweeps of the <code>while</code> loop (sample)</h4>
{table(["Sweep", "Cells added (changed)", "Land after the sweep"], [
    [1, 51, 52], [2, 24, 76], [3, 24, 100], [4, 19, 119], [5, 9, 128], [6, 7, 135], [7, 2, 137],
    [8, 0, "137 → loop stops"]], num=(0, 1))}
<div class="note"><b>Why in-place still gives the puzzle's answer:</b> your code needs 7 working sweeps, but the puzzle
needs 10 rounds. That's because a cell added early in a sweep can help cells later in the same sweep: sweep 1 already adds
51 cells, while the puzzle's first round adds only 4. The final map is the same anyway, because the rule only ever gets
<i>easier</i> to satisfy. A cell becoming land turns a neighbour from "not good" into "good" (or keeps it good), and it
never removes land. So the order in which cells are added can't change which cells are added in the end. This is a
<b>fixed point</b> of a <b>monotone</b> rule.</div>
<div class="note"><b>The map's edge:</b> lines 20 and 23 treat cells outside the map as not good. Because of this, a corner
(3 neighbours) can never become land, and an edge cell needs all 5 of its neighbours to be good. That's how the
5×5 all-<code>1</code> example ends up with 21 land cells, not 25.</div>

<h2 class="part">4. Part II: how much sand?</h2>
<h3>The question</h3>
<p>Grow the land as in Part I. Then turn the coastline into sand: first every land cell that touches water (or the
map's edge), then repeatedly every land cell with at least 5 sand neighbours. Count the <code>=</code> cells.</p>
<h3>Worked example (sample)</h3>
{figs(mp(SAND0, "coastline: 59 sand"), mp(SAND, "after growing: 69 sand"))}
<p>The puzzle shows the sand growing in 3 rounds. A round-by-round copy of your code adds 6, 3 and 1 cells:
59 + 10 = <b>69</b>.</p>

<h3>My solution</h3>
<p>Lines 1–47 are Part I unchanged (apart from the input file name on line 4).</p>
{src("q5/part2.ts", 49, 109, hl=tuple(range(49, 100)) + (105,))}
{walk([
    ("49–59", "<code>isTouchesWater</code> returns <code>true</code> as soon as the 3×3 block around the cell goes off the map (lines 51, 53) or contains a <code>0</code> or <code>1</code>. The cell itself is in the block too, but it is <code>#</code>, so it never matches."),
    ("61–67", "One pass over the grid: every <code>#</code> that touches water becomes <code>=</code>."),
    ("54", "This only counts <code>0</code>/<code>1</code> as water, <b>not</b> \"anything that isn't <code>#</code>\". That matters, because cells earlier in this same pass have already become <code>=</code>. If <code>=</code> counted as water, the sand would spread inward through the whole island in one pass."),
    ("69–82", "<code>isValidSand</code> counts <code>=</code> neighbours (off-map cells are skipped) and asks for at least 5."),
    ("84–99", "The same \"sweep until nothing changes\" loop as Part I, but now it turns <code>#</code> into <code>=</code>."),
    ("105", "Counts <code>=</code> instead of <code>#</code>."),
])}
<h4>Trace (sample)</h4>
{table(["Stage", "Changed", "Sand", "Land left"], [
    ["after lines 61–67 (coastline)", 59, 59, 78],
    ["sand sweep 1", 8, 67, 70],
    ["sand sweep 2", 2, 69, 68],
    ["sand sweep 3", 0, "69 → loop stops", 68]], num=(1, 2, 3))}
<p>As in Part I, the in-place sweeps (8 + 2) and the puzzle's rounds (6 + 3 + 1) add the same 10 cells, because the sand
rule is also monotone: more sand never stops a cell from qualifying.</p>

<h2 class="part">5. Part III: how many trees?</h2>
<h3>The question</h3>
<p>Build land and sand as before. Then stamp trees onto land cells in reading order, using the 20-cell stamp, and let
the forest grow for exactly two simultaneous steps (at least 4 tree neighbours, no sand neighbour). Count the
<code>@</code> cells.</p>
<h3>Worked example (sample)</h3>
{figs(mp(SAND, "land + sand"), mp(STAMPED, "after stamping: 11 trees"), mp(FINAL, "after 2 growth steps: 14 trees"))}
{table(["Stage", "Trees added at (row, col)", "Total trees"], [
    ["stamping", "(4,6) (5,6) (5,7) (6,6) (6,7) (6,8) (6,9) (6,10) (6,11) (6,12) (6,13)", 11],
    ["growth step 1", "(5,8)", 12],
    ["growth step 2", "(4,7) (5,9)", 14]], num=(2,))}
<p>The puzzle stamps one cell at a time and says earlier trees can help later positions. In practice the order can't
matter: a <code>+</code> cell passes if it is <code>#</code> <i>or</i> <code>@</code>, and the stamp only ever turns a
<code>#</code> into an <code>@</code>, so no other cell's check ever changes. Stamping all at once would give the same
11 trees.</p>

<h3>My solution</h3>
<p>Lines 1–99 are Part II unchanged (apart from the input file name on line 4).</p>
{src("q5/part3.ts", 101, 162, hl=tuple(range(101, 153)) + (158,))}
{walk([
    ("101–116", "<code>isValidTree</code> checks the 5×5 block around the cell. It skips cells off the map, the cell itself, and the 4 corners (line 109). It counts how many of the rest are <code>#</code> or <code>@</code>."),
    ("115", "All 20 <code>+</code> cells must pass. Off-map cells are skipped rather than counted, so a cell too close to the edge can never reach 20."),
    ("118–123", "Tries every <code>#</code> in reading order and changes it to <code>@</code> <b>in place</b>, as the puzzle describes. (As explained above, the order doesn't affect the result here.)"),
    ("125–139", "<code>canGrowTree</code>: if any neighbour is <code>=</code>, it returns <code>false</code> straight away. Otherwise it counts <code>@</code> neighbours and needs at least 4."),
    ("141–152", "Two growth steps. In each one, the qualifying cells are first <b>collected</b> in <code>positions</code> (line 147) and only changed afterwards (line 151). That makes the step simultaneous."),
    ("156–162", "Counts <code>@</code>."),
])}
<div class="warn"><b>Why growth must be simultaneous (your code gets it right):</b> the stamp is
in place (lines 118–123), but growth is collect-then-apply (lines 141–152). As an experiment, I made a copy where growth also
changes cells immediately. On the sample, step 1 then adds (5,8), (5,9), (5,10), (5,11), (5,12): each new tree gives
the next cell its 4th tree neighbour. The final count is <b>17</b> instead of 14. Unlike Parts I and II, this growth runs for a
fixed number of steps rather than until nothing changes, so the order of updates does change the answer.</div>
<div class="note"><b>The map's edge again:</b> <code>canGrowTree</code> skips off-map neighbours, so it doesn't see the
"water around the map" there. That's safe: any land cell on the edge already became sand in Part II, so the only
<code>#</code> cells left are inside the map.</div>

<h2>6. Summary</h2>
{table(["Part", "Counts", "New rule", "How cells are updated", "Sample"], [
    ["I", "land <code>#</code>", "touches land and ≥ 5 neighbours are <code>#</code>/<code>1</code>", "in place, repeat until no change", 137],
    ["II", "sand <code>=</code>", "touches water/edge; then ≥ 5 <code>=</code> neighbours", "coastline in one pass; then in place until no change", 69],
    ["III", "trees <code>@</code>", "20-cell stamp; then ≥ 4 <code>@</code> and no <code>=</code> neighbours", "stamp in place; growth simultaneous, exactly 2 steps", 14],
], num=(4,))}
<p><b>Cost:</b> each sweep looks at every cell and its 8 neighbours (24 for the stamp), so it costs O(rows × cols).
The land and sand loops repeat that until nothing changes (8 and 3 sweeps on the sample), which is fast enough for
these maps.</p>
""")

doc = inject(doc, "<h3>My solution</h3>", [
    ["Read the grid into a 2D array of characters.",
     "Mark the centre cell (row ⌊rows/2⌋, column ⌊cols/2⌋) as <code>#</code>.",
     "Sweep over every cell that isn't land yet. Count its land neighbours and its good neighbours (land or <code>1</code>).",
     "If it has at least 1 land neighbour and at least 5 good ones, make it <code>#</code>.",
     "Repeat the sweep until one sweep changes nothing.",
     "Count the <code>#</code> cells."],
    ["Do Part I to get the land.",
     "Go over every land cell once. If any cell in its 3×3 block is off the map, or is <code>0</code>/<code>1</code>, make it <code>=</code>.",
     "Sweep over the remaining land cells. If one has at least 5 <code>=</code> neighbours, make it <code>=</code>.",
     "Repeat until one sweep changes nothing.",
     "Count the <code>=</code> cells."],
    ["Do Part II to get the land and sand.",
     "Go over land cells in reading order. If all 20 stamp cells around it are on the map and are <code>#</code> or <code>@</code>, make it <code>@</code> right away.",
     "Growth step: collect every land cell that has no <code>=</code> neighbour and at least 4 <code>@</code> neighbours. Then turn all of them into <code>@</code> together.",
     "Do the growth step a second time.",
     "Count the <code>@</code> cells."],
])

if __name__ == "__main__":
    build(5, doc)
