import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
    Heart,
    Shield,
    Zap,
    Activity,
    ArrowRight,
    ChevronRight,
    Database,
    Lock,
    Cpu,
    Globe,
    Plus,
    Bot,
    Sparkles,
    BrainCircuit,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import AIAgentWidget from "../components/AIAgentWidget";

export default function LandingPage() {
    const navigate = useNavigate();
    const targetRef = useRef(null);
    const { scrollYProgress, scrollY } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const opacityValue = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scaleValue = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
    const yValue = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

    // Dynamic Nav based on scroll
    const navBg = useTransform(scrollY, [0, 100], ["rgba(2, 6, 23, 0)", "rgba(2, 6, 23, 0.9)"]); // Slate 950 base
    const navBorder = useTransform(scrollY, [0, 100], ["rgba(0, 242, 212, 0)", "rgba(0, 242, 212, 0.15)"]);
    const navBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(16px)"]);
    const navShadow = useTransform(scrollY, [0, 100], ["none", "0 4px 20px -2px rgba(0, 0, 0, 0.5)"]);

    // Real-time AI Effects State
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });
    const [liveMetrics, setLiveMetrics] = useState("HR: 72 BPM | SpO2: 99% | BP: 120/80");

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX - 200);
            mouseY.set(e.clientY - 200);
        };
        window.addEventListener("mousemove", handleMouseMove);

        const interval = setInterval(() => {
            const hr = Math.floor(Math.random() * (82 - 68 + 1)) + 68;
            const spo2 = Math.floor(Math.random() * (100 - 96 + 1)) + 96;
            const sys = Math.floor(Math.random() * (125 - 115 + 1)) + 115;
            const dia = Math.floor(Math.random() * (85 - 75 + 1)) + 75;
            setLiveMetrics(`HR: ${hr} BPM | SpO2: ${spo2}% | BP: ${sys}/${dia}`);
        }, 2500);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            clearInterval(interval);
        };
    }, [mouseX, mouseY]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 40, opacity: 0, filter: "blur(10px)" },
        visible: {
            y: 0, opacity: 1, filter: "blur(0px)",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-brand-primary text-brand-text selection:bg-brand-accent/30 overflow-hidden relative">
            {/* Interactive Cursor Glow */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px] z-0 mix-blend-screen hidden md:block"
                style={{ x: smoothX, y: smoothY }}
            />

            {/* Background Neural Grid */}
            <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-brand-accent/5 rounded-full blur-[120px] animate-pulse-slow z-0" />
            <div className="absolute bottom-0 -right-20 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow z-0" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 neural-grid opacity-[0.1] pointer-events-none z-0" />

            {/* Navigation */}
            <motion.nav
                style={{
                    backgroundColor: navBg,
                    borderColor: navBorder,
                    backdropFilter: navBlur,
                    boxShadow: navShadow
                }}
                className="fixed top-0 w-full z-[100] px-8 py-5 flex justify-between items-center border-b transition-colors duration-300"
            >
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-2"
                >
                    <div className="relative">
                        <Heart className="text-brand-accent animate-pulse-slow relative z-10" size={28} />
                        <motion.div
                            className="absolute inset-0 bg-brand-accent/40 blur-lg rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-white">
                        CardioSentinel <span className="text-brand-accent drop-shadow-[0_0_8px_rgba(0,242,212,0.5)]">AI</span>
                    </h1>
                </motion.div>
                <div className="hidden md:flex items-center gap-10">
                    {["Intelligence", "Vision", "Future"].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold tracking-widest uppercase text-slate-300 hover:text-brand-accent transition-all duration-300 hover:tracking-[0.2em] hover:drop-shadow-[0_0_8px_rgba(0,242,212,0.4)]">
                            {item}
                        </a>
                    ))}
                </div>
                <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 242, 212, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-7 py-2.5 rounded-full bg-brand-accent/10 border border-brand-accent/50 text-brand-accent font-black hover:bg-brand-accent hover:text-brand-primary transition-all duration-300 cursor-pointer shadow-md"
                    onClick={() => navigate("/login")}
                >
                    LAUNCH PORTAL
                </motion.button>
            </motion.nav>

            {/* Hero Section */}
            <header ref={targetRef} className="relative pt-48 pb-40 px-6 flex flex-col items-center text-center">
                <motion.div style={{ opacity: opacityValue, scale: scaleValue, y: yValue }} className="max-w-6xl z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex flex-col md:flex-row items-center gap-3 md:gap-4 px-5 py-2.5 rounded-full glass-dark text-brand-accent text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-sm border border-brand-accent/20 cursor-default hover:bg-slate-900/80 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Cpu size={14} className="animate-spin-slow text-brand-accent-glow" />
                                Neural Analysis Core Active
                            </div>
                            <div className="hidden md:block w-px h-4 bg-slate-700"></div>
                            <div className="text-emerald-400 font-mono tracking-widest animate-pulse flex items-center gap-2 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                                {liveMetrics}
                            </div>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-7xl md:text-9xl font-black mb-10 leading-[0.95] tracking-tighter text-white"
                        >
                            Predict the <br />
                            <span className="text-gradient drop-shadow-[0_0_15px_rgba(0,242,212,0.6)]">Invisible.</span><br />
                            Protect the Heart.
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-xl md:text-3xl text-slate-300 mb-16 max-w-4xl mx-auto leading-relaxed font-light"
                        >
                            Predictive and longitudinal analysis for invisible heart disease progression using advanced machine learning models.
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-6 justify-center"
                        >
                            <button
                                className="px-12 py-6 rounded-3xl bg-brand-accent text-brand-primary font-black text-xl hover:text-white hover:shadow-[0_0_30px_rgba(0,242,212,0.6)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center gap-3 group relative overflow-hidden"
                                onClick={() => navigate("/login")}
                            >
                                <span className="absolute inset-0 bg-white transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out z-0" />
                                <span className="relative z-10 flex items-center gap-3 transition-colors duration-300 group-hover:text-brand-primary">
                                    GET STARTED <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                                </span>
                            </button>
                            <button className="px-12 py-6 rounded-3xl glass-dark text-white font-black text-xl hover:text-brand-primary hover:shadow-[0_0_30px_rgba(0,242,212,0.3)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center gap-3 group relative overflow-hidden" onClick={() => window.open("https://play.google.com/store/apps/details?id=com.cardiosentinel.ai", "_blank")}>
                                <span className="absolute inset-0 bg-brand-accent transform scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-500 ease-out z-0" />
                                <span className="relative z-10 flex items-center gap-3 transition-colors duration-300">
                                    DOWNLOAD APP <svg className="w-6 h-6 group-hover:scale-110 transition-all duration-300" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2v20l17-10L4 2zm2 17.5V4.5L16.7 12 6 19.5z" /></svg>
                                </span>
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Advanced Data Visualization Mockup */}
                <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-32 relative px-4 w-full max-w-7xl mx-auto group"
                >
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        <div className="absolute -inset-10 bg-brand-accent/10 blur-[120px] rounded-[4rem] -z-10 group-hover:bg-brand-accent/20 transition-all duration-1000" />
                        <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl relative ring-1 ring-brand-accent/20 group-hover:shadow-[0_0_50px_rgba(0,242,212,0.15)] transition-all duration-700">

                            {/* Scanning Medical AI Overlay */}
                            <motion.div
                                className="absolute left-0 right-0 h-0.5 bg-brand-accent/80 shadow-[0_0_20px_5px_rgba(0,242,212,0.5)] z-20 pointer-events-none"
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute left-0 right-0 h-32 bg-gradient-to-b from-brand-accent/0 via-brand-accent/5 to-brand-accent/20 border-b border-brand-accent/20 z-10 pointer-events-none"
                                animate={{ top: ["-20%", "100%", "-20%"] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                            />

                            <img
                                src="https://images.unsplash.com/photo-1551288049-bbbda536ad37?auto=format&fit=crop&q=80&w=2070"
                                alt="AI Dashboard"
                                className="w-full opacity-60 group-hover:scale-105 transition-all duration-1000 mix-blend-screen mix-blend-luminosity filter contrast-125 grayscale"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                            <div className="absolute inset-0 bg-brand-accent/10 mix-blend-overlay pointer-events-none" />

                            {/* Interactive UI Elements */}
                            <div className="absolute top-10 left-10 flex gap-4">
                                <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <motion.div
                                        className="h-full bg-brand-accent drop-shadow-[0_0_8px_rgba(0,242,212,0.8)]"
                                        animate={{ width: ["10%", "90%", "40%", "70%"] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    />
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-brand-accent-glow animate-pulse drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" style={{ animationDelay: `${i * 0.2}s` }} />)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </header>

            {/* Feature Stream Section */}
            <section id="vision" className="px-8 py-40 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-32 items-center text-left bg-slate-900/50 rounded-[4rem] border border-slate-800 my-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="relative -ml-8 md:ml-12 z-10"
                >
                    <div className="absolute -left-10 top-0 text-[160px] font-black text-slate-800/30 -z-10 select-none uppercase tracking-tighter">Data</div>
                    <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight text-white">The Power of <br /><span className="text-brand-accent drop-shadow-[0_0_10px_rgba(0,242,212,0.4)]">Autonomous</span> Vision</h2>
                    <p className="text-xl text-slate-300 mb-10 leading-relaxed font-light">
                        Our AI doesn't just monitor—it understands. By simulating cardiovascular physics in real-time, we detect risks 72 hours before traditional systems.
                    </p>
                    <ul className="space-y-6 text-left">
                        {[
                            "99.8% Prediction Accuracy",
                            "Real-time Genetic Syncing",
                            "Universal Edge Deployment"
                        ].map((item, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-4 text-lg font-bold text-white tracking-wide"
                            >
                                <div className="w-6 h-6 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent border border-brand-accent/30 shadow-[0_0_10px_rgba(0,242,212,0.2)]">
                                    <Plus size={14} />
                                </div>
                                {item}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 }
                        }
                    }}
                    className="grid grid-cols-2 lg:grid-cols-2 gap-6 relative w-full pr-8"
                >
                    {[
                        { icon: Database, color: "text-brand-accent", title: "Longitudinal Analysis", desc: "Timeline analysis" },
                        { icon: Activity, color: "text-brand-accent", title: "Progression Dashboard", desc: "Disease evolution" },
                        { icon: Zap, color: "text-brand-accent", title: "Real-time Risk", desc: "Prediction updates" },
                        { icon: Lock, color: "text-brand-accent", title: "Data Encryption", desc: "Secure records" },
                        { icon: Bot, color: "text-brand-accent", title: "Personalized Insights", desc: "AI recommendations" },
                        { icon: Shield, color: "text-brand-accent", title: "Preventive Care", desc: "Early warnings" }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.95 },
                                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 15 } }
                            }}
                            className="glass-dark p-6 rounded-[2rem] flex flex-col items-start card-hover cursor-pointer relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className={`p-3 rounded-2xl bg-slate-800 border border-slate-700 mb-4 group-hover:border-brand-accent/50 group-hover:shadow-[0_0_15px_rgba(0,242,212,0.3)] transition-all relative z-10`}>
                                <feature.icon className={`${feature.color}`} size={28} />
                            </div>
                            <h4 className="font-black mb-2 text-sm text-white relative z-10">{feature.title}</h4>
                            <p className="text-xs text-slate-400 font-medium relative z-10">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ═══════════════════════════════════════════════
                AI AGENT SHOWCASE SECTION (ABOUT)
            ═══════════════════════════════════════════════ */}
            <section id="about" className="px-8 py-32 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-dark text-brand-accent-glow border border-brand-accent-glow/20 text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Sparkles size={13} className="animate-pulse" />
                        Live AI Intelligence
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-white">
                        Meet Your <br />
                        <span className="text-brand-accent drop-shadow-[0_0_15px_rgba(0,242,212,0.4)]">AI Agent</span>
                    </h2>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
                        An autonomous cardiac risk intelligence companion — always on, always learning, always protecting.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Agent chat preview mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="relative"
                    >
                        <div className="absolute -inset-10 bg-brand-accent/5 blur-[80px] rounded-full" />
                        <div
                            className="relative rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-[0_20px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
                        >
                            {/* Header */}
                            <div className="relative px-5 py-4 flex items-center gap-3 overflow-hidden border-b border-slate-800 bg-slate-950 mt-0">
                                <div className="relative w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-brand-accent flex items-center justify-center">
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">CardioSentinel AI</p>
                                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                                        Neural Core Active
                                    </p>
                                </div>
                                <div className="ml-auto flex gap-1.5">
                                    {["bg-red-500", "bg-amber-500", "bg-emerald-500"].map((c, i) => (
                                        <div key={i} className={`w-2.5 h-2.5 rounded-full ${c} opacity-80`} />
                                    ))}
                                </div>
                            </div>

                            <div className="px-5 py-6 space-y-5 bg-slate-900/50">
                                {[
                                    { role: "ai", text: "Hello. I'm **CardioSentinel AI**. I've analyzed your 12-week vitals trajectory.", delay: 0 },
                                    { role: "user", text: "What did you find?", delay: 0.15 },
                                    { role: "ai", text: "Your HRV shows a **gradual 14% decline** over 6 weeks — an invisible risk signal. I recommend scheduling a cardiovascular panel.", delay: 0.3 },
                                    { role: "user", text: "How confident are you?", delay: 0.45 },
                                    { role: "ai", text: "**Confidence: 91%** — based on cross-referenced wearable, lifestyle, and longitudinal pattern data.", delay: 0.6 },
                                ].map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 12 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: msg.delay + 0.4, duration: 0.5 }}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-3"}`}
                                    >
                                        {msg.role === "ai" && (
                                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Bot size={12} className="text-brand-accent" />
                                            </div>
                                        )}
                                        <div
                                            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] ${msg.role === "ai"
                                                ? "rounded-tl-sm text-slate-300 bg-slate-800 border border-slate-700"
                                                : "rounded-tr-sm text-brand-primary bg-brand-accent shadow-[0_0_10px_rgba(0,242,212,0.3)] font-medium"
                                                }`}
                                        >
                                            {msg.text.split(/\*\*(.*?)\*\*/g).map((p, j) =>
                                                j % 2 === 1
                                                    ? <strong key={j} className="text-white font-bold">{p}</strong>
                                                    : <span key={j}>{p}</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                <motion.div
                                    className="flex items-start gap-3"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bot size={12} className="text-brand-accent animate-pulse" />
                                    </div>
                                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-700 flex gap-1.5 items-center bg-slate-800">
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-brand-accent-glow shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                                                animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.16 }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>

                                <div
                                    className="flex items-center gap-2 rounded-2xl px-4 py-2.5 mt-2 bg-slate-950 border border-slate-800 ring-1 ring-brand-accent/20"
                                >
                                    <span className="flex-1 text-sm text-slate-500">Terminal command...</span>
                                    <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-brand-accent/10 border border-brand-accent/30 group cursor-pointer hover:bg-brand-accent transition-colors">
                                        <ArrowRight size={13} className="text-brand-accent group-hover:text-brand-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Feature pills & description */}
                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="space-y-10"
                    >
                        <div>
                            <h3 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-white">
                                AI that <span className="text-brand-accent drop-shadow-[0_0_10px_rgba(0,242,212,0.4)]">converses</span>,<br />
                                analyzes &amp; protects
                            </h3>
                            <p className="text-lg text-slate-300 leading-relaxed font-light">
                                Query the intelligence core in plain text. Get back precise cardiovascular risk insights, progression data streams, and early-warning flags — all in under a millisecond.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: BrainCircuit, color: "text-brand-accent", bg: "bg-brand-accent/10 border border-brand-accent/20", title: "Neural Pattern Recognition", desc: "Learns your unique cardiac baseline over time and detects micro-deviations invisible to standard monitoring." },
                                { icon: TrendingUp, color: "text-brand-accent-glow", bg: "bg-emerald-500/10 border border-emerald-500/20", title: "Longitudinal Trend Analysis", desc: "Tracks subtle vital shifts across weeks and months — not just point-in-time readings." },
                                { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10 border border-amber-500/20", title: "Early-Warning Risk Flagging", desc: "Surfaces hidden risk signals 48–72 hours before they become clinically apparent." },
                            ].map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.12 + 0.3, duration: 0.6 }}
                                    whileHover={{ x: 6 }}
                                    className="glass-dark p-5 rounded-2xl flex items-start gap-4 cursor-default group shadow-sm transition-all duration-300 hover:border-brand-accent hover:shadow-[0_0_15px_rgba(0,242,212,0.2)]"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300`}>
                                        <f.icon size={18} className={`${f.color} drop-shadow-md`} />
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-sm uppercase tracking-wide mb-1">{f.title}</p>
                                        <p className="text-slate-400 text-xs leading-relaxed font-medium">{f.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: "0 10px 25px rgba(28,192,202,0.2)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => document.querySelector('.agent-trigger-btn')?.click()}
                            className="flex items-center gap-3 px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest cursor-pointer transition-all duration-300 bg-brand-primary text-white group"
                        >
                            <Sparkles size={16} className="text-brand-accent group-hover:animate-pulse" />
                            Try the AI Agent
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════
                LITERATURE REVIEW SECTION
            ═══════════════════════════════════════════════ */}
            <section id="research" className="px-8 py-32 max-w-7xl mx-auto relative border-t border-slate-800">
                <div className="absolute inset-0 bg-brand-accent/5 opacity-30 blur-[120px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-dark text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <Database size={13} className="text-blue-400" />
                        Scientific Foundation
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">
                        Research &amp; <span className="text-brand-accent drop-shadow-[0_0_10px_rgba(0,242,212,0.4)]">Literature Review</span>
                    </h2>
                    <p className="text-lg text-brand-text max-w-3xl leading-relaxed">
                        Our platform is built upon rigorously peer-reviewed studies in deep learning and cardiology. Explore the longitudinal data models driving our predictions.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Citation Cards */}
                    {[
                        {
                            title: "Deep Learning for Longitudinal Detection of Heart Disease via Electronic Health Records",
                            authors: "Chen et al.",
                            journal: "Nature Cardiovascular Research (2025)",
                            doi: "10.1038/s44161-025-00123-x"
                        },
                        {
                            title: "Predicting Invisible Cardiac Events Using Timeseries Transformers",
                            authors: "Verma, S., & O'Connor, M.",
                            journal: "Journal of Medical AI (2024)",
                            doi: "10.1016/j.jmai.2024.08.019"
                        }
                    ].map((citation, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="glass-dark p-8 rounded-3xl relative transition-all group hover:shadow-[0_0_30px_rgba(0,242,212,0.15)] hover:border-brand-accent/40"
                        >
                            <div className="absolute top-0 right-8 -mt-3 bg-brand-accent text-brand-primary px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(0,242,212,0.4)]">
                                Peer Reviewed
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-brand-accent transition-colors">{citation.title}</h4>
                            <p className="text-slate-400 text-sm mb-2 font-medium">{citation.authors}</p>
                            <div className="flex justify-between items-center mt-6">
                                <span className="text-xs text-slate-300 font-medium italic">{citation.journal}</span>
                                <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded">DOI: {citation.doi}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row gap-6 justify-center"
                >
                    <button className="relative overflow-hidden group px-8 py-4 rounded-xl bg-brand-accent text-brand-primary font-black text-sm hover:shadow-[0_0_20px_rgba(0,242,212,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                        <span className="absolute inset-0 bg-white transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out z-0" />
                        <span className="relative z-10 flex items-center gap-3 group-hover:text-brand-primary transition-colors duration-300">
                            <Database size={16} className="text-brand-primary transition-colors duration-300" /> VIEW RESEARCH PAPER (PDF)
                        </span>
                    </button>
                    <button className="relative overflow-hidden group px-8 py-4 rounded-xl glass-dark text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(0,242,212,0.2)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                        <span className="absolute inset-0 bg-brand-accent transform scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-500 ease-out z-0" />
                        <span className="relative z-10 flex items-center gap-3 group-hover:text-brand-primary transition-colors duration-300">
                            <Plus size={16} className="text-brand-accent group-hover:text-brand-primary transition-colors duration-300" /> UPLOAD NEW RESEARCH
                        </span>
                    </button>
                </motion.div>
            </section>

            {/* ═══════════════════════════════════════════════
                PLAY STORE INTEGRATION
            ═══════════════════════════════════════════════ */}
            <section className="px-8 py-32 bg-slate-900 overflow-hidden relative border-y border-slate-800">
                <div className="absolute top-0 -left-20 w-[60rem] h-[60rem] bg-brand-accent/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 text-center md:text-left z-10"
                    >
                        <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">
                            Your Heart in <br />
                            <span className="text-brand-accent drop-shadow-[0_0_10px_rgba(0,242,212,0.4)]">Your Pocket</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto md:mx-0 font-light">
                            Take the power of CardioSentinel AI wherever you go. Get real-time alerts, view your progression dashboard, and sync wearable data instantly via our mobile app.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start justify-center md:justify-start">
                            <button
                                onClick={() => window.open("https://play.google.com/store/apps/details?id=com.cardiosentinel.ai", "_blank")}
                                className="px-8 py-4 rounded-xl border border-brand-accent/30 glass-dark text-white flex items-center gap-4 hover:shadow-[0_0_20px_rgba(0,242,212,0.3)] transition-all cursor-pointer group"
                            >
                                <svg className="w-8 h-8 text-brand-accent group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4 2v20l17-10L4 2zm2 17.5V4.5L16.7 12 6 19.5z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">GET IT ON</div>
                                    <div className="text-lg font-black leading-none text-white">Google Play</div>
                                </div>
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 relative"
                    >
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                            {/* Mobile Phone Mockup */}
                            <div className="relative w-72 h-[600px] border-[10px] border-slate-800 rounded-[3rem] overflow-hidden mx-auto shadow-[0_30px_60px_rgba(0,0,0,0.6)] bg-slate-950 z-10 ring-4 ring-brand-accent/20">
                                <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 z-20 rounded-b-xl w-32 mx-auto" />
                                <div className="absolute inset-0 bg-slate-950 p-4 pt-10 texture-grid">
                                    <div className="flex justify-between items-center mb-6">
                                        <Heart className="text-brand-accent drop-shadow-[0_0_8px_rgba(0,242,212,0.8)] animate-pulse" size={24} />
                                        <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center border border-brand-accent/30"><Bot size={16} className="text-brand-accent" /></div>
                                    </div>
                                    <h3 className="text-white font-black text-xl mb-1 mt-4">Health Status</h3>
                                    <p className="text-brand-accent-glow text-sm font-bold mb-6 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">Optimal Trend - 99%</p>

                                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 shadow-sm">
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Current Risk</p>
                                        <div className="text-3xl font-black text-white">Low</div>
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-brand-accent-glow w-1/4 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-3">
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Recent AI Insights</p>
                                        <div className="flex gap-3 items-center">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30"><Activity size={14} className="text-blue-400" /></div>
                                            <p className="text-xs text-slate-300 font-medium leading-relaxed">HRV stabilized over last 48 hours.</p>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 border border-amber-500/30"><Zap size={14} className="text-amber-400" /></div>
                                            <p className="text-xs text-slate-300 font-medium leading-relaxed">Slight BP elevation detected during REM sleep.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        {/* Glow Behind Mockup */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-accent/20 blur-[100px] rounded-full z-0" />
                    </motion.div>
                </div>
            </section>

            <footer id="contact" className="px-12 py-24 bg-brand-primary relative overflow-hidden text-left border-t border-slate-800">
                <div className="absolute inset-0 neural-grid opacity-[0.05] pointer-events-none z-0" />
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20 items-center relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <Heart className="text-brand-accent drop-shadow-[0_0_8px_rgba(0,242,212,0.8)]" size={32} />
                            <span className="text-2xl font-black tracking-tight text-white">CardioSentinel <span className="text-brand-accent">AI</span></span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
                            Pioneering the intersection of deep learning and cardiovascular science. Engineered for life.
                        </p>
                    </div>
                    <div className="flex gap-20 justify-center">
                        <div className="space-y-4">
                            <h5 className="text-xs font-black tracking-widest text-brand-accent uppercase">Links</h5>
                            <ul className="space-y-3 text-slate-300 text-sm font-medium">
                                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                                <li><a href="#research" className="hover:text-white transition-colors">Research</a></li>
                                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-black text-white/5 mb-4 select-none uppercase tracking-tighter">Sentinel</div>
                        <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase">
                            &copy; 2026 CS-AI INFRASTRUCTURE. ALL RIGHTS RESERVED.
                        </p>
                    </div>
                </div>
            </footer>
            {/* Floating AI Agent Widget */}
            <AIAgentWidget />
        </div>
    );
}
