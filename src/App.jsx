import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Code2, 
  Cpu, 
  Globe, 
  ArrowRight, 
  Moon, 
  Sun,
  Server,
  Database,
  Terminal,
  ChevronRight
} from 'lucide-react';
import './App.css';

/* ------------------- DATA ------------------- */
const PROJECTS = [
  {
    title: "AI Digital Parking System",
    description: "Real-time computer vision system that detects parking slot availability using OpenCV. Improves parking efficiency through automation.",
    tech: ["Python", "OpenCV", "AI Logic", "Backend"],
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800",
    github: "https://github.com/Harish-Gen/",
    live: "#"
  },
  {
    title: "Rule Management System (GRC Application)",
    description: "Dynamic rule engine to create, update, and manage complex business rules using JSON structures with nested conditions.",
    tech: [".NET Core", "SQL Server", "React Query Builder", "JSON"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    github: "https://github.com/Harish-Gen/",
    live: "#"
  },
  {
    title: "Employee Task Management API",
    description: "Backend system to manage employee tasks with CRUD operations, Repository Pattern, and automated scheduling.",
    tech: [".NET Core", "Entity Framework", "Unit of Work", "SQL Server"],
    image: "https://images.unsplash.com/photo-1454165833767-027ffea7028c?auto=format&fit=crop&q=80&w=800",
    github: "https://github.com/Harish-Gen/",
    live: "#"
  }
];

const EXPERIENCE = [
  {
    date: "May 2025 – Present",
    title: "Software Engineer",
    company: "JOY IT Solutions",
    description: "Building and maintaining backend services using .NET and SQL Server. Developing scalable APIs for enterprise applications."
  },
  {
    date: "Apr 2024 – May 2025",
    title: "Analyst",
    company: "Objectways Technologies",
    description: "Worked on NLP-based AI projects using Amazon SageMaker. Processed and analyzed large datasets for machine learning models."
  },
  {
    date: "Mar 2023 – Jul 2023",
    title: "Full Stack Developer (Internship)",
    company: "Infognana Solutions",
    description: "Developed web applications using JavaScript and Node.js. Built frontend components and backend APIs."
  }
];

const SKILLS = {
  "Core & Backend": ["C# / .NET Core", "Entity Framework", "REST APIs", "Node.js", "System Design"],
  "Data & AI": ["Python", "OpenCV", "Amazon SageMaker", "SQL Server", "PostgreSQL"],
  "Frontend & Web": ["React.js", "JavaScript", "Tailwind CSS", "Framer Motion"]
};

/* ------------------- COMPONENTS ------------------- */

const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseX = useSpring(0, { stiffness: 500, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div 
      className="custom-cursor"
      style={{ 
        x: mouseX, 
        y: mouseY,
        translateX: '-50%',
        translateY: '-50%'
      }}
    />
  );
};

const Navbar = ({ darkTheme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar glass ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-content">
        <a href="#home" className="logo">Harish.dev</a>
        
        <div className="nav-links">
          {['About', 'Projects', 'Experience', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">{item}</a>
          ))}
          <button onClick={toggleTheme} className="theme-toggle">
            {darkTheme ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

const ProjectCard = ({ project, index }) => {
  return (
    <motion.div 
      className="project-card glass"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      <div className="project-image-container">
        <img src={project.image} alt={project.title} className="project-image" />
      </div>
      <div className="project-info">
        <h3 className="project-title">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        <div className="project-tech" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {project.tech.map((t) => <span key={t} className="tech-pill">{t}</span>)}
        </div>
        <div className="project-links">
          <a href={project.github} className="project-link"><Github size={16} /> <span style={{ borderBottom: '1px solid transparent', transition: '0.3s' }}>Code</span></a>
          <a href={project.live} className="project-link"><ExternalLink size={16} /> <span style={{ borderBottom: '1px solid transparent', transition: '0.3s' }}>Live</span></a>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [darkTheme, setDarkTheme] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkTheme ? 'dark' : 'light');
  }, [darkTheme]);

  const toggleTheme = () => setDarkTheme(!darkTheme);

  return (
    <div className="app-wrapper">
      <div className="noise-overlay"></div>
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <CustomCursor />
      <Navbar darkTheme={darkTheme} toggleTheme={toggleTheme} />

      {/* HERO SECTION */}
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content">
            <motion.span 
              className="hero-tagline"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              Backend Engineer & AI Specialized
            </motion.span>
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Hi, I'm <span className="gradient-text">Harish Kumar</span><br />
              Backend & AI Engineer.
            </motion.h1>
            <motion.p 
              className="hero-description"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              Specializing in scalable APIs, AI-powered systems, and production-grade applications. Focused on efficient architectures and cloud-based AI solutions.
            </motion.p>
            <motion.div 
              className="cta-group"
              style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <a href="#projects" className="btn btn-primary">View Work <ArrowRight size={18} /></a>
              <a href="#contact" className="btn btn-outline">Let's Talk</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about">
        <div className="container">
          <div className="about-grid">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="section-label">01. About Me</span>
              <h2 className="section-title">Crafting logic with Purpose</h2>
              <div className="about-text">
                <p>
                  Specializing in .NET, Python, and React, with hands-on work in NLP, computer vision, and cloud-based AI solutions using Amazon SageMaker.
                </p>
                <p>
                  Focused on building efficient backend architectures, optimizing performance, and delivering real-world solutions.
                </p>
              </div>
            </motion.div>

            <div className="skills-categories">
              {Object.entries(SKILLS).map(([category, items], i) => (
                <motion.div 
                   key={category}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h3 className="skill-category-title">{category}</h3>
                  <div className="skill-tags">
                    {items.map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-label">02. Selected Work</span>
            <h2 className="section-title">Featured Projects</h2>
          </motion.div>
          
          <div className="projects-grid">
            {PROJECTS.map((project, i) => (
              <ProjectCard key={project.title} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section id="experience">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center' }}
          >
            <span className="section-label">03. Journey</span>
            <h2 className="section-title">Experience</h2>
          </motion.div>
          
          <div className="experience-list">
            {EXPERIENCE.map((exp, i) => (
              <motion.div 
                key={exp.title} 
                className="experience-item glass"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="exp-date">{exp.date}</span>
                <h3 className="exp-title">{exp.title}</h3>
                <span className="exp-company">{exp.company}</span>
                <p className="exp-desc">{exp.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact">
        <div className="container">
          <div className="contact-container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="section-label">05. Connection</span>
              <h1 className="contact-info-title">Let’s build something <span className="gradient-text">extraordinary</span>.</h1>
              <p className="about-text">
                Open to backend developer roles and AI-driven product opportunities. Let’s build scalable and intelligent systems together.
              </p>
              <div className="social-links">
                <a href="https://github.com/Harish-Gen/" className="social-link" target="_blank" rel="noopener noreferrer"><Github size={20} /></a>
                <a href="https://www.linkedin.com/in/im-harishkumar/" className="social-link" target="_blank" rel="noopener noreferrer"><Linkedin size={20} /></a>
                <a href="mailto:harishpalani2023@gmail.com" className="social-link"><Mail size={20} /></a>
              </div>
            </motion.div>

            <motion.form 
              className="contact-form glass"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" placeholder="How can I help you?" style={{ minHeight: '120px' }}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Send Message <ArrowRight size={18} />
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      <footer style={{ padding: '60px 0', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
        <p>© 2026 Harish Kumar. Crafted with passion.</p>
      </footer>
    </div>
  );
}

