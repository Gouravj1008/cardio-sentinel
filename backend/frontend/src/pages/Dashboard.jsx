import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Activity, AlertTriangle, ShieldCheck, ArrowRight, ActivitySquare, HeartPulse } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from "socket.io-client";

const normalizePatient = (item) => {
  const id = item?.id || item?.patientId || "";
  const riskLevel = item?.riskLevel || "Unknown";
  return {
    id: String(id),
    name: item?.name || "Unknown Patient",
    age: item?.age ?? "N/A",
    riskLevel,
    trend: item?.trend || (riskLevel === "High" ? "Declining" : "Stable"),
    lastUpdate: item?.lastUpdate || (item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A"),
  };
};

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', email: '', phone: '', age: '', gender: 'other', bloodGroup: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const navigate = useNavigate();

  // Real-Time System-Wide Telemetry State
  const [telemetryData, setTelemetryData] = useState([
    { time: new Date(Date.now() - 15000).toLocaleTimeString('en-US', { hour12: false }), riskIndex: 25, anomalyRate: 3 },
    { time: new Date(Date.now() - 12000).toLocaleTimeString('en-US', { hour12: false }), riskIndex: 28, anomalyRate: 4 },
    { time: new Date(Date.now() - 9000).toLocaleTimeString('en-US', { hour12: false }), riskIndex: 26, anomalyRate: 2 },
    { time: new Date(Date.now() - 6000).toLocaleTimeString('en-US', { hour12: false }), riskIndex: 30, anomalyRate: 5 },
    { time: new Date(Date.now() - 3000).toLocaleTimeString('en-US', { hour12: false }), riskIndex: 24, anomalyRate: 1 },
  ]);

  // Handle Socket Connection
  useEffect(() => {
    // Connect to backend websocket
    const socket = io("http://localhost:5000");

    socket.on('connect', () => {
      console.log('Connected to Neural Telemetry WebSocket');
    });

    socket.on('telemetry_update', (newPoint) => {
      setTelemetryData((prevData) => {
        // Keep only the last 15 points to prevent memory overflow (low space requirement)
        const updatedData = [...prevData, newPoint];
        if (updatedData.length > 15) {
          updatedData.shift();
        }
        return updatedData;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/doctor/patients");
        setPatients((res.data.data || []).map(normalizePatient));
      } catch (err) {
        console.error("Failed to fetch patients", err);
        // Mock data for demo if API fails
        setPatients([
          { id: "1", name: "John Doe", age: 65, riskLevel: "High", trend: "Declining", lastUpdate: "Just now" },
          { id: "2", name: "Jane Smith", age: 54, riskLevel: "Stable", trend: "Stable", lastUpdate: "2 mins ago" },
          { id: "3", name: "Robert Brown", age: 72, riskLevel: "High", trend: "Critical", lastUpdate: "5 mins ago" },
          { id: "4", name: "Sarah Connor", age: 41, riskLevel: "Stable", trend: "Improving", lastUpdate: "12 mins ago" },
        ]);
      }
    };
    fetchPatients();
  }, []);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError('');
    try {
      await api.post("/doctor/patients", newPatient);
      // Refresh patient list
      const res = await api.get("/doctor/patients");
      setPatients((res.data.data || []).map(normalizePatient));
      setIsAddModalOpen(false);
      setNewPatient({ name: '', email: '', phone: '', age: '', gender: 'other', bloodGroup: '' });
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add patient.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary text-slate-50 relative overflow-hidden">
      {/* Background AI Visuals */}
      <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-brand-accent/5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="neural-grid absolute inset-0 opacity-[0.1] pointer-events-none" />

      <Navbar />

      <main className="p-6 md:p-10 max-w-7xl mx-auto relative z-10 pt-32">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark text-brand-accent text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm border border-brand-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
              Live Monitoring Active
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-white">Neural Core <span className="text-brand-accent drop-shadow-[0_0_10px_rgba(0,242,212,0.4)]">Dashboard</span></h1>
            <p className="text-slate-400 font-medium">Monitoring {patients.length} active patient pipelines via advanced telemetry.</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-brand-accent/10 border border-brand-accent/50 text-brand-accent font-black uppercase tracking-widest rounded-xl hover:bg-brand-accent hover:text-brand-primary hover:shadow-[0_0_20px_rgba(0,242,212,0.4)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Users size={18} /> New Patient
          </motion.button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "High Risk Alerts", count: 2, color: "text-brand-danger", icon: AlertTriangle, drop: "drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" },
            { label: "Stable Profiles", count: 42, color: "text-brand-success", icon: ShieldCheck, drop: "drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" },
            { label: "Pending Analysis", count: 8, color: "text-brand-accent", icon: ActivitySquare, drop: "drop-shadow-[0_0_8px_rgba(0,242,212,0.6)]" },
            { label: "Total Monitored", count: 52, color: "text-white", icon: Users, drop: "" },
          ].map((stat, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              key={idx} className="glass-dark p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-brand-accent/30 hover:shadow-[0_0_15px_rgba(0,242,212,0.1)] transition-all"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon size={48} className={stat.color} />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <stat.icon size={14} className={stat.color} /> {stat.label}
              </p>
              <h3 className={`text-4xl font-black ${stat.color} ${stat.drop}`}>{stat.count}</h3>
            </motion.div>
          ))}
        </div>

        {/* Global Telemetry Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-dark p-6 rounded-3xl border border-slate-800 relative overflow-hidden mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <HeartPulse className="text-brand-accent" /> System-Wide Anomaly Detection
              </h2>
              <p className="text-slate-400 text-sm mt-1">Aggregated risk indexing across all active monitoring nodes.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(0,242,212,0.8)]"></div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Global Risk Index</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-danger shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Anomaly Rate</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#00f2d4', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                />
                <Line type="monotone" dataKey="riskIndex" stroke="#00f2d4" strokeWidth={3} dot={{ r: 4, fill: '#00f2d4', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, fill: '#00f2d4', stroke: '#fff', strokeWidth: 2 }} animationDuration={1500} />
                <Line type="monotone" dataKey="anomalyRate" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Patient Stream */}
        {/* Patient Stream */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-dark rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent opacity-50"></div>

          <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Activity size={18} className="text-brand-accent" /> Real-Time Trajectory Stream</h2>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span> Live Sync
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Patient ID / Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Age</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Predicted Risk</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Recent Trend</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Last Telemetry</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/patient/${p.id}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-200 group-hover:text-brand-accent transition-colors">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">SYS-{p.id.slice(-4).padStart(4, '0')}</div>
                    </td>
                    <td className="px-6 py-5 text-slate-400 font-medium">{p.age}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.riskLevel === 'High' ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'bg-brand-success/10 text-brand-success border border-brand-success/20'}`}>
                        {p.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-sm font-medium ${p.trend === 'Declining' || p.trend === 'Critical' ? 'text-brand-danger' : 'text-brand-success'}`}>
                        {p.trend} {p.trend === 'Declining' || p.trend === 'Critical' ? '↓' : '↑'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-400 text-sm italic">{p.lastUpdate}</td>
                    <td className="px-6 py-5 text-right">
                      <button className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center ml-auto group-hover:bg-brand-accent group-hover:border-brand-accent transition-colors">
                        <ArrowRight size={14} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-dark w-full max-w-lg p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-slate-700 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />

              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-2xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Register Patient Target</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddPatient} className="space-y-4 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Full Name</label>
                    <input required value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-accent/50 focus:border-brand-accent transition-all text-sm" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Email Address</label>
                    <input required type="email" value={newPatient.email} onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-accent/50 focus:border-brand-accent transition-all text-sm" placeholder="john@domain.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Age</label>
                    <input required type="number" value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-accent/50 focus:border-brand-accent transition-all text-sm" placeholder="45" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Phone</label>
                    <input required type="tel" value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-accent/50 focus:border-brand-accent transition-all text-sm" placeholder="555-0199" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-6 mb-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Gender</label>
                    <select value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-accent/50 focus:border-brand-accent transition-all text-sm appearance-none">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Blood Type</label>
                    <input value={newPatient.bloodGroup} onChange={e => setNewPatient({ ...newPatient, bloodGroup: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-accent/50 focus:border-brand-accent transition-all text-sm" placeholder="O+" />
                  </div>
                </div>

                {addError && (
                  <div className="bg-brand-danger/20 border border-brand-danger/30 text-brand-danger px-4 py-2.5 rounded-xl text-xs font-bold text-center">
                    {addError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full py-4 bg-brand-accent hover:bg-brand-accent/90 text-slate-950 font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-50 drop-shadow-[0_0_10px_rgba(0,242,212,0.4)] hover:drop-shadow-[0_0_20px_rgba(0,242,212,0.6)]"
                >
                  {isAdding ? "Initializing Neural Pipeline..." : "Register & Establish Baseline"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
