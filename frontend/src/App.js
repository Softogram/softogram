import { useEffect, useState, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Layout from "@/components/redesign/Layout";
import NotFound from "@/pages/NotFound";
import PlaceholderPage from "@/pages/PlaceholderPage";
import axios from "axios";
import { motion, useInView, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import Marquee from "react-fast-marquee";
import {
  Code,
  Globe,
  ShoppingCart,
  Server,
  Briefcase,
  Gamepad2,
  Bot,
  Rocket,
  CheckCircle,
  Check,
  Award,
  MessageCircle,
  Shield,
  Zap,
  Users,
  ChevronRight,
  Menu,
  X,
  Send,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Facebook,
  ExternalLink,
  Quote,
  ArrowRight,
  Layers,
  Database,
  Cloud,
  GitBranch,
  Terminal,
  Monitor,
  Smartphone
} from "lucide-react";
import { cn } from "./lib/utils";
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "./components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Toaster, toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Animated Section Component
const AnimatedSection = ({ children, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// New Logo Component - Code Brackets + Signal Wave
const SoftogramLogo = ({ size = "default", showTagline = false }) => {
  const sizes = {
    small: { icon: "w-9 h-9", text: "text-lg", tagline: "text-[10px]" },
    default: { icon: "w-10 h-10", text: "text-xl", tagline: "text-xs" },
    large: { icon: "w-12 h-12", text: "text-2xl", tagline: "text-sm" }
  };
  
  return (
    <div className="flex items-center gap-3">
      {/* Icon - Code Brackets with Signal Wave */}
      <div className={`${sizes[size].icon} relative flex items-center justify-center`}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-cyan-400/20 rounded-lg blur-md"></div>
        {/* Main icon */}
        <svg viewBox="0 0 40 40" className="w-full h-full relative z-10" fill="none">
          {/* Left bracket < */}
          <path 
            d="M12 8L4 20L12 32" 
            stroke="url(#bracketGradient)" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right bracket > morphing into signal */}
          <path 
            d="M28 8L36 20L28 32" 
            stroke="url(#bracketGradient)" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Signal wave in center */}
          <path 
            d="M14 20H17L19 14L21 26L23 17L25 23L26 20H28" 
            stroke="url(#signalGradient)" 
            strokeWidth="2" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glowing core dot */}
          <circle cx="20" cy="20" r="2" fill="#00F5FF">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
          </circle>
          {/* Gradients */}
          <defs>
            <linearGradient id="bracketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F5FF"/>
              <stop offset="100%" stopColor="#7C3AED"/>
            </linearGradient>
            <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F5FF"/>
              <stop offset="50%" stopColor="#00F5FF"/>
              <stop offset="100%" stopColor="#7C3AED"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Wordmark */}
      <div className="flex flex-col">
        <span className={`font-bold ${sizes[size].text} text-white font-['Space_Grotesk'] tracking-tight leading-none`}>
          Softo<span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">gram</span>
        </span>
        {showTagline && (
          <span className={`${sizes[size].tagline} text-gray-500 mt-1 tracking-wide`}>
            Your idea. Our code. Delivered.
          </span>
        )}
      </div>
    </div>
  );
};

// Typing Animation Component
const TypingCode = () => {
  const lines = [
    { indent: 0, content: [
      { text: "const ", type: "keyword" },
      { text: "softogram", type: "variable" },
      { text: " = {", type: "bracket" }
    ]},
    { indent: 1, content: [
      { text: "mission", type: "function" },
      { text: ": ", type: "bracket" },
      { text: '"Build dreams"', type: "string" },
      { text: ",", type: "bracket" }
    ]},
    { indent: 1, content: [
      { text: "approach", type: "function" },
      { text: ": ", type: "bracket" },
      { text: '"Your idea"', type: "string" },
      { text: ",", type: "bracket" }
    ]},
    { indent: 1, content: [
      { text: "delivery", type: "function" },
      { text: ": ", type: "bracket" },
      { text: '"Our code"', type: "string" },
      { text: ",", type: "bracket" }
    ]},
    { indent: 1, content: [
      { text: "result", type: "function" },
      { text: ": ", type: "bracket" },
      { text: '"Delivered"', type: "string" }
    ]},
    { indent: 0, content: [
      { text: "};", type: "bracket" }
    ]},
    { indent: 0, content: [] },
    { indent: 0, content: [
      { text: "// ", type: "comment" },
      { text: "Let's build together", type: "comment" }
    ]}
  ];

  return (
    <div className="code-window animate-float">
      <div className="code-window-header">
        <div className="code-dot code-dot-red"></div>
        <div className="code-dot code-dot-yellow"></div>
        <div className="code-dot code-dot-green"></div>
        <span className="text-xs text-gray-500 ml-4">softogram.js</span>
      </div>
      <div className="code-content">
        {lines.map((line, lineIndex) => (
          <motion.div 
            key={lineIndex} 
            className="code-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: lineIndex * 0.3 }}
          >
            <span style={{ marginLeft: `${line.indent * 20}px` }}>
              {line.content.map((part, partIndex) => (
                <span key={partIndex} className={`code-${part.type}`}>
                  {part.text}
                </span>
              ))}
            </span>
          </motion.div>
        ))}
        <span className="typing-cursor"></span>
      </div>
    </div>
  );
};

// Navbar Component
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = isHomePage ? [
    { href: "#services", label: "Services" },
    { href: "/case-studies", label: "Case Studies", isRoute: true },
    { href: "#pricing", label: "Pricing" },
    { href: "/blog", label: "Blog", isRoute: true },
    { href: "#contact", label: "Contact" }
  ] : [
    { href: "/", label: "Home", isRoute: true },
    { href: "/#services", label: "Services" },
    { href: "/case-studies", label: "Case Studies", isRoute: true },
    { href: "/blog", label: "Blog", isRoute: true },
    { href: "/#contact", label: "Contact" }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`mx-auto max-w-5xl rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "navbar-glass shadow-2xl" : "bg-black/50 backdrop-blur-md border border-white/10"
        }`}
        data-testid="navbar"
      >
        <Link to="/" className="flex items-center" data-testid="logo-link">
          <SoftogramLogo size="small" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                className="text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium whitespace-nowrap"
                data-testid={`nav-link-${link.label.toLowerCase().replace(" ", "-")}`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium whitespace-nowrap"
                data-testid={`nav-link-${link.label.toLowerCase().replace(" ", "-")}`}
              >
                {link.label}
              </a>
            )
          ))}
          {isHomePage ? (
            <a href="#contact">
              <button className="btn-glow text-sm px-5 py-2 whitespace-nowrap" data-testid="nav-cta-button">
                Start Project
              </button>
            </a>
          ) : (
            <Link to="/#contact">
              <button className="btn-glow text-sm px-5 py-2 whitespace-nowrap" data-testid="nav-cta-button">
                Start Project
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 mt-2 navbar-glass rounded-2xl p-4 lg:hidden"
              data-testid="mobile-menu"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  link.isRoute ? (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors text-base font-medium py-3 px-4 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors text-base font-medium py-3 px-4 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  )
                ))}
                <div className="pt-2 mt-2 border-t border-white/10">
                  <a href={isHomePage ? "#contact" : "/#contact"} onClick={() => setMobileMenuOpen(false)}>
                    <button className="btn-glow w-full py-3 text-sm">
                      Start Project
                    </button>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

// Word-by-word animated headline for the hero
const AnimatedHeadline = () => {
  const line1 = ["We", "Build", "Software", "That"];
  const line2 = ["Grows", "Your", "Business"];

  const wordVariants = {
    hidden: { opacity: 0, y: 24, skewX: -4 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      skewX: 0,
      transition: {
        delay: i * 0.12 + 0.3,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight font-['Space_Grotesk']">
      <span className="flex flex-wrap justify-center gap-x-3">
        {line1.map((word, i) => (
          <motion.span
            key={word}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
            className="inline-block"
          >
            {word}
          </motion.span>
        ))}
      </span>
      <span className="flex flex-wrap justify-center gap-x-3 mt-1">
        {line2.map((word, i) => (
          <motion.span
            key={word}
            custom={line1.length + i}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
            className="inline-block gradient-text"
          >
            {word}
          </motion.span>
        ))}
      </span>
    </h1>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden px-4 dot-pattern pt-20"
      data-testid="hero-section"
    >
      {/* Background Orbs */}
      <div className="gradient-orb orb-cyan absolute -top-48 -right-48" />
      <div className="gradient-orb orb-violet absolute -bottom-32 -left-32" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto pt-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8"
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-gray-400">Premium Software Development Studio</span>
        </motion.div>

        {/* Word-by-word animated headline */}
        <AnimatedHeadline />

        {/* Subtitle — fades in after headline words finish */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.15, ease: "easeOut" }}
          className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Custom websites, web apps, enterprise software, games, and intelligent automation —{" "}
          end-to-end digital solutions for ambitious businesses.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.35, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a href="#contact">
            <button className="btn-glow flex items-center gap-2 text-base" data-testid="hero-cta-quote">
              Start Your Project
              <ArrowRight className="w-5 h-5" />
            </button>
          </a>
          <a href="#portfolio">
            <button className="btn-outline text-base" data-testid="hero-cta-work">
              Explore Our Work
            </button>
          </a>
        </motion.div>
      </div>

      {/* Code Window — unchanged */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2"
      >
        <TypingCode />
      </motion.div>
    </section>
  );
};

// Stats Section
const StatsSection = () => {
  const stats = [
    { value: 15, suffix: "+", label: "Projects Delivered", icon: CheckCircle },
    { value: 10, suffix: "+", label: "Happy Clients", icon: Users },
    { value: 3, suffix: "+", label: "Years Experience", icon: Award },
    { value: 100, suffix: "%", label: "On-Time Delivery", icon: Zap }
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-12 border-y border-[#2A2A2A] bg-[#0D0D0D]" data-testid="stats-section">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
              data-testid={`stat-item-${index}`}
            >
              <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
              <div className="stat-number text-3xl md:text-4xl mb-1">
                {isInView && (
                  <CountUp end={stat.value} duration={2.5} suffix={stat.suffix} />
                )}
              </div>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Services Section
const ServicesSection = () => {
  const services = [
    {
      icon: Code,
      title: "Custom Web Applications",
      description: "We architect and develop full-stack web applications tailored to your business logic — from complex dashboards and SaaS platforms to internal tools with real-time capabilities."
    },
    {
      icon: Globe,
      title: "Business & Portfolio Websites",
      description: "High-performance, SEO-optimized, and conversion-focused websites built with pixel-perfect UI — crafted to make your brand stand out and turn visitors into leads."
    },
    {
      icon: ShoppingCart,
      title: "E-commerce Platforms",
      description: "End-to-end commerce solutions with product management, secure payment gateways, order tracking, and analytics dashboards — built to handle real-world scale."
    },
    {
      icon: Server,
      title: "API Development & Microservices",
      description: "We design RESTful and gRPC APIs with microservices architecture — decoupled, scalable, and production-ready backend systems engineered for performance and reliability."
    },
    {
      icon: Briefcase,
      title: "Business Software & Enterprise Tools",
      description: "Custom ERP systems, CRM platforms, inventory management tools, billing software, and internal dashboards — purpose-built software that streamlines your operations."
    },
    {
      icon: Gamepad2,
      title: "Game Development",
      description: "From casual 2D browser games to interactive gamified experiences and simulation tools — we build engaging, performant games using modern game engines and web technologies."
    },
    {
      icon: Bot,
      title: "AI-Powered Automation & Workflows",
      description: "We integrate intelligent automation into your business processes — from automated data pipelines and report generation to AI-assisted workflows and chatbots."
    },
    {
      icon: Rocket,
      title: "Future-Ready Tech & Scalability",
      description: "We help you architect systems that don't just work today — we build with cloud-native infrastructure, containerization, CI/CD pipelines, and scalable microservices."
    }
  ];

  return (
    <section id="services" className="section-padding bg-[#0D0D0D]" data-testid="services-section">
      <div className="container-custom">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-['Space_Grotesk']">
            <span className="gradient-text">What We Build For You</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From idea to deployment — we engineer solutions that perform, scale, and evolve with your business.
          </p>
        </AnimatedSection>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="glass-card p-6 group"
              data-testid={`service-card-${index}`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center mb-5 group-hover:from-cyan-500/30 group-hover:to-violet-500/30 transition-all">
                <service.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3 font-['Space_Grotesk']">{service.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Case Studies Section
const CaseStudiesSection = () => {
  const caseStudy = {
    title: "Polluxkart",
    subtitle: "Full-Stack E-commerce Platform",
    description: "A complete e-commerce solution built from the ground up, featuring a modern React frontend, FastAPI Python backend, and microservices architecture deployed on AWS.",
    challenge: "The client needed a scalable e-commerce platform that could handle thousands of concurrent users, integrate multiple payment gateways, and provide real-time inventory management across multiple warehouses.",
    solution: "We architected a microservices-based system with separate services for user management, product catalog, orders, payments, and inventory. Each service was containerized using Docker and deployed on AWS ECS with auto-scaling capabilities.",
    results: [
      { metric: "99.9%", label: "Uptime Achieved" },
      { metric: "< 200ms", label: "Average API Response" },
      { metric: "10,000+", label: "Concurrent Users" },
      { metric: "3x", label: "Sales Increase" }
    ],
    techStack: [
      { name: "React.js", icon: Monitor, category: "Frontend" },
      { name: "FastAPI", icon: Terminal, category: "Backend" },
      { name: "Node.js", icon: Server, category: "Services" },
      { name: "PostgreSQL", icon: Database, category: "Database" },
      { name: "Redis", icon: Zap, category: "Caching" },
      { name: "Docker", icon: Layers, category: "Container" },
      { name: "AWS", icon: Cloud, category: "Cloud" },
      { name: "GitHub Actions", icon: GitBranch, category: "CI/CD" }
    ],
    architecture: [
      { phase: "Frontend", description: "React.js with Redux for state management, Tailwind CSS for styling, deployed on AWS CloudFront CDN" },
      { phase: "API Gateway", description: "FastAPI with async request handling, JWT authentication, rate limiting, and request validation" },
      { phase: "Microservices", description: "Node.js services for real-time features (chat, notifications), Python services for ML-based recommendations" },
      { phase: "Database Layer", description: "PostgreSQL for transactional data, Redis for caching and session management, Elasticsearch for product search" },
      { phase: "Infrastructure", description: "AWS ECS for container orchestration, RDS for managed databases, S3 for media storage, CloudWatch for monitoring" }
    ]
  };

  return (
    <section id="case-studies" className="section-padding bg-black" data-testid="case-studies-section">
      <div className="container-custom">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-['Space_Grotesk']">
            <span className="gradient-text">Case Study: Deep Dive</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            See how we approach complex projects — from architecture to deployment.
          </p>
        </AnimatedSection>

        {/* Main Case Study Card */}
        <div className="glass-card p-8 md:p-12 mb-12">
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            <div className="lg:w-1/2">
              <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Featured Project</span>
              <h3 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4 font-['Space_Grotesk']">{caseStudy.title}</h3>
              <p className="text-xl text-gray-400 mb-6">{caseStudy.subtitle}</p>
              <p className="text-gray-500 leading-relaxed">{caseStudy.description}</p>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop" 
                alt="Polluxkart E-commerce Platform"
                className="w-full h-64 lg:h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {caseStudy.results.map((result, index) => (
              <div key={index} className="text-center p-6 bg-[#111111] rounded-xl border border-[#2A2A2A]">
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">{result.metric}</div>
                <p className="text-gray-500 text-sm">{result.label}</p>
              </div>
            ))}
          </div>

          {/* Challenge & Solution */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-[#111111] rounded-xl border-l-4 border-cyan-400">
              <h4 className="text-xl font-bold text-white mb-4 font-['Space_Grotesk']">The Challenge</h4>
              <p className="text-gray-500 leading-relaxed">{caseStudy.challenge}</p>
            </div>
            <div className="p-6 bg-[#111111] rounded-xl border-l-4 border-violet-500">
              <h4 className="text-xl font-bold text-white mb-4 font-['Space_Grotesk']">Our Solution</h4>
              <p className="text-gray-500 leading-relaxed">{caseStudy.solution}</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-12">
            <h4 className="text-xl font-bold text-white mb-6 font-['Space_Grotesk']">Technology Stack</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {caseStudy.techStack.map((tech, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-[#111111] rounded-xl border border-[#2A2A2A] hover:border-cyan-400/30 transition-all">
                  <tech.icon className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-white font-medium text-sm">{tech.name}</p>
                    <p className="text-gray-600 text-xs">{tech.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Breakdown */}
          <div>
            <h4 className="text-xl font-bold text-white mb-6 font-['Space_Grotesk']">Architecture Breakdown</h4>
            <div className="space-y-4">
              {caseStudy.architecture.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-[#111111] rounded-xl border border-[#2A2A2A]">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-1">{item.phase}</h5>
                    <p className="text-gray-500 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <a href="#contact">
            <button className="btn-glow">
              Discuss Your Project
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  // Master feature list for comparison table — ordered from basic to advanced
  const allFeatures = [
    "Responsive design",
    "Contact form integration",
    "Basic SEO setup",
    "Business website (up to 5 pages)",
    "2 revision rounds",
    "Custom web application",
    "E-commerce capabilities",
    "API integration",
    "Admin dashboard",
    "3 months post-launch support",
    "Priority development",
    "Enterprise software development",
    "Game development",
    "AI automation & workflows",
    "Microservices architecture",
    "Cloud infrastructure",
    "Dedicated support & custom SLA",
  ];

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "₹10,000 – ₹25,000",
      description: "Perfect for small businesses getting started online",
      popular: false,
      buttonLabel: "Get Started",
      features: [
        { name: "Responsive design", isIncluded: true },
        { name: "Contact form integration", isIncluded: true },
        { name: "Basic SEO setup", isIncluded: true },
        { name: "Business website (up to 5 pages)", isIncluded: true },
        { name: "2 revision rounds", isIncluded: true },
        { name: "Custom web application", isIncluded: false },
        { name: "E-commerce capabilities", isIncluded: false },
        { name: "API integration", isIncluded: false },
        { name: "Admin dashboard", isIncluded: false },
        { name: "3 months post-launch support", isIncluded: false },
        { name: "Priority development", isIncluded: false },
        { name: "Enterprise software development", isIncluded: false },
        { name: "Game development", isIncluded: false },
        { name: "AI automation & workflows", isIncluded: false },
        { name: "Microservices architecture", isIncluded: false },
        { name: "Cloud infrastructure", isIncluded: false },
        { name: "Dedicated support & custom SLA", isIncluded: false },
      ],
    },
    {
      id: "growth",
      name: "Growth",
      price: "₹25,000 – ₹1,00,000",
      description: "For businesses ready to scale with custom solutions",
      popular: true,
      buttonLabel: "Get Started",
      features: [
        { name: "Responsive design", isIncluded: true },
        { name: "Contact form integration", isIncluded: true },
        { name: "Basic SEO setup", isIncluded: true },
        { name: "Business website (up to 5 pages)", isIncluded: true },
        { name: "2 revision rounds", isIncluded: true },
        { name: "Custom web application", isIncluded: true },
        { name: "E-commerce capabilities", isIncluded: true },
        { name: "API integration", isIncluded: true },
        { name: "Admin dashboard", isIncluded: true },
        { name: "3 months post-launch support", isIncluded: true },
        { name: "Priority development", isIncluded: true },
        { name: "Enterprise software development", isIncluded: false },
        { name: "Game development", isIncluded: false },
        { name: "AI automation & workflows", isIncluded: false },
        { name: "Microservices architecture", isIncluded: false },
        { name: "Cloud infrastructure", isIncluded: false },
        { name: "Dedicated support & custom SLA", isIncluded: false },
      ],
    },
    {
      id: "custom",
      name: "Custom",
      price: "Let's Talk",
      description: "Enterprise solutions tailored to your exact needs",
      popular: false,
      buttonLabel: "Contact Us",
      features: [
        { name: "Responsive design", isIncluded: true },
        { name: "Contact form integration", isIncluded: true },
        { name: "Basic SEO setup", isIncluded: true },
        { name: "Business website (up to 5 pages)", isIncluded: true },
        { name: "2 revision rounds", isIncluded: true },
        { name: "Custom web application", isIncluded: true },
        { name: "E-commerce capabilities", isIncluded: true },
        { name: "API integration", isIncluded: true },
        { name: "Admin dashboard", isIncluded: true },
        { name: "3 months post-launch support", isIncluded: true },
        { name: "Priority development", isIncluded: true },
        { name: "Enterprise software development", isIncluded: true },
        { name: "Game development", isIncluded: true },
        { name: "AI automation & workflows", isIncluded: true },
        { name: "Microservices architecture", isIncluded: true },
        { name: "Cloud infrastructure", isIncluded: true },
        { name: "Dedicated support & custom SLA", isIncluded: true },
      ],
    },
  ];

  return (
    <section id="pricing" className="section-padding bg-[#0D0D0D]" data-testid="pricing-section">
      <div className="container-custom">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-['Space_Grotesk']">
            <span className="gradient-text">Simple, Transparent Pricing</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            No surprise costs. No vague timelines. Just clear value.
          </p>
        </AnimatedSection>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 items-start">
          {plans.map((plan) => {
            const includedFeatures = plan.features.filter((f) => f.isIncluded);
            return (
              <AnimatedSection key={plan.id}>
                <Card
                  className={cn(
                    "flex flex-col bg-[#111111] border-[#2A2A2A] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10",
                    plan.popular &&
                      "ring-2 ring-cyan-400 shadow-xl shadow-cyan-400/20 md:scale-[1.03] hover:scale-[1.05] hover:shadow-cyan-400/30"
                  )}
                  data-testid={`pricing-card-${plan.id}`}
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl font-bold text-white font-['Space_Grotesk']">
                        {plan.name}
                      </CardTitle>
                      {plan.popular && (
                        <span className="text-xs font-semibold px-3 py-1 bg-gradient-to-r from-cyan-400 to-violet-500 text-black rounded-full whitespace-nowrap">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold gradient-text mt-3">{plan.price}</div>
                    <CardDescription className="text-gray-500 text-sm mt-1">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow px-6 pb-0 pt-0">
                    <h4 className="text-xs font-semibold mb-3 text-gray-500 uppercase tracking-wider">
                      What's included
                    </h4>
                    <ul className="space-y-2">
                      {includedFeatures.slice(0, 5).map((feature) => (
                        <li key={feature.name} className="flex items-start gap-3 py-1">
                          <Check
                            className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span className="text-gray-400 text-sm">{feature.name}</span>
                        </li>
                      ))}
                      {includedFeatures.length > 5 && (
                        <li className="text-sm text-gray-500 mt-1 pl-7">
                          + {includedFeatures.length - 5} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>

                  <CardFooter className="p-6 pt-4">
                    <a href="#contact" className="w-full">
                      <button
                        className={`w-full py-3 font-semibold rounded-full transition-all ${
                          plan.popular ? "btn-glow" : "btn-outline"
                        }`}
                        data-testid={`pricing-cta-${plan.id}`}
                      >
                        {plan.buttonLabel}
                      </button>
                    </a>
                  </CardFooter>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Comparison Table — desktop/tablet only */}
        <div className="mt-16 hidden md:block border border-[#2A2A2A] rounded-xl overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2A2A2A]">
            <thead>
              <tr className="bg-[#111111]">
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-400 w-[280px]"
                >
                  Feature
                </th>
                {plans.map((plan) => (
                  <th
                    key={`th-${plan.id}`}
                    scope="col"
                    className={cn(
                      "px-6 py-4 text-center text-sm font-semibold whitespace-nowrap",
                      plan.popular ? "text-cyan-400 bg-cyan-500/5" : "text-gray-400"
                    )}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {allFeatures.map((featureName, index) => (
                <tr
                  key={featureName}
                  className={cn(
                    "transition-colors hover:bg-white/5",
                    index % 2 !== 0 && "bg-[#0D0D0D]/60"
                  )}
                >
                  <td className="px-6 py-3 text-left text-sm text-gray-400 font-medium">
                    {featureName}
                  </td>
                  {plans.map((plan) => {
                    const feature = plan.features.find((f) => f.name === featureName);
                    const isIncluded = feature?.isIncluded ?? false;
                    return (
                      <td
                        key={`${plan.id}-${featureName}`}
                        className={cn(
                          "px-6 py-3 text-center",
                          plan.popular && "bg-cyan-500/5"
                        )}
                      >
                        {isIncluded ? (
                          <Check
                            className="h-4 w-4 mx-auto text-cyan-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <X
                            className="h-4 w-4 mx-auto text-gray-700"
                            aria-hidden="true"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// Projects Section
const ProjectsSection = () => {
  const projects = [
    {
      title: "Polluxkart",
      description: "Full-stack e-commerce platform. React frontend, Python microservices backend, AWS deployment. Features: product catalog, cart, payments, order management.",
      tags: ["React", "Python", "FastApi", "AWS", "Microservices", "Mongodb"],
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
      link: "https://polluxkart.com"
    },
    {
      title: "Expense Splitter App",
      description: "Real-time group expense management with balance tracking and smart settlement suggestions.",
      tags: ["Java", "Spring Boot", "PostgreSQL", "REST API"],
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
      link: "https://cosmicsaaurabh.github.io/myportfoliooo/"
    },
    {
      title: "Custom API Gateway",
      description: "High-performance API gateway with dynamic routing, JWT authentication, and rate limiting built for a microservices ecosystem.",
      tags: ["Go", "Docker", "Kubernetes", "gRPC"],
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
      link: "#"
    }
  ];

  return (
    <section id="portfolio" className="section-padding bg-black" data-testid="portfolio-section">
      <div className="container-custom">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-['Space_Grotesk']">
            <span className="gradient-text">Work We're Proud Of</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real projects. Real impact. Built with precision.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <AnimatedSection key={index}>
              <div className="glass-card overflow-hidden group h-full flex flex-col" data-testid={`project-card-${index}`}>
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-3 font-['Space_Grotesk']">{project.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 flex-grow">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline w-full py-2 text-sm flex items-center justify-center gap-2"
                      data-testid={`project-view-${index}`}
                  >
                    View Project
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Softogram built our e-commerce platform from scratch. Delivery was on time and quality exceeded every expectation.",
      name: "Rahul Sharma",
      title: "Founder, ShopEasy",
      initials: "RS"
    },
    {
      quote: "Their API architecture transformed how our platform scales under load. Incredibly professional team.",
      name: "Priya Mehta",
      title: "CTO, TechNova",
      initials: "PM"
    },
    {
      quote: "We had a stunning business website live in 3 weeks. Our inbound inquiries doubled within a month.",
      name: "Amit Singh",
      title: "Owner, Prayagraj Traders",
      initials: "AS"
    }
  ];

  return (
    <section className="section-padding bg-[#0D0D0D]" data-testid="testimonials-section">
      <div className="container-custom">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-['Space_Grotesk']">
            <span className="gradient-text">Trusted By Growing Businesses</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients say.
          </p>
        </AnimatedSection>

        <Marquee gradient={false} speed={40} pauseOnHover>
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-8 mx-4 w-96 flex-shrink-0"
              data-testid={`testimonial-card-${index}`}
            >
              <Quote className="w-8 h-8 text-cyan-400 mb-4" />
              <p className="text-gray-400 mb-6 leading-relaxed">{testimonial.quote}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-black font-bold">
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

// Why Choose Us Section
const WhyChooseUsSection = () => {
  const features = [
    {
      icon: Award,
      title: "Enterprise-Grade Experience",
      description: "3+ years building production software at global tech companies. We bring that rigor to every project."
    },
    {
      icon: CheckCircle,
      title: "Full-Cycle Delivery",
      description: "Design, development, testing, deployment, and post-launch support — all under one roof."
    },
    {
      icon: MessageCircle,
      title: "Radical Transparency",
      description: "Weekly progress updates, clear milestones, no hidden costs, no surprises."
    },
    {
      icon: Shield,
      title: "Engineered to Scale",
      description: "Cloud-native architecture, containerized deployments, and future-proof tech stacks that grow with you."
    }
  ];

  return (
    <section id="about" className="section-padding bg-black" data-testid="why-choose-section">
      <div className="container-custom">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-['Space_Grotesk']">
            <span className="gradient-text">Why Businesses Choose Softogram</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We don't just build software. We build partnerships.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={index}>
              <div className="glass-card p-8 flex gap-6" data-testid={`feature-card-${index}`}>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">{feature.title}</h3>
                  <p className="text-gray-500">{feature.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Section
const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
    budget: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.service || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API}/contact`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        message: `${formData.message}\n\nBudget Range: ${formData.budget || 'Not specified'}`
      });
      if (response.data.status === "success") {
        toast.success(response.data.message);
        setFormData({ name: "", email: "", phone: "", service: "", message: "", budget: "" });
      }
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    "Custom Web Application",
    "Business & Portfolio Website",
    "E-commerce Platform",
    "API Development & Microservices",
    "Business Software & Enterprise Tools",
    "Game Development",
    "AI-Powered Automation",
    "Future-Ready Tech Consulting"
  ];

  const budgetRanges = [
    "Under ₹50,000",
    "₹50,000 – ₹2,00,000",
    "₹2,00,000+",
    "Not Sure"
  ];

  return (
    <section id="contact" className="section-padding bg-[#0D0D0D]" data-testid="contact-section">
      <div className="container-custom">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-['Space_Grotesk']">
            <span className="gradient-text">Let's Build Something Great Together</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Share your idea with us. We'll respond within 24 hours with a free consultation.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <AnimatedSection>
            <form onSubmit={handleSubmit} className="glass-card p-8" data-testid="contact-form">
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Full Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-dark w-full"
                    data-testid="contact-name-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email Address *</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-dark w-full"
                    data-testid="contact-email-input"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91-6393783010"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-dark w-full"
                    data-testid="contact-phone-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Service Interested In *</label>
                  <Select
                    value={formData.service}
                    onValueChange={(value) => setFormData({ ...formData, service: value })}
                  >
                    <SelectTrigger 
                      className="bg-[#111111] border-[#2A2A2A] text-white focus:border-cyan-400 h-[46px]"
                      data-testid="contact-service-select"
                    >
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#2A2A2A]">
                      {services.map((service) => (
                        <SelectItem 
                          key={service} 
                          value={service}
                          className="text-white hover:bg-[#1A1A1A] focus:bg-[#1A1A1A]"
                        >
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Budget Range</label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                >
                  <SelectTrigger 
                    className="bg-[#111111] border-[#2A2A2A] text-white focus:border-cyan-400 h-[46px]"
                    data-testid="contact-budget-select"
                  >
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#2A2A2A]">
                    {budgetRanges.map((budget) => (
                      <SelectItem 
                        key={budget} 
                        value={budget}
                        className="text-white hover:bg-[#1A1A1A] focus:bg-[#1A1A1A]"
                      >
                        {budget}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Project Brief *</label>
                <textarea
                  placeholder="Tell us about your project..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="input-dark w-full resize-none"
                  data-testid="contact-message-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-glow w-full py-4 text-base flex items-center justify-center gap-2"
                data-testid="contact-submit-button"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send className="w-5 h-5" />
              </button>
            </form>
          </AnimatedSection>

          {/* Contact Info */}
          <AnimatedSection>
            <div className="h-full flex flex-col gap-6">
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6 font-['Space_Grotesk']">Get in Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Email Us</h4>
                      <a href="mailto:support@softogram.com" className="text-gray-500 hover:text-cyan-400 transition-colors" data-testid="contact-email-link">
                        support@softogram.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Call Us</h4>
                      <a href="tel:+91-6393783010" className="text-gray-500 hover:text-cyan-400 transition-colors" data-testid="contact-phone-link">
                        +91-6393783010
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Location</h4>
                      <p className="text-gray-500" data-testid="contact-location">Uttar Pradesh, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="glass-card p-8 flex-grow">
                <h3 className="text-xl font-bold text-white mb-6 font-['Space_Grotesk']">Connect With Us</h3>
                <div className="flex gap-4">
                  {[
                    { icon: Linkedin, href: "https://www.linkedin.com/company/softogram/about/", label: "LinkedIn" },
                    { icon: Github, href: "#", label: "GitHub" },
                    { icon: Twitter, href: "#", label: "Twitter" },
                    { icon: Instagram, href: "#", label: "Instagram" },
                    { icon: Facebook, href: "#", label: "Facebook" }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all group"
                      data-testid={`social-link-${social.label.toLowerCase()}`}
                    >
                      <social.icon className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { href: "/", label: "Home" },
      { href: "/#services", label: "Services" },
      { href: "/#case-studies", label: "Case Studies" },
      { href: "/#portfolio", label: "Portfolio" },
      { href: "/#contact", label: "Contact" }
    ],
    legal: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms-and-conditions", label: "Terms & Conditions" },
      { href: "/refund-policy", label: "Refund Policy" },
      { href: "/cookie-policy", label: "Cookie Policy" }
    ]
  };

  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/company/softogram/about/", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" }
  ];

  return (
    <footer className="bg-[#050505] relative" data-testid="footer">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      
      <div className="container-custom">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Section - Takes more space */}
          <div className="lg:col-span-5">
            <SoftogramLogo size="default" showTagline={true} />
            <p className="text-gray-500 mt-6 text-sm leading-relaxed max-w-sm">
              We're a premium software development studio crafting digital experiences 
              that help businesses grow. From startups to enterprises.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all group"
                  data-testid={`footer-social-${social.label.toLowerCase()}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-semibold mb-4 font-['Space_Grotesk']">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4 font-['Space_Grotesk']">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4 font-['Space_Grotesk']">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:support@softogram.com"
                  className="text-gray-500 hover:text-cyan-400 transition-colors text-sm flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 flex-shrink-0"/> <span> support@softogram.com</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+91-6393783010"
                  className="text-gray-500 hover:text-cyan-400 transition-colors text-sm flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>+91-6393783010</span>
                </a>
              </li>
              <li className="text-gray-500 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Uttar Pradesh, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm text-center sm:text-left">
              © {currentYear} Softogram. All rights reserved.
            </p>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              Crafted with precision in India <span className="ml-1">🇮🇳</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// WhatsApp Button
const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/6393783010?text=Hello%20Softogram!%20I%20have%20a%20project%20idea%20I'd%20like%20to%20discuss."
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
      data-testid="whatsapp-button"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
};

// Policy Page Layout Component
const PolicyLayout = ({ title, lastUpdated, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-32 pb-20"
      >
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Space_Grotesk']">
            <span className="gradient-text">{title}</span>
          </h1>
          <p className="text-gray-500 text-sm mb-12">Last updated: {lastUpdated}</p>
          <div className="space-y-8">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Policy Section Component
const PolicySection = ({ title, children }) => (
  <div className="policy-section">
    <h2 className="text-xl font-semibold text-white mb-4 pl-4 border-l-4 border-cyan-400 font-['Space_Grotesk']">
      {title}
    </h2>
    <div className="text-gray-400 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

// Privacy Policy Page
const PrivacyPolicy = () => (
  <PolicyLayout title="Privacy Policy" lastUpdated="March 2026">
    <PolicySection title="Information We Collect">
      <p>We collect information you provide directly to us, including:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Name, email address, and phone number</li>
        <li>Project details and requirements submitted via our contact form</li>
        <li>Communication history and correspondence</li>
        <li>Any other information you choose to provide</li>
      </ul>
    </PolicySection>

    <PolicySection title="How We Use Your Information">
      <p>We use the information we collect to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Respond to your inquiries and provide customer support</li>
        <li>Deliver project work and related services</li>
        <li>Send you updates about your project and our services</li>
        <li>Improve our website and services</li>
        <li>Comply with legal obligations</li>
      </ul>
    </PolicySection>

    <PolicySection title="Data Storage & Security">
      <p>Your data is stored securely using industry-standard encryption and security practices. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      <p className="mt-4">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
    </PolicySection>

    <PolicySection title="Cookies">
      <p>We use cookies and similar tracking technologies to analyze website traffic and improve your experience. These include:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Essential cookies required for website functionality</li>
        <li>Analytics cookies (Google Analytics) to understand how visitors use our site</li>
        <li>Preference cookies to remember your settings</li>
      </ul>
      <p className="mt-4">You can control cookie settings through your browser preferences.</p>
    </PolicySection>

    <PolicySection title="Third-Party Services">
      <p>We may use third-party services that collect, monitor, and analyze data:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Google Analytics for website traffic analysis</li>
        <li>WhatsApp Business for customer communication</li>
        <li>Email service providers for communication</li>
      </ul>
    </PolicySection>

    <PolicySection title="Your Rights">
      <p>You have the right to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data at any time</li>
        <li>Opt-out of marketing communications</li>
      </ul>
      <p className="mt-4">To exercise any of these rights, please email us at <a href="mailto:support@softogram.com" className="text-cyan-400 hover:underline">support@softogram.com</a></p>
    </PolicySection>

    <PolicySection title="Changes to This Policy">
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.</p>
    </PolicySection>

    <PolicySection title="Contact Us">
      <p>If you have any questions about this Privacy Policy, please contact us at:</p>
      <p className="mt-2"><strong className="text-white">Email:</strong> <a href="mailto:support@softogram.com" className="text-cyan-400 hover:underline">support@softogram.com</a></p>
    </PolicySection>
  </PolicyLayout>
);

// Terms and Conditions Page
const TermsAndConditions = () => (
  <PolicyLayout title="Terms & Conditions" lastUpdated="March 2026">
    <PolicySection title="Acceptance of Terms">
      <p>By engaging Softogram's services, accessing our website, or entering into any agreement with us, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>
    </PolicySection>

    <PolicySection title="Services">
      <p>Softogram provides custom software development services, including but not limited to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Web application development</li>
        <li>Business and portfolio websites</li>
        <li>E-commerce platform development</li>
        <li>API development and microservices</li>
        <li>Enterprise software solutions</li>
        <li>Game development</li>
        <li>AI-powered automation and consulting</li>
      </ul>
    </PolicySection>

    <PolicySection title="Project Engagement">
      <p>All projects begin with a signed proposal outlining scope, deliverables, timeline, and pricing. An advance payment of 40–50% of the total project cost is required before work commences. The remaining balance is due upon project completion or as specified in the project agreement.</p>
    </PolicySection>

    <PolicySection title="Intellectual Property">
      <p>Upon receipt of full and final payment:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Full ownership of all custom code, designs, and deliverables transfers to the client</li>
        <li>Softogram retains the right to display the work in our portfolio (unless otherwise agreed)</li>
        <li>Third-party libraries and frameworks remain subject to their respective licenses</li>
      </ul>
    </PolicySection>

    <PolicySection title="Confidentiality">
      <p>Softogram agrees to keep all client project details, business information, and proprietary data strictly confidential. We will not disclose any information to third parties without explicit written consent, except as required by law.</p>
    </PolicySection>

    <PolicySection title="Revisions & Scope">
      <p>Revisions are limited to the agreed project scope as defined in the proposal. Additional work, features, or changes outside the original scope will be quoted and billed separately. Change requests must be submitted in writing and approved by both parties.</p>
    </PolicySection>

    <PolicySection title="Payment Terms">
      <p>All invoices are due within 7 days of issuance unless otherwise specified. Late payments will attract interest at the rate of 2% per month on the outstanding amount. Softogram reserves the right to suspend work on projects with overdue payments.</p>
    </PolicySection>

    <PolicySection title="Limitation of Liability">
      <p>Softogram shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of our software or services. Our total liability shall not exceed the amount paid by the client for the specific services giving rise to the claim.</p>
    </PolicySection>

    <PolicySection title="Termination">
      <p>Either party may terminate the agreement with 14 days written notice. Upon termination:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>All work completed to date will be delivered and billed</li>
        <li>Any advance payment for incomplete work will be adjusted based on work delivered</li>
        <li>Client must pay for all work completed up to the termination date</li>
      </ul>
    </PolicySection>

    <PolicySection title="Governing Law">
      <p>These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Uttar Pradesh, India.</p>
    </PolicySection>
  </PolicyLayout>
);

// Refund Policy Page
const RefundPolicy = () => (
  <PolicyLayout title="Refund & Cancellation Policy" lastUpdated="March 2026">
    <PolicySection title="Advance Payment">
      <p>The initial deposit (40–50% of project cost) is non-refundable once project work has commenced. This advance covers initial planning, resource allocation, and preliminary development work.</p>
    </PolicySection>

    <PolicySection title="Mid-Project Cancellation">
      <p>If a project is cancelled after work has begun:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>All work completed to date will be billed at our standard hourly rate</li>
        <li>Any remaining advance payment will be adjusted accordingly</li>
        <li>Completed deliverables will be transferred to the client upon payment settlement</li>
        <li>A detailed breakdown of work completed will be provided</li>
      </ul>
    </PolicySection>

    <PolicySection title="Delivery Disputes">
      <p>If delivered work significantly deviates from the agreed scope and specifications:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>We will first offer free revisions to address the discrepancies</li>
        <li>The scope of free revisions is limited to the original project requirements</li>
        <li>Disputes must be raised within 7 days of delivery</li>
        <li>Both parties will work in good faith to resolve any issues</li>
      </ul>
    </PolicySection>

    <PolicySection title="Refund Eligibility">
      <p>Full refunds are only considered under the following circumstances:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>No work has been started within 7 days of payment</li>
        <li>Softogram is unable to deliver the agreed services</li>
        <li>Mutual agreement between both parties</li>
      </ul>
      <p className="mt-4">Partial refunds may be considered on a case-by-case basis for extenuating circumstances.</p>
    </PolicySection>

    <PolicySection title="Refund Process">
      <p>To request a refund:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Send a written request to <a href="mailto:support@softogram.com" className="text-cyan-400 hover:underline">support@softogram.com</a> within 7 days of payment</li>
        <li>Include your project details and reason for the refund request</li>
        <li>Our team will review your request within 3–5 business days</li>
        <li>Approved refunds will be processed within 7–10 business days</li>
      </ul>
    </PolicySection>
  </PolicyLayout>
);

// Cookie Policy Page
const CookiePolicy = () => (
  <PolicyLayout title="Cookie Policy" lastUpdated="March 2026">
    <PolicySection title="What Are Cookies?">
      <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and understand how you interact with the site.</p>
    </PolicySection>

    <PolicySection title="How We Use Cookies">
      <p>We use cookies for the following purposes:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong className="text-white">Essential Cookies:</strong> Required for basic website functionality</li>
        <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors use our website through Google Analytics</li>
        <li><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences</li>
      </ul>
    </PolicySection>

    <PolicySection title="Google Analytics">
      <p>We use Google Analytics to collect anonymous information about how visitors use our website. This includes:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Pages visited and time spent on each page</li>
        <li>How you arrived at our website</li>
        <li>Your general geographic location (country/city level)</li>
        <li>Device and browser information</li>
      </ul>
      <p className="mt-4">This data helps us improve our website and provide a better user experience. Google Analytics data is anonymized and does not personally identify you.</p>
    </PolicySection>

    <PolicySection title="Managing Cookies">
      <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>View and delete cookies</li>
        <li>Block all cookies or specific types</li>
        <li>Set preferences for certain websites</li>
      </ul>
      <p className="mt-4">Please note that disabling certain cookies may affect the functionality of our website.</p>
    </PolicySection>

    <PolicySection title="Opt-Out Options">
      <p>To opt out of Google Analytics tracking, you can:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
        <li>Adjust your browser settings to block cookies</li>
        <li>Use private/incognito browsing mode</li>
      </ul>
    </PolicySection>

    <PolicySection title="Contact Us">
      <p>If you have questions about our use of cookies, please contact us at <a href="mailto:support@softogram.com" className="text-cyan-400 hover:underline">support@softogram.com</a></p>
    </PolicySection>
  </PolicyLayout>
);

// Case Studies Page
const CaseStudiesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const caseStudies = [
    {
      id: "polluxkart",
      title: "Polluxkart",
      subtitle: "Full-Stack E-commerce Platform",
      description: "A complete e-commerce solution built from the ground up, featuring a modern React frontend, FastAPI Python backend, and microservices architecture deployed on AWS.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop",
      challenge: "The client needed a scalable e-commerce platform that could handle thousands of concurrent users, integrate multiple payment gateways, and provide real-time inventory management across multiple warehouses.",
      solution: "We architected a microservices-based system with separate services for user management, product catalog, orders, payments, and inventory. Each service was containerized using Docker and deployed on AWS ECS with auto-scaling capabilities.",
      results: [
        { metric: "99.9%", label: "Uptime Achieved" },
        { metric: "< 200ms", label: "Average API Response" },
        { metric: "10,000+", label: "Concurrent Users" },
        { metric: "3x", label: "Sales Increase" }
      ],
      techStack: [
        { name: "React.js", icon: Monitor, category: "Frontend" },
        { name: "FastAPI", icon: Terminal, category: "Backend" },
        { name: "Node.js", icon: Server, category: "Services" },
        { name: "PostgreSQL", icon: Database, category: "Database" },
        { name: "Redis", icon: Zap, category: "Caching" },
        { name: "Docker", icon: Layers, category: "Container" },
        { name: "AWS", icon: Cloud, category: "Cloud" },
        { name: "GitHub Actions", icon: GitBranch, category: "CI/CD" }
      ],
      architecture: [
        { phase: "Frontend", description: "React.js with Redux for state management, Tailwind CSS for styling, deployed on AWS CloudFront CDN" },
        { phase: "API Gateway", description: "FastAPI with async request handling, JWT authentication, rate limiting, and request validation" },
        { phase: "Microservices", description: "Node.js services for real-time features (chat, notifications), Python services for ML-based recommendations" },
        { phase: "Database Layer", description: "PostgreSQL for transactional data, Redis for caching and session management, Elasticsearch for product search" },
        { phase: "Infrastructure", description: "AWS ECS for container orchestration, RDS for managed databases, S3 for media storage, CloudWatch for monitoring" }
      ]
    },
    {
      id: "expense-splitter",
      title: "Expense Splitter App",
      subtitle: "Real-time Group Expense Management",
      description: "A Splitwise-like application for splitting group expenses with real-time balance tracking and smart settlement suggestions.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop",
      challenge: "Building an intuitive expense tracking app that handles complex multi-party settlements, supports multiple currencies, and works offline with sync capabilities.",
      solution: "Developed a robust backend with Spring Boot handling complex settlement algorithms, combined with a responsive web app featuring offline-first capabilities using service workers.",
      results: [
        { metric: "50K+", label: "Expenses Tracked" },
        { metric: "98%", label: "Accuracy Rate" },
        { metric: "5K+", label: "Active Users" },
        { metric: "4.8", label: "App Rating" }
      ],
      techStack: [
        { name: "Java", icon: Code, category: "Backend" },
        { name: "Spring Boot", icon: Server, category: "Framework" },
        { name: "PostgreSQL", icon: Database, category: "Database" },
        { name: "React Native", icon: Smartphone, category: "Mobile" },
        { name: "Redis", icon: Zap, category: "Caching" },
        { name: "Docker", icon: Layers, category: "Container" }
      ],
      architecture: [
        { phase: "Mobile App", description: "React Native for cross-platform mobile development with offline-first architecture" },
        { phase: "Backend API", description: "Spring Boot REST API with complex settlement algorithms and multi-currency support" },
        { phase: "Real-time Sync", description: "WebSocket connections for instant updates when group members add expenses" },
        { phase: "Database", description: "PostgreSQL with optimized queries for balance calculations and expense history" }
      ]
    },
    {
      id: "api-gateway",
      title: "Custom API Gateway",
      subtitle: "High-Performance Microservices Gateway",
      description: "A high-performance API gateway handling routing, authentication and rate limiting for a microservices architecture.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=500&fit=crop",
      challenge: "Design a gateway capable of handling 100K+ requests per second with sub-millisecond latency, supporting dynamic routing and real-time configuration updates.",
      solution: "Built with Go for maximum performance, implementing a plugin-based architecture for extensibility. Features include JWT validation, rate limiting per client, request/response transformation, and comprehensive logging.",
      results: [
        { metric: "100K+", label: "Requests/Second" },
        { metric: "< 1ms", label: "Added Latency" },
        { metric: "99.99%", label: "Availability" },
        { metric: "Zero", label: "Downtime Deploys" }
      ],
      techStack: [
        { name: "Go", icon: Terminal, category: "Language" },
        { name: "gRPC", icon: Server, category: "Protocol" },
        { name: "Redis", icon: Database, category: "Cache" },
        { name: "Docker", icon: Layers, category: "Container" },
        { name: "Kubernetes", icon: Cloud, category: "Orchestration" },
        { name: "Prometheus", icon: Zap, category: "Monitoring" }
      ],
      architecture: [
        { phase: "Gateway Core", description: "Go-based HTTP server with connection pooling and graceful shutdown" },
        { phase: "Plugin System", description: "Modular middleware chain for auth, rate limiting, logging, and transformation" },
        { phase: "Config Management", description: "Real-time configuration via etcd with zero-downtime updates" },
        { phase: "Monitoring", description: "Prometheus metrics, Jaeger tracing, and ELK stack for logging" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-['Space_Grotesk']">
              <span className="gradient-text">Case Studies</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Deep dives into our most impactful projects. See how we approach complex challenges 
              from architecture to deployment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies List */}
      <section className="pb-20 px-4">
        <div className="container-custom">
          <div className="space-y-24">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="glass-card p-8 md:p-12"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row gap-8 mb-12">
                  <div className="lg:w-1/2">
                    <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
                      Case Study #{index + 1}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4 font-['Space_Grotesk']">
                      {study.title}
                    </h2>
                    <p className="text-xl text-gray-400 mb-6">{study.subtitle}</p>
                    <p className="text-gray-500 leading-relaxed">{study.description}</p>
                  </div>
                  <div className="lg:w-1/2">
                    <img 
                      src={study.image} 
                      alt={study.title}
                      className="w-full h-64 lg:h-80 object-cover rounded-xl"
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  {study.results.map((result, i) => (
                    <div key={i} className="text-center p-4 md:p-6 bg-[#111111] rounded-xl border border-[#2A2A2A]">
                      <div className="text-xl md:text-2xl font-bold gradient-text mb-1">{result.metric}</div>
                      <p className="text-gray-500 text-xs md:text-sm">{result.label}</p>
                    </div>
                  ))}
                </div>

                {/* Challenge & Solution */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  <div className="p-6 bg-[#111111] rounded-xl border-l-4 border-cyan-400">
                    <h4 className="text-lg font-bold text-white mb-3 font-['Space_Grotesk']">The Challenge</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{study.challenge}</p>
                  </div>
                  <div className="p-6 bg-[#111111] rounded-xl border-l-4 border-violet-500">
                    <h4 className="text-lg font-bold text-white mb-3 font-['Space_Grotesk']">Our Solution</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{study.solution}</p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="mb-12">
                  <h4 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">Technology Stack</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {study.techStack.map((tech, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-[#111111] rounded-lg border border-[#2A2A2A]">
                        <tech.icon className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="text-white font-medium text-xs">{tech.name}</p>
                          <p className="text-gray-600 text-[10px]">{tech.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architecture */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">Architecture</h4>
                  <div className="space-y-3">
                    {study.architecture.map((item, i) => (
                      <div key={i} className="flex gap-3 p-4 bg-[#111111] rounded-xl border border-[#2A2A2A]">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <h5 className="text-white font-semibold text-sm mb-1">{item.phase}</h5>
                          <p className="text-gray-500 text-xs">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-white mb-4 font-['Space_Grotesk']">
              Ready to Build Your Next Project?
            </h3>
            <p className="text-gray-400 mb-8">
              Let's discuss how we can help bring your vision to life.
            </p>
            <Link to="/#contact">
              <button className="btn-glow">
                Start Your Project
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

// Blog Page
const BlogPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
    {
      id: 1,
      title: "Building Scalable E-commerce Platforms: Lessons from Polluxkart",
      excerpt: "Discover the architectural decisions and technologies we used to build a platform handling 10,000+ concurrent users.",
      date: "March 2026",
      readTime: "8 min read",
      category: "Architecture",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Why We Chose FastAPI Over Flask for Our Backend Services",
      excerpt: "A deep dive into our decision to use FastAPI and how it improved our API performance by 3x.",
      date: "February 2026",
      readTime: "6 min read",
      category: "Backend",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Microservices vs Monolith: When to Choose What",
      excerpt: "Our practical guide to choosing the right architecture for your project based on real-world experience.",
      date: "January 2026",
      readTime: "10 min read",
      category: "Architecture",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Implementing Real-time Features with WebSockets",
      excerpt: "How we built real-time notifications and chat features for our expense splitter application.",
      date: "December 2025",
      readTime: "7 min read",
      category: "Development",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
    },
    {
      id: 5,
      title: "AWS ECS vs Kubernetes: Our Production Experience",
      excerpt: "Comparing container orchestration platforms based on our experience running production workloads.",
      date: "November 2025",
      readTime: "9 min read",
      category: "DevOps",
      image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&h=400&fit=crop"
    },
    {
      id: 6,
      title: "Optimizing React Performance: Tips from the Trenches",
      excerpt: "Practical tips and techniques we use to keep our React applications fast and responsive.",
      date: "October 2025",
      readTime: "5 min read",
      category: "Frontend",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop"
    }
  ];

  const categories = ["All", "Architecture", "Backend", "Frontend", "DevOps", "Development"];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = activeCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-black">
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-['Space_Grotesk']">
              <span className="gradient-text">Blog & Insights</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Technical articles, development insights, and lessons learned from building 
              production software.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8 px-4">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20 px-4">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card overflow-hidden group cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/70 backdrop-blur-sm text-cyan-400 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 font-['Space_Grotesk'] group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 flex items-center text-cyan-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="text-center mt-16 glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-3 font-['Space_Grotesk']">
              More Articles Coming Soon
            </h3>
            <p className="text-gray-400 mb-6">
              We're working on more technical content. Subscribe to get notified when we publish new articles.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-dark flex-grow"
              />
              <button className="btn-glow whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

// Home Page
const Home = () => {
  return (
    <div className="min-h-screen bg-black">
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <PricingSection />
      <ProjectsSection />
      <TestimonialsSection />
      <WhyChooseUsSection />
      <ContactSection />
      <WhatsAppButton />
    </div>
  );
};

// Scroll to hash on navigation
const ScrollToHash = () => {
  const location = useLocation();
  
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return null;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToHash />
        <Toaster position="top-center" richColors theme="dark" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/products"
              element={
                <PlaceholderPage
                  title="Products"
                  note="Shipped products catalog — content arrives in redesign Phase 5."
                />
              }
            />
            <Route
              path="/client-work"
              element={
                <PlaceholderPage
                  title="Client Work"
                  note="Case studies move here in redesign Phase 6. Meanwhile use the home shipped section."
                />
              }
            />
            <Route path="/case-studies" element={<Navigate to="/client-work" replace />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route
              path="/blog/:slug"
              element={
                <PlaceholderPage
                  title="Blog post"
                  note="Individual posts land in redesign Phase 7."
                />
              }
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
