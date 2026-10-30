"""Builds q4/explanation.pdf. Run: python3 tools/explanation-pdf/q4.py"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from pdfkit import *  # noqa: F401,F403

doc = page("Quest 4: The Rankening", "Lord of the Wings · scoring the Tournament of Elven Warriors", f"""
<div class="glance"><b>In one sentence:</b> turn tournament records into a ranking, then compute a checksum:
Σ position × (the value being ranked).<br>
<b>Input:</b> one record per line, such as <code>id=7 quest=1 part=2 time=345</code>, in any order.<br>
<b>Output:</b> the checksum.<br>
<b>What changes between parts:</b> what the ranking is based on (total time → parts completed then time → points
with ties).</div>

<h2>1. The story</h2>
<p>The Grand Council agrees to help the journey to Nulldor, where the cursed Dragonduck egg Frodoff is carrying must be
destroyed. The elves want to send their best warrior, but nobody has worked out the standings of the <b>Tournament of
Elven Warriors</b> yet. You build the leaderboard.</p>

<h2>2. Understanding the question</h2>
<h3>The records</h3>
{table(["Field", "Meaning"], [
    ["<code>id</code>", "the participant"],
    ["<code>quest</code>", "which tournament quest (one quest per day)"],
    ["<code>part</code>", "part 1, 2 or 3 of that quest"],
    ["<code>time</code>", "seconds taken for that part"],
])}
<p>Records are <b>in no particular order</b>, so you have to group them yourself, by participant and later by quest.</p>
<h3>The checksum</h3>
<pre>checksum = 1 × (value of 1st place) + 2 × (value of 2nd place) + 3 × (value of 3rd place) + …</pre>
<p>The "value" is total time in Parts I and II, and total points in Part III.</p>

<h3>Reading the records (same in all parts)</h3>
{src("q4/part1.ts", 10, 17)}
{walk([
    ("12", "Splits a record on spaces: <code>[\"id=1\", \"quest=1\", \"part=1\", \"time=187\"]</code>."),
    ("13–14", "Splits each piece on <code>=</code> into <code>[key, Number(value)]</code>."),
    ("11", "<code>Object.fromEntries</code> builds <code>{{id: 1, quest: 1, part: 1, time: 187}}</code>."),
])}

<h2 class="part">3. Part I: one quest, rank by total time</h2>
<h3>The question</h3>
<p>Every participant finished all three parts of one quest. Add each participant's three times and rank from
<b>shortest total to longest</b>. There are no ties.</p>
<h3>Worked example (sample)</h3>
{table(["Position", "id", "Times", "Total", "Position × total"], [
    [1, 1, "187 + 299 + 362", 848, 848], [2, 5, "257 + 346 + 744", 1347, 2694],
    [3, 2, "192 + 562 + 745", 1499, 4497], [4, 3, "413 + 455 + 1168", 2036, 8144],
    [5, 4, "457 + 558 + 1268", 2283, 11415],
    '<tr><th colspan="4">Checksum</th><th class="n">27598</th></tr>'], num=(0, 1, 3, 4))}
<h3>My solution</h3>
{src("q4/part1.ts", 19, 31)}
{walk([
    ("19", "<code>ranks</code> maps a participant id to its running total time."),
    ("21–24", "For each record, adds its time to that participant's total. <code>ranks[key] || 0</code> starts a new participant at 0. Order doesn't matter, because addition doesn't care about order."),
    ("26–27", "<code>Object.entries</code> gives <code>[id, total]</code> pairs, sorted by total, smallest first."),
    ("28", "Keeps only the totals: <code>[848, 1347, 1499, 2036, 2283]</code>."),
    ("29", "<code>reduce</code> adds <code>total × (idx + 1)</code>. The array index is 0-based, so position is <code>idx + 1</code>."),
])}
<h4>Trace: the <code>ranks</code> object after line 24</h4>
<pre>{{ "1": 848, "2": 1499, "3": 2036, "4": 2283, "5": 1347 }}</pre>

<h2 class="part">4. Part II: whole tournament, more parts completed comes first</h2>
<h3>The question</h3>
<p>Now the records cover all 20 quests, and most participants didn't finish everything. The ranking rule is:</p>
<ol>
<li><b>More completed parts always ranks higher</b>, whatever the time.</li>
<li>With the same number of parts, the <b>shorter total time</b> ranks higher.</li>
</ol>
<p>The checksum still uses total time. There are no ties.</p>
<h3>Worked example (sample)</h3>
{table(["Position", "id", "Parts", "Total time", "Position × time"], [
    [1, 1, 5, 980, 980], [2, 2, 5, 990, 1980], [3, 3, 4, 590, 1770], [4, 4, 3, 435, 1740],
    '<tr><th colspan="4">Checksum</th><th class="n">6470</th></tr>'], num=(0, 1, 2, 3, 4))}
<p>id=4 has the <b>lowest</b> time (435) but ranks <b>last</b>, because it completed only 3 parts. id=1 beats id=2 on time,
since both completed 5 parts.</p>
<h3>My solution</h3>
{src("q4/part2.ts", 19, 37, hl=(19, 23, 25, 26, 27, 28, 29, 33, 35))}
{walk([
    ("19", "Now each participant stores two numbers: <code>{{ time, parts }}</code>."),
    ("25–29", "For each record: adds the time and adds 1 to the parts count. Each record is one completed part."),
    ("33", "The two-level sort. <code>b.parts − a.parts</code> puts more parts first. If that is <code>0</code> (same number of parts), <code>||</code> falls back to <code>a.time − b.time</code>, which puts shorter time first. This works because <code>0</code> is falsy in JavaScript."),
    ("35", "The checksum uses <code>b.time</code>, the total time, times the position."),
])}
<h4>Trace: <code>ranks</code> after line 30</h4>
<pre>{{ "1": {{ time: 980, parts: 5 }}, "2": {{ time: 990, parts: 5 }},
  "3": {{ time: 590, parts: 4 }}, "4": {{ time: 435, parts: 3 }} }}</pre>

<h2 class="part">5. Part III: ranking points, with ties</h2>
<h3>The question</h3>
<p>The final ranking is now based on <b>points</b>. For every quest, a separate mini-ranking is made after <b>each part</b>:</p>
<ol>
<li><b>Who is included:</b> everyone who completed that part. Anyone who didn't gets 0 points for it.</li>
<li><b>What is compared:</b> the <b>combined</b> time so far. After part 2 that is part 1 + part 2; after part 3 it is all three.</li>
<li><b>Points:</b> first place gets <b>50</b> (part 1), <b>100</b> (part 2) or <b>150</b> (part 3). Each lower position
gets 1 point less, down to 1, and anyone below that gets 0. So <code>points = max(50 × part − (position − 1), 0)</code>.</li>
<li><b>Ties:</b> equal combined times <b>share a position</b> and each tied participant gets that position's points. The next
participant's position <b>skips ahead</b>: 1, 1, 3, not 1, 1, 2.</li>
</ol>
<p>Add up each participant's points, rank by total points (highest first), and compute <code>Σ position × points</code>.
<b>Tied totals share a position here as well:</b> <code>… + 55×374 + 55×374 + 57×…</code>.</p>

<h3>Worked example with ties (sample3.txt, which your code uses)</h3>
{table(["Quest · part", "Combined times", "Positions → points"], [
    ["Q1 · 1", "id2 90, id3 90, id4 110, id1 120", "1st id2 50 · <b>1st</b> id3 50 · <b>3rd</b> id4 48 · 4th id1 47"],
    ["Q1 · 2", "id2 260, id3 260, id4 280, id1 300", "1st id2 100 · 1st id3 100 · 3rd id4 98 · 4th id1 97"],
    ["Q1 · 3", "nobody finished", "-"],
    ["Q2 · 1", "id3 120, id1 130, id2 130, id4 150", "1st id3 50 · 2nd id1 49 · 2nd id2 49 · 4th id4 47"],
    ["Q2 · 2", "id1 340, id3 340, id2 350", "1st id1 100 · 1st id3 100 · 3rd id2 98"],
    ["Q2 · 3", "id1 670, id2 700", "1st id1 150 · 2nd id2 149"],
])}
{table(["Position", "id", "Points", "Total", "Position × points"], [
    [1, 2, "50 + 100 + 49 + 98 + 149", 446, 446], [2, 1, "47 + 97 + 49 + 100 + 150", 443, 886],
    [3, 3, "50 + 100 + 50 + 100", 300, 900], [4, 4, "48 + 98 + 47", 193, 772],
    '<tr><th colspan="4">Checksum</th><th class="n">3004</th></tr>'], num=(0, 1, 3, 4))}
<p>The puzzle's other example (the Part II data, with no ties) gives 441 / 444 / 300 / 193 and a checksum of <b>2998</b>.
Running your Part III code on <code>sample2.txt</code> gives 2998 as well.</p>

<h3>My solution, step 1: group times by quest and participant</h3>
{src("q4/part3.ts", 19, 32)}
{walk([
    ("19", "<code>ranks[quest][id]</code> is an array of that participant's times for parts 1–3 of that quest."),
    ("27–29", "Gets (or creates) the quest's object and the participant's array, then puts the time at index <code>part − 1</code>. Because of this, the order of the records doesn't matter."),
    ("31", "Writes the updated object back. The spread <code>{{...prevQuest}}</code> keeps the other participants."),
])}
<h4>Trace: <code>ranks</code> after line 32 (sample3)</h4>
<pre>{{ "1": {{ "1": [120,180], "2": [90,170], "3": [90,170], "4": [110,170] }},
  "2": {{ "1": [130,210,330], "2": [130,220,350], "3": [120,220], "4": [150] }} }}</pre>

<h3>My solution, step 2: points for every (quest, part)</h3>
{src("q4/part3.ts", 34, 58)}
{walk([
    ("36–37", "For each quest <code>r</code>, and for each part index <code>i</code> = 0, 1, 2 (parts 1, 2, 3)…"),
    ("39", "…keeps only participants who completed this part (<code>times[i]</code> exists)…"),
    ("40–43", "…and pairs each one with their <b>combined</b> time: <code>times.slice(0, i + 1)</code> takes parts 1…i+1, and <code>reduce</code> adds them. For quest 2, part 2: id1 → 130 + 210 = 340."),
    ("45", "Skips a part that nobody completed, such as Q1 · 3."),
    ("47", "Sorts fastest first."),
    ("49–52", "<b>Competition ranking.</b> <code>rank</code> only moves to <code>j + 1</code> when the time is different from the previous one. Equal times keep the earlier rank, and the next different time jumps to its real position."),
    ("54", "<code>50 × (i + 1)</code> is the top prize (50, 100, 150); subtract 1 per position below first, and never go below 0."),
    ("55", "Adds the points to the participant's total score."),
])}
<h4>Trace: lines 49–55 for Q1 · part 1</h4>
{table(["j", "id", "time", "same as previous?", "rank", "points"], [
    [0, 2, 90, "(first)", 1, 50], [1, 3, 90, "yes → keep", 1, 50], [2, 4, 110, "no → j + 1", 3, 48], [3, 1, 120, "no → j + 1", 4, 47]],
    num=(0, 1, 2, 4, 5))}

<h3>My solution, step 3: final ranking and checksum</h3>
{src("q4/part3.ts", 60, 70)}
{walk([
    ("60", "<code>rank</code> lives outside the <code>reduce</code> so it keeps its value between items."),
    ("63–64", "Sorts the total scores, highest first, and keeps only the numbers. For the sample: <code>[446, 443, 300, 193]</code>."),
    ("66", "The same tie rule as before: the rank only moves to <code>idx + 1</code> when the score changes. So two scores of 374 at index 54 and 55 both get rank 55, and the next score gets 57."),
    ("67", "Adds <code>score × rank</code>."),
])}
<div class="box"><b>Easy-to-miss details in Part III, all handled by the code:</b>
<ul>
<li>Mini-rankings are made separately for each <b>(quest, part)</b>, not across the whole tournament (line 36–37).</li>
<li>Rankings after part 2 and part 3 use <b>running totals</b>, not the time for that part alone (line 42).</li>
<li>Ties use <b>1, 1, 3</b> ranking, both when giving out points (line 52) and in the final checksum (line 66).</li>
<li>Positions far down still get 0 points rather than negative points (<code>Math.max(…, 0)</code>, line 54).</li>
</ul></div>

<h2>6. Summary</h2>
{table(["Part", "Ranked by", "Ties?", "Checksum multiplies"], [
    ["I", "total time (low first)", "no", "total time"],
    ["II", "parts completed (high first), then total time (low first)", "no", "total time"],
    ["III", "total points from per-(quest, part) mini-rankings", "yes, 1-1-3 style", "total points"],
])}
""")

doc = inject(doc, "<h3>My solution", [
    ["Parse each record into <code>{id, quest, part, time}</code>.",
     "For each record, add its time to that participant's total.",
     "Sort the participants by total time, smallest first.",
     "Go down the list: position 1, 2, 3, …. Add <code>position × total time</code> for each.",
     "That sum is the checksum."],
    ["Parse each record.",
     "For each participant, keep two running numbers: total time, and how many records (parts) they have.",
     "Sort by parts, most first. If two participants have the same number of parts, put the smaller total time first.",
     "Add <code>position × total time</code> down the list."],
    ["Parse each record and file its time under <code>[quest][participant][part − 1]</code>.",
     "For each quest, and each part k = 1, 2, 3: collect everyone who completed part k, with their <b>combined</b> time for parts 1…k.",
     "Sort that list, fastest first. Give out positions, where equal times share a position and the next one skips ahead (1, 1, 3).",
     "Each participant gets <code>max(50·k − (position − 1), 0)</code> points, added to their total score.",
     "When every quest and part is done, sort the participants by total score, highest first. Give positions with the same tie rule.",
     "Add <code>position × score</code> down the list. That is the checksum."],
])

if __name__ == "__main__":
    build(4, doc)
