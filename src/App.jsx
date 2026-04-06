import { useState, useMemo } from "react";

const C_DEFS = [
  { code: "C0", name: "Human-originated", desc: "All ideas and structure are entirely your own" },
  { code: "C1", name: "Human-led, AI-organized", desc: "Your ideas; AI helped structure or outline them" },
  { code: "C2", name: "AI-contributed", desc: "AI added ideas, angles, or expansions beyond your prompt" },
  { code: "C3", name: "AI-originated", desc: "Core ideas came from AI; you directed or curated" },
];

const A_DEFS = [
  { code: "A0", name: "Fully human-written", desc: "Every word is yours, no AI involvement in writing" },
  { code: "A1", name: "Human-written, AI-polished", desc: "You wrote it; AI helped with editing or phrasing" },
  { code: "A2", name: "Human-directed, AI-drafted", desc: "You gave direction; AI produced the draft you refined" },
  { code: "A3", name: "AI-generated, human-edited", desc: "AI wrote it; you reviewed and adjusted the output" },
  { code: "A4", name: "Fully AI-generated", desc: "AI produced the text; minimal human editing" },
];

const EXAMPLES = [
  { c: 0, a: 0, note: "A journal entry, transcribed as written" },
  { c: 0, a: 1, note: "Your blog post, grammar-checked by AI" },
  { c: 1, a: 1, note: "Outline shaped in ChatGPT, text written by you" },
  { c: 0, a: 2, note: "Your concept; you gave a brief and refined the AI draft" },
  { c: 2, a: 3, note: "AI brainstormed the angles; you selected and edited" },
  { c: 3, a: 0, note: "AI conceived the idea; you wrote every word yourself" },
  { c: 3, a: 4, note: "Fully AI-produced report, minimal human review" },
];

function getScore(c, a) {
  return (c / 3 + a / 4) / 2;
}

function getHumanPct(c, a) {
  return Math.round((1 - getScore(c, a)) * 100);
}

function getLabelInfo(c, a) {
  const score = getScore(c, a);
  if (c === 0 && a === 0) return { label: "Human", tier: 0 };
  if (score <= 0.2)        return { label: "Human \u00B7 AI-assisted", tier: 1 };
  if (score < 0.5)         return { label: "Human + AI", tier: 2 };
  if (score < 0.75)        return { label: "AI + Human", tier: 3 };
  return                          { label: "AI", tier: 4 };
}

function getDescription(c, a) {
  const cPart = ["Human-conceived", "Human-led", "AI-contributed", "AI-originated"][c];
  const aPart = ["human-written", "AI-polished", "AI-drafted", "AI-generated and human-edited", "AI-generated"][a];
  return `${cPart}, ${aPart}`;
}

/* ── Continuous color gradient: human (light) → AI (deep blue) ── */


function getColors(c, a) {
  const aHuman = 1 - a / 4; // 1 at A0, 0 at A4

  // C axis = hue: warm top (C0, human) → teal bottom (C3, AI conception)
  // A axis = saturation: vivid left (A0, human) → pale right (A4, AI authorship)
  const warm = [220, 120, 90];
  const teal = [42, 175, 160];
  const white = [245, 247, 250];

  // Blend hue along C: C0 = warm, C3 = teal
  const cRatio = c / 3;
  const baseR = warm[0] + (teal[0] - warm[0]) * cRatio;
  const baseG = warm[1] + (teal[1] - warm[1]) * cRatio;
  const baseB = warm[2] + (teal[2] - warm[2]) * cRatio;

  // Fade toward white along A: A0 = full color, A4 = still has some color
  const intensity = 0.12 + aHuman * 0.43;
  const r = Math.round(white[0] + (baseR - white[0]) * intensity);
  const g = Math.round(white[1] + (baseG - white[1]) * intensity);
  const b = Math.round(white[2] + (baseB - white[2]) * intensity);

  const bg = `rgb(${r}, ${g}, ${b})`;
  const bgHex = `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
  const br = Math.max(0, r - 20), bg2 = Math.max(0, g - 20), bb = Math.max(0, b - 20);
  const borderHex = `#${br.toString(16).padStart(2,"0")}${bg2.toString(16).padStart(2,"0")}${bb.toString(16).padStart(2,"0")}`;

  return {
    bg,
    text: "#1a2a3a",
    border: `rgb(${br}, ${bg2}, ${bb})`,
    bgHex,
    textHex: "#1a2a3a",
    borderHex,
  };
}

/* ── Badge generators ── */

function generateHTMLBadge(c, a, siteUrl, float) {
  const { label } = getLabelInfo(c, a);
  const code = `C${c}:A${a}`;
  const cDef = C_DEFS[c];
  const aDef = A_DEFS[a];
  const { bgHex, textHex, borderHex } = getColors(c, a);
  const id = `__aib_${c}${a}`;
  const tipId = `${id}_tip`;
  const linkUrl = siteUrl || "https://medigree.github.io/CAIndex";
  const linkHref = `${linkUrl}?c=${c}&a=${a}`;

  const floatStyle = float
    ? `position:fixed;bottom:16px;right:16px;z-index:99999;`
    : `display:inline-block;vertical-align:middle;`;

  const badge = `<span id="${id}" style="${floatStyle}position:relative;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;">` +
    `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:${bgHex};border:1px solid white;border-radius:6px;font-size:12px;cursor:default;white-space:nowrap;user-select:none;box-shadow:0 0 0 0.5px ${borderHex},0 2px 8px rgba(0,0,0,0.08);">` +
    `<span style="color:${textHex};font-weight:500;font-size:12px;">${label}</span>` +
    `<span style="color:${textHex};opacity:0.6;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10px;">(${code})</span>` +
    `</span>` +
    `<span id="${tipId}" style="display:none;position:absolute;bottom:100%;${float ? "right:0;" : "left:0;"}padding-bottom:4px;z-index:99999;">` +
    `<span style="display:block;background:#0F172A;color:#E2E8F0;border-radius:8px;padding:10px 12px;font-size:12px;line-height:1.5;min-width:240px;max-width:280px;box-sizing:border-box;white-space:normal;box-shadow:0 4px 16px rgba(0,0,0,.25);">` +
    `<strong style="display:block;color:#F8FAFC;font-size:12px;margin-bottom:6px;">${label} \u00B7 ${code}</strong>` +
    `<div style="margin-bottom:4px;"><span style="color:#94A3B8;font-size:10px;text-transform:uppercase;letter-spacing:.06em;">C${c}</span><span style="color:#94A3B8;font-size:10px;"> \u2014 </span><span style="color:#CBD5E1;font-size:10px;">${cDef.name}. ${cDef.desc}</span></div>` +
    `<div style="margin-bottom:8px;"><span style="color:#94A3B8;font-size:10px;text-transform:uppercase;letter-spacing:.06em;">A${a}</span><span style="color:#94A3B8;font-size:10px;"> \u2014 </span><span style="color:#CBD5E1;font-size:10px;">${aDef.name}. ${aDef.desc}</span></div>` +
    `<a href="${linkHref}" target="_blank" rel="noopener" style="color:#7DD3FC;font-size:10px;text-decoration:none;">CAI Badge \u2192</a>` +
    `</span>` +
    `</span>` +
    `</span>` +
    `<script>(function(){` +
    `var w=document.getElementById('${id}'),t=document.getElementById('${tipId}');` +
    `if(!w||!t)return;` +
    `w.addEventListener('mouseenter',function(){t.style.display='block';});` +
    `w.addEventListener('mouseleave',function(){t.style.display='none';});` +
    `}());<\/script>`;

  return badge;
}

function generateSVG(c, a) {
  const { label } = getLabelInfo(c, a);
  const code = `C${c}:A${a}`;
  const cDef = C_DEFS[c];
  const aDef = A_DEFS[a];
  const { bgHex, textHex, borderHex } = getColors(c, a);
  const humanPct = getHumanPct(c, a);
  const labelLen = label.length * 6.4;
  const codeLen = `(${code})`.length * 5.8;
  const w = Math.ceil(labelLen + codeLen + 28);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="22" viewBox="0 0 ${w} 22" role="img" aria-label="${label} ${code}">
  <title>${label} (${code}) \u2014 Conception (${cDef.code}): ${cDef.name}. Authorship (${aDef.code}): ${aDef.name}. Human participation: ${humanPct}%.</title>
  <rect width="${w}" height="22" rx="4" fill="${bgHex}"/>
  <rect width="${w}" height="22" rx="4" fill="none" stroke="white" stroke-width="1"/>
  <rect width="${w}" height="22" rx="4" fill="none" stroke="${borderHex}" stroke-width="0.5"/>
  <text x="10" y="15" font-family="system-ui,-apple-system,sans-serif" font-size="11" font-weight="500" fill="${textHex}">${label}</text>
  <text x="${10 + labelLen + 5}" y="15" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="10" fill="${textHex}" opacity="0.6">(${code})</text>
</svg>`;
}

function generateMarkdown(c, a, siteUrl) {
  const { label } = getLabelInfo(c, a);
  const code = `C${c}:A${a}`;
  const text = `${label} (${code})`;
  if (!siteUrl) return `**${text}**`;
  return `[${text}](${siteUrl}?c=${c}&a=${a})`;
}

/* ── UI components ── */

function SegControl({ value, onChange, options, axisLetter, axisName, axisColor, gradient }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
        <span style={{
          fontSize: "14px", whiteSpace: "nowrap",
        }}>
          <span style={{ fontWeight: "700", color: axisColor, fontSize: "16px" }}>{axisLetter}</span>
          <span style={{ color: "var(--color-text-secondary)", fontWeight: "400" }}>{axisName}</span>
        </span>
        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{options[value].name}</span>
      </div>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "4px" }}>
        {options.map((opt, i) => (
          <button key={i} onClick={() => onChange(i)} style={{
            padding: "5px 11px", fontSize: "12px", fontFamily: "var(--font-mono)",
            background: value === i ? "var(--color-text-primary)" : "transparent",
            color: value === i ? "var(--color-background-primary)" : "var(--color-text-tertiary)",
            border: `0.5px solid ${value === i ? "var(--color-text-primary)" : "var(--color-border-secondary)"}`,
            borderRadius: "var(--border-radius-md)", cursor: "pointer", transition: "all 0.12s",
          }}>{opt.code}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <span style={{ fontSize: "9px", color: "var(--color-text-tertiary)", whiteSpace: "nowrap" }}>{gradient.left}</span>
        <div style={{
          flex: 1, height: "4px", borderRadius: "2px",
          background: gradient.css,
          border: "0.5px solid var(--color-border-tertiary)",
        }} />
        <span style={{ fontSize: "9px", color: "var(--color-text-tertiary)", whiteSpace: "nowrap" }}>{gradient.right}</span>
      </div>
      <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0, lineHeight: "1.5" }}>
        {options[value].desc}
      </p>
    </div>
  );
}

function Badge({ c, a, size }) {
  const { label } = getLabelInfo(c, a);
  const code = `C${c}:A${a}`;
  const { bg, text, border } = getColors(c, a);
  const humanPct = getHumanPct(c, a);
  const lg = size === "lg";
  return (
    <span title={`${label} — ${humanPct}% human participation`} style={{
      display: "inline-flex", alignItems: "center", gap: lg ? "8px" : "5px",
      padding: lg ? "6px 14px" : "4px 10px",
      background: bg, border: `1px solid white`,
      borderRadius: "var(--border-radius-md)", whiteSpace: "nowrap",
      boxShadow: `0 0 0 0.5px ${border}`,
    }}>
      <span style={{ fontSize: lg ? "14px" : "12px", fontWeight: "500", color: text }}>{label}</span>
      <span style={{ fontSize: lg ? "11px" : "9px", fontFamily: "var(--font-mono)", color: text, opacity: 0.6 }}>({code})</span>
      {lg && <span style={{ fontSize: "10px", color: text, opacity: 0.5, fontFamily: "var(--font-mono)" }}>{humanPct}%</span>}
    </span>
  );
}

function Grid({ c, a, onSelect }) {
  return (
    <div>
      <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginBottom: "7px", fontFamily: "var(--font-mono)" }}>
        click any cell to select
      </div>
      {[0, 1, 2, 3].map(cy => (
        <div key={cy} style={{ display: "flex", gap: "3px", marginBottom: "3px", alignItems: "center" }}>
          <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "#D4776B", width: "22px", textAlign: "right", paddingRight: "4px", flexShrink: 0 }}>
            C{cy}
          </div>
          {[0, 1, 2, 3, 4].map(ax => {
            const active = cy === c && ax === a;
            const { bg: cellBg } = getColors(cy, ax);
            return (
              <div key={ax} onClick={() => onSelect(cy, ax)}
                title={`C${cy}:A${ax}: ${getLabelInfo(cy, ax).label} — ${getHumanPct(cy, ax)}% human`}
                style={{
                  flex: 1, height: "28px", minWidth: 0,
                  background: cellBg,
                  borderRadius: "3px", cursor: "pointer",
                  border: "0.5px solid var(--color-border-tertiary)",
                  boxShadow: active ? "inset 0 0 0 2.5px var(--color-text-primary)" : "none",
                  transition: "all 0.1s",
                }}
              />
            );
          })}
        </div>
      ))}
      <div style={{ display: "flex", gap: "3px", paddingLeft: "22px" }}>
        {[0, 1, 2, 3, 4].map(ax => (
          <div key={ax} style={{ flex: 1, fontSize: "10px", fontFamily: "var(--font-mono)", color: "#2A9D8F", textAlign: "center", minWidth: 0 }}>
            A{ax}
          </div>
        ))}
      </div>
    </div>
  );
}

function SelfBadge() {
  const sc = 0, sa = 2;
  const { bg, text, border } = getColors(sc, sa);
  const { label } = getLabelInfo(sc, sa);
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "fixed", bottom: "16px", right: "16px", zIndex: 1000,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{
        background: bg, border: "1px solid white",
        boxShadow: `0 0 0 0.5px ${border}, 0 2px 8px rgba(0,0,0,0.08)`,
        borderRadius: "8px", padding: "6px 12px",
        fontSize: "11px", color: text,
        cursor: "default", userSelect: "none", whiteSpace: "nowrap",
      }}>
        <strong style={{ fontWeight: 600 }}>{label}</strong>
        <span style={{ opacity: 0.6, fontFamily: "var(--font-mono)", marginLeft: "5px" }}>(C{sc}:A{sa})</span>
      </div>
      {hover && (
        <div style={{
          position: "absolute", bottom: "100%", right: 0, paddingBottom: "4px",
          background: "#0F172A", color: "#E2E8F0", borderRadius: "8px",
          padding: "10px 12px", fontSize: "12px", lineHeight: "1.5",
          minWidth: "240px", maxWidth: "280px", whiteSpace: "normal",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        }}>
          <strong style={{ display: "block", color: "#F8FAFC", fontSize: "12px", marginBottom: "6px" }}>
            {label} {"\u00B7"} C{sc}:A{sa}
          </strong>
          <div style={{ marginBottom: "4px" }}>
            <span style={{ color: "#94A3B8", fontSize: "10px", textTransform: "uppercase", letterSpacing: ".06em" }}>C{sc}</span>
            <span style={{ color: "#94A3B8", fontSize: "10px" }}> — </span>
            <span style={{ color: "#CBD5E1", fontSize: "10px" }}>{C_DEFS[sc].name}. {C_DEFS[sc].desc}</span>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "#94A3B8", fontSize: "10px", textTransform: "uppercase", letterSpacing: ".06em" }}>A{sa}</span>
            <span style={{ color: "#94A3B8", fontSize: "10px" }}> — </span>
            <span style={{ color: "#CBD5E1", fontSize: "10px" }}>{A_DEFS[sa].name}. {A_DEFS[sa].desc}</span>
          </div>
          <a href="https://medigree.github.io/CAIndex" target="_blank" rel="noopener" style={{ color: "#7DD3FC", fontSize: "10px", textDecoration: "none" }}>
            Get badge {"\u2192"}
          </a>
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", margin: "1rem 0" }} />;
}

export default function App() {
  const [c, setC] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const v = parseInt(p.get("c"));
      return !isNaN(v) && v >= 0 && v <= 3 ? v : 0;
    } catch { return 0; }
  });
  const [a, setA] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const v = parseInt(p.get("a"));
      return !isNaN(v) && v >= 0 && v <= 4 ? v : 0;
    } catch { return 0; }
  });
  const [siteUrl, setSiteUrl] = useState("");
  const [copied, setCopied] = useState(null);
  const [showHow, setShowHow] = useState(false);
  const [exportFmt, setExportFmt] = useState("html");

  const { label } = useMemo(() => getLabelInfo(c, a), [c, a]);
  const desc = useMemo(() => getDescription(c, a), [c, a]);
  const humanPct = useMemo(() => getHumanPct(c, a), [c, a]);
  const textBadge = `${label} (C${c}:A${a})`;
  const htmlBadge = useMemo(() => generateHTMLBadge(c, a, siteUrl, false), [c, a, siteUrl]);
  const htmlBadgeFloat = useMemo(() => generateHTMLBadge(c, a, siteUrl, true), [c, a, siteUrl]);
  const svgBadge  = useMemo(() => generateSVG(c, a), [c, a]);
  const mdBadge   = useMemo(() => generateMarkdown(c, a, siteUrl), [c, a, siteUrl]);
  const linkBadge = `${siteUrl || (typeof window !== "undefined" ? window.location.origin : "")}?c=${c}&a=${a}`;

  const copy = async (text, key) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };


  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: "11px", fontWeight: "500", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: "620px", margin: "0 auto", padding: "2rem 1rem 3rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "500", margin: "0 0 6px" }}>CAI Badge</h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.65" }}>
          A seal of human participation. Two-axis model for transparent AI content attribution — no judgment implied, just clarity.
        </p>
      </div>

      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem 1.25rem 0.75rem" }}>
        <SegControl value={c} onChange={setC} options={C_DEFS} axisLetter="C" axisName="onception" axisColor="#D4776B"
          gradient={{ left: "Human", right: "AI", css: "linear-gradient(to right, rgb(220,120,90), rgb(42,175,160))" }} />
        <SegControl value={a} onChange={setA} options={A_DEFS} axisLetter="A" axisName="uthorship" axisColor="#2A9D8F"
          gradient={{ left: "Human", right: "AI", css: "linear-gradient(to right, rgb(220,120,90), rgb(235,240,245))" }} />
      </div>

      <div style={{ marginTop: "1rem", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem" }}>
        <Grid c={c} a={a} onSelect={(nc, na) => { setC(nc); setA(na); }} />

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginTop: "1.25rem", marginBottom: "0.5rem" }}>
          <Badge c={c} a={a} size="lg" />
          <span style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>{desc}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)", whiteSpace: "nowrap" }}>Human participation</span>
          <div style={{ flex: 1, height: "6px", background: "var(--color-background-secondary)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${humanPct}%`, height: "100%", background: getColors(c, a).bg, borderRadius: "3px", transition: "width 0.2s" }} />
          </div>
          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)", whiteSpace: "nowrap" }}>{humanPct}%</span>
        </div>
      </div>

      <div style={{ marginTop: "1rem", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem" }}>
        <SectionLabel>Paste this into your site</SectionLabel>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "12px", color: "var(--color-text-tertiary)", display: "block", marginBottom: "5px" }}>
            Site URL — embedded in badge hover links
          </label>
          <input type="url" value={siteUrl} onChange={e => setSiteUrl(e.target.value)}
            placeholder="https://your-label-site.com"
            style={{ width: "100%", fontSize: "13px", fontFamily: "var(--font-mono)", boxSizing: "border-box" }}
          />
        </div>

        {(() => {
          const formats = [
            { id: "html", label: "HTML", desc: "Inline badge with hover tooltip" },
            { id: "float", label: "HTML (float)", desc: "Fixed bottom-right badge with hover" },
            { id: "svg", label: "SVG", desc: "Image badge for docs and READMEs" },
            { id: "md", label: "Markdown", desc: "For emails, notes, plain text docs" },
            { id: "text", label: "Plain text", desc: "Universal fallback" },
            { id: "link", label: "Link", desc: "Direct URL to this classification" },
          ];
          const codeMap = { html: htmlBadge, float: htmlBadgeFloat, svg: svgBadge, md: mdBadge, text: textBadge, link: linkBadge };
          const current = codeMap[exportFmt];
          return (
            <>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
                {formats.map(f => (
                  <button key={f.id} onClick={() => setExportFmt(f.id)} style={{
                    padding: "5px 10px", fontSize: "11px",
                    background: exportFmt === f.id ? "var(--color-text-primary)" : "transparent",
                    color: exportFmt === f.id ? "var(--color-background-primary)" : "var(--color-text-tertiary)",
                    border: `0.5px solid ${exportFmt === f.id ? "var(--color-text-primary)" : "var(--color-border-secondary)"}`,
                    borderRadius: "var(--border-radius-md)", cursor: "pointer", transition: "all 0.12s",
                  }}>{f.label}</button>
                ))}
              </div>

              <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginBottom: "8px" }}>
                {formats.find(f => f.id === exportFmt)?.desc}
              </div>

              <div style={{
                position: "relative",
                background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)",
                padding: "10px 12px", paddingRight: "70px", fontSize: "11px", fontFamily: "var(--font-mono)",
                color: "var(--color-text-secondary)", overflowX: "auto", whiteSpace: "pre-wrap",
                wordBreak: "break-all", maxHeight: "160px", overflowY: "auto", lineHeight: "1.5",
              }}>
                {current}
                <button onClick={() => copy(current, "code")} style={{
                  position: "absolute", top: "8px", right: "8px",
                  fontSize: "11px", padding: "3px 10px",
                  background: copied === "code" ? "var(--color-background-success)" : "var(--color-background-primary)",
                  color: copied === "code" ? "var(--color-text-success)" : "var(--color-text-secondary)",
                  border: `0.5px solid ${copied === "code" ? "var(--color-border-success)" : "var(--color-border-secondary)"}`,
                  borderRadius: "var(--border-radius-md)", cursor: "pointer", transition: "all 0.1s",
                }}>
                  {copied === "code" ? "Copied!" : "Copy"}
                </button>
              </div>
            </>
          );
        })()}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <SectionLabel>Examples — click to explore</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "6px" }}>
          {EXAMPLES.map(ex => {
            const active = ex.c === c && ex.a === a;
            return (
              <div key={`${ex.c}-${ex.a}`} onClick={() => { setC(ex.c); setA(ex.a); }} style={{
                padding: "10px 12px", cursor: "pointer",
                background: "var(--color-background-primary)",
                border: `${active ? "2px" : "0.5px"} solid ${active ? "var(--color-border-info)" : "var(--color-border-tertiary)"}`,
                borderRadius: "var(--border-radius-md)", transition: "border-color 0.1s",
              }}>
                <div style={{ marginBottom: "5px" }}>
                  <Badge c={ex.c} a={ex.a} />
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: "1.45" }}>
                  {ex.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "1rem", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
        <button onClick={() => setShowHow(v => !v)} style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer",
          color: "var(--color-text-primary)", fontSize: "14px", fontWeight: "500", textAlign: "left",
        }}>
          How to classify your content
          <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)", display: "inline-block", transform: showHow ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            {"\u25BE"}
          </span>
        </button>

        {showHow && (
          <div style={{ padding: "0 16px 16px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.7", marginTop: "14px" }}>
              The label uses two independent dimensions. <strong style={{ fontWeight: "600", color: "#D4776B" }}>C</strong><strong style={{ fontWeight: "500", color: "var(--color-text-primary)" }}>onception</strong> captures who originated the ideas and structure. <strong style={{ fontWeight: "600", color: "#2A9D8F" }}>A</strong><strong style={{ fontWeight: "500", color: "var(--color-text-primary)" }}>uthorship</strong> captures who produced the actual words. The darker the badge, the more human involvement. A piece can be C0:A2 (your ideas, AI-drafted) or C1:A0 (AI-organized outline, your prose).
            </p>

            <div style={{ marginTop: "1rem" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.07em", marginBottom: "8px" }}>
                <span style={{ color: "#D4776B", fontWeight: "600" }}>C</span><span style={{ color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>onception (0–3)</span>
              </div>
              {C_DEFS.map(d => (
                <div key={d.code} style={{ display: "flex", gap: "10px", marginBottom: "7px", alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-primary)", minWidth: "22px", paddingTop: "1px", flexShrink: 0 }}>
                    {d.code}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
                    <strong style={{ fontWeight: "500", color: "var(--color-text-primary)" }}>{d.name}</strong> — {d.desc}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1rem" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.07em", marginBottom: "8px" }}>
                <span style={{ color: "#2A9D8F", fontWeight: "600" }}>A</span><span style={{ color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>uthorship (0–4)</span>
              </div>
              {A_DEFS.map(d => (
                <div key={d.code} style={{ display: "flex", gap: "10px", marginBottom: "7px", alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-primary)", minWidth: "22px", paddingTop: "1px", flexShrink: 0 }}>
                    {d.code}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
                    <strong style={{ fontWeight: "500", color: "var(--color-text-primary)" }}>{d.name}</strong> — {d.desc}
                  </span>
                </div>
              ))}
            </div>

            <Divider />

            <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.7" }}>
              <strong style={{ fontWeight: "500", color: "var(--color-text-primary)" }}>Decision rules</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: "1.2rem" }}>
                <li>Classify based on the <em>final artifact</em>, not the effort spent.</li>
                <li>If you defined the outline and argument flow, lean toward C0/C1 — even if AI added examples.</li>
                <li>If AI produced the base text, it is at least A2 — even if heavily edited.</li>
                <li>A simple prompt ("write an article about X") pushes toward C2/C3. A detailed brief stays C0.</li>
              </ul>
            </div>

            <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "12px", fontStyle: "italic", lineHeight: "1.5" }}>
              Classification reflects substantive contribution, not cosmetic edits. The C:A code is the canonical classification; the label and percentage are derived conveniences.
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: "2rem", fontSize: "11px", color: "var(--color-text-tertiary)", textAlign: "center", lineHeight: "1.8" }}>
        CAI Badge {"\u00B7"} a seal of human participation
        <br />
        The model may be updated. C and A are independent axes; the badge code is the stable reference.
      </div>

      <SelfBadge />
    </div>
  );
}
