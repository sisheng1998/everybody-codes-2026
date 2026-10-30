"""Builds q3/explanation.pdf. Run: python3 tools/explanation-pdf/q3.py"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from pdfkit import *  # noqa: F401,F403

doc = page("Quest 3: The ISOlation", "Lord of the Wings · counting elven votes written in ISO standards", f"""
<div class="glance"><b>In one sentence:</b> each vote is a number written in an elven positional system where every digit has
its own base; convert every vote to decimal and add them up.<br>
<b>Input:</b> one vote per line, such as <code>ISO-3210 7654</code><br>
<b>Output:</b> the candidate's total score in decimal.<br>
<b>What changes between parts:</b> II lets the standard be shorter or longer than the vote; III throws out votes that
aren't the smallest way of writing their value.</div>

<h2>1. The story</h2>
<p>In the Elven Capital, the elves are electing three members of their Grand Council, and the vote count has stalled.
Elves don't write numbers in plain decimal. They use many <b>ISO standards</b>, each its own positional number system,
and all of them count as equally standard. You help convert the votes.</p>

<h2>2. Understanding the question</h2>
<h3>Ordinary place value, as a reminder</h3>
<p>In decimal, <code>7654 = 7×10³ + 6×10² + 5×10¹ + 4×10⁰</code>. Every position uses the same base, 10, raised to its
position counted from the right, starting at 0.</p>
<h3>The elven twist</h3>
<p>In <code>ISO-3210 7654</code>, the <b>standard</b> <code>3210</code> gives a <b>separate base for each position</b>,
lined up digit by digit with the vote <code>7654</code>:</p>
<pre>standard:   3     2     1     0
vote:       7     6     5     4
power:      3     2     1     0        (position from the right)

value = 7×3³ + 6×2² + 5×1¹ + 4×0⁰ = 189 + 24 + 5 + 4 = 222</pre>
<p>In general: <code>value = Σ vote[i] × standard[i] ^ (length − 1 − i)</code>.</p>
<h4>Things to notice</h4>
<ul>
<li><b><code>0⁰ = 1</code>.</b> A base of 0 in the last position still counts the digit once (the <code>+ 4</code> above). JavaScript's
<code>0 ** 0</code> is also 1, so the code handles this without any special case.</li>
<li><b>A standard of all one digit is an ordinary base.</b> <code>ISO-2222 1011</code> is binary: 8 + 0 + 2 + 1 = 11.
<code>ISO-88 17</code> is octal: 1×8 + 7 = 15.</li>
<li><b>Base 1</b> makes every position worth 1, so <code>ISO-1111 1111</code> = 1 + 1 + 1 + 1 = 4.</li>
<li><b>Vote digits can be bigger than their base</b>, for example 7 in a base-3 position. That is what makes Part III necessary.</li>
</ul>

<h2 class="part">3. Part I: standard and vote have the same length</h2>
<h3>Worked examples</h3>
<pre>ISO-3210 7654   7×3³ + 6×2² + 5×1¹ + 4×0⁰ = 189 + 24 + 5 + 4  =  222
ISO-8742 2468   2×8³ + 4×7² + 6×4¹ + 8×2⁰ = 1024 + 196 + 24 + 8 = 1252
ISO-1111 1111   1×1³ + 1×1² + 1×1¹ + 1×1⁰ = 1 + 1 + 1 + 1      =    4
                                                     total     = 1478</pre>
<h3>My solution</h3>
{src("q3/part1.ts", 10, 27)}
{walk([
    ("11", "Removes the <code>ISO-</code> prefix and splits on the space. <code>first</code> is the standard (<code>\"3210\"</code>) and <code>second</code> is the vote (<code>\"7654\"</code>), both kept as strings so each digit can be read by index."),
    ("14", "Walks the positions from left to right."),
    ("15", "Adds <code>vote digit × base ^ power</code>, where the power is <code>length − 1 − i</code>: 3, 2, 1, 0 for a 4-digit number."),
    ("21–25", "Adds up all votes and prints the total."),
])}
<h4>Trace: <code>ISO-8742 2468</code></h4>
{table(["i", "second[i]", "first[i]", "power", "term"], [
    [0, 2, 8, 3, "2 × 512 = 1024"], [1, 4, 7, 2, "4 × 49 = 196"], [2, 6, 4, 1, "6 × 4 = 24"], [3, 8, 2, 0, "8 × 1 = 8"],
    '<tr><th colspan="4">answer</th><th class="n">1252</th></tr>'], num=(0, 1, 2, 3))}

<h2 class="part">4. Part II: the standard repeats to fit</h2>
<h3>The question</h3>
<p>The standard and the vote can now have different lengths. The standard is a <b>repeating pattern</b>: repeat it
<b>from right to left</b> until it covers the whole vote. The rightmost digits always line up.</p>
<pre>ISO-123  756423     →  ISO-123123   756423
ISO-123  7564231    →  ISO-3123123  7564231     (an extra 3 on the left)
ISO-2    12345678   →  ISO-22222222 12345678
ISO-2341 945        →  ISO-341      945         (longer standard: keep the rightmost 3)</pre>
<h3>Worked examples (sample)</h3>
{table(["Vote", "Expanded standard", "Calculation", "Value"], [
    ["<code>ISO-3210 7654</code>", "3210", "as Part I", 222],
    ["<code>ISO-8742 2468</code>", "8742", "as Part I", 1252],
    ["<code>ISO-1 1111</code>", "1111", "1+1+1+1", 4],
    ["<code>ISO-13 777</code>", "313", "7×3² + 7×1¹ + 7×3⁰ = 63+7+7", 77],
    ["<code>ISO-34 140856</code>", "343434", "1×3⁵ + 4×4⁴ + 0×3³ + 8×4² + 5×3¹ + 6×4⁰", 1416],
    ["<code>ISO-789 2465112</code>", "9789789", "2×9⁶ + 4×7⁵ + 6×8⁴ + 5×9³ + 1×7² + 1×8¹ + 2×9⁰", 1158390],
    ["<code>ISO-2341 945</code>", "341", "9×3² + 4×4¹ + 5×1⁰ = 81+16+5", 102],
    '<tr><th colspan="3">Total</th><th class="n">1161463</th></tr>'], num=(3,))}

<h3>My solution</h3>
{src("q3/part2.ts", 10, 29, hl=(14, 16, 17, 18, 19, 20, 21, 23, 25))}
{walk([
    ("14", "<code>updatedFirst</code> will hold the standard after it has been stretched or trimmed to the vote's length."),
    ("16", "Only builds it if the lengths differ; otherwise uses <code>first</code> as it is (line 21)."),
    ("17–19", "Builds the expanded standard <b>from the right</b>. For step <code>i</code> (0 = rightmost), it takes standard digit <code>first.length − 1 − (i % first.length)</code>, which cycles through the standard backwards, and puts it in <b>front</b> of what it has so far. This one loop handles both repeating and trimming."),
    ("23–25", "Same sum as Part I, but over the vote's length and using <code>updatedFirst</code>."),
])}
<h4>Trace: expanding <code>ISO-789</code> for <code>2465112</code> (7 digits)</h4>
{table(["i", "i % 3", "index 2 − (i % 3)", "digit", "updatedFirst"], [
    [0, 0, 2, 9, "9"], [1, 1, 1, 8, "89"], [2, 2, 0, 7, "789"], [3, 0, 2, 9, "9789"],
    [4, 1, 1, 8, "89789"], [5, 2, 0, 7, "789789"], [6, 0, 2, 9, "<b>9789789</b>"]], num=(0, 1, 2, 3))}
<p>For <code>ISO-2341 945</code> the loop runs only 3 times and picks 1, 4, 3, giving <code>341</code>. The leading 2 is never used.</p>

<h2 class="part">5. Part III: ISO2, only the smallest representation counts</h2>
<h3>The question</h3>
<p>Because vote digits can be bigger than their base, <b>one value can be written in several ways</b>. With standard
<code>5322</code>, each of these is 137:</p>
<pre>1028 → 1×5³ + 0×3² + 2×2¹ + 8×2⁰ = 125 + 0 + 4 + 8 = 137
1036 → 125 + 0 + 6 + 6 = 137        (one "2" moved from the last place to the one before)
1044, 1052, 1060, 1103 → also 137</pre>
<p><b>ISO2</b> removes the ambiguity: a vote is <b>valid only if no smaller number gives the same value</b> under the same
standard. Here only <code>1028</code> is valid. Invalid votes count as 0.</p>
<p>The smaller number can have <b>fewer digits</b>. In that case the standard is repeated or trimmed to the shorter length,
using the same rule as Part II.</p>

<h3>Worked examples (sample)</h3>
{table(["Vote", "Value", "Smaller twin", "Why", "Counted"], [
    ["<code>ISO2-3 23</code>", 9, "<code>9</code>", "standard 33: 2×3 + 3 = 9; and 9 with standard 3: 9×1 = 9", 0],
    ["<code>ISO2-61 149</code>", 34, "<code>54</code>", "standard 161: 1 + 24 + 9 = 34; and 54 with standard 61: 30 + 4 = 34", 0],
    ["<code>ISO2-978 99</code>", 72, "none", "", 72],
    ["<code>ISO2-5887 5923</code>", 1220, "none", "", 1220],
    ["<code>ISO2-76988 123749</code>", 38826, "none", "", 38826],
    ["<code>ISO2-435657 929977</code>", 10869, "none", "", 10869],
    ["<code>ISO2-3949 870737</code>", 54705, "<code>280207</code>", "same value, smaller number", 0],
    '<tr><th colspan="4">Total</th><th class="n">50987</th></tr>'], num=(1, 4))}

<h3>My solution</h3>
{src("q3/part3.ts", 10, 35, hl=(10, 11, 28, 29, 30, 31, 32))}
{walk([
    ("10", "<code>getAnswer</code> takes a second argument, <code>needChecking</code>. It is <code>true</code> for real votes and <code>false</code> when the function calls itself to evaluate a candidate twin, so the check doesn't recurse forever."),
    ("11", "The prefix is now <code>ISO2-</code>."),
    ("13–26", "Same as Part II: compute the vote's value into <code>answer</code>."),
    ("29", "Brute force: try every smaller number <code>i = 0, 1, 2, …, vote − 1</code>."),
    ("30", "Evaluates <code>i</code> under the <b>same standard</b> by building the string <code>`ISO2-${{first}} ${{i}}`</code> and calling itself with checking turned off. <code>i</code> is written without leading zeros, so a short <code>i</code> gets a stretched or trimmed standard, as in Part II. If the values match, the vote is invalid and the function returns <b>0</b>."),
    ("34", "No smaller twin was found, so the vote is valid and its value is returned."),
])}
<h4>Trace: <code>ISO2-3 23</code> (value 9)</h4>
{table(["i", "Expanded standard", "Value of i", "== 9?"], [
    [0, "3", "0", "no"], [1, "3", "1", "no"], ["…", "", "", ""], [8, "3", "8", "no"], [9, "3", "9", "<b>yes → return 0</b>"]], num=(0,))}
<p>Single-digit numbers use only the 3⁰ = 1 place, so their value is just the digit, and 9 matches.</p>
<h4>How much work does this do?</h4>
{table(["Vote", "Loop stops at", "Calls to getAnswer"], [
    ["<code>ISO2-3 23</code>", "i = 9 (twin found)", 10],
    ["<code>ISO2-61 149</code>", "i = 54 (twin found)", 55],
    ["<code>ISO2-978 99</code>", "end (valid)", 99],
    ["<code>ISO2-3949 870737</code>", "i = 280207 (twin found)", "280,208"],
    ["<code>ISO2-435657 929977</code>", "end (valid)", "929,977"],
], num=(2,))}
<p>Valid votes check every number below them, so the cost grows with the size of the vote. The puzzle says the numbers in
this set are "reasonably small", so this is fast enough. The loop also stops at the <b>first</b> twin, which is enough,
because one smaller twin already makes the vote invalid.</p>

<h2>6. Summary</h2>
{table(["Part", "New rule", "Code change"], [
    ["I", "each digit has its own base", "sum of digit × base^power"],
    ["II", "standard repeats from the right", "build <code>updatedFirst</code> with <code>i % first.length</code>"],
    ["III", "only the smallest representation is valid", "try every smaller number by calling itself with <code>needChecking = false</code>"],
])}
""")

doc = inject(doc, "<h3>My solution</h3>", [
    ["Remove <code>ISO-</code> and split the line into the standard (e.g. <code>3210</code>) and the vote (e.g. <code>7654</code>).",
     "Go through the vote's digits from left to right. For digit number <code>i</code>, its power is <code>length − 1 − i</code>.",
     "Multiply the vote digit by (standard digit) ^ (power) and add it to a running total.",
     "That total is the vote's decimal value. Add up every vote's value to get the answer."],
    ["Split the line into standard and vote, as in Part I.",
     "If their lengths differ, build an expanded standard the same length as the vote. Start from the rightmost digit and walk the standard backwards, wrapping around (<code>i % length</code>), putting each digit in front.",
     "Compute the value with the expanded standard, exactly as in Part I.",
     "Add up every vote's value."],
    ["Compute the vote's value, exactly as in Part II.",
     "For every smaller number <code>i</code> = 0, 1, 2, … up to vote − 1, compute its value under the <b>same</b> standard. The standard is stretched or trimmed to <code>i</code>'s length.",
     "If any <code>i</code> gives the same value, the vote is not the smallest representation: it is invalid and counts as 0. You can stop at the first match.",
     "If no smaller number matched, the vote is valid and its value counts.",
     "Add up the counted values."],
])

if __name__ == "__main__":
    build(3, doc)
