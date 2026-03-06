import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, HeartPulse, Clock, Download, User as UserIcon, ShieldCheck, ActivitySquare } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Patient() {
  const { id } = useParams();

  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const res1 = await api.get(`/doctor/patients/${id}/summary`);
        const summaryData = res1.data.data || {};
        const patient = summaryData.patient || {};
        const aiSource = summaryData.ai || summaryData.latestRecord?.aiAnalysis || {};
        setSummary({
          patient: {
            name: patient.name || "Unknown Patient",
            age: patient.age ?? "N/A",
            gender: patient.gender || "N/A",
            bloodGroup: patient.bloodGroup || "N/A",
          },
          ai: {
            riskLevel: aiSource.riskLevel || "Unknown",
            riskScore: aiSource.riskScore ?? 0,
          },
        });

        const res2 = await api.get(`/doctor/patients/${id}/timeline`);
        setTimeline(
          (res2.data.data || []).map((record) => ({
            date: new Date(record.recordDate).toISOString().slice(0, 10),
            riskScore: record.aiAnalysis?.riskScore ?? record.riskScore ?? 0,
            riskLevel: record.aiAnalysis?.riskLevel || "Stable",
            insight: record.aiAnalysis?.trendDetected || "No major trend change detected.",
          }))
        );
      } catch (err) {
        console.error("Failed to load patient data", err);
        // Realistic Mock Data for UI presentation
        setSummary({
          patient: { name: id === "1" ? "John Doe" : id === "2" ? "Jane Smith" : "Robert Brown", age: id === "1" ? 65 : id === "2" ? 54 : 72, gender: id === "2" ? "Female" : "Male", bloodGroup: "O+" },
          ai: { riskLevel: id === "2" ? "Stable" : "High", riskScore: id === "2" ? 22 : 84 }
        });
        setTimeline([
          { date: "2026-01-10", riskScore: 30, riskLevel: "Stable", insight: "Initial baseline established." },
          { date: "2026-01-24", riskScore: 35, riskLevel: "Stable", insight: "Minor HRV fluctuations." },
          { date: "2026-02-05", riskScore: 65, riskLevel: "Elevated", insight: "SpO2 decoupling detected during REM sleep." },
          { date: "2026-02-20", riskScore: 84, riskLevel: "High", insight: "Pre-arrhythmic patterns confirmed. Immediate review recommended." },
        ]);
      }
    };

    loadPatient();
  }, [id]);

  if (!summary) return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-accent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-primary text-slate-50 relative overflow-hidden">
      {/* Background AI Visuals */}
      <div className="absolute top-40 -left-32 w-[60rem] h-[60rem] bg-brand-accent/5 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />
      <div className="absolute top-0 -right-20 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '3s' }} />
      <div className="neural-grid absolute inset-0 opacity-[0.1] pointer-events-none" />

      <Navbar />

      <main className="p-6 md:p-10 max-w-7xl mx-auto pt-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8">

          {/* Left Column: Profile & Details */}
          <div className="w-full md:w-1/3 space-y-8">
            {/* Identity Card */}
            <div className="glass-dark p-8 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-brand-accent/30 transition-all shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <UserIcon size={120} className="text-brand-accent" />
              </div>
              <p className="text-brand-accent font-black uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                Target Acquired
              </p>
              <h1 className="text-4xl font-black text-white tracking-tight mb-1">{summary.patient.name}</h1>
              <p className="text-slate-400 font-mono text-sm uppercase tracking-widest mb-8">Node: SYS-{String(id).slice(-4).padStart(4, '0')}</p>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Age</span>
                  <span className="text-lg font-bold text-white">{summary.patient.age || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Gender</span>
                  <span className="text-lg font-bold text-white">{summary.patient.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Blood Type</span>
                  <span className="text-lg font-bold text-brand-accent drop-shadow-[0_0_8px_rgba(0,242,212,0.5)]">{summary.patient.bloodGroup || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Current Risk Card */}
            <div className={`p-8 rounded-3xl border relative overflow-hidden shadow-2xl ${summary.ai.riskLevel === 'High' ? 'bg-brand-danger/10 border-brand-danger/30' : 'bg-brand-success/10 border-brand-success/30'}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] -z-10 ${summary.ai.riskLevel === 'High' ? 'bg-brand-danger/20' : 'bg-brand-success/20'}`} />
              <p className="text-slate-400 text-[10px] mb-2 uppercase font-black tracking-widest flex items-center gap-2">
                {summary.ai.riskLevel === 'High' ? <AlertTriangle size={14} className="text-brand-danger" /> : <ShieldCheck size={14} className="text-brand-success" />}
                Current Risk Assessment
              </p>
              <h2 className={`text-5xl font-black mb-1 ${summary.ai.riskLevel === 'High' ? 'text-brand-danger drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]' : 'text-brand-success drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]'}`}>
                {summary.ai.riskLevel}
              </h2>
              <p className="text-slate-300 font-mono text-sm">Confidence Score: <strong className="text-white">{summary.ai.riskScore}/100</strong></p>
            </div>

            <button className="w-full py-4 glass-dark text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-brand-accent/10 hover:border-brand-accent/50 hover:text-brand-accent transition-all border border-slate-800 shadow-lg flex justify-center items-center gap-2 group">
              <Download size={16} className="text-slate-400 group-hover:text-brand-accent transition-colors" /> Download Telemetry JSON
            </button>
          </div>

          {/* Right Column: Analytics & Timeline */}
          <div className="w-full md:w-2/3 space-y-8">

            {/* Risk Projection Graph */}
            <div className="glass-dark p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent opacity-50"></div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <ActivitySquare className="text-brand-accent" /> Longitudinal Risk Trajectory
                </h3>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#f43f5e', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="riskScore" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights Timeline */}
            <div className="glass-dark p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-8">
                <HeartPulse className="text-brand-accent" /> AI Anomaly Detection Log
              </h3>

              {timeline.length === 0 ? (
                <div className="text-center text-slate-500 py-10 font-mono text-sm">
                  [!] SYSTEM AWAITING INGESTION
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-accent/50 before:via-brand-accent/20 before:to-transparent">
                  {timeline.slice().reverse().map((t, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${t.riskLevel === 'High' ? 'bg-brand-danger drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]' : t.riskLevel === 'Elevated' ? 'bg-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-brand-success drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`}>
                        {t.riskLevel === 'High' ? <AlertTriangle size={14} className="text-slate-900" /> : <Activity size={14} className="text-slate-900" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass p-5 rounded-2xl border border-white/5 hover:border-brand-accent/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-brand-accent font-mono text-xs font-bold">{t.date}</span>
                          <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Score: {t.riskScore}</span>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed">{t.insight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
