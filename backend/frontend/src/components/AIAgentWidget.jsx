import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Minimize2, Maximize2, Sparkles } from "lucide-react";
import api from "../api/api";
import { useParams, useLocation } from "react-router-dom";

// ─── Predefined AI conversation pairs ────────────────────────────────────────
const INITIAL_MESSAGES = [
    {
        role: "ai",
        text: "Hello. I'm **CardioSentinel AI** — your autonomous cardiac risk intelligence agent. I process real-time telemetry and calculate longitudinal risk scores. How can I assist you today?",
    },
];

// Helper to formulate a response based on real data
const formulateRealDataResponse = (query, records) => {
    const lowerQuery = query.toLowerCase();

    // If we have no real data, fall back to safe responses
    if (!records || records.length === 0) {
        return "I am currently monitoring the live telemetry feed. I need more baseline data before I can calculate a definitive risk trajectory.";
    }

    const latestRecord = records[0]; // Assuming sorted by newest first
    const analysis = latestRecord.aiAnalysis;

    if (!analysis) {
        return "The predictive engine is currently analyzing the latest telemetry batch. Please check back in a moment for the updated risk score.";
    }

    if (lowerQuery.includes("risk") || lowerQuery.includes("score")) {
        return `Based on the latest algorithmic evaluation, the current **Risk Score is ${analysis.riskScore}/100**. This calculation has a confidence level of ${analysis.confidence}%.`;
    }

    if (lowerQuery.includes("trend") || lowerQuery.includes("progression")) {
        return `My engine detected the following trend: **"${analysis.trendDetected}"**`;
    }

    if (lowerQuery.includes("factor") || lowerQuery.includes("anomaly")) {
        if (analysis.riskFactors.length > 0) {
            return `I have flagged the following primary risk factors based on recent vitals: **${analysis.riskFactors.join(", ")}**.`;
        } else {
            return "No critical cardiovascular risk factors are flagged in the current datastream.";
        }
    }

    if (lowerQuery.includes("recommend")) {
        if (analysis.recommendations.length > 0) {
            return `Based on standard clinical guidelines applied to this data: **${analysis.recommendations.join(" ")}**`;
        } else {
            return "Routine monitoring is recommended. No immediate acute interventions are flagged.";
        }
    }

    // Default fallback summarizing the state
    return `Current Engine Status: Risk Score **${analysis.riskScore}/100**. Trend: **${analysis.trendDetected}**. Ask me specifically about 'risk', 'trends', 'factors', or 'recommendations'.`;
};

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(text, speed = 22, active = false) {
    const [displayed, setDisplayed] = useState("");
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!active) return;
        setDisplayed("");
        setDone(false);
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(interval);
                setDone(true);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, active, speed]);

    return { displayed, done };
}

// ─── Render bold markdown inline ─────────────────────────────────────────────
function RichText({ text }) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
        <span>
            {parts.map((p, i) =>
                i % 2 === 1 ? (
                    <strong key={i} className="text-brand-accent font-bold">{p}</strong>
                ) : (
                    <span key={i}>{p}</span>
                )
            )}
        </span>
    );
}

// ─── Single AI message with typewriter ───────────────────────────────────────
function AIMessage({ text, animate }) {
    const { displayed, done } = useTypewriter(text, 18, animate);
    const shown = animate ? displayed : text;

    return (
        <div className="flex items-start gap-3 group">
            <div className="relative flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center">
                    <Bot size={14} className="text-brand-accent" />
                </div>
                <motion.div
                    className="absolute inset-0 rounded-full bg-brand-accent/20"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-200 leading-relaxed border border-white/5">
                    <RichText text={shown} />
                    {animate && !done && (
                        <span className="inline-block w-0.5 h-3.5 bg-brand-accent ml-0.5 animate-pulse align-middle" />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── User message bubble ──────────────────────────────────────────────────────
function UserMessage({ text }) {
    return (
        <div className="flex justify-end">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm bg-brand-accent/15 border border-brand-accent/20 text-sm text-slate-100 leading-relaxed">
                {text}
            </div>
        </div>
    );
}

// ─── Thinking dots ────────────────────────────────────────────────────────────
function ThinkingDots() {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-brand-accent" />
            </div>
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5 flex gap-1.5 items-center h-10">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-brand-accent"
                        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.16 }}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Suggested prompts ────────────────────────────────────────────────────────
const SUGGESTIONS = [
    "Analyze my cardiac risk",
    "What does HRV tell you?",
    "Show progression trends",
    "Any anomalies detected?",
];

// ─── Main Widget ──────────────────────────────────────────────────────────────
export default function AIAgentWidget() {
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState("");
    const [thinking, setThinking] = useState(false);
    const [latestAI, setLatestAI] = useState(null);
    const [responseIdx, setResponseIdx] = useState(0);
    const { id: patientId } = useParams();
    const location = useLocation();

    // Store fetched context
    const [patientRecords, setPatientRecords] = useState([]);
    const bottomRef = useRef(null);

    // Fetch context on mount or when route changes
    useEffect(() => {
        const fetchContext = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setPatientRecords([]);
                return;
            }
            try {
                // If we are on a specific patient's page
                if (location.pathname.includes('/patient/') && patientId) {
                    const res = await api.get(`/health/records?patientId=${patientId}`);
                    setPatientRecords(res.data.data);
                } else {
                    // If on dashboard, just fetch general latest records
                    const res = await api.get(`/health/records`);
                    setPatientRecords(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch context for AI Agent", err);
            }
        };
        fetchContext();
    }, [location.pathname, patientId]);

    useEffect(() => {
        if (open && !minimized) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, thinking, open, minimized]);

    const sendMessage = (text) => {
        const query = (text || input).trim();
        if (!query) return;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: query }]);
        setThinking(true);

        const delay = 800 + Math.random() * 400; // Faster feel
        setTimeout(() => {
            const response = formulateRealDataResponse(query, patientRecords);
            const msgId = Date.now();
            setLatestAI(msgId);
            setResponseIdx((i) => i + 1);
            setMessages((prev) => [...prev, { role: "ai", text: response, id: msgId }]);
            setThinking(false);
        }, delay);
    };

    return (
        <>
            {/* ── Floating Trigger Button ── */}
            <motion.button
                onClick={() => { setOpen(true); setMinimized(false); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                className={`fixed bottom-8 right-8 z-[200] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-sm cursor-pointer shadow-2xl transition-all duration-500 ${open && !minimized ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                style={{
                    background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                    boxShadow: "0 0 30px rgba(14,165,233,0.4), 0 8px 32px rgba(0,0,0,0.5)",
                }}
            >
                {/* Pulse ring */}
                <motion.span
                    className="absolute inset-0 rounded-2xl"
                    animate={{ boxShadow: ["0 0 0 0 rgba(14,165,233,0.5)", "0 0 0 12px rgba(14,165,233,0)"] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                />
                <Sparkles size={18} className="text-white" />
                <span className="text-white tracking-wide">Ask CardioAI</span>
                {/* Status dot */}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </motion.button>

            {/* ── Chat Panel ── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="agent-panel"
                        initial={{ opacity: 0, y: 60, scale: 0.92 }}
                        animate={minimized
                            ? { opacity: 1, y: 0, scale: 1, height: "auto" }
                            : { opacity: 1, y: 0, scale: 1 }
                        }
                        exit={{ opacity: 0, y: 60, scale: 0.92 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed bottom-8 right-8 z-[300] w-96 max-w-[calc(100vw-2rem)] rounded-3xl overflow-hidden shadow-2xl"
                        style={{
                            background: "rgba(2,6,23,0.95)",
                            backdropFilter: "blur(24px)",
                            border: "1px solid rgba(14,165,233,0.2)",
                            boxShadow: "0 0 0 1px rgba(14,165,233,0.1), 0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(14,165,233,0.08)",
                        }}
                    >
                        {/* ── Header ── */}
                        <div
                            className="relative px-5 py-4 flex items-center justify-between overflow-hidden"
                            style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(99,102,241,0.08) 100%)" }}
                        >
                            {/* Scanline */}
                            <motion.div
                                className="absolute left-0 right-0 h-px"
                                style={{ background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.6), transparent)" }}
                                animate={{ top: ["0%", "100%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="flex items-center gap-3 z-10">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center">
                                        <Bot size={18} className="text-brand-accent" />
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#020617]" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm tracking-wide">CardioSentinel AI</p>
                                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                        Neural Core Active
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 z-10">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setMinimized((m) => !m)}
                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setOpen(false)}
                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                >
                                    <X size={13} />
                                </motion.button>
                            </div>
                        </div>

                        {/* ── Body ── */}
                        <AnimatePresence>
                            {!minimized && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Messages */}
                                    <div
                                        className="px-4 py-5 space-y-4 overflow-y-auto"
                                        style={{ maxHeight: "340px", scrollbarWidth: "none" }}
                                    >
                                        {messages.map((msg, i) =>
                                            msg.role === "ai" ? (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                >
                                                    <AIMessage
                                                        text={msg.text}
                                                        animate={msg.id === latestAI}
                                                    />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 12, x: 20 }}
                                                    animate={{ opacity: 1, y: 0, x: 0 }}
                                                    transition={{ duration: 0.35 }}
                                                >
                                                    <UserMessage text={msg.text} />
                                                </motion.div>
                                            )
                                        )}
                                        {thinking && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <ThinkingDots />
                                            </motion.div>
                                        )}
                                        <div ref={bottomRef} />
                                    </div>

                                    {/* Suggestions */}
                                    {messages.length <= 1 && (
                                        <div className="px-4 pb-3 flex flex-wrap gap-2">
                                            {SUGGESTIONS.map((s) => (
                                                <motion.button
                                                    key={s}
                                                    whileHover={{ scale: 1.04 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={() => sendMessage(s)}
                                                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide cursor-pointer transition-all duration-200"
                                                    style={{
                                                        background: "rgba(14,165,233,0.08)",
                                                        border: "1px solid rgba(14,165,233,0.2)",
                                                        color: "#7dd3fc",
                                                    }}
                                                >
                                                    {s}
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Input */}
                                    <div
                                        className="px-4 pb-4 pt-1"
                                        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                                    >
                                        <div
                                            className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
                                            style={{
                                                background: "rgba(255,255,255,0.04)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                            }}
                                        >
                                            <input
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                                placeholder="Ask the AI agent…"
                                                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => sendMessage()}
                                                disabled={!input.trim() || thinking}
                                                className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 disabled:opacity-30"
                                                style={{
                                                    background: input.trim() && !thinking
                                                        ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                                                        : "rgba(255,255,255,0.06)",
                                                }}
                                            >
                                                <Send size={14} className="text-white" />
                                            </motion.button>
                                        </div>
                                        <p className="text-[9px] text-slate-700 text-center mt-2 uppercase tracking-widest font-bold">
                                            Risk insights only · Not medical advice
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
