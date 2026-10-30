"""Helpers for building Everybody Codes quest explanation PDFs (HTML -> WeasyPrint).

Each quest has its own build script, tools/explanation-pdf/qN.py; see CLAUDE.md for the conventions.
"""
import html, subprocess, pathlib, tempfile

REPO = pathlib.Path(subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip())

CSS = """
@page { size: A4; margin: 17mm 17mm 19mm;
  @bottom-center { content: string(quest) " · page " counter(page) " of " counter(pages); font: 8pt 'Helvetica'; color:#888; } }
body { font: 10.3pt/1.5 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#1d1d1f; }
h1 { string-set: quest content(); font-size: 22pt; margin: 0 0 2pt; letter-spacing:-0.3pt; }
.sub { color:#666; margin:0 0 12pt; font-size:10pt; }
h2 { font-size: 15pt; margin: 20pt 0 6pt; padding-bottom:3pt; border-bottom: 1.5pt solid #d9dcf0; page-break-after: avoid; color:#1b2a6b; }
h2.part { page-break-before: always; }
h3 { font-size: 11.5pt; margin: 13pt 0 4pt; color:#222; page-break-after: avoid; }
h4 { font-size: 10.3pt; margin: 9pt 0 3pt; color:#444; page-break-after: avoid; }
p { margin: 0 0 7pt; }
ul, ol { margin: 0 0 8pt; padding-left: 16pt; }
li { margin-bottom: 2pt; }
code, pre { font-family: Menlo, 'Courier New', monospace; font-size: 8.6pt; }
code { background:#f0f1f6; padding: 0 2pt; border-radius:2pt; }
pre { background:#f6f7fb; border:0.6pt solid #e1e3ec; border-radius:4pt; padding:7pt 9pt; white-space:pre-wrap; margin:0 0 8pt; line-height:1.45; }
pre.src { background:#fbfbfd; padding:6pt 0; }
pre.src .ln { display:inline-block; width:22pt; text-align:right; color:#a0a4b5; padding-right:8pt; margin-right:6pt; border-right:0.6pt solid #e1e3ec; }
pre.src .hl { background:#fff3c4; display:block; }
pre.src .row { display:block; padding-right:8pt; }
.cap { font-size:8.5pt; color:#666; margin:-4pt 0 8pt; }
.box { border-left: 3pt solid #4a6cf7; background:#f3f5ff; padding: 6pt 10pt; margin: 6pt 0 10pt; }
.glance { border: 1pt solid #c9d1fb; background:#f7f8ff; border-radius:5pt; padding: 8pt 12pt; margin: 4pt 0 12pt; }
.glance b { color:#1b2a6b; }
.note { border-left: 3pt solid #c9a227; background:#fbf7e9; padding: 6pt 10pt; margin: 6pt 0 10pt; font-size:9.5pt; }
.warn { border-left: 3pt solid #d9534f; background:#fdf1f0; padding: 6pt 10pt; margin: 6pt 0 10pt; font-size:9.5pt; }
table { border-collapse: collapse; margin: 4pt 0 10pt; font-size: 9.2pt; }
th, td { border: 0.6pt solid #d6d8e2; padding: 3pt 6pt; text-align:left; vertical-align:top; }
th { background:#f0f1f6; }
td.n, th.n { text-align:right; font-variant-numeric: tabular-nums; }
table, pre, .box, .glance, .figs, .warn, .note { page-break-inside: avoid; }
.figs { display:flex; gap: 18pt; align-items:flex-end; margin: 4pt 0 8pt; flex-wrap: wrap; }
.fig { text-align:center; font-size:8.5pt; color:#555; }
.steps { border: 1pt solid #9fd3ad; background:#f1faf3; border-radius:5pt; padding: 7pt 12pt 3pt; margin: 8pt 0 10pt; page-break-inside: avoid; }
.steps-h { font-weight:bold; color:#1d6b35; margin-bottom:3pt; }
.walk td:first-child { white-space:nowrap; font-family: Menlo, monospace; font-size:8.4pt; color:#1b2a6b; }
"""

NOTE = """<div class="note">This guide uses the official puzzle text. The story is summarised and the rules are restated in
plain words. Every number in the examples and traces was checked by running the code in this repo
(<code>node partN.ts --sample</code>, plus small instrumented copies to print intermediate values).</div>"""


def page(title, sub, body):
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<style>{CSS}</style></head><body><h1>{title}</h1><p class="sub">{sub}</p>{NOTE}{body}</body></html>"""


def src(path, start=1, end=None, hl=()):
    """Source listing of repo file `path` (lines start..end, 1-based) with line numbers; hl = lines to highlight."""
    lines = (REPO / path).read_text().rstrip("\n").split("\n")
    end = end or len(lines)
    rows = []
    for n in range(start, end + 1):
        cls = "row hl" if n in hl else "row"
        rows.append(f'<span class="{cls}"><span class="ln">{n}</span>{html.escape(lines[n-1])}</span>')
    return f'<pre class="src">{"".join(rows)}</pre><p class="cap">{path}, lines {start}–{end}' + \
        (" (highlighted lines are the ones that changed from the previous part)" if hl else "") + "</p>"


def walk(rows):
    """Two-column 'lines → what happens' table."""
    body = "".join(f"<tr><td>{a}</td><td>{b}</td></tr>" for a, b in rows)
    return f'<table class="walk"><tr><th>Lines</th><th>What happens</th></tr>{body}</table>'


def table(head, rows, num=()):
    th = "".join(f'<th class="{"n" if i in num else ""}">{h}</th>' for i, h in enumerate(head))
    tr = ""
    for r in rows:
        if isinstance(r, str):
            tr += r
            continue
        tr += "<tr>" + "".join(f'<td class="{"n" if i in num else ""}">{c}</td>' for i, c in enumerate(r)) + "</tr>"
    return f"<table><tr>{th}</tr>{tr}</table>"


def grid(n, filled, size=10, hole_center=False, ring=False):
    cells = []
    for r in range(n):
        for c in range(n):
            if ring and 0 < r < n - 1 and 0 < c < n - 1:
                continue
            if hole_center and r == n // 2 and c == n // 2:
                continue
            cells.append((r, c))
    w = n * size
    out = [f'<svg width="{w}pt" height="{w}pt" viewBox="0 0 {w} {w}" xmlns="http://www.w3.org/2000/svg">']
    for i, (r, c) in enumerate(cells):
        have = i < filled
        out.append(f'<rect x="{c*size+0.5}" y="{r*size+0.5}" width="{size-1}" height="{size-1}" '
                   f'fill="{"#4a6cf7" if have else "#fff"}" stroke="{"#4a6cf7" if have else "#e0662f"}" stroke-width="0.8" rx="1"/>')
    out.append("</svg>")
    return "".join(out)



def steps(items):
    lis = "".join(f"<li>{s}</li>" for s in items)
    return f'<div class="steps"><div class="steps-h">Step-by-step solution</div><ol>{lis}</ol></div>'


def inject(doc, anchor, step_lists, skip_after=None):
    """Insert step boxes before the first len(step_lists) occurrences of anchor."""
    parts = doc.split(anchor)
    out = parts[0]
    for k, rest in enumerate(parts[1:]):
        out += (steps(step_lists[k]) if k < len(step_lists) else "") + anchor + rest
    return out


def build(quest, doc, html_dir=None):
    """Write the HTML to html_dir (a temp dir by default) and render REPO/q{quest}/explanation.pdf with WeasyPrint."""
    html_dir = pathlib.Path(html_dir or tempfile.mkdtemp(prefix="explanation-html-"))
    html_dir.mkdir(parents=True, exist_ok=True)
    src_file = html_dir / f"q{quest}.html"
    src_file.write_text(doc)
    dst = REPO / f"q{quest}" / "explanation.pdf"
    subprocess.run(["weasyprint", "-q", str(src_file), str(dst)], check=True)
    print("wrote", dst)
    return dst
