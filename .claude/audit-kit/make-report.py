# Build audit/audit-report.html from every agent's audit/<agent>/findings.json (+ optional audit/results.json).
# Usage: python3 .claude/audit-kit/make-report.py
import glob, html, json, os, re, subprocess

repo = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
root = os.path.join(repo, "audit")
e = html.escape
sev_order = {"high": 0, "medium": 1, "low": 2}

# Merge agent findings; the verifier's verdicts and the fixer's proposals attach by id.
data = {"base": "main", "scope": "", "findings": []}
verdicts, proposals = {}, {}
for path in sorted(glob.glob(os.path.join(root, "*", "findings.json"))):
    part = json.load(open(path))
    agent = os.path.basename(os.path.dirname(path))
    if agent in ("verifier", "fixer"):
        target = verdicts if agent == "verifier" else proposals
        for f in part.get("findings", []):
            target[f["id"]] = {k: v for k, v in f.items() if k != "id"}
        continue
    data["scope"] = part.get("scope", data["scope"])
    data["base"] = part.get("base", data["base"])
    for f in part.get("findings", []):
        data["findings"].append({"status": "open", "agent": agent, **f})
fixer_ran = bool(proposals)
# Findings the verifier rejected stay out of the report; a missing verdict means it was not re-checked.
rejected = {i for i, v in verdicts.items() if v.get("verdict") == "rejected"}
findings = [f for f in data["findings"] if f["id"] not in rejected]
known = {f["id"] for f in data["findings"]}
extra_ids = [i for i in proposals if i not in known]  # fixer-only items such as TEST-1 and KIT-1

def num(i):
    tail = i.rsplit("-", 1)[-1]
    return int(tail) if tail.isdigit() else 0

findings.sort(key=lambda f: (sev_order.get(f.get("sev"), 3), f["id"].split("-")[0], num(f["id"])))
live = {f["id"] for f in findings} | set(extra_ids)
results_path = os.path.join(root, "results.json")
results = json.load(open(results_path)) if os.path.exists(results_path) else None
rev = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, cwd=repo).stdout.strip()
branch = subprocess.run(["git", "branch", "--show-current"], capture_output=True, text=True, cwd=repo).stdout.strip()

def link_ids(text):
    return re.sub(r"\b([A-Z0-9]+-\d+)\b", lambda m: f'<a href="#{m[1]}">{m[1]}</a>' if m[1] in live else (f"{m[1]} (rejected)" if m[1] in rejected else m[1]), e(text))

def diff_block(diff, label):
    body = "".join(
        f'<span class="{"hdr" if l.startswith(("--- ", "Option ", "Moves", "Example", "  git mv")) else {"+": "add", "-": "del"}.get(l[:1], "ctx")}">{e(l) or " "}</span>'
        for l in diff.split("\n")
    )
    return f'<details open><summary>{e(label)}</summary><pre class="diff">{body}</pre></details>'

def verdict_of(i):
    return verdicts.get(i, {}).get("verdict", "unverified")

def meta(i):
    v, x, bits = verdicts.get(i, {}), proposals.get(i, {}), []
    bits.append(f'<p><b>Verifier:</b> <span class="verdict {e(verdict_of(i))}">{e(verdict_of(i))}</span>' + (f' {link_ids(v["note"])}' if v.get("note") else "") + "</p>")
    if x:
        bits.append(f'<p><b>Proposal {e(i)}:</b> risk {e(x.get("risk", "?"))}' + (' · <span class="decide">needs your decision</span>' if x.get("decision") else "") + "</p>")
        if x.get("group"):
            bits.append(f'<p class="group"><b>Lands with:</b> {link_ids(x["group"])}</p>')
        if x.get("note"):
            bits.append(f'<p><b>Fixer note:</b> {link_ids(x["note"])}</p>')
    return "".join(bits)

labels = {"open": "Open", "fixed": "Fixed", "proposal": "Proposal", "kept": "Kept as is"}
def badge(s):
    return f'<span class="badge {e(s)}">{e(labels.get(s, s))}</span>'

# Findings grouped by kind, each with its verdict, proposal, and before/after diff.
groups = [("Bugs", ("bug",)), ("Accessibility", ("a11y",)), ("Performance", ("performance",)), ("Security", ("security",)), ("UX and visual consistency", ("ux", "visual")), ("Code conventions", ("convention",)), ("Structure", ("structure",)), ("Uncertain", ("uncertain",)), ("Proposals for you", ("proposal",))]
rows = []
for title, kinds in groups:
    items = [f for f in findings if f["kind"] in kinds]
    if not items:
        continue
    rows.append(f"<h2>{e(title)}</h2>")
    for f in items:
        x = proposals.get(f["id"], {})
        fix = x.get("fix") or f["fix"]
        note = f'<p><b>Done:</b> {e(f["done"])}</p>' if f.get("done") else ""
        diff = f.get("diff") or x.get("diff")
        if diff:
            note += diff_block(diff, f.get("diffLabel") or x.get("diffLabel") or ("Before → after (git diff of the fix)" if f["status"] == "fixed" else "Suggested change (not applied)"))
        rows.append(f"""<article id="{e(f['id'])}"><h3><span class="id">{e(f['id'])}</span> {e(f['title'])} {badge(f['status'])} <span class="sev">{e(f['kind'])} · {e(f['sev'])} · {e(f.get('agent', ''))}</span></h3>
<p class="where"><code>{e(f['where'])}</code></p>{meta(f['id'])}
<p><b>Evidence:</b> {link_ids(f['evidence'])}</p><p><b>Impact:</b> {link_ids(f['impact'])}</p><p><b>Fix:</b> {link_ids(fix)}</p>{note}</article>""")

# Tests and kit changes the fixer proposed without a finder id.
extras = ""
if extra_ids:
    extras = "<h2>Tests and audit tooling (proposals)</h2>" + "".join(
        f'<article id="{e(i)}"><h3><span class="id">{e(i)}</span> {e(proposals[i]["fix"][:110])} {badge("proposal")} <span class="sev">risk {e(proposals[i].get("risk", "?"))} · fixer</span></h3>'
        + (f'<p class="group"><b>Lands with:</b> {link_ids(proposals[i]["group"])}</p>' if proposals[i].get("group") else "")
        + (f'<p><b>Fixer note:</b> {link_ids(proposals[i]["note"])}</p>' if proposals[i].get("note") else "")
        + (diff_block(proposals[i]["diff"], proposals[i].get("diffLabel", "Proposal")) if proposals[i].get("diff") else "")
        + "</article>"
        for i in extra_ids
    )

# Pick-by-ID index: decisions, groups that must land together, and every id.
sev_count = {}
for f in findings:
    sev_count[f["sev"]] = sev_count.get(f["sev"], 0) + 1
by_id = {f["id"]: f for f in findings}
decisions = [i for i in proposals if proposals[i].get("decision") and i in live]
grouped = [(i, proposals[i]["group"]) for i in proposals if proposals[i].get("group") and i in live]

def index_row(i):
    f, x = by_id.get(i, {}), proposals.get(i, {})
    risk = e(x.get("risk", "-")) if x else ("no diff" if fixer_ran else "-")
    return (f'<tr><td><a href="#{e(i)}">{e(i)}</a></td><td>{e(f.get("sev", "-"))}</td><td>{e(verdict_of(i) if f else "-")}</td>'
            f'<td>{risk}</td><td>{"decide" if x.get("decision") else ""}</td><td>{e(f.get("title") or x.get("fix", "")[:90])}</td></tr>')

pick = f"""<h2 id="pick">Pick fixes by ID</h2>
<p><b>Findings shown:</b> {len(findings)} ({", ".join(f"{sev_count.get(s, 0)} {s}" for s in ("high", "medium", "low"))}); {len(rejected)} rejected by the verifier are left out. <b>Proposals:</b> {len(proposals) if fixer_ran else "fixer not run; each finding carries its finder's fix"}.</p>
{f'<h3 class="plain">Needs your decision ({len(decisions)})</h3><ul class="picks">' + "".join(f'<li><a href="#{e(i)}"><b>{e(i)}</b></a> (risk {e(proposals[i].get("risk", "?"))}): {link_ids(proposals[i]["fix"])}</li>' for i in decisions) + "</ul>" if decisions else ""}
{f'<h3 class="plain">Must land together</h3><ul class="picks">' + "".join(f"<li><a href=\"#{e(i)}\"><b>{e(i)}</b></a>: {link_ids(g)}</li>" for i, g in grouped) + "</ul>" if grouped else ""}
<h3 class="plain" id="all-ids">All IDs</h3><div class="scroll"><table class="index"><thead><tr><th>ID</th><th>Sev</th><th>Verdict</th><th>Risk</th><th></th><th>Title</th></tr></thead><tbody>{"".join(index_row(f["id"]) for f in findings)}{"".join(index_row(i) for i in extra_ids)}</tbody></table></div>"""

validation = ""
if results:
    table = lambda pairs: '<div class="scroll"><table><thead><tr><th>Check</th><th>Result</th></tr></thead><tbody>' + "".join(f"<tr><td>{e(k)}</td><td>{e(v)}</td></tr>" for k, v in pairs) + "</tbody></table></div>"
    changes = "".join(f"<li>{e(c)}</li>" for c in results.get("changes", [])) or "<li>None yet.</li>"
    limits = "".join(f"<li>{e(c)}</li>" for c in results.get("limits", []))
    validation = f"""<h2>Changes made</h2><ul>{changes}</ul>
<h2>Validation</h2>{table(results.get("checks", []))}
<h2>Stress and browser tests</h2><p>{e(results.get('browsers', ''))}</p>{table(results.get("stress", []))}
<h2>Limitations</h2><ul>{limits}</ul>"""

counts = {}
for f in findings:
    counts[f["status"]] = counts.get(f["status"], 0) + 1
summary = " · ".join(f"{labels.get(k, k)}: {v}" for k, v in counts.items())
page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Portfolio Audit</title>
<style>
:root{{--bg:#fbfaf7;--fg:#1d1b22;--muted:#5c5866;--line:#dddae3;--card:#fff;--code:#f1eff5;--open:#b45309;--fixed:#15803d;--proposal:#4f46e5;--addbg:#e6f6ea;--addfg:#14532d;--delbg:#fdecec;--delfg:#7f1d1d}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16141b;--fg:#ece9f2;--muted:#a7a2b3;--line:#2e2a38;--card:#1d1a24;--code:#27232f;--open:#f59e0b;--fixed:#4ade80;--proposal:#a5b4fc;--addbg:#12331f;--addfg:#bbf7d0;--delbg:#3a1618;--delfg:#fecaca}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif}}
main{{max-width:880px;margin:0 auto;padding:24px 16px 64px}}h1{{font-size:1.7rem;margin:0 0 4px}}h2{{margin:36px 0 12px;font-size:1.25rem;border-bottom:1px solid var(--line);padding-bottom:6px}}
h3{{font-size:1.02rem;margin:0 0 6px;display:flex;flex-wrap:wrap;gap:8px;align-items:baseline}}h3.plain{{display:block;margin:18px 0 6px}}.id{{font-family:ui-monospace,monospace;color:var(--muted)}}
article{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:10px 0}}article p{{margin:4px 0;overflow-wrap:anywhere}}article:target{{outline:2px solid var(--proposal)}}
.where code,code{{background:var(--code);padding:1px 5px;border-radius:4px;font-size:.86em;overflow-wrap:anywhere}}.sev{{color:var(--muted);font-size:.85rem;font-weight:400}}a{{color:var(--proposal)}}
.badge{{font-size:.75rem;font-weight:600;padding:1px 8px;border-radius:999px;border:1px solid currentColor}}.open{{color:var(--open)}}.fixed{{color:var(--fixed)}}.proposal,.kept{{color:var(--proposal)}}
.verdict{{font-weight:600}}.verdict.confirmed{{color:var(--fixed)}}.verdict.uncertain,.verdict.unverified{{color:var(--open)}}.decide{{color:var(--open);font-weight:600}}.group{{border-left:3px solid var(--proposal);padding-left:8px}}
.meta{{color:var(--muted);margin:0}}.scroll{{overflow-x:auto}}table{{width:100%;border-collapse:collapse;font-size:.92rem}}td,th{{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top;overflow-wrap:break-word}}
table.index td:first-child{{font-family:ui-monospace,monospace}}table.index td:not(:last-child){{white-space:nowrap}}table.index td:last-child{{min-width:12rem}}
@media (max-width:640px){{table.index thead{{display:none}}table.index tr{{display:flex;flex-wrap:wrap;gap:0 10px;border-bottom:1px solid var(--line);padding:6px 0}}table.index td{{border:0;padding:0}}table.index td:empty{{display:none}}table.index td:last-child{{flex-basis:100%;min-width:0}}}}
ul{{padding-left:20px}}ul.picks li{{margin:4px 0;overflow-wrap:anywhere}}details{{margin-top:8px}}summary{{cursor:pointer;font-weight:600;font-size:.9rem;color:var(--muted)}}
pre.diff{{margin:6px 0 0;padding:10px 12px;background:var(--code);border-radius:8px;overflow-x:auto;font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre}}
pre.diff span{{display:block;min-width:max-content}}.add{{background:var(--addbg);color:var(--addfg)}}.del{{background:var(--delbg);color:var(--delfg)}}.hdr{{color:var(--muted);font-weight:600;margin-top:4px}}
</style></head><body><main>
<h1>Portfolio audit</h1>
<p class="meta">Branch <code>{e(branch)}</code> at <code>{e(rev)}</code> vs base <code>{e(data['base'])}</code>, including the uncommitted working tree.</p>
<p class="meta">{e(data['scope'])}</p>
<h2>Overview</h2><p>{e(summary)}. Findings are listed by type; each shows where, the verifier's verdict, the evidence, the impact, the fix, and a before/after code chunk when one was proposed: the real git diff for completed fixes, the suggested change for proposals. Start with <a href="#pick">Pick fixes by ID</a>.</p>
{pick}
{''.join(rows)}
{extras}
{validation}
</main></body></html>"""
open(os.path.join(root, "audit-report.html"), "w").write(page)
print("wrote audit/audit-report.html:", len(findings), "findings", sev_count, "·", len(rejected), "rejected ·", len(proposals), "proposals")
