import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowRight, Code2, Database, Cpu } from "lucide-react";

/* ---------------- NAVBAR ---------------- */
function Navbar() {
  return (
    <nav className="fixed w-full z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
        >
          Harish.dev
        </Link>
        <div className="flex gap-8 text-gray-300 text-sm">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/projects" className="hover:text-white transition">Projects</Link>
          <a href="#contact" className="hover:text-white transition">Contact</a>
        </div>
      </div>
    </nav>
  );
}

/* ---------------- FLOATING BACKGROUND ---------------- */
function BackgroundGlow() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl animate-pulse -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse top-1/3 -right-32" />
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse bottom-0 left-1/3" />
    </div>
  );
}

/* ---------------- ANIMATED CURSOR ---------------- */
function AnimatedCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const moveCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9999]"
      animate={{ x: position.x - 12, y: position.y - 12 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      style={{
        background: "radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(6,182,212,0.4) 60%, transparent 70%)",
        boxShadow: "0 0 20px rgba(59,130,246,0.6)",
      }}
    />
  );
}

/* ---------------- HOME PAGE ---------------- */
function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white overflow-x-hidden">
      <BackgroundGlow />

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center py-44 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
        >
          Building Intelligent Systems
        </motion.h1>

        <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
          I'm Harish Kumar — a backend-focused engineer crafting scalable APIs,
          AI-powered applications, and production-grade systems.
        </p>

        <div className="flex gap-6 mt-12">
          <button
            onClick={() => navigate("/projects")}
            className="rounded-2xl px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 transition shadow-xl flex items-center"
          >
            Explore Projects <ArrowRight className="ml-2" size={18} />
          </button>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <Code2 />, label: "Backend APIs Built", value: "20+" },
            { icon: <Cpu />, label: "AI / ML Projects", value: "5+" },
            { icon: <Database />, label: "Database Systems Designed", value: "15+" },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }}>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-10 text-center">
                <div className="flex justify-center mb-4 text-blue-400">{item.icon}</div>
                <h3 className="text-3xl font-bold">{item.value}</h3>
                <p className="text-gray-400 mt-2 text-sm">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="px-8 py-24 bg-black/60 backdrop-blur-xl">
        <h2 className="text-4xl font-bold text-center mb-16">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {[
            "C# / .NET",
            "React",
            "SQL Server",
            "Python",
            "OpenCV",
            "REST APIs",
            "Node.js",
            "System Design",
          ].map((tech, i) => (
            <motion.span
              key={i}
              whileHover={{ scale: 1.1 }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-white/10 text-sm shadow-lg"
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-8 py-28 text-center">
        <h2 className="text-4xl font-bold mb-6">Let’s Build Something Impactful</h2>
        <p className="text-gray-400 mb-10">
          Open to backend & AI-driven product opportunities.
        </p>
        <div className="flex justify-center gap-8">
          <Github className="hover:text-blue-400 cursor-pointer transition" size={28} />
          <Linkedin className="hover:text-blue-400 cursor-pointer transition" size={28} />
          <Mail className="hover:text-blue-400 cursor-pointer transition" size={28} />
        </div>
      </section>
    </div>
  );
}

/* ---------------- PROJECT PAGE ---------------- */
function Projects() {
  return (
    <div className="relative min-h-screen bg-black text-white px-8 py-32 overflow-hidden">
      <BackgroundGlow />

      <h1 className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
        Featured Project
      </h1>

      <div className="max-w-5xl mx-auto">
        <motion.div whileHover={{ scale: 1.03 }}>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-12">
            <h3 className="text-3xl font-bold mb-6">AI Digital Parking System</h3>
            <p className="text-gray-300 mb-6 leading-relaxed text-lg">
              Real-time computer vision system detecting parking slot availability
              using OpenCV with backend automation and database tracking.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Python", "OpenCV", "Database", "AI Logic"].map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="text-center mt-20">
        <Link to="/" className="text-blue-400 hover:underline text-lg">← Back to Home</Link>
      </div>
    </div>
  );
}

/* ---------------- MAIN APP ---------------- */
export default function PortfolioApp() {
  return (
    <Router>
      <AnimatedCursor />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </Router>
  );
}
