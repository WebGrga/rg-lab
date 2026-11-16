import "./project";
import "./gamefinder.css";

// A faithful port of gamefinder/scoring.py (WebGrga/gamefinder) so the radar runs in the
// browser on fictional sample games. Nothing here calls Steam, YouTube or Reddit.

type Game = {
  name: string;
  tags: string[];
  description: string;
  release: string;
  uploads: number;
  views: number;
  breakouts: number;
  redditMentions: number;
  redditTop: number;
};

type Line = { label: string; points: number };

const BUILD_WORDS = ["build", "builds", "class", "classes", "weapon", "weapons", "perk", "perks", "synergy", "synergies", "deckbuilder", "roguelike", "roguelite", "survivor", "bullet heaven"];
const NICHE_WORDS = ["roguelike", "roguelite", "deckbuilder", "survivor", "demo", "indie"];
const TAG_CHOICES = ["roguelike", "roguelite", "deckbuilder", "survivor", "demo", "indie", "build", "weapons", "perks", "classes"];

const SAMPLE: Game[] = [
  { name: "Rune Survivors: Prologue", tags: ["demo", "roguelike", "survivor", "build"], description: "A fast survivor-like demo with weapon evolutions and class perks.", release: "Apr 2026", uploads: 12, views: 136_000, breakouts: 5, redditMentions: 9, redditTop: 144 },
  { name: "Clockwork Catacombs", tags: ["roguelike", "deckbuilder", "build"], description: "A deckbuilding roguelite with relic chains and boss counters.", release: "Coming soon", uploads: 4, views: 11_900, breakouts: 0, redditMentions: 4, redditTop: 53 },
  { name: "Ashfall Orchard", tags: ["indie"], description: "A beautiful narrative farming game with light combat.", release: "Mar 2026", uploads: 18, views: 450_000, breakouts: 8, redditMentions: 22, redditTop: 710 },
  { name: "Hexbound Arena", tags: ["roguelite", "classes"], description: "An arena roguelite with class synergies and weekly seeds.", release: "Jan 2026", uploads: 46, views: 980_000, breakouts: 2, redditMentions: 30, redditTop: 900 },
  { name: "Lantern Keeper", tags: ["demo", "indie", "survivor"], description: "A bullet heaven where your light radius is your health.", release: "Demo, May 2026", uploads: 2, views: 14_000, breakouts: 1, redditMentions: 3, redditTop: 40 },
  { name: "Glyphfall", tags: ["deckbuilder", "roguelike"], description: "A word-spelling deckbuilder with perk drafts between floors.", release: "Feb 2026", uploads: 6, views: 38_000, breakouts: 1, redditMentions: 6, redditTop: 130 },
  { name: "Iron Hive Survivors", tags: ["survivor", "roguelite", "weapons"], description: "Swarm survival with modular weapons and hive bosses.", release: "Dec 2025", uploads: 22, views: 300_000, breakouts: 3, redditMentions: 14, redditTop: 220 },
  { name: "Saltmarsh Courier", tags: ["indie"], description: "A cozy delivery game across a tidal village.", release: "Jun 2026", uploads: 1, views: 2_000, breakouts: 0, redditMentions: 1, redditTop: 12 },
];

function score(g: Game) {
  let total = 20;
  const lines: Line[] = [{ label: "base score", points: 20 }];
  const combined = `${g.tags.join(" ")} ${g.description} ${g.name}`.toLowerCase();

  const niche = NICHE_WORDS.filter((w) => combined.includes(w)).length;
  if (niche) lines.push({ label: `niche fit: ${niche} strong tag/keyword matches`, points: Math.min(20, niche * 5) });
  const build = BUILD_WORDS.filter((w) => combined.includes(w)).length;
  if (build) lines.push({ label: "has build/guide video potential", points: Math.min(25, build * 4) });
  if (g.uploads) lines.push({ label: `${g.uploads} recent matching YouTube uploads`, points: Math.min(14, g.uploads * 1.4) });
  if (g.views) lines.push({ label: `${g.views.toLocaleString("en-US")} recent matching YouTube views`, points: Math.min(18, g.views / 8_000) });
  if (g.breakouts) lines.push({ label: `${g.breakouts} breakout-sized recent videos`, points: Math.min(12, g.breakouts * 4) });
  if (g.uploads > 0 && g.uploads <= 12 && g.views >= 10_000) lines.push({ label: "demand exists without obvious saturation", points: 12 });
  else if (g.uploads > 35) lines.push({ label: "likely saturated: many recent videos", points: -14 });
  if (g.redditMentions) lines.push({ label: `${g.redditMentions} recent Reddit mentions`, points: Math.min(8, g.redditMentions) });
  if (g.redditTop >= 100) lines.push({ label: "one Reddit post has meaningful traction", points: 6 });
  if (combined.includes("demo") || combined.includes("prologue")) lines.push({ label: "demo/prologue timing is good for discovery", points: 9 });

  for (const l of lines.slice(1)) total += l.points;
  const value = Math.round(Math.max(0, Math.min(100, total)) * 10) / 10;
  return { value, lines, raw: total };
}

function tier(s: number) {
  if (s >= 85) return "record today";
  if (s >= 70) return "test today";
  if (s >= 50) return "watchlist";
  return "skip for now";
}

function angles(g: Game) {
  const text = `${g.name} ${g.tags.join(" ")} ${g.description}`.toLowerCase();
  const out: string[] = [];
  if (text.includes("demo") || text.includes("prologue")) out.push(`The strongest early build I found in ${g.name}`, `${g.name} demo tips before your first run`);
  if (text.includes("deckbuilder")) out.push(`The best starter deck strategy in ${g.name}`);
  if (text.includes("survivor") || text.includes("bullet heaven")) out.push(`This weapon combo breaks ${g.name}`);
  if (text.includes("roguelike") || text.includes("roguelite")) out.push(`${g.name}: best upgrades to take first`);
  out.push(`Is ${g.name} worth playing right now?`);
  return [...new Set(out)].slice(0, 4);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const fmtPts = (p: number) => (p > 0 ? "+" : p < 0 ? "−" : "") + String(Math.round(Math.abs(p) * 10) / 10);

let games: Game[] = structuredClone(SAMPLE);
let selected = games[0].name;

const listEl = document.getElementById("gf-list")!;
const detailEl = document.getElementById("gf-detail")!;

function renderList() {
  const ranked = games.map((g) => ({ g, s: score(g).value })).sort((a, b) => b.s - a.s);
  listEl.innerHTML = ranked
    .map(({ g, s }, i) => {
      const t = tier(s);
      return `<li><button type="button" class="gf-row${g.name === selected ? " is-on" : ""}" data-name="${esc(g.name)}" aria-pressed="${g.name === selected}">
        <span class="gf-rank">${i + 1}</span>
        <span class="gf-name">${esc(g.name)}<small>${esc(g.tags.join(" · ") || "no tags")}</small></span>
        <span class="gf-bar" aria-hidden="true"><i data-w="${s}" class="t-${t.replace(/\s/g, "-")}"></i></span>
        <span class="gf-score">${s}<small>${t}</small></span>
      </button></li>`;
    })
    .join("");
  // Widths via CSSOM: the lab's CSP blocks inline style attributes.
  for (const bar of listEl.querySelectorAll<HTMLElement>("i[data-w]")) bar.style.width = `${bar.dataset.w}%`;
}

const capNote = (raw: number) => (raw > 100 ? `Raw total ${Math.round(raw * 10) / 10}, capped at 100.` : "");

const SLIDERS: { key: keyof Game; label: string; max: number; step: number }[] = [
  { key: "uploads", label: "Recent YouTube uploads", max: 60, step: 1 },
  { key: "views", label: "Views on those uploads", max: 1_000_000, step: 2_000 },
  { key: "breakouts", label: "Breakout videos (small channels)", max: 10, step: 1 },
  { key: "redditMentions", label: "Reddit mentions", max: 40, step: 1 },
  { key: "redditTop", label: "Top Reddit post score", max: 1_000, step: 10 },
];

function renderDetail() {
  const g = games.find((x) => x.name === selected)!;
  const s = score(g);
  const t = tier(s.value);
  detailEl.innerHTML = `
    <div class="gf-head">
      <div><h3 class="pixel">${esc(g.name)}</h3><p>${esc(g.description)} <span class="gf-rel">${esc(g.release)}</span></p></div>
      <div class="gf-big"><b class="pixel">${s.value}</b><span class="t-${t.replace(/\s/g, "-")}">${t}</span></div>
    </div>
    <fieldset class="gf-tags"><legend>Tags (click to toggle)</legend>
      ${TAG_CHOICES.map((tag) => `<button type="button" class="gf-tag${g.tags.includes(tag) ? " is-on" : ""}" data-tag="${tag}" aria-pressed="${g.tags.includes(tag)}">${tag}</button>`).join("")}
    </fieldset>
    <div class="gf-sliders">
      ${SLIDERS.map((sl) => `<label><span>${sl.label}<output>${(g[sl.key] as number).toLocaleString("en-US")}</output></span>
        <input type="range" min="0" max="${sl.max}" step="${sl.step}" value="${g[sl.key]}" data-key="${sl.key}"></label>`).join("")}
    </div>
    <div class="gf-why">
      <h4>Why this score</h4>
      <ol>${s.lines.map((l) => `<li class="${l.points < 0 ? "neg" : ""}"><span>${esc(l.label)}</span><b>${l.label === "base score" ? "20" : fmtPts(l.points)}</b></li>`).join("")}</ol>
      <p class="gf-note">${capNote(s.raw)}</p>
      <h4>Video angles it suggests</h4>
      <ul>${angles(g).map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
    </div>
    <button type="button" class="pbtn ghost gf-reset">Reset sample data</button>`;
}

function render() {
  renderList();
  renderDetail();
}

listEl.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".gf-row");
  if (!btn) return;
  selected = btn.dataset.name!;
  render();
  if (window.matchMedia("(max-width: 900px)").matches) detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
});

detailEl.addEventListener("click", (e) => {
  const el = e.target as HTMLElement;
  const g = games.find((x) => x.name === selected)!;
  const tagBtn = el.closest<HTMLButtonElement>(".gf-tag");
  if (tagBtn) {
    const tag = tagBtn.dataset.tag!;
    g.tags = g.tags.includes(tag) ? g.tags.filter((x) => x !== tag) : [...g.tags, tag];
    render();
    detailEl.querySelector<HTMLButtonElement>(`.gf-tag[data-tag="${tag}"]`)?.focus();
  }
  if (el.closest(".gf-reset")) {
    games = structuredClone(SAMPLE);
    render();
  }
});

detailEl.addEventListener("input", (e) => {
  const input = e.target as HTMLInputElement;
  if (input.type !== "range") return;
  const g = games.find((x) => x.name === selected)!;
  (g as Record<string, unknown>)[input.dataset.key!] = Number(input.value);
  // Update in place so the slider keeps focus while dragging.
  input.parentElement!.querySelector("output")!.textContent = Number(input.value).toLocaleString("en-US");
  renderList();
  const s = score(g);
  const t = tier(s.value);
  const big = detailEl.querySelector(".gf-big")!;
  big.innerHTML = `<b class="pixel">${s.value}</b><span class="t-${t.replace(/\s/g, "-")}">${t}</span>`;
  const why = detailEl.querySelector(".gf-why ol")!;
  why.innerHTML = s.lines.map((l) => `<li class="${l.points < 0 ? "neg" : ""}"><span>${esc(l.label)}</span><b>${l.label === "base score" ? "20" : fmtPts(l.points)}</b></li>`).join("");
  detailEl.querySelector(".gf-note")!.textContent = capNote(s.raw);
  const angleList = detailEl.querySelector(".gf-why ul")!;
  angleList.innerHTML = angles(g).map((a) => `<li>${esc(a)}</li>`).join("");
});

render();
