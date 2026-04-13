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
    description: "Real-time computer vision system detecting parking slot availability using OpenCV with backend automation and database tracking.",
    tech: ["Python", "OpenCV", "SQL Server", "AI Logic"],
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800", // High quality fallback
    github: "#",
    live: "#"
  },
  {
    title: "EcoTrack API",
    description: "Highly scalable RESTful API designed for environmental monitoring, featuring real-time data ingestion and analytics dashboards.",
    tech: [".NET Core", "Redis", "PostgreSQL", "Docker"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    github: "#",
    live: "#"
  },
  {
    title: "Neural Vision Dashboard",
    description: "A comprehensive management interface for distributed AI processing nodes, providing deep insights into model performance metrics.",
    tech: ["React", "D3.js", "Node.js", "WebSockets"],
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    github: "#",
    live: "#"
  }
];

const EXPERIENCE = [
  {
    date: "2023 - Present",
    title: "Backend-focused Engineer",
    company: "TechInnova Solutions",
    description: "Leading the development of high-performance microservices and AI-driven automation tools. Optimized database queries by 40%."
  },
  {
    date: "2021 - 2023",
    title: "Full Stack Developer",
    company: "DataStream Systems",
    description: "Developed and maintained several client-facing web applications focusing on real-time data visualization and scalability."
  },
  {
    date: "2020 - 2021",
    title: "Software Engineering Intern",
    company: "NexGen Labs",
    description: "Assisted in building internal tooling for automated testing and documentation workflows."
  }
];

const TESTIMONIALS = [
  {
    name: "Alex Rivers",
    role: "CTO @ CloudScale",
    content: "Harish is a rare talent who understands both the low-level architecture and the high-level product goals. His work on our API performance was transformative."
  },
  {
    name: "Sarah Chen",
    role: "Head of AI @ Visionary",
    content: "The computer vision models Harish developed for us were remarkably accurate and easy to integrate. His technical depth is impressive."
  },
  {
    name: "Marcus Thorne",
    role: "Founder @ EcoLogix",
    content: "Professional, efficient, and highly skilled. Harish delivered our backend infrastructure ahead of schedule and with zero defects."
  }
];

const SKILLS = {
  Frontend: ["React", "JavaScript", "CSS3", "Framer Motion", "Tailwind"],
  Backend: [".NET Core", "Node.js", "Python", "REST APIs", "gRPC"],
  Database: ["SQL Server", "PostgreSQL", "MongoDB", "Redis"],
  Tools: ["Docker", "Git", "Jenkins", "AWS", "Linux"]
};

/* ------------------- COMPONENTS ------------------- */

const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e) => {
      if (e.target.closest('button, a, .project-card')) setIsHovering(true);
      else setIsHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div 
      className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
      animate={{ 
        x: mousePos.x, 
        y: mousePos.y,
        scale: isHovering ? 1.5 : 1
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
    />
  );
};

const Navbar = ({ darkTheme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <motion.div 
        className="nav-progress" 
        style={{ 
          scaleX, 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: '2px', 
          background: 'var(--gradient-primary)',
          transformOrigin: '0%'
        }} 
      />
      <div className="container nav-content">
        <a href="#home" className="logo">Harish.dev</a>
        
        <div className="nav-links">
          {['About', 'Projects', 'Experience', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">{item}</a>
          ))}
          <button onClick={toggleTheme} className="theme-toggle">
            {darkTheme ? <Sun size={20} /> : <Moon size={20} />}
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
    >
      <div className="project-image-container">
        <img src={project.image} alt={project.title} className="project-image" />
      </div>
      <div className="project-info">
        <h3 className="project-title">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        <div className="project-tech">
          {project.tech.map((t) => <span key={t} className="tech-pill">{t}</span>)}
        </div>
        <div className="project-links">
          <a href={project.github} className="project-link"><Github size={18} /> Repo</a>
          <a href={project.live} className="project-link"><ExternalLink size={18} /> Demo</a>
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
      <CustomCursor />
      <Navbar darkTheme={darkTheme} toggleTheme={toggleTheme} />

      {/* HERO SECTION */}
      <section id="home" className="hero">
        <div className="hero-glow"></div>
        <div className="container">
          <div className="hero-content">
            <motion.span 
              className="hero-tagline"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Building the invisible machines
            </motion.span>
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Hi, I'm <span className="gradient-text">Harish Kumar</span><br />
              Backend & AI Engineer.
            </motion.h1>
            <motion.p 
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              I architect scalable APIs and intelligent systems that power real-world applications with precision and efficiency.
            </motion.p>
            <motion.div 
              className="cta-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
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
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-label">01. About Me</span>
              <h2 className="section-title">Crafting logic with Purpose</h2>
              <div className="about-text">
                <p>
                  I'm a software engineer based in India with a passion for designing systems that are both robust and elegant. My journey started with a fascination for logic puzzles, which eventually translated into building complex backend architectures.
                </p>
                <p>
                  Currently, I specialize in Backend development (C#/.NET, Node.js) and AI integration (OpenCV, Python), bridging the gap between raw data and actionable intelligence.
                </p>
              </div>
            </motion.div>

            <div className="skills-categories">
              {Object.entries(SKILLS).map(([category, items], i) => (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center' }}
          >
            <span className="section-label">03. Journey</span>
            <h2 className="section-title">Experience</h2>
          </motion.div>
          
          <div className="experience-list">
            {EXPERIENCE.map((exp, i) => (
              <motion.div 
                key={exp.title} 
                className="experience-item"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
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

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <span className="section-label">04. Feedback</span>
            <h2 className="section-title">What People Say</h2>
          </motion.div>
          
          <div className="projects-grid">
            {TESTIMONIALS.map((test, i) => (
              <motion.div 
                key={test.name}
                className="project-card glass"
                style={{ padding: '40px' }}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <p className="project-desc" style={{ fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '24px' }}>
                  "{test.content}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>{test.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{test.role}</span>
                  </div>
                </div>
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
            >
              <span className="section-label">05. Connection</span>
              <h1 className="contact-info-title">Let’s build something <span className="gradient-text">extraordinary</span> together.</h1>
              <p className="about-text">
                Currently open to backend partnerships, AI research collaborations, and full-time opportunities.
              </p>
              <div className="social-links">
                <a href="#" className="social-link"><Github size={24} /></a>
                <a href="#" className="social-link"><Linkedin size={24} /></a>
                <a href="#" className="social-link"><Mail size={24} /></a>
              </div>
            </motion.div>

            <motion.form 
              className="contact-form glass"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="Enter your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" placeholder="How can I help you?"></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Send Message <ArrowRight size={18} />
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      <footer style={{ padding: '40px 0', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>© 2026 Harish Kumar. Crafted with passion & precision.</p>
      </footer>
    </div>
  );
}
