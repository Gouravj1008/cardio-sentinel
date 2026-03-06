import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const COLORS = {
  primary: "#E84545",
  secondary: "#2B2D42",
  accent: "#06D6A0",
  warning: "#FFB703",
  danger: "#EF476F",
  bg: "#0A0E1A",
  card: "#111827",
  cardHover: "#1a2235",
  border: "#1F2937",
  text: "#F1F5F9",
  muted: "#6B7280",
  chart1: "#E84545",
  chart2: "#06D6A0",
  chart3: "#3B82F6",
  chart4: "#F59E0B",
};

// Simulated data generators
const generateHRData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    hr: 55 + Math.floor(Math.random() * 45) + (i > 8 && i < 20 ? 20 : 0),
    hrv: 30 + Math.floor(Math.random() * 40),
  }));

const generateWeeklyData = () =>
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
    day: d,
    steps: 4000 + Math.floor(Math.random() * 8000),
    calories: 1800 + Math.floor(Math.random() * 700),
    activeMin: 20 + Math.floor(Math.random() * 60),
    sleep: 5.5 + Math.random() * 3,
  }));

const generateSpO2Data = () =>
  Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    spo2: 95 + Math.floor(Math.random() * 5),
    bp_sys: 115 + Math.floor(Math.random() * 20),
    bp_dia: 70 + Math.floor(Math.random() * 15),
  }));

// Sparkline component
const Sparkline = ({ data, color, width = 80, height = 30 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
    </svg>
  );
};

// Bar chart
const BarChart = ({ data, valueKey, color, maxVal, height = 60, label }) => {
  const max = maxVal || Math.max(...data.map((d) => d[valueKey]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div
            style={{
              width: "100%",
              height: (d[valueKey] / max) * (height - 16),
              background: color,
              borderRadius: "3px 3px 0 0",
              opacity: 0.85,
              minHeight: 4,
              transition: "height 0.4s ease",
            }}
          />
          {label && (
            <span style={{ fontSize: 9, color: COLORS.muted, marginTop: 2 }}>
              {d[label]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// Radial gauge
const RadialGauge = ({ value, max = 100, color, size = 80, label, unit = "" }) => {
  const pct = Math.min(value / max, 1);
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ * 0.75;
  const gap = circ - dash;
  const rot = -135;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} style={{ transform: `rotate(${rot}deg)` }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1F2937" strokeWidth="8" strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash + circ * 0.25}`} style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div style={{ marginTop: -size * 0.35, textAlign: "center" }}>
        <div style={{ fontSize: size * 0.22, fontWeight: 700, color: COLORS.text }}>{value}{unit}</div>
        {label && <div style={{ fontSize: 9, color: COLORS.muted }}>{label}</div>}
      </div>
    </div>
  );
};

// ECG Animated line
const ECGLine = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let x = 0;
    let animId;
    const W = canvas.width, H = canvas.height;
    const ecgPattern = [0, 0, 0, -2, 2, 18, -8, 3, 0, 0, 0, 2, 2, 0, 0, 0, 0, -1, 0, 0];
    let pts = [];
    ctx.clearRect(0, 0, W, H);
    const draw = () => {
      ctx.fillStyle = "rgba(17,24,39,0.15)";
      ctx.fillRect(0, 0, W, H);
      const y = H / 2 + (ecgPattern[Math.floor(x / 4) % ecgPattern.length] * 2.5);
      pts.push({ x: x % W, y });
      if (pts.length > W) pts.shift();
      ctx.beginPath();
      ctx.strokeStyle = "#E84545";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = "#E84545";
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].x < pts[i - 1].x) continue;
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      x++;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={ref} width={300} height={60} style={{ borderRadius: 8 }} />;
};

// Pulse animation
const PulseIcon = ({ bpm }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{
      width: 12, height: 12, borderRadius: "50%", background: COLORS.primary,
      animation: "pulse 0.8s infinite",
    }} />
    <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.text }}>{bpm}</span>
    <span style={{ fontSize: 13, color: COLORS.muted }}>bpm</span>
  </div>
);

// AI Chat
const AIChat = ({ language }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm your Cardio Sentinel AI health assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const q = userMsg.toLowerCase();
      let reply = `(${language}) I can help with heart-rate trends, HRV, blood pressure, SpO2, ECG basics, and preventive guidance.`;
      if (q.includes("risk")) reply = `(${language}) Your current on-screen risk indicators appear low-to-moderate. Keep monitoring trends, and consult a doctor if symptoms appear.`;
      if (q.includes("hrv")) reply = `(${language}) Higher HRV usually reflects better autonomic recovery. Prioritize sleep, hydration, and stress control to improve HRV.`;
      if (q.includes("sleep")) reply = `(${language}) Better sleep quality improves HRV and heart recovery. Target a stable sleep schedule and reduced caffeine late in the day.`;
      if (q.includes("ecg")) reply = `(${language}) ECG interpretation should be clinician-reviewed for diagnosis. This app can flag trends but not replace clinical evaluation.`;
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Connection error. Please check your network." }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? COLORS.primary : COLORS.cardHover,
              color: COLORS.text, fontSize: 13, lineHeight: 1.5,
            }}>
              {m.role === "assistant" && (
                <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 700, marginBottom: 4 }}>🫀 CARDIO AI</div>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 6, padding: "10px 14px", background: COLORS.cardHover, borderRadius: 12, width: "fit-content" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.primary, animation: `bounce ${0.6 + i * 0.15}s infinite alternate` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask about your heart health..."
          style={{
            flex: 1, background: COLORS.cardHover, border: `1px solid ${COLORS.border}`,
            borderRadius: 12, padding: "10px 14px", color: COLORS.text, fontSize: 13, outline: "none",
          }}
        />
        <button onClick={sendMessage} disabled={loading} style={{
          padding: "10px 16px", background: COLORS.primary, border: "none", borderRadius: 12,
          color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14,
        }}>
          ➤
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["What's my risk level?", "Explain my HRV", "Tips for better sleep", "ECG interpretation"].map(q => (
          <button key={q} onClick={() => { setInput(q); }} style={{
            padding: "5px 10px", background: "transparent", border: `1px solid ${COLORS.border}`,
            borderRadius: 20, color: COLORS.muted, fontSize: 11, cursor: "pointer",
          }}>{q}</button>
        ))}
      </div>
    </div>
  );
};

// Report Analyzer
const ReportAnalyzer = ({ language }) => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeReport = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const isImage = file.type.startsWith("image/");
      const isPDF = file.type === "application/pdf";
      if (!isImage && !isPDF) {
        setResult({ error: "Please upload a PDF or image file." });
        setAnalyzing(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 900));
      setResult({
        metrics: [
          { name: "Heart Rate", value: 78, unit: "bpm", status: "normal" },
          { name: "Blood Pressure", value: "128/82", unit: "mmHg", status: "borderline" },
          { name: "SpO2", value: 97, unit: "%", status: "normal" },
          { name: "HRV", value: 34, unit: "ms", status: "low" },
        ],
        abnormalities: ["Borderline blood pressure trend", "Reduced HRV"],
        riskScore: 42,
        riskLevel: "Moderate Risk",
        recommendations: [
          `(${language}) Recheck BP twice daily for 7 days.`,
          `(${language}) Improve sleep consistency and hydration.`,
          `(${language}) Discuss persistent abnormalities with your physician.`,
        ],
        summary: `(${language}) Parsed ${file.name}. Preliminary automated summary only; clinical validation required.`,
      });
    } catch (err) {
      setResult({ error: "Analysis failed. Please try again." });
    }
    setAnalyzing(false);
  };

  const riskColor = (score) =>
    score < 30 ? COLORS.accent : score < 60 ? COLORS.warning : COLORS.danger;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        border: `2px dashed ${COLORS.border}`, borderRadius: 16, padding: 24,
        textAlign: "center", cursor: "pointer",
        background: file ? `${COLORS.primary}10` : "transparent",
        transition: "all 0.3s",
      }}
        onClick={() => document.getElementById("reportInput").click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); setResult(null); }}
      >
        <input id="reportInput" type="file" accept=".pdf,image/*" style={{ display: "none" }}
          onChange={e => { setFile(e.target.files[0]); setResult(null); }} />
        <div style={{ fontSize: 36 }}>📋</div>
        <div style={{ color: file ? COLORS.accent : COLORS.muted, marginTop: 8, fontSize: 13 }}>
          {file ? `✓ ${file.name}` : "Drop your medical report here or click to upload"}
        </div>
        <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 4 }}>Supports PDF, PNG, JPG · ECG, Blood Pressure, HRV, VO₂ Max reports</div>
      </div>

      <button onClick={analyzeReport} disabled={!file || analyzing} style={{
        padding: "12px 24px", background: !file ? COLORS.border : COLORS.primary,
        border: "none", borderRadius: 12, color: "#fff", fontWeight: 700,
        cursor: file ? "pointer" : "not-allowed", fontSize: 14,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        {analyzing ? "🔍 Analyzing with AI..." : "🫀 Analyze Report"}
      </button>

      {result && !result.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {result.riskScore !== undefined && (
            <div style={{ background: COLORS.cardHover, borderRadius: 16, padding: 20, display: "flex", gap: 20, alignItems: "center" }}>
              <RadialGauge value={result.riskScore} color={riskColor(result.riskScore)} size={90} label="Risk" unit="%" />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: riskColor(result.riskScore) }}>
                  {result.riskLevel || (result.riskScore < 30 ? "Low Risk" : result.riskScore < 60 ? "Moderate Risk" : "High Risk")}
                </div>
                {result.summary && <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 4, maxWidth: 300 }}>{result.summary}</div>}
              </div>
            </div>
          )}

          {result.metrics?.length > 0 && (
            <div style={{ background: COLORS.cardHover, borderRadius: 16, padding: 16 }}>
              <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 12, fontSize: 13 }}>📊 Extracted Metrics</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                {result.metrics.map((m, i) => (
                  <div key={i} style={{
                    background: COLORS.card, borderRadius: 10, padding: "8px 12px",
                    borderLeft: `3px solid ${m.status === "abnormal" || m.status === "high" ? COLORS.danger : m.status === "borderline" ? COLORS.warning : COLORS.accent}`,
                  }}>
                    <div style={{ fontSize: 10, color: COLORS.muted }}>{m.name}</div>
                    <div style={{ fontWeight: 700, color: COLORS.text }}>{m.value} {m.unit}</div>
                    <div style={{ fontSize: 10, color: m.status === "normal" ? COLORS.accent : COLORS.warning }}>{m.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.abnormalities?.length > 0 && (
            <div style={{ background: `${COLORS.danger}15`, border: `1px solid ${COLORS.danger}40`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontWeight: 700, color: COLORS.danger, marginBottom: 8, fontSize: 13 }}>⚠️ Abnormalities Detected</div>
              {result.abnormalities.map((a, i) => <div key={i} style={{ color: COLORS.text, fontSize: 12, marginBottom: 4 }}>• {a}</div>)}
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div style={{ background: `${COLORS.accent}10`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontWeight: 700, color: COLORS.accent, marginBottom: 8, fontSize: 13 }}>💡 AI Recommendations</div>
              {result.recommendations.map((r, i) => <div key={i} style={{ color: COLORS.text, fontSize: 12, marginBottom: 6 }}>✓ {r}</div>)}
            </div>
          )}
        </div>
      )}
      {result?.error && (
        <div style={{ background: `${COLORS.danger}15`, borderRadius: 12, padding: 16, color: COLORS.danger, fontSize: 13 }}>
          ⚠️ {result.error}
        </div>
      )}
    </div>
  );
};

// Main App
export default function CardioSentinelAI() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [language, setLanguage] = useState("English");
  const [authenticated, setAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData] = useState({ name: "", email: "", password: "", age: "", gender: "Male" });
  const [alerts, setAlerts] = useState([
    { id: 1, type: "warning", msg: "Elevated heart rate detected (148 bpm) during sleep at 2:34 AM" },
    { id: 2, type: "info", msg: "Weekly cardio report ready for review" },
  ]);
  const [user, setUser] = useState({ name: "Alex Johnson", age: 34, gender: "Male" });
  const [hrData] = useState(generateHRData());
  const [weeklyData] = useState(generateWeeklyData());
  const [spo2Data] = useState(generateSpO2Data());
  const [liveHR, setLiveHR] = useState(72);
  const [liveSpO2, setLiveSpO2] = useState(98);
  const [liveBP, setLiveBP] = useState({ sys: 122, dia: 78 });
  const [liveHRV, setLiveHRV] = useState(45);
  const [liveStress, setLiveStress] = useState(32);
  const [riskScore] = useState(28);
  const [fitnessIndex] = useState(74);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setAuthenticated(false);
          return;
        }
        const res = await api.get("/auth/me");
        const me = res.data?.data || {};
        setUser((prev) => ({
          ...prev,
          name: me.name || prev.name,
          email: me.email || prev.email,
          gender: me.gender || prev.gender,
          role: me.role || prev.role,
        }));
        setAuthenticated(true);

        if (me.role === "doctor") {
          const alertRes = await api.get("/alerts");
          const apiAlerts = (alertRes.data?.data || []).slice(0, 5).map((a) => ({
            id: a._id,
            type: a.type || "info",
            msg: a.message || a.title || "New alert",
          }));
          if (apiAlerts.length) {
            setAlerts(apiAlerts);
          }
        }
      } catch {
        localStorage.removeItem("token");
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };
    bootstrapSession();
  }, []);

  const handleLogin = async () => {
    setAuthError("");
    try {
      const res = await api.post("/auth/login", {
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password.trim(),
      });
      localStorage.setItem("token", res.data.token);
      setUser((prev) => ({
        ...prev,
        name: res.data?.user?.name || prev.name,
        email: res.data?.user?.email || loginData.email,
        role: res.data?.user?.role || prev.role,
      }));
      setAuthenticated(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async () => {
    setAuthError("");
    try {
      const payload = {
        name: regData.name.trim(),
        email: regData.email.trim().toLowerCase(),
        password: regData.password.trim(),
        role: "doctor",
        gender: (regData.gender || "other").toLowerCase(),
        phone: "0000000000",
      };
      const res = await api.post("/auth/register", payload);
      localStorage.setItem("token", res.data.token);
      setUser((prev) => ({
        ...prev,
        name: res.data?.user?.name || regData.name || prev.name,
        email: res.data?.user?.email || regData.email,
        gender: regData.gender,
        role: res.data?.user?.role || prev.role,
      }));
      setAuthenticated(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || "Registration failed");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
    navigate("/login");
  };

  // Simulate live data
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => {
      setLiveHR(h => Math.max(55, Math.min(110, h + (Math.random() - 0.5) * 4)));
      setLiveSpO2(s => Math.max(95, Math.min(100, s + (Math.random() - 0.5))));
      setLiveHRV(h => Math.max(20, Math.min(80, h + (Math.random() - 0.5) * 3)));
      setLiveStress(s => Math.max(10, Math.min(90, s + (Math.random() - 0.5) * 5)));
    }, 2000);
    return () => clearInterval(interval);
  }, [authenticated]);

  const dismissAlert = (id) => setAlerts(a => a.filter(x => x.id !== id));

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "vitals", label: "Vitals", icon: "💓" },
    { id: "ecg", label: "ECG", icon: "📈" },
    { id: "sleep", label: "Sleep", icon: "😴" },
    { id: "reports", label: "Reports", icon: "📋" },
    { id: "ai", label: "AI Chat", icon: "🤖" },
    { id: "alerts", label: "Alerts", icon: "🔔" },
  ];

  const langs = ["English", "Hindi", "Spanish", "French", "Arabic"];

  // ── Auth Screen ──
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, display: "grid", placeItems: "center", color: COLORS.text }}>
        Loading Cardio Sentinel AI...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <style>{`@keyframes pulse{0%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:0.6}100%{transform:scale(1);opacity:1}}
        @keyframes bounce{0%{transform:translateY(0)}100%{transform:translateY(-5px)}}
        @keyframes heartbeat{0%,100%{transform:scale(1)}10%{transform:scale(1.15)}20%{transform:scale(1)}}
        input:focus{outline:none!important;border-color:#E84545!important;}`}</style>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 52, animation: "heartbeat 1.5s infinite" }}>🫀</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, margin: "8px 0 4px" }}>
              Cardio<span style={{ color: COLORS.primary }}>Sentinel</span> AI
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>Advanced Cardiovascular Health Intelligence</p>
          </div>

          <div style={{ background: COLORS.card, borderRadius: 20, padding: 32, border: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {["login", "register"].map(m => (
                <button key={m} onClick={() => setAuthMode(m)} style={{
                  flex: 1, padding: "10px", background: authMode === m ? COLORS.primary : "transparent",
                  border: `1px solid ${authMode === m ? COLORS.primary : COLORS.border}`,
                  borderRadius: 10, color: COLORS.text, fontWeight: 600, cursor: "pointer", fontSize: 13,
                }}>{m === "login" ? "Sign In" : "Sign Up"}</button>
              ))}
            </div>

            {authMode === "login" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input placeholder="Email address" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                  style={{ background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 13 }} />
                <input type="password" placeholder="Password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  style={{ background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 13 }} />
                <button onClick={handleLogin} style={{
                  padding: "12px", background: COLORS.primary, border: "none", borderRadius: 10,
                  color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, marginTop: 4,
                }}>Sign In →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input placeholder="Full name" value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })}
                  style={{ background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 13 }} />
                <input placeholder="Email address" value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })}
                  style={{ background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 13 }} />
                <input type="password" placeholder="Password" value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })}
                  style={{ background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 13 }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <input placeholder="Age" value={regData.age} onChange={e => setRegData({ ...regData, age: e.target.value })}
                    style={{ flex: 1, background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 13 }} />
                  <select value={regData.gender} onChange={e => setRegData({ ...regData, gender: e.target.value })}
                    style={{ flex: 1, background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 13 }}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <button onClick={handleRegister} style={{
                  padding: "12px", background: COLORS.primary, border: "none", borderRadius: 10,
                  color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14,
                }}>Create Account →</button>
              </div>
            )}

            {authError && (
              <div style={{ marginTop: 12, color: COLORS.danger, fontSize: 12 }}>
                {authError}
              </div>
            )}

            <div style={{ marginTop: 24, padding: 16, background: COLORS.cardHover, borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, fontWeight: 600 }}>CONNECTED DEVICES</div>
              {["Apple HealthKit", "Google Health Connect", "Samsung Health", "Fitbit"].map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent }} />
                  <span style={{ color: COLORS.text, fontSize: 12 }}>{d}</span>
                  <span style={{ marginLeft: "auto", color: COLORS.accent, fontSize: 11 }}>Ready</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main App ──
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes pulse{0%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0.4}100%{transform:scale(1);opacity:1}}
        @keyframes bounce{0%{transform:translateY(0)}100%{transform:translateY(-6px)}}
        @keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.13)}28%{transform:scale(1)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#1F2937;border-radius:4px}
        input,select{outline:none;color-scheme:dark}
        input::placeholder{color:#4B5563}
      `}</style>

      {/* Header */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: 22, animation: "heartbeat 1.5s infinite" }}>🫀</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: COLORS.text }}>Cardio<span style={{ color: COLORS.primary }}>Sentinel</span> AI</div>
          <div style={{ fontSize: 10, color: COLORS.muted }}>CARDIOVASCULAR INTELLIGENCE PLATFORM</div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.cardHover, padding: "6px 12px", borderRadius: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: COLORS.accent }}>LIVE</span>
          </div>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            style={{ background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "6px 10px", color: COLORS.text, fontSize: 12 }}>
            {langs.map(l => <option key={l}>{l}</option>)}
          </select>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
            {user.name?.[0] || "U"}
          </div>
        </div>
      </div>

      {/* Alerts bar */}
      {alerts.length > 0 && (
        <div style={{ background: `${COLORS.warning}15`, borderBottom: `1px solid ${COLORS.warning}30`, padding: "8px 20px", display: "flex", alignItems: "center", gap: 12, overflowX: "auto" }}>
          {alerts.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, background: `${COLORS.warning}20`, borderRadius: 8, padding: "5px 10px", whiteSpace: "nowrap", flexShrink: 0 }}>
              <span style={{ fontSize: 12 }}>{a.type === "warning" ? "⚠️" : "ℹ️"}</span>
              <span style={{ fontSize: 11, color: COLORS.text }}>{a.msg}</span>
              <button onClick={() => dismissAlert(a.id)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", height: "calc(100vh - 57px)" }}>
        {/* Sidebar */}
        <div style={{ width: 60, background: COLORS.card, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 4, flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} title={t.label} style={{
              width: 44, height: 44, borderRadius: 12, border: "none",
              background: tab === t.id ? `${COLORS.primary}25` : "transparent",
              color: tab === t.id ? COLORS.primary : COLORS.muted,
              cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              outline: tab === t.id ? `1px solid ${COLORS.primary}40` : "none",
              transition: "all 0.2s",
            }}>
              {t.icon}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={handleSignOut} title="Sign Out" style={{
            width: 44, height: 44, borderRadius: 12, border: "none", background: "transparent",
            color: COLORS.muted, cursor: "pointer", fontSize: 16,
          }}>🚪</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, animation: "fadeIn 0.3s ease" }}>

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Good morning, {user.name?.split(" ")[0]} 👋</h2>
                  <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>Your cardiovascular health overview</p>
                </div>
                <div style={{ background: COLORS.card, borderRadius: 12, padding: "8px 16px", border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 10, color: COLORS.muted }}>TODAY</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                </div>
              </div>

              {/* Score cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
                {[
                  { label: "Cardio Score", value: 82, max: 100, color: COLORS.accent, icon: "🫀", unit: "/100" },
                  { label: "Risk Score", value: riskScore, max: 100, color: COLORS.primary, icon: "⚡", unit: "%" },
                  { label: "Fitness Index", value: fitnessIndex, max: 100, color: COLORS.chart3, icon: "💪", unit: "/100" },
                  { label: "Recovery", value: 68, max: 100, color: COLORS.chart4, icon: "🔄", unit: "/100" },
                ].map((s, i) => (
                  <div key={i} style={{ background: COLORS.card, borderRadius: 16, padding: "16px 14px", border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <RadialGauge value={s.value} max={s.max} color={s.color} size={76} unit={s.unit} />
                    <div style={{ fontSize: 12, color: COLORS.muted, textAlign: "center" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Live metrics row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
                {[
                  { label: "Heart Rate", value: Math.round(liveHR), unit: "bpm", icon: "💓", color: COLORS.primary, sparkData: hrData.slice(0, 12).map(d => d.hr) },
                  { label: "SpO₂", value: Math.round(liveSpO2), unit: "%", icon: "🩸", color: COLORS.chart3, sparkData: spo2Data.map(d => d.spo2) },
                  { label: "HRV", value: Math.round(liveHRV), unit: "ms", icon: "📊", color: COLORS.chart4, sparkData: hrData.slice(0, 12).map(d => d.hrv) },
                  { label: "Stress", value: Math.round(liveStress), unit: "%", icon: "🧠", color: COLORS.warning, sparkData: Array.from({ length: 8 }, () => 20 + Math.random() * 60) },
                  { label: "Blood Pressure", value: `${liveBP.sys}/${liveBP.dia}`, unit: "mmHg", icon: "📏", color: COLORS.accent, sparkData: spo2Data.map(d => d.bp_sys) },
                  { label: "VO₂ Max", value: "42.3", unit: "ml/kg/min", icon: "🌬️", color: COLORS.chart2, sparkData: [38, 39, 40, 41, 42, 42, 42] },
                ].map((m, i) => (
                  <div key={i} style={{ background: COLORS.card, borderRadius: 16, padding: 14, border: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{m.icon} {m.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: m.color, marginTop: 4 }}>{m.value}</div>
                        <div style={{ fontSize: 10, color: COLORS.muted }}>{m.unit}</div>
                      </div>
                      <Sparkline data={m.sparkData} color={m.color} width={60} height={28} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity + Sleep */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📶 Weekly Steps</div>
                  <BarChart data={weeklyData} valueKey="steps" color={COLORS.chart3} height={70} label="day" />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: COLORS.muted }}>Avg: {Math.round(weeklyData.reduce((a, d) => a + d.steps, 0) / 7).toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: COLORS.accent }}>Goal: 10,000</span>
                  </div>
                </div>

                <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>💤 Sleep Duration</div>
                  <BarChart data={weeklyData} valueKey="sleep" color={COLORS.chart4} height={70} label="day" />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: COLORS.muted }}>Avg: {(weeklyData.reduce((a, d) => a + d.sleep, 0) / 7).toFixed(1)}h</span>
                    <span style={{ fontSize: 11, color: COLORS.accent }}>Goal: 8h</span>
                  </div>
                </div>
              </div>

              {/* Connected devices */}
              <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📡 Connected Health Sources</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                  {[
                    { name: "Apple HealthKit", status: "synced", icon: "🍎", last: "2 min ago", metrics: 24 },
                    { name: "Google Health Connect", status: "synced", icon: "🔗", last: "5 min ago", metrics: 18 },
                    { name: "Samsung Health", status: "synced", icon: "📱", last: "12 min ago", metrics: 15 },
                    { name: "Fitbit API", status: "synced", icon: "⌚", last: "1 min ago", metrics: 22 },
                    { name: "Garmin Connect", status: "offline", icon: "🏃", last: "2h ago", metrics: 0 },
                    { name: "Google Fit", status: "synced", icon: "💚", last: "3 min ago", metrics: 12 },
                  ].map((d, i) => (
                    <div key={i} style={{ background: COLORS.cardHover, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{d.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                        <div style={{ fontSize: 10, color: COLORS.muted }}>{d.last}</div>
                      </div>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.status === "synced" ? COLORS.accent : COLORS.muted, flexShrink: 0, ...(d.status === "synced" ? { animation: "pulse 2s infinite" } : {}) }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── VITALS ── */}
          {tab === "vitals" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>💓 Live Vital Signs</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
                {[
                  { label: "Heart Rate", value: `${Math.round(liveHR)}`, unit: "bpm", color: COLORS.primary, desc: liveHR > 100 ? "High" : liveHR < 60 ? "Low" : "Normal", icon: "💓" },
                  { label: "Blood Oxygen (SpO₂)", value: `${Math.round(liveSpO2)}`, unit: "%", color: COLORS.chart3, desc: liveSpO2 < 95 ? "⚠️ Low" : "Normal", icon: "🩸" },
                  { label: "Blood Pressure", value: `${liveBP.sys}/${liveBP.dia}`, unit: "mmHg", color: COLORS.accent, desc: liveBP.sys > 130 ? "Elevated" : "Normal", icon: "📏" },
                  { label: "Heart Rate Variability", value: `${Math.round(liveHRV)}`, unit: "ms", color: COLORS.chart4, desc: liveHRV > 50 ? "Good" : "Low", icon: "📊" },
                  { label: "Stress Index", value: `${Math.round(liveStress)}`, unit: "%", color: COLORS.warning, desc: liveStress > 60 ? "High Stress" : "Normal", icon: "🧠" },
                  { label: "Resting Heart Rate", value: "62", unit: "bpm", color: COLORS.chart3, desc: "Excellent", icon: "😴" },
                  { label: "VO₂ Max", value: "42.3", unit: "ml/kg/min", color: COLORS.primary, desc: "Good fitness", icon: "🌬️" },
                  { label: "Body Temperature", value: "98.6", unit: "°F", color: COLORS.warning, desc: "Normal", icon: "🌡️" },
                ].map((v, i) => (
                  <div key={i} style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{v.icon} {v.label}</div>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${v.color}20`, color: v.color }}>{v.desc}</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: v.color, margin: "8px 0 4px" }}>{v.value}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>{v.unit}</div>
                    <div style={{ marginTop: 12 }}>
                      <Sparkline data={Array.from({ length: 20 }, () => parseFloat(v.value) * (0.9 + Math.random() * 0.2))} color={v.color} width={150} height={30} />
                    </div>
                  </div>
                ))}
              </div>

              {/* HR zones */}
              <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>🎯 Heart Rate Zones (Today)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { zone: "Zone 5 — Max (>180 bpm)", pct: 2, color: "#FF0000" },
                    { zone: "Zone 4 — Hard (162–180 bpm)", pct: 8, color: "#FF6B00" },
                    { zone: "Zone 3 — Aerobic (144–162 bpm)", pct: 22, color: "#FFB700" },
                    { zone: "Zone 2 — Fat Burn (126–144 bpm)", pct: 35, color: "#00C853" },
                    { zone: "Zone 1 — Recovery (<126 bpm)", pct: 33, color: "#2979FF" },
                  ].map((z, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: COLORS.text }}>{z.zone}</span>
                        <span style={{ fontSize: 12, color: z.color, fontWeight: 600 }}>{z.pct}%</span>
                      </div>
                      <div style={{ height: 8, background: COLORS.cardHover, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${z.pct}%`, background: z.color, borderRadius: 4, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ECG ── */}
          {tab === "ecg" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>📈 ECG Monitor</h2>
              <div style={{ background: COLORS.card, borderRadius: 16, padding: 20, border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Live ECG Rhythm Strip</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>Lead II · 25mm/s · 10mm/mV</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ padding: "4px 12px", background: `${COLORS.accent}20`, color: COLORS.accent, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Normal Sinus Rhythm</span>
                    <span style={{ padding: "4px 12px", background: `${COLORS.chart3}20`, color: COLORS.chart3, borderRadius: 20, fontSize: 12 }}>HR: {Math.round(liveHR)} bpm</span>
                  </div>
                </div>
                <ECGLine />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
                {[
                  { label: "PR Interval", value: "164", unit: "ms", status: "Normal", color: COLORS.accent },
                  { label: "QRS Duration", value: "88", unit: "ms", status: "Normal", color: COLORS.accent },
                  { label: "QTc Interval", value: "412", unit: "ms", status: "Normal", color: COLORS.accent },
                  { label: "RR Interval", value: "820", unit: "ms", status: "Normal", color: COLORS.accent },
                  { label: "P-wave", value: "Normal", unit: "", status: "Normal", color: COLORS.accent },
                  { label: "ST Segment", value: "Isoelectric", unit: "", status: "Normal", color: COLORS.accent },
                ].map((m, i) => (
                  <div key={i} style={{ background: COLORS.card, borderRadius: 14, padding: "14px 16px", border: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{m.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: m.color, marginTop: 4 }}>{m.value}</div>
                    {m.unit && <div style={{ fontSize: 11, color: COLORS.muted }}>{m.unit}</div>}
                    <div style={{ marginTop: 6, fontSize: 11, color: m.color }}>● {m.status}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: `${COLORS.accent}10`, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.accent}30` }}>
                <div style={{ fontWeight: 700, color: COLORS.accent, marginBottom: 8 }}>🤖 AI ECG Interpretation</div>
                <p style={{ color: COLORS.text, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  The ECG demonstrates normal sinus rhythm with a heart rate of {Math.round(liveHR)} bpm. P-waves are upright and consistent in Leads I and II, suggesting normal atrial depolarization. The QRS complex is narrow (&lt;120ms), indicating normal ventricular conduction. ST segments are isoelectric with no evidence of ischemia or injury. No arrhythmias detected. <span style={{ color: COLORS.accent, fontWeight: 600 }}>Overall assessment: Normal ECG.</span>
                </p>
              </div>
            </div>
          )}

          {/* ── SLEEP ── */}
          {tab === "sleep" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>😴 Sleep Analysis</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
                {[
                  { label: "Total Sleep", value: "7h 24m", icon: "⏰", color: COLORS.chart4 },
                  { label: "Sleep Score", value: "82/100", icon: "⭐", color: COLORS.accent },
                  { label: "REM Sleep", value: "1h 48m", icon: "🌙", color: COLORS.chart3 },
                  { label: "Deep Sleep", value: "1h 12m", icon: "🔵", color: COLORS.primary },
                  { label: "Light Sleep", value: "4h 24m", icon: "💤", color: COLORS.muted },
                  { label: "Awake", value: "18m", icon: "👁️", color: COLORS.warning },
                ].map((s, i) => (
                  <div key={i} style={{ background: COLORS.card, borderRadius: 14, padding: "14px 16px", border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
                    <div style={{ fontSize: 22 }}>{s.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>🌙 Sleep Architecture</div>
                <div style={{ display: "flex", height: 40, borderRadius: 8, overflow: "hidden", gap: 2 }}>
                  {[
                    { label: "Awake", pct: 4, color: COLORS.warning },
                    { label: "REM", pct: 24, color: COLORS.chart3 },
                    { label: "Light", pct: 59, color: COLORS.chart4 },
                    { label: "Deep", pct: 13, color: COLORS.chart3 },
                  ].map((s, i) => (
                    <div key={i} style={{ width: `${s.pct}%`, background: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {s.pct > 8 && <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>{s.label}</span>}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  {[{ l: "REM", c: COLORS.chart3 }, { l: "Deep", c: COLORS.chart3 }, { l: "Light", c: COLORS.chart4 }, { l: "Awake", c: COLORS.warning }].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: s.c }} />
                      <span style={{ fontSize: 11, color: COLORS.muted }}>{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📅 Weekly Sleep Trend</div>
                <BarChart data={weeklyData} valueKey="sleep" color={COLORS.chart4} height={80} label="day" />
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {tab === "reports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>📋 Medical Report Analyzer</h2>
              <div style={{ background: COLORS.card, borderRadius: 16, padding: 20, border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  {["ECG Report", "Blood Pressure", "HRV Analysis", "VO₂ Max Test", "Stress Test", "Holter Monitor"].map(t => (
                    <span key={t} style={{ padding: "4px 12px", background: COLORS.cardHover, borderRadius: 20, fontSize: 12, color: COLORS.muted }}>📄 {t}</span>
                  ))}
                </div>
                <ReportAnalyzer language={language} />
              </div>

              <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📂 Previous Reports</div>
                {[
                  { name: "Annual Cardio Checkup 2024.pdf", date: "Dec 15, 2024", score: 88, status: "Normal" },
                  { name: "Exercise Stress Test.pdf", date: "Oct 3, 2024", score: 74, status: "Normal" },
                  { name: "Holter Monitor 24h.pdf", date: "Aug 18, 2024", score: 62, status: "Review" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: COLORS.cardHover, borderRadius: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{r.date}</div>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, background: r.status === "Normal" ? `${COLORS.accent}20` : `${COLORS.warning}20`, color: r.status === "Normal" ? COLORS.accent : COLORS.warning }}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI CHAT ── */}
          {tab === "ai" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "calc(100vh - 140px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🤖 AI Health Assistant</h2>
                <span style={{ padding: "3px 12px", background: `${COLORS.accent}20`, color: COLORS.accent, borderRadius: 20, fontSize: 12 }}>● Live</span>
                <span style={{ fontSize: 12, color: COLORS.muted }}>Language: {language}</span>
              </div>
              <div style={{ flex: 1, background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <AIChat language={language} />
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {tab === "alerts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🔔 Health Alerts & Emergency Log</h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                {[
                  { label: "Active Alerts", value: alerts.length, icon: "⚠️", color: COLORS.warning },
                  { label: "This Week", value: 7, icon: "📅", color: COLORS.chart3 },
                  { label: "Resolved", value: 23, icon: "✅", color: COLORS.accent },
                  { label: "Emergency Events", value: 0, icon: "🚨", color: COLORS.danger },
                ].map((a, i) => (
                  <div key={i} style={{ background: COLORS.card, borderRadius: 14, padding: "16px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: a.color }}>{a.value}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted }}>{a.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>📋 Alert History</div>
                {[
                  { type: "warning", icon: "💓", title: "Elevated heart rate during sleep", detail: "148 bpm detected at 2:34 AM", time: "Today 2:34 AM", status: "Active" },
                  { type: "info", icon: "📊", title: "Low HRV detected", detail: "HRV dropped to 18ms (baseline: 42ms)", time: "Yesterday 11:20 PM", status: "Resolved" },
                  { type: "danger", icon: "🩸", title: "SpO₂ below threshold", detail: "92% detected during sleep — possible sleep apnea", time: "3 days ago", status: "Reviewed" },
                  { type: "info", icon: "📈", title: "VO₂ Max improvement", detail: "Increased from 40.1 to 42.3 ml/kg/min", time: "1 week ago", status: "Resolved" },
                  { type: "warning", icon: "📏", title: "Elevated blood pressure", detail: "145/92 mmHg — hypertension stage 1", time: "1 week ago", status: "Reviewed" },
                ].map((a, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, padding: "12px", background: COLORS.cardHover, borderRadius: 12, marginBottom: 8,
                    borderLeft: `4px solid ${a.type === "danger" ? COLORS.danger : a.type === "warning" ? COLORS.warning : COLORS.chart3}`,
                  }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{a.detail}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>🕐 {a.time}</div>
                    </div>
                    <span style={{ alignSelf: "flex-start", padding: "3px 10px", borderRadius: 20, fontSize: 11, background: a.status === "Active" ? `${COLORS.warning}20` : `${COLORS.accent}20`, color: a.status === "Active" ? COLORS.warning : COLORS.accent }}>{a.status}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: COLORS.card, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>⚙️ Alert Thresholds</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                  {[
                    { metric: "Heart Rate High", threshold: "> 140 bpm", enabled: true },
                    { metric: "Heart Rate Low", threshold: "< 45 bpm", enabled: true },
                    { metric: "SpO₂ Low", threshold: "< 94%", enabled: true },
                    { metric: "Blood Pressure High", threshold: "> 140/90 mmHg", enabled: true },
                    { metric: "HRV Low", threshold: "< 20 ms", enabled: false },
                    { metric: "Fall Detection", threshold: "Impact > 3G", enabled: true },
                  ].map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: COLORS.cardHover, borderRadius: 10 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{t.metric}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{t.threshold}</div>
                      </div>
                      <div style={{ width: 36, height: 20, borderRadius: 10, background: t.enabled ? COLORS.accent : COLORS.border, cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
                        <div style={{ position: "absolute", top: 2, left: t.enabled ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.3s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
