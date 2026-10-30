"""Builds q1/explanation.pdf. Run: python3 tools/explanation-pdf/q1.py"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from pdfkit import *  # noqa: F401,F403

doc = page("Quest 1: The Coneservation", "Lord of the Wings · topping up the pine-cone defences of Quackshire", f"""
<div class="glance"><b>In one sentence:</b> each outpost has some pine cones; find the smallest valid formation that
can use all of them, and add up how many cones are missing.<br>
<b>Input:</b> one comma-separated list of numbers (cones per outpost).<br>
<b>Output:</b> the total number of new cones to collect.<br>
<b>What changes between parts:</b> only the shape of a valid formation.</div>

<h2>1. The story</h2>
<p>Before leaving Quackshire, the narrator and Frodoff check the village defences. The outposts protect the village with
<b>formations of enchanted elven pine cones</b> laid out on a grid. Many cones have lost their magic, so each outpost
has fewer than it needs. The outposts form <b>three defensive rings</b>, and each ring uses a different formation shape.</p>

<h2>2. Understanding the question</h2>
<p>Three rules apply in every part:</p>
<ol>
<li>Each outpost builds <b>exactly one</b> formation.</li>
<li>It must use <b>all</b> of its cones. It can't leave any out or throw any away.</li>
<li>It can only <b>add</b> new cones.</li>
</ol>
<p>So an outpost with <code>x</code> cones has to grow to the <b>next valid formation size</b>: the smallest one that holds
at least <code>x</code> cones. The number of cones to collect is <code>size − x</code>, and the answer is the sum of this
over all outposts.</p>
<div class="box"><b>Think of it as:</b> a list of allowed sizes, such as 1, 4, 9, 16, 25, …. For each number, find the
first allowed size that is at least that number, and measure the gap.</div>
<p>For example, 10 cones is one too many for a 3×3 square (9), so the outpost can't use 3×3. It has to go up to 4×4
(16) and collect 16 − 10 = <b>6</b> cones.</p>

<h3>The three formation shapes</h3>
<div class="figs">
  <div class="fig">{grid(4, 11, 12)}<br><b>Ring 1:</b> filled square<br>11 cones → 4×4, collect 5</div>
  <div class="fig">{grid(4, 11, 12, ring=True)}<br><b>Ring 2:</b> square frame<br>11 cones → 4×4, collect 1</div>
  <div class="fig">{grid(5, 11, 12, hole_center=True)}<br><b>Ring 3:</b> filled square, centre empty<br>11 cones → 5×5, collect 13</div>
</div>
<p class="cap">Blue cells are cones the outpost already has; orange outlines are cones it must collect.</p>
{table(["Ring", "Valid sides n", "Cones needed", "Valid sizes"], [
    ["1 (Part I)", "1, 2, 3, 4, …", "n²", "1, 4, 9, 16, 25, 36, …"],
    ["2 (Part II)", "3, 4, 5, 6, …", "4(n − 1)", "8, 12, 16, 20, 24, 28, …"],
    ["3 (Part III)", "3, 5, 7, 9, …", "n² − 1", "8, 24, 48, 80, 120, …"],
])}

<h2>3. Reading the input (same in all three parts)</h2>
{src("q1/part1.ts", 1, 8)}
{walk([
    ("3–4", "With <code>--sample</code> it reads <code>sample1.txt</code>; otherwise it reads <code>input1.txt</code> (part 2 and part 3 read <code>input2.txt</code> and <code>input3.txt</code>). All three parts share the same sample."),
    ("5–6", "Reads the file as text and trims the trailing newline."),
    ("7", "Splits on any run of commas or whitespace (<code>/[\\s,]+/</code>), so <code>3,11, 12</code> and a list spread over several lines both work."),
    ("8", "Turns each piece into a number: <code>\"3,11,12\"</code> becomes <code>[3, 11, 12]</code>."),
])}

<h2 class="part">4. Part I: filled squares</h2>
<h3>The question</h3>
<p>A valid formation is a completely filled n×n square, so it holds <code>n²</code> cones. Any side n ≥ 1 is allowed:</p>
<pre>1 x 1     2 x 2      3 x 3
#         ##         ###
          ##         ###
                     ###</pre>
<h3>Worked examples</h3>
{table(["Cones x", "Smallest n with n² ≥ x", "n²", "Collect"], [
    [3, 2, 4, 1], [11, 4, 16, 5], [12, 4, 16, 4], [16, 4, 16, 0], [24, 5, 25, 1], [25, 5, 25, 0],
    '<tr><th colspan="3">Sample total</th><th class="n">11</th></tr>'], num=(0, 1, 2, 3))}
<h4>Extra examples</h4>
{table(["Cones x", "Reasoning", "Collect"], [
    [1, "already a 1×1 square", 0],
    [10, "9 &lt; 10 ≤ 16 → 4×4", 6],
    [50, "49 &lt; 50 ≤ 64 → 8×8", 14],
    [100, "exactly 10×10", 0],
], num=(0, 2))}

<h3>My solution</h3>
{src("q1/part1.ts", 10, 24)}
{walk([
    ("10–11", "<code>getAnswer</code> handles one outpost. It starts at the smallest square, side <code>n = 1</code>."),
    ("13", "While the square is still too small (<code>n * n &lt; num</code>), it tries the next side. When the loop stops, <code>n</code> is the smallest side that fits."),
    ("15", "It returns how many cones are missing: <code>n² − num</code>."),
    ("18–22", "It runs <code>getAnswer</code> on every outpost and adds the results into <code>sum</code>."),
    ("24", "It prints the total."),
])}
<h4>Trace: <code>getAnswer(11)</code></h4>
{table(["n", "n * n", "n * n &lt; 11?", "Action"], [
    [1, 1, "yes", "n++"], [2, 4, "yes", "n++"], [3, 9, "yes", "n++"], [4, 16, "no", "stop → return 16 − 11 = <b>5</b>"],
], num=(0, 1))}

<h2 class="part">5. Part II: square frames</h2>
<h3>The question</h3>
<p>The second ring builds only the <b>border</b> of a square. The frame must surround at least one empty cell, or the
magic fails, so 1×1 and 2×2 aren't allowed and the smallest frame is 3×3:</p>
<pre>3 x 3     4 x 4      5 x 5
###       ####       #####
#.#       #..#       #...#
###       #..#       #...#
          ####       #...#
                     #####</pre>
<h3>Where 4(n − 1) comes from</h3>
<p>Count the border of an n×n square: the top row has n cells and the bottom row has n cells. Each side column then adds
n − 2 more, because its two corners are already counted. Total: <code>n + n + 2(n − 2) = 4n − 4 = 4(n − 1)</code>.
For example, a 5×5 frame has 5 + 5 + 3 + 3 = 16 = 4 × 4 cones.</p>
<h3>Worked examples</h3>
{table(["Cones x", "Smallest n ≥ 3 with 4(n−1) ≥ x", "4(n−1)", "Collect"], [
    [3, 3, 8, 5], [11, 4, 12, 1], [12, 4, 12, 0], [16, 5, 16, 0], [24, 7, 24, 0], [25, 8, 28, 3],
    '<tr><th colspan="3">Sample total</th><th class="n">9</th></tr>'], num=(0, 1, 2, 3))}
<h4>Extra examples</h4>
{table(["Cones x", "Reasoning", "Collect"], [
    [1, "even 1 cone needs the smallest frame, 3×3 = 8", 7],
    [13, "frame sizes go up in steps of 4: 12 &lt; 13 ≤ 16 → 5×5", 3],
    [50, "48 &lt; 50 ≤ 52 → 14×14", 2],
    [100, "4 × 25 = 100 → 26×26", 0],
], num=(0, 2))}
<p>Frame sizes go up by 4 each time, so an outpost never needs more than 3 extra cones, except when it has fewer than 8.</p>

<h3>My solution</h3>
{src("q1/part2.ts", 10, 16, hl=(11, 13, 15))}
{walk([
    ("11", "Starts at <code>n = 3</code>, because the smallest valid frame is 3×3."),
    ("13", "Grows the side while the frame is too small: <code>4 * (n - 1) &lt; num</code>."),
    ("15", "Returns the gap <code>4(n − 1) − num</code>."),
    ("rest", "Same as Part I: sum over all outposts and print."),
])}
<h4>Trace: <code>getAnswer(25)</code></h4>
{table(["n", "4(n − 1)", "&lt; 25?"], [[3, 8, "yes"], [4, 12, "yes"], [5, 16, "yes"], [6, 20, "yes"], [7, 24, "yes"], [8, 28, "no → return 28 − 25 = <b>3</b>"]], num=(0, 1))}

<h2 class="part">6. Part III: filled squares with an empty centre</h2>
<h3>The question</h3>
<p>The third ring builds a filled square with <b>exactly one empty cell in the very centre</b>. A square with an even side
has no single centre cell: the middle of a 4×4 falls between four cells. So only <b>odd</b> sides are allowed:</p>
<pre>3 x 3     5 x 5      7 x 7
###       #####      #######
#.#       #####      #######
###       ##.##      #######
          #####      ###.###
          #####      #######
                     #######
                     #######</pre>
<p>An n×n formation holds <code>n² − 1</code> cones (the full square minus the centre).</p>
<h3>Worked examples</h3>
{table(["Cones x", "Smallest odd n ≥ 3 with n² − 1 ≥ x", "n² − 1", "Collect"], [
    [3, 3, 8, 5], [11, 5, 24, 13], [12, 5, 24, 12], [16, 5, 24, 8], [24, 5, 24, 0], [25, 7, 48, 23],
    '<tr><th colspan="3">Sample total</th><th class="n">61</th></tr>'], num=(0, 1, 2, 3))}
<h4>Extra examples</h4>
{table(["Cones x", "Reasoning", "Collect"], [
    [48, "exactly 7×7 − 1", 0],
    [49, "one too many for 7×7, so it has to jump to 9×9 = 80", 31],
    [100, "80 &lt; 100 ≤ 120 → 11×11", 20],
], num=(0, 2))}
<p>The gaps grow quickly because valid sizes jump by about 4n each step (8 → 24 → 48 → 80 …).</p>

<h3>My solution</h3>
{src("q1/part3.ts", 10, 16, hl=(13, 15))}
{walk([
    ("11", "Starts at <code>n = 3</code>, the smallest odd side that can have an empty centre."),
    ("13", "Grows the side by <b>2</b> (<code>n += 2</code>), so <code>n</code> stays odd: 3, 5, 7, …."),
    ("15", "Returns <code>n² − 1 − num</code>."),
])}
<h4>Trace: <code>getAnswer(25)</code></h4>
{table(["n", "n² − 1", "&lt; 25?"], [[3, 8, "yes"], [5, 24, "yes"], [7, 48, "no → return 48 − 25 = <b>23</b>"]], num=(0, 1))}

<h2>7. Summary</h2>
{table(["Part", "Start n", "Step", "Capacity", "Sample"], [
    ["I", 1, "+1", "n²", 11], ["II", 3, "+1", "4(n − 1)", 9], ["III", 3, "+2", "n² − 1", 61]], num=(1, 4))}
<div class="box">All three parts use the same pattern: <b>start at the smallest valid side, grow until the formation is big
enough, and return the gap</b>. The loop runs about √x times, which is instant for these inputs. If you wanted a formula
instead of a loop, Part I's side is <code>Math.ceil(Math.sqrt(x))</code>.</div>
""")

doc = inject(doc, "<h3>My solution</h3>", [
    ["Read the file and split it into a list of numbers <code>x</code> (one per outpost).",
     "For one outpost, start with the smallest square: side <code>n = 1</code>.",
     "If <code>n × n</code> is still smaller than <code>x</code>, the square is too small, so try <code>n + 1</code>. Repeat.",
     "When <code>n × n ≥ x</code>, you have found the smallest square that fits. The cones to collect are <code>n × n − x</code>.",
     "Do steps 2–4 for every outpost and add up the results. That total is the answer."],
    ["Read the numbers, same as Part I.",
     "For one outpost, start with the smallest valid frame: <code>n = 3</code>. Smaller frames have no empty cell inside.",
     "Work out the frame size <code>4 × (n − 1)</code>. If it is smaller than <code>x</code>, try <code>n + 1</code>. Repeat.",
     "When <code>4 × (n − 1) ≥ x</code>, the cones to collect are <code>4 × (n − 1) − x</code>.",
     "Add this up over all outposts."],
    ["Read the numbers, same as Part I.",
     "For one outpost, start with <code>n = 3</code>, the smallest odd side.",
     "Work out the formation size <code>n × n − 1</code>. If it is smaller than <code>x</code>, try <code>n + 2</code>, skipping even sides. Repeat.",
     "When <code>n × n − 1 ≥ x</code>, the cones to collect are <code>n × n − 1 − x</code>.",
     "Add this up over all outposts."],
])

if __name__ == "__main__":
    build(1, doc)
