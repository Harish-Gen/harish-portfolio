import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import './Enhancements.css';

/* ------------------- DATA ------------------- */
const PROJECTS = [
  {
    title: "J-Star Workforce Management Platform",
    description: "A workforce coordination platform supporting staff scheduling, task assignment, attendance tracking, and real-time workforce management across hospitality, manufacturing, and logistics operations.",
    tech: ["Workforce Scheduling", "Task Management", "Attendance Tracking", "Operations"],
    image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1200&q=80",
    github: "https://github.com/Harish-Gen/",
    live: ""
  },
  {
    title: "JOY PIM — Product Information Management",
    description: "AI-powered product data platform that centralizes product information and digital assets, automates data validation and enrichment, and distributes consistent content across channels.",
    tech: ["Product Data", "Digital Assets", "AI Processing", "Multi-channel"],
    image: "https://joypim.com/wp-content/uploads/2024/11/pim.webp",
    github: "https://github.com/Harish-Gen/",
    live: "https://joypim.com/"
  },
  {
    title: "Green Metrics — ESG Management Platform",
    description: "A centralized ESG platform for collecting sustainability data, tracking performance, and creating compliant reports with automated workflows and real-time insights.",
    tech: ["ESG Data", "Reporting", "Compliance", "Analytics"],
    image: "https://greenmetrics.co/wp-content/uploads/2024/12/about-2.png",
    github: "https://github.com/Harish-Gen/",
    live: "https://greenmetrics.co/"
  },
  {
    title: "GRC Application",
    description: "A configurable Governance, Risk, and Compliance application with a dynamic rule engine for creating and managing complex business rules, including nested conditions.",
    tech: [".NET Core", "SQL Server", "React Query Builder", "JSON"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    github: "https://github.com/Harish-Gen/",
    live: "https://joyitsolutions.co/grc/"
  },
  {
    title: "AI Digital Parking System",
    description: "Real-time computer vision system that detects parking slot availability using OpenCV. Improves parking efficiency through automation.",
    tech: ["Python", "OpenCV", "AI Logic", "Backend"],
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800",
    github: "https://github.com/Harish-Gen/",
    live: ""
  }
];

const EXPERIENCE = [
  {
    date: "May 2025 – Present",
    title: "Software Engineer",
    company: "JOY IT Solutions",
    description: "Building scalable APIs with .NET, SQL Server, and PostgreSQL, plus web and mobile applications with React.js and React Native."
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

const HeroSignal = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !section || !context) return undefined;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = finePointer && !reducedMotion;
    const points = [];
    const pointer = { x: -1000, y: -1000 };
    let width = 0;
    let height = 0;
    let columns = 0;
    let gap = 72;
    let frameId;
    let pixelRatio = 1;

    const resize = () => {
      const bounds = section.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      points.length = 0;

      gap = width < 600 ? 58 : 72;
      columns = Math.ceil(width / gap) + 1;
      const rows = Math.ceil(height / gap) + 1;
      const offsetX = (width - (columns - 1) * gap) / 2;
      const offsetY = (height - (rows - 1) * gap) / 2;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = offsetX + column * gap;
          const y = offsetY + row * gap;
          points.push({ x, y, originX: x, originY: y, vx: 0, vy: 0, row, column });
        }
      }
      draw();
    };

    const onPointerMove = (event) => {
      if (!animate || event.pointerType === 'touch') return;
      const bounds = section.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
    };
    const onPointerLeave = () => {
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      if (animate) {
        points.forEach((point) => {
          const dx = pointer.x - point.x;
          const dy = pointer.y - point.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 170) {
            const pull = (1 - distance / 170) * 0.48;
            point.vx += dx * pull * 0.025;
            point.vy += dy * pull * 0.025;
          }
          point.vx += (point.originX - point.x) * 0.025;
          point.vy += (point.originY - point.y) * 0.025;
          point.vx *= 0.88;
          point.vy *= 0.88;
          point.x += point.vx;
          point.y += point.vy;
        });
      }

      context.lineWidth = 0.7;
      points.forEach((point) => {
        const neighbors = [
          [point.row, point.column + 1],
          [point.row + 1, point.column - 1],
          [point.row + 1, point.column],
          [point.row + 1, point.column + 1],
        ];
        neighbors.forEach(([row, column]) => {
          const neighbor = points[row * columns + column];
          if (!neighbor || neighbor.row !== row || neighbor.column !== column) return;
          const distance = Math.hypot(neighbor.x - point.x, neighbor.y - point.y);
          const opacity = Math.max(0.025, 0.105 * (1 - Math.abs(distance - 72) / 110));
          context.strokeStyle = `rgba(170,170,165,${opacity})`;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(neighbor.x, neighbor.y);
          context.stroke();
        });
        context.fillStyle = 'rgba(190,190,184,0.5)';
        context.beginPath();
        context.arc(point.x, point.y, 1.15, 0, Math.PI * 2);
        context.fill();
      });

      if (animate) frameId = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(section);
    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave, { passive: true });
    resize();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-signal" aria-hidden="true" />;
};

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
          <button
            onClick={toggleTheme}
            className={`theme-toggle ${darkTheme ? 'is-dark' : 'is-light'}`}
            aria-label={`Switch to ${darkTheme ? 'light' : 'dark'} theme`}
            aria-pressed={darkTheme}
            title={`Current theme: ${darkTheme ? 'dark' : 'light'}`}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {darkTheme ? <Moon size={12} /> : <Sun size={12} />}
            </span>
            <span className="theme-toggle-label">{darkTheme ? 'DARK' : 'LIGHT'}</span>
            <span className="theme-toggle-status" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
};

const PAGE_SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

const SectionProgress = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let frameId;
    const updateActiveSection = () => {
      frameId = undefined;
      const markerLine = window.innerHeight * 0.42;
      let nextIndex = 0;
      PAGE_SECTIONS.forEach(({ id }, index) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= markerLine) nextIndex = index;
      });
      setActiveIndex(nextIndex);
    };
    const onScroll = () => {
      if (frameId === undefined) frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const markerPosition = 6.3 + (activeIndex / (PAGE_SECTIONS.length - 1)) * 87.4;

  return (
    <nav className="section-progress" aria-label="Page sections">
      <span className="section-progress-track" aria-hidden="true" />
      <span className="section-progress-marker" style={{ top: `${markerPosition}%` }} aria-hidden="true" />
      {PAGE_SECTIONS.map(({ id, label }, index) => (
        <button
          key={id}
          type="button"
          className={index === activeIndex ? 'is-active' : ''}
          aria-label={`Go to ${label} section`}
          aria-current={index === activeIndex ? 'location' : undefined}
          onClick={() => document.getElementById(id)?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start',
          })}
        >
          <span className="sr-only">{label}</span>
        </button>
      ))}
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
          <a href={project.github} className="project-link" target="_blank" rel="noopener noreferrer"><Github size={16} /> <span style={{ borderBottom: '1px solid transparent', transition: '0.3s' }}>Code</span></a>
          {project.live && <a href={project.live} className="project-link" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> <span style={{ borderBottom: '1px solid transparent', transition: '0.3s' }}>Live</span></a>}
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
      <SectionProgress />

      {/* HERO SECTION */}
      <section id="home" className="hero">
        <HeroSignal />
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
              Full Stack Developer.
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
              <a href="/harish-kumar-cv.pdf" className="btn btn-outline" target="_blank" rel="noopener noreferrer" aria-label="View Harish Kumar's CV in a new tab">
                View CV <ExternalLink size={15} />
              </a>
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
                <span className="exp-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
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

