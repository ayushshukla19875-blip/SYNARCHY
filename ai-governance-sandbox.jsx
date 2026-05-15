import { useState, useEffect, useRef } from "react";

const METRICS = [
  { key: "freedom", label: "Freedom Index", icon: "ti-shield", color: "#5DCAA5", desc: "Privacy, civil liberties, censorship resistance" },
  { key: "trust", label: "Public Trust", icon: "ti-heart-handshake", color: "#378ADD", desc: "Citizen confidence in institutions" },
  { key: "economy", label: "Economic Stability", icon: "ti-trending-up", color: "#EF9F27", desc: "Jobs, productivity, inequality" },
  { key: "stability", label: "Social Stability", icon: "ti-building-community", color: "#7F77DD", desc: "Cohesion, unrest, protests" },
  { key: "info", label: "Information Integrity", icon: "ti-news", color: "#D4537E", desc: "Misinformation, propaganda, narrative control" },
  { key: "psych", label: "Psychological Wellbeing", icon: "ti-brain", color: "#D85A30", desc: "Fear, anxiety, social cohesion" },
];

const POLICIES = [
  { key: "surveillance", label: "AI Surveillance", icon: "ti-camera", min: 0, max: 100, default: 30, desc: "Facial recognition, mass monitoring, data collection" },
  { key: "automation", label: "AI Automation", icon: "ti-robot", min: 0, max: 100, default: 40, desc: "Job replacement, industrial AI, algorithmic decisions" },
  { key: "censorship", label: "Content Moderation", icon: "ti-filter", min: 0, max: 100, default: 35, desc: "Platform controls, speech restrictions, algorithmic filtering" },
  { key: "welfare", label: "Social Safety Net", icon: "ti-home-heart", min: 0, max: 100, default: 50, desc: "UBI, retraining programs, public support" },
  { key: "regulation", label: "AI Regulation Intensity", icon: "ti-scale", min: 0, max: 100, default: 45, desc: "Oversight bodies, liability, transparency mandates" },
];

const SCENARIOS = [
  { id: "democracy", label: "Liberal Democracy", icon: "ti-flag", color: "#378ADD" },
  { id: "authoritarian", label: "Authoritarian State", icon: "ti-crown", color: "#E24B4A" },
  { id: "developing", label: "Developing Economy", icon: "ti-plant", color: "#639922" },
  { id: "crisis", label: "Climate Crisis", icon: "ti-cloud-storm", color: "#EF9F27" },
  { id: "wartime", label: "Information Warfare", icon: "ti-antenna-bars-5", color: "#D4537E" },
];

function computeMetrics(policies, scenario) {
  const { surveillance, automation, censorship, welfare, regulation } = policies;
  const s = (v) => v / 100;

  let freedom = 70 - s(surveillance) * 40 - s(censorship) * 30 + s(regulation) * 10;
  let trust = 50 - s(surveillance) * 15 + s(welfare) * 20 + s(regulation) * 15 - s(censorship) * 10;
  let economy = 50 + s(automation) * 20 - s(automation) * 15 * (1 - s(welfare)) + s(regulation) * 5;
  let stability = 60 + s(welfare) * 20 - s(automation) * 15 * (1 - s(welfare)) - s(surveillance) * 5 - s(censorship) * 8;
  let info = 70 - s(censorship) * 20 + s(regulation) * 25 - s(automation) * 10;
  let psych = 60 - s(surveillance) * 25 - s(automation) * 10 * (1 - s(welfare)) + s(welfare) * 15 - s(censorship) * 10;

  const multipliers = {
    democracy: { freedom: 1.1, trust: 1.05, info: 1.1, stability: 0.95 },
    authoritarian: { freedom: 0.6, trust: 0.75, economy: 1.1, stability: 1.15, info: 0.7, psych: 0.8 },
    developing: { economy: 0.85, welfare: 0.8, stability: 0.9, trust: 0.9 },
    crisis: { stability: 0.85, economy: 0.8, psych: 0.85, trust: 0.9 },
    wartime: { info: 0.6, trust: 0.7, psych: 0.75, freedom: 0.85 },
  };

  const m = multipliers[scenario] || {};
  const clamp = (v) => Math.min(100, Math.max(0, Math.round(v)));

  return {
    freedom: clamp(freedom * (m.freedom || 1)),
    trust: clamp(trust * (m.trust || 1)),
    economy: clamp(economy * (m.economy || 1)),
    stability: clamp(stability * (m.stability || 1)),
    info: clamp(info * (m.info || 1)),
    psych: clamp(psych * (m.psych || 1)),
  };
}

function MetricBar({ label, value, color, icon, desc }) {
  const prev = useRef(value);
  const [delta, setDelta] = useState(0);
  useEffect(() => {
    const d = value - prev.current;
    if (d !== 0) setDelta(d);
    prev.current = value;
    const t = setTimeout(() => setDelta(0), 1500);
    return () => clearTimeout(t);
  }, [value]);

  const getColor = (v) => v >= 65 ? "#1D9E75" : v >= 40 ? "#BA7517" : "#A32D2D";

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <i className={`ti ${icon}`} style={{ fontSize: 15, color, opacity: 0.9 }} aria-hidden="true" />
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {delta !== 0 && (
            <span style={{
              fontSize: 11, fontWeight: 500,
              color: delta > 0 ? "#1D9E75" : "#A32D2D",
              transition: "opacity 0.3s",
              opacity: delta !== 0 ? 1 : 0,
            }}>
              {delta > 0 ? "+" : ""}{delta}
            </span>
          )}
          <span style={{ fontSize: 14, fontWeight: 500, color: getColor(value), minWidth: 30, textAlign: "right" }}>{value}</span>
        </div>
      </div>
      <div style={{ height: 6, background: "var(--color-background-tertiary)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${value}%`,
          background: getColor(value),
          borderRadius: 3,
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1), background 0.3s",
        }} />
      </div>
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "3px 0 0" }}>{desc}</p>
    </div>
  );
}

function PolicySlider({ policy, value, onChange }) {
  const getTrackColor = (v) => v > 70 ? "#A32D2D" : v > 45 ? "#BA7517" : "#1D9E75";
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <i className={`ti ${policy.icon}`} style={{ fontSize: 14, color: "var(--color-text-secondary)" }} aria-hidden="true" />
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{policy.label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: getTrackColor(value), minWidth: 28, textAlign: "right" }}>{value}</span>
      </div>
      <input
        type="range" min={policy.min} max={policy.max} step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: getTrackColor(value) }}
        aria-label={policy.label}
      />
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "2px 0 0" }}>{policy.desc}</p>
    </div>
  );
}

function ScenarioBtn({ scenario, active, onClick }) {
  return (
    <button
      onClick={() => onClick(scenario.id)}
      style={{
        display: "flex", alignItems: "center", gap: 7, padding: "7px 12px",
        borderRadius: "var(--border-radius-md)",
        border: active ? `2px solid ${scenario.color}` : "0.5px solid var(--color-border-tertiary)",
        background: active ? `${scenario.color}18` : "var(--color-background-primary)",
        cursor: "pointer", fontSize: 12, fontWeight: active ? 500 : 400,
        color: active ? scenario.color : "var(--color-text-secondary)",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
      aria-pressed={active}
    >
      <i className={`ti ${scenario.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />
      {scenario.label}
    </button>
  );
}

function AIAdvisor({ policies, scenario, metrics }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function fetchAnalysis() {
    setLoading(true);
    setAnalysis("");
    setOpen(true);

    const scenarioLabel = SCENARIOS.find(s => s.id === scenario)?.label || scenario;
    const policyLines = POLICIES.map(p => `- ${p.label}: ${policies[p.key]}/100`).join("\n");
    const metricLines = METRICS.map(m => `- ${m.label}: ${metrics[m.key]}/100`).join("\n");

    const prompt = `You are an AI governance policy analyst. A user has configured the following governance policies in a simulation:

Scenario: ${scenarioLabel}

Policies:
${policyLines}

Resulting metrics:
${metricLines}

In 3-4 sharp paragraphs:
1. Identify the most critical trade-off visible in these metrics.
2. Name the most dangerous unintended consequence of this policy mix.
3. Suggest one concrete policy adjustment and explain why it improves the balance.
4. Give a one-sentence governance verdict (e.g. "This resembles a soft authoritarian technocracy with fragile legitimacy.").

Be direct, analytical, and reference real-world governance examples where relevant. Avoid generic statements.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "No analysis returned.";
      setAnalysis(text);
    } catch (e) {
      setAnalysis("Failed to fetch AI analysis. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={fetchAnalysis}
        style={{
          width: "100%", padding: "10px 16px",
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-md)",
          cursor: "pointer", fontSize: 13, fontWeight: 500,
          color: "var(--color-text-primary)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "background 0.2s",
        }}
      >
        <i className="ti ti-robot" style={{ fontSize: 15 }} aria-hidden="true" />
        {loading ? "Analyzing policy mix..." : "Get AI governance analysis ↗"}
      </button>

      {open && (
        <div style={{
          marginTop: 12, padding: "14px 16px",
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          fontSize: 13, lineHeight: 1.7,
          color: "var(--color-text-primary)",
        }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-secondary)" }}>
              <i className="ti ti-loader-2" style={{ fontSize: 15, animation: "spin 1s linear infinite" }} />
              Running governance model analysis...
            </div>
          ) : (
            <div style={{ whiteSpace: "pre-wrap" }}>{analysis}</div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function ConsequenceTag({ text, type }) {
  const colors = {
    positive: { bg: "#EAF3DE", text: "#3B6D11", border: "#97C459" },
    negative: { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
    neutral: { bg: "#E6F1FB", text: "#185FA5", border: "#85B7EB" },
  };
  const c = colors[type] || colors.neutral;
  return (
    <span style={{
      display: "inline-block", fontSize: 11, padding: "2px 8px",
      borderRadius: "var(--border-radius-md)",
      background: c.bg, color: c.text,
      border: `0.5px solid ${c.border}`,
      marginRight: 5, marginBottom: 5,
    }}>{text}</span>
  );
}

function computeConsequences(policies) {
  const tags = [];
  const { surveillance, automation, censorship, welfare, regulation } = policies;

  if (surveillance > 65) { tags.push({ text: "Mass surveillance", type: "negative" }); tags.push({ text: "Crime reduction", type: "positive" }); }
  if (surveillance > 80) tags.push({ text: "Chilling effect on dissent", type: "negative" });
  if (automation > 60 && welfare < 40) { tags.push({ text: "High unemployment", type: "negative" }); tags.push({ text: "Social unrest risk", type: "negative" }); }
  if (automation > 60 && welfare > 60) { tags.push({ text: "Managed transition", type: "positive" }); }
  if (automation > 50) tags.push({ text: "Productivity gains", type: "positive" });
  if (censorship > 60) { tags.push({ text: "Hate speech reduction", type: "positive" }); tags.push({ text: "Narrative control risk", type: "negative" }); }
  if (censorship > 75) tags.push({ text: "Political censorship risk", type: "negative" });
  if (welfare > 65) { tags.push({ text: "Social safety", type: "positive" }); tags.push({ text: "Fiscal pressure", type: "neutral" }); }
  if (regulation > 60) { tags.push({ text: "AI accountability", type: "positive" }); tags.push({ text: "Innovation slowdown", type: "neutral" }); }
  if (regulation < 20) { tags.push({ text: "AI proliferation", type: "neutral" }); tags.push({ text: "Uncontrolled AI risk", type: "negative" }); }
  if (surveillance < 20 && censorship < 20) tags.push({ text: "High civil liberty", type: "positive" });
  if (tags.length === 0) tags.push({ text: "Balanced configuration", type: "neutral" });

  return tags;
}

export default function GovernanceSandbox() {
  const [policyValues, setPolicyValues] = useState(
    Object.fromEntries(POLICIES.map(p => [p.key, p.default]))
  );
  const [scenario, setScenario] = useState("democracy");
  const metrics = computeMetrics(policyValues, scenario);
  const consequences = computeConsequences(policyValues);

  const overallScore = Math.round(
    (metrics.freedom + metrics.trust + metrics.economy + metrics.stability + metrics.info + metrics.psych) / 6
  );

  const getVerdict = (score) => {
    if (score >= 70) return { text: "Stable governance", color: "#1D9E75" };
    if (score >= 55) return { text: "Fragile equilibrium", color: "#BA7517" };
    if (score >= 40) return { text: "High tension", color: "#D85A30" };
    return { text: "Societal crisis risk", color: "#A32D2D" };
  };
  const verdict = getVerdict(overallScore);

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", padding: "1rem 0", maxWidth: 680 }}>
      <h2 className="sr-only">AI Governance Sandbox — interactive policy simulator</h2>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 500 }}>AI Governance Sandbox</span>
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: "var(--border-radius-md)",
            background: `${verdict.color}18`, color: verdict.color,
            border: `0.5px solid ${verdict.color}66`,
            fontWeight: 500,
          }}>{verdict.text}</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          Adjust policies and observe how society responds. No configuration is perfect.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {SCENARIOS.map(s => (
          <ScenarioBtn key={s.id} scenario={s} active={scenario === s.id} onClick={setScenario} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16, marginBottom: 20 }}>
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)", padding: "16px 18px",
        }}>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 14px", fontWeight: 500, letterSpacing: "0.03em", textTransform: "uppercase" }}>
            Policy controls
          </p>
          {POLICIES.map(p => (
            <PolicySlider
              key={p.key} policy={p}
              value={policyValues[p.key]}
              onChange={(v) => setPolicyValues(prev => ({ ...prev, [p.key]: v }))}
            />
          ))}
        </div>

        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)", padding: "16px 18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, fontWeight: 500, letterSpacing: "0.03em", textTransform: "uppercase" }}>
              Societal metrics
            </p>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 22, fontWeight: 500, color: verdict.color }}>{overallScore}</span>
              <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", display: "block" }}>overall / 100</span>
            </div>
          </div>
          {METRICS.map(m => (
            <MetricBar key={m.key} label={m.label} value={metrics[m.key]} color={m.color} icon={m.icon} desc={m.desc} />
          ))}
        </div>
      </div>

      <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)", padding: "14px 18px", marginBottom: 16,
      }}>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 10px", fontWeight: 500, letterSpacing: "0.03em", textTransform: "uppercase" }}>
          Emerging consequences
        </p>
        <div>{consequences.map((c, i) => <ConsequenceTag key={i} text={c.text} type={c.type} />)}</div>
      </div>

      <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)", padding: "14px 18px",
      }}>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 4px", fontWeight: 500, letterSpacing: "0.03em", textTransform: "uppercase" }}>
          AI policy advisor
        </p>
        <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "0 0 4px" }}>
          Claude will analyze your configuration and surface hidden trade-offs, unintended consequences, and actionable suggestions.
        </p>
        <AIAdvisor policies={policyValues} scenario={scenario} metrics={metrics} />
      </div>
    </div>
  );
}
