import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../ECGAnimations.css";

export default function Signup() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "doctor", // Default role
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = {
                ...formData,
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                password: formData.password.trim(),
            };
            const res = await api.post("/auth/register", payload);
            localStorage.setItem("token", res.data.token);
            setSuccess(true);
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background AI Visuals */}
            <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-brand-accent/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-0 -right-20 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            <div className="neural-grid absolute inset-0 opacity-[0.1] pointer-events-none" />

            {/* Floating Particles/Waves placeholder */}
            <motion.div
                className="absolute inset-0 z-0 opacity-10 select-none pointer-events-none"
                initial={{ backgroundPosition: "0 0" }}
                animate={{ backgroundPosition: ["0px 0px", "100px 100px"] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                style={{
                    backgroundImage: "radial-gradient(circle at center, rgba(14,165,233,0.3) 0%, transparent 8%)",
                    backgroundSize: "40px 40px"
                }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass-dark w-full max-w-md p-10 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-800 relative z-10 ring-1 ring-white/5"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        {/* AI Heart ECG SVG */}
                        <div className="relative w-20 h-20">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-brand-accent fill-current drop-shadow-[0_0_10px_rgba(0,242,212,0.3)]">
                                <path d="M50 88.9L44.1 83.6C17.6 59.4 0 43.4 0 24C0 10.8 10.4 0.4 23.6 0.4C31.1 0.4 38.3 3.9 42.9 9.3C45.6 12.5 48.1 16.2 50 20.3C51.9 16.2 54.4 12.5 57.1 9.3C61.7 3.9 68.9 0.4 76.4 0.4C89.6 0.4 100 10.8 100 24C100 43.4 82.4 59.4 55.9 83.7L50 88.9Z" fillOpacity="0.1" />
                            </svg>
                            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full">
                                <path
                                    d="M10 50 L30 50 L35 30 L45 70 L55 20 L65 80 L70 50 L90 50"
                                    fill="none"
                                    stroke="#00f2d4"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    className="animate-ecg drop-shadow-[0_0_8px_rgba(0,242,212,0.8)]"
                                />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Create Account</h2>
                    <p className="text-brand-accent text-sm font-bold tracking-widest uppercase">Join the CardioSentinel AI Network</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold tracking-wider text-slate-300 ml-1 uppercase">Full Name</label>
                        <input
                            name="name"
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                            placeholder="Dr. John Smith"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold tracking-wider text-slate-300 ml-1 uppercase">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                            placeholder="john@sentinel.ai"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold tracking-wider text-slate-300 ml-1 uppercase">Phone Number</label>
                        <input
                            name="phone"
                            type="tel"
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold tracking-wider text-slate-300 ml-1 uppercase">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-brand-danger/20 border border-brand-danger/30 text-brand-danger px-4 py-3 rounded-xl text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-brand-success/20 border border-brand-success/30 text-brand-success px-4 py-3 rounded-xl text-sm"
                            >
                                Registration successful! Redirecting...
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full py-4 bg-brand-accent text-brand-primary font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(0,242,212,0.5)] hover:-translate-y-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group border border-transparent"
                    >
                        <span className="absolute inset-0 bg-white transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out z-0" />
                        <span className="relative z-10 group-hover:text-brand-primary transition-colors duration-300">
                            {loading ? "Creating Profile..." : "Sign Up"}
                        </span>
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-700"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase font-bold tracking-widest">Or</span>
                        <div className="flex-grow border-t border-slate-700"></div>
                    </div>

                    <button
                        type="button"
                        className="w-full py-4 bg-slate-900/50 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        Sign up with Google
                    </button>

                </form>

                <p className="text-center mt-8 text-slate-400 text-sm font-medium">
                    Already have an account? <Link to="/login" className="text-brand-accent font-bold hover:text-white transition-colors">Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
}
