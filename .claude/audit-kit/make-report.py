# Build audit/audit-report.html from every agent's audit/<agent>/findings.json (+ optional audit/results.json).
# Usage: python3 .claude/audit-kit/make-report.py
import glob, html, json, os, subprocess

repo = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
root = os.path.join(repo, "audit")

# Merge agent findings; the verifier's verdicts and the fixer's diffs attach by id.
data = {"base": "main", "scope": "", "findings": []}
extra = {}
for path in sorted(glob.glob(os.path.join(root, "*", "findings.json"))):
    part = json.load(open(path))
    agent = os.path.basename(os.path.dirname(path))
    if agent in ("verifier", "fixer"):
        for f in part.get("findings", []):
            extra.setdefault(f["id"], {}).update({k: v for k, v in f.items() if k != "id"})
        continue
    data["scope"] = part.get("scope", data["scope"])
    data["base"] = part.get("base", data["base"])
    for f in part.get("findings", []):
        data["findings"].append({"status": "open", "agent": agent, **f})
for f in data["findings"]:
    f.update(extra.get(f["id"], {}))
# Findings the verifier rejected stay out of the report.
data["findings"] = [f for f in data["findings"] if f.get("verdict") != "rejected"]
order = {"high": 0, "medium": 1, "low": 2}
data["findings"].sort(key=lambda f: order.get(f.get("sev"), 3))
results_path = os.path.join(root, "results.json")
results = json.load(open(results_path)) if os.path.exists(results_path) else None
rev = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, cwd=repo).stdout.strip()
branch = subprocess.run(["git", "branch", "--show-current"], capture_output=True, text=True, cwd=repo).stdout.strip()
e = html.escape

groups = [("Bugs", ("bug",)), ("Accessibility", ("a11y",)), ("Performance", ("performance",)), ("Security", ("security",)), ("UX and visual consistency", ("ux", "visual")), ("Code conventions", ("convention",)), ("Structure", ("structure",)), ("Uncertain", ("uncertain",)), ("Proposals for you", ("proposal",))]
labels = {"open": "Open", "fixed": "Fixed", "proposal": "Proposal", "kept": "Kept as is"}

def badge(s):
    return f'<span class="badge {e(s)}">{e(labels.get(s, s))}</span>'

counts = {}
for f in data["findings"]:
    counts[f["status"]] = counts.get(f["status"], 0) + 1

rows = []
for title, kinds in groups:
    items = [f for f in data["findings"] if f["kind"] in kinds]
    if not items:
        continue
    rows.append(f"<h2>{e(title)}</h2>")
    for f in items:
        note = f'<p><b>Done:</b> {e(f["done"])}</p>' if f.get("done") else ""
        if f.get("diff"):
            label = f.get("diffLabel") or ("Before → after (git diff of the fix)" if f["status"] == "fixed" else "Before → after")
            body = "".join(
                f'<span class="{ {"+": "add", "-": "del"}.get(l[:1], "hdr" if l.startswith(("--- ", "Moves", "Example", "  git mv")) else "ctx") if not l.startswith("--- ") else "hdr"}">{e(l) or " "}</span>'
                for l in f["diff"].split("\n")
            )
            note += f'<details open><summary>{e(label)}</summary><pre class="diff">{body}</pre></details>'

        rows.append(f"""<article id="{e(f['id'])}"><h3><span class="id">{e(f['id'])}</span> {e(f['title'])} {badge(f['status'])} <span class="sev">{e(f['kind'])} · {e(f['sev'])} · {e(f.get('agent', ''))}</span></h3>
<p class="where"><code>{e(f['where'])}</code></p>
<p><b>Evidence:</b> {e(f['evidence'])}</p><p><b>Impact:</b> {e(f['impact'])}</p><p><b>Fix:</b> {e(f['fix'])}</p>{note}</article>""")

validation = ""
if results:
    items = "".join(f"<tr><td>{e(k)}</td><td>{e(v)}</td></tr>" for k, v in results["checks"])
    stress = "".join(f"<tr><td>{e(k)}</td><td>{e(v)}</td></tr>" for k, v in results["stress"])
    changes = "".join(f"<li>{e(c)}</li>" for c in results["changes"])
    limits = "".join(f"<li>{e(c)}</li>" for c in results["limits"])
    validation = f"""<h2>Changes made</h2><ul>{changes}</ul>
<h2>Validation</h2><table><thead><tr><th>Check</th><th>Result</th></tr></thead><tbody>{items}</tbody></table>
<h2>Stress and browser tests</h2><p>{e(results['browsers'])}</p><table><thead><tr><th>Scenario</th><th>Result</th></tr></thead><tbody>{stress}</tbody></table>
<h2>Limitations</h2><ul>{limits}</ul>"""

summary = " · ".join(f"{labels.get(k, k)}: {v}" for k, v in counts.items())
page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Portfolio Audit</title>
<style>
:root{{--bg:#fbfaf7;--fg:#1d1b22;--muted:#5c5866;--line:#dddae3;--card:#fff;--code:#f1eff5;--open:#b45309;--fixed:#15803d;--proposal:#4f46e5;--addbg:#e6f6ea;--addfg:#14532d;--delbg:#fdecec;--delfg:#7f1d1d}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16141b;--fg:#ece9f2;--muted:#a7a2b3;--line:#2e2a38;--card:#1d1a24;--code:#27232f;--open:#f59e0b;--fixed:#4ade80;--proposal:#a5b4fc;--addbg:#12331f;--addfg:#bbf7d0;--delbg:#3a1618;--delfg:#fecaca}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif}}
main{{max-width:880px;margin:0 auto;padding:24px 16px 64px}}h1{{font-size:1.7rem;margin:0 0 4px}}h2{{margin:36px 0 12px;font-size:1.25rem;border-bottom:1px solid var(--line);padding-bottom:6px}}
h3{{font-size:1.02rem;margin:0 0 6px;display:flex;flex-wrap:wrap;gap:8px;align-items:baseline}}.id{{font-family:ui-monospace,monospace;color:var(--muted)}}
article{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:10px 0}}article p{{margin:4px 0;overflow-wrap:anywhere}}
.where code,code{{background:var(--code);padding:1px 5px;border-radius:4px;font-size:.86em;overflow-wrap:anywhere}}.sev{{color:var(--muted);font-size:.85rem;font-weight:400}}
.badge{{font-size:.75rem;font-weight:600;padding:1px 8px;border-radius:999px;border:1px solid currentColor}}.open{{color:var(--open)}}.fixed{{color:var(--fixed)}}.proposal,.kept{{color:var(--proposal)}}
.meta{{color:var(--muted);margin:0}}table{{width:100%;border-collapse:collapse;font-size:.92rem}}td,th{{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}}
ul{{padding-left:20px}}
details{{margin-top:8px}}summary{{cursor:pointer;font-weight:600;font-size:.9rem;color:var(--muted)}}
pre.diff{{margin:6px 0 0;padding:10px 12px;background:var(--code);border-radius:8px;overflow-x:auto;font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre}}
pre.diff span{{display:block;min-width:max-content}}.add{{background:var(--addbg);color:var(--addfg)}}.del{{background:var(--delbg);color:var(--delfg)}}.hdr{{color:var(--muted);font-weight:600;margin-top:4px}}
</style></head><body><main>
<h1>Portfolio audit</h1>
<p class="meta">Branch <code>{e(branch)}</code> at <code>{e(rev)}</code> vs base <code>{e(data['base'])}</code>, including the uncommitted working tree.</p>
<p class="meta">{e(data['scope'])}</p>
<h2>Overview</h2><p>{e(summary)}. Findings are listed by type; each shows where, the evidence, the impact, the fix, and a before/after code chunk: the real git diff for completed fixes, the suggested change for proposals. Proposals are left for you to decide.</p>
{''.join(rows)}
{validation}
</main></body></html>"""
open(os.path.join(root, "audit-report.html"), "w").write(page)
print("wrote audit-report.html", counts)
