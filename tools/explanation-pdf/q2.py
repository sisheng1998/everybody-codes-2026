"""Builds q2/explanation.pdf. Run: python3 tools/explanation-pdf/q2.py"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from pdfkit import *  # noqa: F401,F403

doc = page("Quest 2: The Axeperiment", "Lord of the Wings · ranking Gimlock's alloys from hardest to softest", f"""
<div class="glance"><b>In one sentence:</b> given head-to-head hardness results between alloys, find the order from
hardest to softest, read it as a number, and add these numbers up.<br>
<b>Input:</b> one line per group of alloys, such as <code>4&lt;3 2&lt;5 3&gt;1 …</code><br>
<b>Output:</b> the checksum, the sum of the order-numbers.<br>
<b>What changes between parts:</b> how many comparison results are missing (none, exactly one, or many).</div>

<h2>1. The story</h2>
<p>The party stops at the Forge Mountain to recruit the dwarven blacksmith <b>Gimlock Ironstack</b>. He will only leave
once his research on the hardness of new metal alloys is finished. His method is to hit two axe blades together and see
which one gives way. You help him make sense of his notes.</p>

<h2>2. Understanding the question</h2>
<h3>Reading one comparison</h3>
<p>Each token compares two alloys. The pointy side of the symbol points at the <b>softer</b> one:</p>
{table(["Token", "Means", "Rewritten as harder&gt;softer"], [
    ["<code>3&gt;5</code>", "alloy 3 is harder than alloy 5", "<code>3&gt;5</code>"],
    ["<code>4&lt;3</code>", "alloy 4 is softer than alloy 3", "<code>3&gt;4</code>"],
])}
<h3>From comparisons to an order</h3>
<p>Each line is one group. Arrange its alloys from hardest to softest and read the alloy numbers as one number. Here is a
small 4-alloy example (not from the puzzle):</p>
<pre>1&lt;2 3&gt;1 2&lt;3 4&lt;1 4&lt;2 4&lt;3
rewritten:  2&gt;1  3&gt;1  3&gt;2  1&gt;4  2&gt;4  3&gt;4</pre>
<p>Alloy 3 beats everyone, then 2, then 1, then 4, so the order is <b>3 2 1 4</b> and this group's number is <b>3214</b>.
The <b>checksum</b> is the sum of these numbers over all lines.</p>

<div class="box"><b>Key insight used in every part:</b> hardness is a strict order with no ties and no cycles. So once you know
the result for <b>every pair</b>, the hardest alloy beats all n − 1 others, the second hardest beats n − 2, and so on down to the
softest, which beats none. <b>Counting how many alloys each one beats gives its position directly</b>, and sorting by that
count gives the order. In the 4-alloy example the win counts are 3:3, 2:2, 1:1, 4:0.</div>

<h2>3. Shared code: parsing and turning win counts into a number</h2>
<p>All three parts share the same first step (parse and rewrite) and last step (count wins, sort, join). Here they are from Part I:</p>
{src("q2/part1.ts", 10, 37)}
{walk([
    ("11–12", "Splits the line on spaces into tokens: <code>[\"4&lt;3\", \"2&lt;5\", …]</code>."),
    ("13–15", "Rewrites every <code>&lt;</code> token as <code>harder&gt;softer</code>. The trick: reverse the characters, then swap the symbol. <code>\"4&lt;3\"</code> → <code>[\"4\",\"&lt;\",\"3\"]</code> reversed → <code>\"3&lt;4\"</code> → replace <code>&lt;</code> with <code>&gt;</code> → <code>\"3&gt;4\"</code>. Tokens with <code>&gt;</code> are left as they are."),
    ("17", "One win counter per alloy. <code>wins[0]</code> is alloy 1, <code>wins[4]</code> is alloy 5. Part I's real input has 5 alloys per group, so 5 is hard-coded."),
    ("19", "In each token <code>\"a&gt;b\"</code>, the first character <code>p[0]</code> is the harder alloy, so that alloy's counter goes up by one. This works because alloy ids are single digits (1–9)."),
    ("21–27", "Copies the counters into an object <code>{{1: wins, 2: wins, …}}</code> keyed by alloy number."),
    ("29–34", "<code>Object.entries</code> gives <code>[alloy, wins]</code> pairs. Sorting by wins, highest first, gives the order. <code>.map(([v]) =&gt; v)</code> keeps just the alloy numbers, <code>.join(\"\")</code> glues them into a string such as <code>\"35124\"</code>, and <code>Number(...)</code> turns that into a number."),
    ("39–45", "Adds up the numbers for every line and prints the checksum."),
])}

<h2 class="part">4. Part I: every pair is compared</h2>
<h3>The question</h3>
<p>Each group contains the result of <b>every possible pair</b>. With 5 alloys that is 5 × 4 / 2 = 10 comparisons per line.</p>
<h3>Worked example: first sample line</h3>
<pre>4&lt;3 2&lt;5 3&gt;1 1&gt;2 1&lt;5 4&lt;1 3&gt;2 4&lt;2 3&gt;5 4&lt;5
rewritten (line 13–15):
3&gt;4 5&gt;2 3&gt;1 1&gt;2 5&gt;1 1&gt;4 3&gt;2 2&gt;4 3&gt;5 5&gt;4</pre>
<p>Count the winners (line 19), looking at the first character of each rewritten token:</p>
{table(["Alloy", "1", "2", "3", "4", "5"], [["wins", 2, 1, 4, 0, 3]], num=(1, 2, 3, 4, 5))}
<p>Sorted by wins: 3 (4), 5 (3), 1 (2), 2 (1), 4 (0) → <code>"35124"</code> → <b>35124</b>.</p>
{table(["Line", "Order", "Number"], [
    ["<code>4&lt;3 2&lt;5 3&gt;1 1&gt;2 1&lt;5 4&lt;1 3&gt;2 4&lt;2 3&gt;5 4&lt;5</code>", "3 5 1 2 4", 35124],
    ["<code>4&gt;1 2&gt;1 3&gt;2 1&lt;5 4&gt;5 2&lt;5 3&gt;1 4&gt;3 2&lt;4 5&lt;3</code>", "4 3 5 2 1", 43521],
    ["<code>5&gt;1 5&gt;2 4&gt;1 2&lt;4 3&gt;2 3&lt;4 1&gt;2 3&gt;5 1&lt;3 4&gt;5</code>", "4 3 5 1 2", 43512],
    '<tr><th colspan="2">Checksum</th><th class="n">122157</th></tr>'], num=(2,))}

<h2 class="part">5. Part II: exactly one comparison is missing</h2>
<h3>The question</h3>
<p>Each group in the second notebook is missing <b>exactly one</b> comparison. Without it, two alloys would have the same
win count and their order would be unclear. Frodoff's observation is that hardness is <b>transitive</b>:</p>
<pre>if  a &gt; c  and  c &gt; b   then  a &gt; b</pre>
<p>So you can recover the missing result through some third alloy <code>c</code> and then count wins as before.
The real input has 9 alloys per group, so the numbers are 9 digits long.</p>
<h3>Worked example: first sample line</h3>
<pre>2&lt;5 3&gt;1 1&gt;2 1&lt;5 4&lt;1 3&gt;2 4&lt;2 3&gt;5 4&lt;5        ← only 9 tokens
rewritten:  5&gt;2 3&gt;1 1&gt;2 5&gt;1 1&gt;4 3&gt;2 2&gt;4 3&gt;5 5&gt;4</pre>
<p>Alloys 3 and 4 were never compared. But <code>3&gt;5</code> and <code>5&gt;4</code>, so <b>3&gt;4</b>. Also <code>3&gt;1</code> and
<code>1&gt;4</code> lead to the same result. Now every pair is known and the order is 3 5 1 2 4 again. The sample is the Part I
sample with one comparison removed from each line, so the checksum is still <b>122157</b>.</p>

<h3>My solution: the new part</h3>
{src("q2/part2.ts", 10, 35, hl=(10, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 35))}
{walk([
    ("10", "The number of alloys: 5 in the sample, 9 in the real input."),
    ("19–20", "Loops over every unordered pair <code>(a, b)</code> with <code>a &lt; b</code>."),
    ("21–22", "Tries every other alloy <code>c</code> as the middle step."),
    ("24–25", "If <code>a&gt;c</code> and <code>c&gt;b</code> are both known, adds <code>a&gt;b</code>."),
    ("27–28", "Checks the other direction too: if <code>b&gt;c</code> and <code>c&gt;a</code>, adds <code>b&gt;a</code>."),
    ("33–35", "Counts wins over the extended list, then sorts and joins as before."),
])}
<div class="warn"><b>A subtle detail worth knowing:</b> line 25 adds <code>a&gt;b</code> <b>every time</b> it finds a middle
alloy, even if <code>a&gt;b</code> is already in the list. So <code>pairs</code> ends up with duplicates, and the win counts are
inflated. For the first sample line, the instrumented run gives 19 entries instead of 10:
<pre>correct wins (alloys 1..5):  [2, 1, 4, 0, 3]
wins from line 35:           [3, 1, 9, 0, 6]</pre>
The answer is still right because of how the duplicates are spread. An alloy with k alloys below it gets extra entries for
the pairs it can reach through a middle alloy. That bonus <b>grows with k</b>, so stronger alloys always get at least as
many extras as weaker ones and the <b>order is preserved</b>. It works, but by luck rather than design. Part III's
version uses a <code>Set</code>, which avoids this.</div>

<h2 class="part">6. Part III: many comparisons missing</h2>
<h3>The question</h3>
<p>The early notes are missing <b>many</b> results, for example:</p>
<pre>5&gt;1 3&lt;4 1&gt;2 3&gt;5            ← only 4 of the 10 pairs</pre>
<p>A single middle alloy is no longer enough. To know that 4 is harder than 2, you need the chain
<code>4 &gt; 3 &gt; 5 &gt; 1 &gt; 2</code>. You need every result that follows from <b>chains of any length</b>, which is
called the <b>transitive closure</b>. The puzzle guarantees that this is enough to fix the complete order.</p>

<h3>My solution: the new part</h3>
{src("q2/part3.ts", 19, 33, hl=(19, 21, 22, 23, 24, 25, 26, 33))}
{walk([
    ("19", "Puts the known results in a <code>Set</code>. This gives fast <code>has</code> lookups and stops the same pair from being stored twice."),
    ("21", "<b>The middle alloy <code>c</code> is in the outer loop.</b> This is the Floyd–Warshall order, and it's what makes long chains work."),
    ("22–23", "For each alloy <code>a</code> that is harder than <code>c</code>…"),
    ("25–26", "…and each <code>b</code> that <code>c</code> is harder than, records <code>a&gt;b</code>."),
    ("33", "Counts wins from the closed set. Each pair now appears exactly once, so the counts are the true positions."),
])}

<h3>Why the middle alloy has to be in the outer loop</h3>
<p>After the outer loop has handled <code>c = 1 … k</code>, the set contains <code>a&gt;b</code> whenever there is a chain from a to b
whose <b>middle alloys are all ≤ k</b>. When k reaches the last alloy, every chain is covered. If <code>c</code> were in an inner loop,
as in Part II, a result found late in the loops couldn't be used to find earlier ones, so long chains could be missed.</p>

<h3>Trace: third sample line <code>5&gt;1 3&lt;4 1&gt;2 3&gt;5</code></h3>
<p>Start: <code>{{5&gt;1, 4&gt;3, 1&gt;2, 3&gt;5}}</code></p>
{table(["c", "a with a&gt;c", "b with c&gt;b", "Added"], [
    [1, "5", "2", "<code>5&gt;2</code>"],
    [2, "1, 5", "(none)", "-"],
    [3, "4", "5", "<code>4&gt;5</code>"],
    [4, "(none)", "3", "-"],
    [5, "3, 4", "1, 2", "<code>3&gt;1 3&gt;2 4&gt;1 4&gt;2</code>"],
], num=(0,))}
<p>The set now has all 10 pairs. Wins are 1:1, 2:0, 3:3, 4:4, 5:2, so the order is 4 3 5 1 2 → <b>43512</b>. When c = 5, the
loop used <code>3&gt;5</code> and <code>5&gt;2</code>; <code>5&gt;2</code> had only just been added when c = 1. That is the chain-building at work.</p>
{table(["Line", "Number"], [
    ["<code>3&gt;1 1&gt;2 1&lt;5 4&lt;2 3&gt;5</code>", 35124],
    ["<code>2&gt;1 2&lt;5 3&gt;1 4&gt;3 2&lt;4 5&lt;3</code>", 43521],
    ["<code>5&gt;1 3&lt;4 1&gt;2 3&gt;5</code>", 43512],
    '<tr><th>Checksum</th><th class="n">122157</th></tr>'], num=(1,))}

<h2>7. Summary</h2>
{table(["Part", "Missing", "How the gaps are filled", "Code"], [
    ["I", "none", "nothing to fill; just count wins", "array, count, sort"],
    ["II", "exactly 1", "one middle alloy is enough", "triple loop, c innermost (duplicates are harmless)"],
    ["III", "many", "full transitive closure", "Set, triple loop, c outermost (Floyd–Warshall)"],
])}
<div class="note">Another way to see Part III: draw an arrow a → b for "a is harder than b". The answer is the unique
<b>topological order</b> of that graph, so Kahn's algorithm would also solve it.</div>
""")

doc = inject(doc, "<h3>Worked example: first sample line</h3>", [[
    "Take one line (one group) and split it on spaces into comparison tokens.",
    "Rewrite every token as <code>harder&gt;softer</code>: <code>4&lt;3</code> becomes <code>3&gt;4</code>.",
    "For each token, add 1 to the win count of the alloy on the left of <code>&gt;</code>.",
    "Sort the alloys by win count, most wins first. That is hardest to softest.",
    "Glue the alloy numbers together into one number, such as 35124.",
    "Do this for every line and add up the numbers. That is the checksum."]])

doc = inject(doc, "<h3>My solution: the new part</h3>", [
    ["Parse and rewrite the tokens as in Part I. One pair is missing.",
     "For every pair of alloys (a, b), look for a third alloy c with <code>a&gt;c</code> and <code>c&gt;b</code>. If you find one, add <code>a&gt;b</code>. Check the other direction (<code>b&gt;c&gt;a</code>) too.",
     "The missing pair is now filled in.",
     "Count wins, sort, glue the numbers together and add them up, as in Part I."],
    ["Parse and rewrite the tokens. Store them in a <b>Set</b> of known pairs.",
     "For each alloy c (1, 2, 3, … as the <b>outer</b> loop): for every a with <code>a&gt;c</code> known, and every b with <code>c&gt;b</code> known, add <code>a&gt;b</code> to the set.",
     "After the last c, every pair that follows from any chain is in the set (the transitive closure).",
     "Count wins, sort, glue the numbers together and add them up, as in Part I."],
])

if __name__ == "__main__":
    build(2, doc)
