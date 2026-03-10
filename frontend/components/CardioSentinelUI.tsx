'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, HeartPulse, Shield, Network, ArrowLeft, Dna } from 'lucide-react';

interface CardioSentinelUIProps {
    section: string | null;
    onBack: () => void;
}

const sectionsData: Record<string, { title: string; icon: React.ReactNode; content: React.ReactNode }> = {
    about: {
        title: "About Cardio Sentinel AI",
        icon: <Brain className="w-8 h-8 text-brand-red mb-4" />,
        content: (
            <div className="space-y-4 text-sm text-foreground/80">
                <p>The next-generation AI heart monitoring and predictive cardiovascular diagnostics system.</p>
                <p>Utilizing quantum-scale neural networks to process real-time biometric data and predict anomalies before they manifest.</p>
                <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-brand-red/20 text-brand-red rounded-full text-xs">Real-time Analysis</span>
                    <span className="px-3 py-1 bg-brand-blue/20 text-brand-blue rounded-full text-xs">99.9% Accuracy</span>
                </div>
            </div>
        )
    },
    features: {
        title: "System Features",
        icon: <Activity className="w-8 h-8 text-brand-blue mb-4" />,
        content: (
            <ul className="space-y-3 text-sm text-foreground/80">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" /> Advanced ECG AI Analysis</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" /> Heart Risk Prediction Engine</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" /> Live Biomarker Tracking</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Immersive Data Visualization</li>
            </ul>
        )
    },
    technology: {
        title: "Core Technology",
        icon: <Network className="w-8 h-8 text-brand-pink mb-4" />,
        content: (
            <div className="space-y-4 text-sm text-foreground/80">
                <div className="p-3 border border-glass-border rounded-lg bg-black/40">
                    <h4 className="text-brand-pink mb-1 font-semibold flex items-center gap-2"><Dna className="w-4 h-4" /> Neural Architecture</h4>
                    <p className="text-xs">Deep learning models trained on millions of diverse cardiac signal processed waveforms.</p>
                </div>
                <div className="h-2 w-full bg-glass-border rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-brand-red via-brand-pink to-brand-blue"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    />
                </div>
            </div>
        )
    },
    howitworks: {
        title: "Workflow Protocol",
        icon: <Shield className="w-8 h-8 text-white mb-4" />,
        content: (
            <div className="relative border-l border-glass-border ml-2 pl-4 space-y-4 text-sm text-foreground/80">
                {[
                    "Upload real-time ECG telemetry",
                    "AI processes biological signals",
                    "Detect microscopic anomalies",
                    "Generate predictive health insights"
                ].map((step, i) => (
                    <div key={i} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-blue box-content border-[3px] border-black" />
                        <span className="text-white font-mono text-xs opacity-50 mr-2">0{i + 1}</span>
                        {step}
                    </div>
                ))}
            </div>
        )
    }
};

export default function CardioSentinelUI({ section, onBack }: CardioSentinelUIProps) {
    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8">
            {/* Header */}
            <motion.header
                className="flex justify-between items-start"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                <div>
                    <h1 className="text-2xl font-bold tracking-widest text-glow-red flex items-center gap-2 uppercase">
                        <HeartPulse className="text-brand-red" />
                        Cardio Sentinel
                        <span className="text-xs font-mono text-brand-blue tracking-normal ml-2 bg-brand-blue/10 px-2 py-0.5 rounded border border-brand-blue/30 text-glow-blue">AI CORE v4.0</span>
                    </h1>
                    <p className="text-xs text-foreground/50 font-mono mt-1 tracking-widest uppercase">System Status: <span className="text-brand-blue">Active Monitoring</span></p>
                </div>

                {/* Live HUD Elements */}
                <div className="flex gap-4">
                    <div className="glass-panel px-4 py-2 rounded-lg font-mono text-xs flex gap-4">
                        <div>
                            <div className="text-foreground/50">BPM</div>
                            <div className="text-brand-red text-lg font-bold text-glow-red">72<span className="animate-pulse">_</span></div>
                        </div>
                        <div>
                            <div className="text-foreground/50">SPO2</div>
                            <div className="text-brand-blue text-lg font-bold text-glow-blue">98%</div>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-end relative">
                <AnimatePresence>
                    {section && sectionsData[section] && (
                        <motion.div
                            layoutId="glass-panel"
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="glass-panel w-96 rounded-2xl p-6 pointer-events-auto relative overflow-hidden group"
                        >
                            {/* Scanline effect */}
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />

                            <button
                                onClick={onBack}
                                className="absolute top-6 right-6 text-foreground/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {sectionsData[section].icon}
                                <h2 className="text-xl font-bold mb-6 tracking-wide uppercase">{sectionsData[section].title}</h2>
                                {sectionsData[section].content}
                            </motion.div>

                            {/* Decorative corners */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-red/50 rounded-tl mt-1 ml-1" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-blue/50 rounded-br mb-1 mr-1" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Global instructions when no section is selected */}
                <AnimatePresence>
                    {!section && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center"
                        >
                            <div className="inline-block glass-panel px-6 py-3 rounded-full animate-bounce">
                                <p className="text-sm font-mono tracking-widest text-glow-blue">CLICK HEART TO INITIATE DEEP SCAN</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer / Telemetry */}
            <motion.footer
                className="text-xs font-mono text-foreground/30 flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <div>LAT: 32.4042 // LNG: -12.1932</div>
                <div>SECURE TERMINAL // UNAUTHORIZED ACCESS PROHIBITED</div>
            </motion.footer>
        </div>
    );
}
