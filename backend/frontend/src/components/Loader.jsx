import { motion } from "framer-motion";

export default function Loader() {
    return (
        <div className="fixed inset-0 z-[9999] bg-brand-primary flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 neural-grid opacity-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* AI Brain/Heart mixed pulse SVG */}
                <div className="w-24 h-24 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-2 bg-brand-accent/40 rounded-full animate-pulse z-0" />
                    <svg className="w-12 h-12 text-brand-accent relative z-10 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <h2 className="text-xl font-black text-white uppercase tracking-widest italic ai-glow-text mb-2 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-brand-accent animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        CardioSentinel AI
                    </h2>
                    <div className="flex gap-1 justify-center items-center">
                        <span className="text-xs text-brand-accent uppercase tracking-widest font-bold">Initializing Neural Core</span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-brand-accent font-black"
                        >...</motion.span>
                    </div>
                </motion.div>

                <div className="mt-8 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="h-full bg-brand-accent"
                    />
                </div>
            </motion.div>
        </div>
    );
}
