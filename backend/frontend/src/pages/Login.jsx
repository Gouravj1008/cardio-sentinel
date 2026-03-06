import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      if (!err.response) {
        setError("Backend server is not reachable. Start backend on http://localhost:5000.");
      } else {
        setError(err.response?.data?.message || "Invalid credentials");
      }
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

      {/* Logo Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 z-10 flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-2xl glass-dark border border-brand-accent/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,212,0.3)]">
          <svg className="w-6 h-6 text-brand-accent animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight italic uppercase">CardioSentinel</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-dark w-full max-w-md p-10 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-800 relative z-10 ring-1 ring-white/5"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-2 uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Welcome Back</h2>
          <p className="text-brand-accent text-sm font-bold tracking-widest uppercase">Log in to the Neural Interface.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold tracking-wider text-slate-300 ml-1 uppercase">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
              placeholder="doctor@sentinel.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-300 ml-1">Password</label>
              <a href="#" className="text-xs text-brand-accent hover:text-white transition-colors font-semibold">Forgot Password?</a>
            </div>
            <input
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-danger/20 border border-brand-danger/30 text-brand-danger px-4 py-3 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-accent text-brand-primary font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(0,242,212,0.5)] hover:-translate-y-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50 relative overflow-hidden group border border-transparent"
          >
            <span className="absolute inset-0 bg-white transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out z-0" />
            <span className="relative z-10 group-hover:text-brand-primary transition-colors duration-300">
              {loading ? "Authenticating..." : "Sign In"}
            </span>
          </button>

          <div className="relative flex items-center py-4">
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
            Sign in with Google
          </button>

        </form>

        <p className="text-center mt-8 text-slate-400 text-sm font-medium">
          New to CardioSentinel AI? <Link to="/signup" className="text-brand-accent font-bold hover:text-white transition-colors">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
}
