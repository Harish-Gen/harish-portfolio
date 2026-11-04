import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Code2, Cpu, Database, Github, Linkedin, Mail } from "lucide-react";

const reveal = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.55 } };

function NetworkField() {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = 0, height = 0, frame = 0;
    let pointer = { x: -1000, y: -1000 };
    const points = [];
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      width = canvas.width = box.width * Math.min(window.devicePixelRatio || 1, 2);
      height = canvas.height = box.height * Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(Math.min(window.devicePixelRatio || 1, 2), 0, 0, Math.min(window.devicePixelRatio || 1, 2), 0, 0);
      points.length = 0;
      const gap = window.innerWidth < 700 ? 64 : 82;
      for (let y = 24; y < box.height; y += gap) for (let x = 24; x < box.width; x += gap) points.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
    };
    const move = (event) => { const box = canvas.getBoundingClientRect(); pointer = { x: event.clientX - box.left, y: event.clientY - box.top }; };
    const leave = () => { pointer = { x: -1000, y: -1000 }; };
    const draw = () => {
      const box = canvas.getBoundingClientRect(); ctx.clearRect(0, 0, box.width, box.height);
      points.forEach((p) => {
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.hypot(dx, dy);
        if (!reduceMotion && d < 150) { const force = (150 - d) / 150 * 1.8; p.vx += (dx / (d || 1)) * force; p.vy += (dy / (d || 1)) * force; }
        p.vx += (p.ox - p.x) * 0.035; p.vy += (p.oy - p.y) * 0.035; p.vx *= 0.86; p.vy *= 0.86; p.x += p.vx; p.y += p.vy;
      });
      ctx.lineWidth = 0.7;
      points.forEach((p, i) => {
        for (let j = i + 1; j < points.length; j++) { const q = points[j]; if (Math.hypot(p.ox - q.ox, p.oy - q.oy) < 88) { const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < 105) { ctx.strokeStyle = `rgba(17,17,17,${0.11 * (1 - d / 105)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); } } }
        ctx.fillStyle = "rgba(17,17,17,0.35)"; ctx.beginPath(); ctx.arc(p.x, p.y, 1.15, 0, Math.PI * 2); ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    resize(); draw(); window.addEventListener("resize", resize); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave); };
  }, [reduceMotion]);
  return <canvas ref={canvasRef} className="network-canvas" aria-hidden="true" />;
}

function DotMark({ className = "" }) { return <span className={`dot-mark ${className}`} aria-hidden="true">{Array.from({ length: 25 }, (_, i) => <i key={i} />)}</span>; }

function Navbar() {
  const location = useLocation();
  return <nav className="nav-shell"><div className="nav-inner">
    <Link to="/" className="wordmark" aria-label="Harish Kumar home"><span className="mark-square">H</span><span>HK<span className="wordmark-dot">.</span></span></Link>
    <div className="nav-links"><Link className={location.pathname === "/" ? "active" : ""} to="/"><b />INDEX</Link><Link className={location.pathname === "/projects" ? "active" : ""} to="/projects"><b />PROJECTS</Link><a href={location.pathname === "/" ? "#contact" : "/#contact"}><b />CONTACT</a></div>
    <div className="nav-status"><span className="status-dot" /> AVAILABLE <span className="nav-divider">/</span> 01:01:26</div>
  </div></nav>;
}

function SectionHead({ index, title, note }) { return <div className="section-head"><div><span className="eyebrow">{index} <i /> SYSTEM / {note}</span><h2>{title}</h2></div><span className="section-code">HK — 2026</span></div>; }

function Home() {
  const categories = [
    ["01", "BACKEND ENGINEERING", ["C# / .NET", "Node.js", "REST APIs"]],
    ["02", "FRONTEND ENGINEERING", ["React", "JavaScript"]],
    ["03", "DATA SYSTEMS", ["SQL Server", "Database Design"]],
    ["04", "AI & AUTOMATION", ["Python", "OpenCV", "AI Logic"]],
    ["05", "ARCHITECTURE", ["System Design", "Scalable APIs"]],
    ["06", "INFRASTRUCTURE", ["Production Systems", "Backend Automation"]],
  ];
  return <main>
    <section className="hero" id="top"><NetworkField /><div className="hero-topline"><span>SOFTWARE ENGINEER <i /> PORTFOLIO / 2026</span><span>INDEPENDENT SYSTEMS THINKING</span></div>
      <div className="hero-content"><motion.div {...reveal} className="hero-copy"><p className="eyebrow"><span className="red-square" /> HELLO, I AM HARISH KUMAR</p><h1>ENGINEERING<br /><span>WHAT’S</span> NEXT<span className="red-period">.</span></h1><div className="hero-bottom"><p className="hero-description">Backend-focused engineer crafting scalable APIs, AI-powered applications, and production-grade systems.</p><div className="hero-actions"><Link className="button button-dark" to="/projects">VIEW PROJECTS <ArrowRight size={15} /></Link><a className="button button-line" href="#contact">CONTACT <ArrowUpRight size={15} /></a></div></div></motion.div>
      <div className="hero-graphic"><div className="ring ring-one"><div className="ring ring-two"><div className="ring-core"><span>HK</span></div></div></div><span className="graphic-label graphic-label-top">FIG. 001 / SIGNAL</span><span className="graphic-label graphic-label-bottom">37° 33′ N — SYSTEM ONLINE</span><DotMark /></div></div>
      <div className="hero-footer"><span><i className="status-dot" /> OPEN TO WORK</span><a href="#about">SCROLL TO EXPLORE <ArrowDown size={13} /></a><span>LATENCY: 08MS</span></div>
    </section>

    <section className="spec-strip"><div className="spec-intro"><span className="eyebrow">CORE METRICS / 001</span><p>Built for scale.<br />Designed for clarity.</p></div>{[{ icon: <Code2 />, value: "20+", label: "BACKEND APIs BUILT" }, { icon: <Cpu />, value: "05+", label: "AI / ML PROJECTS" }, { icon: <Database />, value: "15+", label: "DATABASE SYSTEMS" }].map((item) => <motion.div {...reveal} className="metric" key={item.label}><span className="metric-icon">{item.icon}</span><strong>{item.value}</strong><small>{item.label}</small><span className="metric-index">● 0{item.value === "20+" ? "1" : item.value === "05+" ? "2" : "3"}</span></motion.div>)}</section>

    <section id="about" className="section about-section"><SectionHead index="01" title="About the operator." note="IDENTITY" /><div className="about-grid"><div className="about-aside"><DotMark /><span className="eyebrow">ENGINEER / BUILDER / PROBLEM SOLVER</span><div className="vertical-stamp">HARISH KUMAR — EST. 2026</div></div><div className="about-main"><p className="about-lead">I build <em>reliable digital systems</em> with a focus on backend engineering, applied AI, and the details that make software work in the real world.</p><p className="body-copy">From scalable APIs to computer vision applications, I care about thoughtful architecture, clear interfaces, and turning complex ideas into useful products.</p><div className="about-data"><div><span>PRIMARY DISCIPLINE</span><strong>Software Engineering</strong></div><div><span>FOCUS AREAS</span><strong>Backend · AI · Systems</strong></div><div><span>WORK STATUS</span><strong><i className="status-dot" /> Open to opportunities</strong></div></div></div></div></section>

    <section className="section skills-section"><SectionHead index="02" title="System capabilities." note="SPECIFICATION" /><div className="skills-grid">{categories.map(([n, title, items]) => <motion.div {...reveal} className="skill-group" key={n}><div className="skill-head"><span>{n} / CATEGORY</span><span className="skill-led" /></div><h3>{title}</h3><ul>{items.map((item, i) => <li key={item}><span className="skill-dash">—</span>{item}<small>0{i + 1}</small></li>)}</ul></motion.div>)}</div></section>

    <section className="section focus-section"><SectionHead index="03" title="Engineering focus." note="CAREER LOG" /><div className="timeline"><div className="timeline-rail"><span /></div><div className="timeline-entry"><span className="timeline-number">01</span><div><p className="eyebrow">ROLE / SOFTWARE ENGINEERING</p><h3>Backend systems</h3><p className="body-copy">Building scalable APIs and production-grade systems with a focus on clear architecture and reliable data.</p></div><span className="timeline-meta">API DESIGN<br />DATA SYSTEMS</span></div><div className="timeline-entry timeline-entry-muted"><span className="timeline-number">02</span><div><p className="eyebrow">APPLIED TECHNOLOGY</p><h3>AI & automation</h3><p className="body-copy">Creating AI-powered applications and automating backend workflows, including real-time computer vision.</p></div><span className="timeline-meta">COMPUTER VISION<br />AUTOMATION</span></div></div></section>

    <section className="project-preview section"><SectionHead index="04" title="Built to solve." note="PROJECT FILES" /><Link to="/projects" className="project-feature"><div className="project-visual"><div className="parking-grid"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="scan-line" /><span className="visual-stamp">VISION / ACTIVE</span></div><div className="project-info"><p className="eyebrow">PROJECT_001 <i /> COMPUTER VISION</p><h3>AI Digital<br />Parking System</h3><p>Real-time computer vision detects parking slot availability, connected to backend automation and database tracking.</p><div className="tag-row"><span>PYTHON</span><span>OPENCV</span><span>DATABASE</span><span>AI LOGIC</span></div><span className="project-link">EXPLORE PROJECT <ArrowRight size={16} /></span></div></Link></section>

    <section className="contact-section" id="contact"><div className="contact-inner"><span className="eyebrow"><span className="red-square" /> END OF TRANSMISSION / BEGIN A CONVERSATION</span><h2>Have a system<br />to <span>build?</span></h2><div className="contact-bottom"><p>Open to backend and AI-driven product opportunities.<br />Let’s make something useful.</p><a className="button button-light" href="mailto:">GET IN TOUCH <ArrowUpRight size={15} /></a></div><div className="social-row"><span>CONNECT / 01</span><span className="social-label"><Github size={17} /> GITHUB</span><span className="social-label"><Linkedin size={17} /> LINKEDIN</span><span className="social-label"><Mail size={17} /> EMAIL</span></div></div></section>
    <Footer />
  </main>;
}

function Projects() {
  return <main className="projects-page"><div className="page-intro"><span className="eyebrow">ARCHIVE / 001—001</span><h1>Project<br /><span>files.</span></h1><p>A selection of systems built to solve real problems with thoughtful engineering.</p><DotMark /></div><section className="project-detail"><div className="detail-visual"><div className="parking-grid large"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="scan-line" /><span className="visual-stamp">CV MODULE / 001</span></div><div className="detail-copy"><span className="eyebrow"><i className="red-square" /> PROJECT_001 / COMPUTER VISION</span><h2>AI Digital<br />Parking System</h2><p>Real-time computer vision system detecting parking slot availability using OpenCV, connected to backend automation and database tracking.</p><div className="detail-block"><span>TECHNICAL STACK</span><div className="tag-row"><span>PYTHON</span><span>OPENCV</span><span>DATABASE</span><span>AI LOGIC</span></div></div><div className="detail-block"><span>ENGINEERING CONTRIBUTIONS</span><ul><li>Real-time parking availability detection</li><li>Computer vision pipeline with OpenCV</li><li>Backend automation and database tracking</li></ul></div><div className="detail-links"><span>REPOSITORY / UNLISTED</span><Link to="/">BACK TO INDEX <ArrowLeft size={14} /></Link></div></div></section><Footer /></main>;
}

function Footer() { return <footer className="footer"><Link to="/" className="wordmark"><span className="mark-square">H</span><span>HK<span className="wordmark-dot">.</span></span></Link><span>PORTFOLIO INTERFACE / V1.0</span><a href="#top">BACK TO TOP ↑</a><span>© 2026 HARISH KUMAR</span></footer>; }

export default function PortfolioApp() { return <Router><Navbar /><Routes><Route path="/" element={<Home />} /><Route path="/projects" element={<Projects />} /></Routes></Router>; }
