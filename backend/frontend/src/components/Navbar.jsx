import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 glass px-6 py-4 flex justify-between items-center">
            <h2
                className="text-xl font-bold text-gradient cursor-pointer"
                onClick={() => navigate("/dashboard")}
            >
                CardioSentinel AI
            </h2>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/cardio-ai")}
                    className="px-4 py-2 bg-brand-accent text-slate-900 rounded-lg font-medium hover:opacity-90 transition-colors cursor-pointer"
                >
                    AI Console
                </button>
                <button
                    onClick={handleLogout}
                    className="px-5 py-2 bg-brand-danger text-white rounded-lg font-medium hover:bg-rose-600 transition-colors cursor-pointer shadow-lg shadow-brand-danger/20"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
