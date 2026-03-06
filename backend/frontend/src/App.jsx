import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Patient from "./pages/Patient";
import LandingPage from "./pages/LandingPage";
import Loader from "./components/Loader";
import CardioSentinelAI from "./pages/CardioSentinelAI";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial delay for futuristic preloader effect
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/patient/:id" element={<ProtectedRoute><Patient /></ProtectedRoute>} />
        <Route path="/cardio-ai" element={<ProtectedRoute><CardioSentinelAI /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
