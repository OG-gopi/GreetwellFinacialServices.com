import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, ChevronRight, CheckCircle2, Menu, X, ArrowRight, 
  MapPin, Mail, Globe, Trophy, Calendar, Users, Award, Heart, Sparkles
} from 'lucide-react'

const HERO_IMAGES = [
  '/hero_donation_1.jpg',
  '/hero_donation_2.jpg',
  '/hero_donation_3.jpg',
  '/hero_donation_4.jpg',
]

const GALLERY_ITEMS = [
  {
    src: '/gallery_gfs_1.png',
    title: 'Certificate Presentation',
    category: 'Recognition',
    description: 'Special recognition certificate presented in office'
  },
  {
    src: '/gallery_gfs_2.jpg',
    title: 'Champion of Insurance',
    category: 'Awards',
    description: 'Awarded Champion title at GFS Festival of Insurance'
  },
  {
    src: '/gallery_gfs_3.jpg',
    title: 'Appreciation Shield',
    category: 'Recognition',
    description: 'Certificate of Appreciation for outstanding performance'
  },
  {
    src: '/gallery_gfs_4.jpg',
    title: 'Milaap 2025 Stage',
    category: 'Events',
    description: 'Welcome stage connect program by HDFC ERGO'
  },
  {
    src: '/gallery_gfs_5.jpg',
    title: 'Executive Leadership',
    category: 'Team Meet',
    description: 'Corporate executive portrait at Greetwell Financial'
  },
  {
    src: '/gallery_gfs_6.jpg',
    title: 'Ruby Club 2023 Ceremony',
    category: 'Awards',
    description: 'Stage presentation and honor at Ruby Club 2023'
  },
  {
    src: '/gallery_gfs_7.jpg',
    title: 'Mysore Palace Meet',
    category: 'Team Meet',
    description: 'GFS delegates group photo at majestic Mysore Palace'
  },
  {
    src: '/gallery_gfs_8.jpg',
    title: 'Ruby Club Plaque',
    category: 'Awards',
    description: 'Linga Prasad Goud honored with Plaque of Excellence'
  },
  {
    src: '/gallery_gfs_9.jpg',
    title: 'Audience Stage Honor',
    category: 'Recognition',
    description: 'Honored in front of delegates at Ruby Club 2023'
  },
  {
    src: '/gallery_gfs_10.jpg',
    title: 'Mysore Group Celebration',
    category: 'CSR Activities',
    description: 'Corporate social connect and team meet-up celebration'
  }
]

export default function HomePage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeSection, setActiveSection] = useState('home')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedAgentType, setSelectedAgentType] = useState<'loan-agent' | 'insurance-agent' | 'investment-agent'>('loan-agent')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      
      const scrollPosition = window.scrollY + 180; // Offset for navbar height + buffer
      let currentSection = 'home';
      
      const sections = ['home', 'about', 'services', 'careers', 'gallery', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = section;
          }
        }
      }
      
      // Bottom fallback check
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        currentSection = 'contact';
      }

      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    }
    
    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About Us', href: '#about', id: 'about' },
    { name: 'Services', href: '#services', id: 'services' },
    { name: 'Careers', href: '#careers', id: 'careers' },
    { name: 'Gallery', href: '#gallery', id: 'gallery' },
    { name: 'Contact Us', href: '#contact', id: 'contact' },
  ]

  // Removed handleServiceClick as per new navigation requirements

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-900">
      {/* ── Navbar ── */}
      <nav className={`z-50 px-8 md:px-16 lg:px-20 bg-white/90 backdrop-blur-md sticky top-0 border-b border-slate-100 transition-all duration-500 ${
        scrolled ? 'py-3.5 shadow-md bg-white/80 shadow-[#081f45]/5' : 'py-7 shadow-sm'
      }`}
        style={{
          boxShadow: scrolled ? '0 10px 30px rgba(8, 31, 69, 0.05)' : '0 4px 30px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4 relative z-20">
            <img src="/logo.png" alt="GFS Logo" className={`object-cover rounded-full shadow-lg border-2 border-white/50 transition-all duration-500 ${
              scrolled ? 'h-12 w-12 md:h-14 md:w-14' : 'h-16 w-16 md:h-20 md:w-20'
            }`} />
            <span className="text-lg md:text-xl font-extrabold tracking-tight uppercase font-serif whitespace-nowrap hidden sm:inline text-[#081f45]">
              Greetwell Financial Services
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    setActiveSection(link.id);
                  }}
                  className={`text-[13px] uppercase tracking-wider font-extrabold px-5 py-2.5 rounded-full transition-all duration-300 relative group flex items-center justify-center border ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-cyan-600 to-cyan-500 border-cyan-600 shadow-md shadow-cyan-500/20 -translate-y-[1px]' 
                      : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-50 border-transparent hover:-translate-y-[1px]'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {/* Subtle active glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-md -z-10" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Contact Info (Right) */}
          <div className="hidden md:flex items-center gap-3 relative z-20">
            <a href="tel:+919866382525" className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 hover:bg-cyan-100 transition-colors">
              <Phone className="w-4 h-4" />
            </a>
            <div className="flex flex-col">
              <a href="tel:+919866382525" className="text-sm font-bold text-slate-900 hover:text-cyan-600 transition-colors">
                +91 98663 82525
              </a>
              <span className="text-[10px] text-slate-500 font-medium">Mon - Sat: 9:30 AM - 6:30 PM</span>
            </div>
            <Link
              to="/login"
              className="ml-4 bg-sky-500 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-sky-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 relative z-20"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 lg:hidden py-4 px-4 flex flex-col gap-4 z-10"
            >
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => {
                      setActiveSection(link.id);
                      setTimeout(() => setMobileMenuOpen(false), 150);
                    }}
                    className={`text-sm font-bold p-3 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center border ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-cyan-600 to-cyan-500 border-cyan-600 shadow-md shadow-cyan-500/10' 
                        : 'text-slate-600 hover:text-cyan-600 hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center inline-block bg-cyan-600 text-white px-6 py-3 rounded-full font-bold text-sm mt-4 shadow-md"
              >
                Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero Section ── */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-50">
        {/* Soft abstract background elements */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-cyan-50/80 to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            
            {/* Hero Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex-1 max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] mb-6 font-serif uppercase">
                GIVING BACK <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-800">
                  TO SOCIETY
                </span>
              </h1>
              
              <p className="text-slate-600 text-lg mb-8 leading-relaxed max-w-xl">
                At <strong className="text-[#081f45]">Greetwell Financial Services</strong>, we believe in growing together. <strong className="text-[#081f45] font-bold">A portion of our earnings is dedicated to supporting those in need.</strong> We care for society by contributing to <strong className="text-green-600 font-semibold">food donation</strong> and empowering lives for a better tomorrow.
              </p>

              <a href="#about" className="bg-gradient-to-r from-[#003153] to-[#0A4D80] text-white px-8 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 group">
                <span>♡ Our Social Initiative</span>
              </a>

              <div className="flex flex-wrap items-center gap-8 mt-12 pt-8 border-t border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">Serving the<br/>Community</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">Sharing &<br/>Caring</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">Together for a<br/>Better Tomorrow</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Right Slider */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="flex-1 w-full relative"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-square shadow-2xl shadow-slate-300/50 group border-8 border-white">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    src={HERO_IMAGES[currentSlide]}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Greetwell Social Initiative"
                  />
                </AnimatePresence>
                
                {/* Image Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80 pointer-events-none" />
                
                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                  {HERO_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentSlide ? 'w-6 bg-cyan-400' : 'w-2 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* ── About Us Section ── */}
      <section id="about" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#081f45] font-serif mb-4">About Us</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-12 h-px bg-slate-300" />
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="w-12 h-px bg-slate-300" />
            </div>
            <p className="text-slate-600 text-sm md:text-base">
              Welcome to <strong className="text-[#081f45]">Greetwell Financial Services</strong> — where financial growth meets social responsibility.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Left side text */}
            <div className="flex-1">
              <div className="space-y-4 text-slate-600 leading-relaxed mb-8">
                <p>
                  At <strong className="text-[#081f45]">Greetwell Financial Services</strong>, our mission is to help individuals and businesses achieve their financial goals through trusted and customer-focused solutions. We provide a wide range of services including Loans, Insurance, and Investment Solutions designed to support every stage of life and business growth.
                </p>
                <p>
                  Beyond financial services, we believe in <strong>Giving Back to Society</strong>. Through our food donation initiatives and community support activities, we strive to make a meaningful impact and spread care to those in need.
                </p>
              </div>

              {/* Why Choose Us */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-4 text-lg">Why Choose Us?</h4>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Trusted Financial Guidance',
                    'Quick & Hassle-Free Process',
                    'Customer-Centric Approach',
                    'Transparent & Reliable Service',
                    'Commitment to Community Welfare'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side list */}
            <div className="flex-1 w-full">
              <div className="relative rounded-3xl p-8 bg-gradient-to-br from-[#0B2144] to-[#0A1931] text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                <h4 className="text-2xl font-bold font-serif mb-8 text-[#D4AF37]">Our Services</h4>
                <ul className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                  {[
                    'Personal Loans', 'Home Loans', 'Mortgage Loans', 'Business Loans',
                    'Health Insurance', 'Life Insurance', 'Term Insurance', 'Motor Insurance',
                    'Investment Guidance'
                  ].map((service, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-sm font-medium text-slate-200">{service}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10 pt-6 border-t border-white/10">
                  <p className="text-lg font-serif italic text-cyan-200 text-center">
                    "Grow with Confidence. Serve with Purpose."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section id="services" className="py-24 bg-slate-50 relative">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif mb-4">Core Financial Categories</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-12 h-px bg-slate-300" />
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="w-12 h-px bg-slate-300" />
            </div>
            <p className="text-slate-600 text-sm md:text-base">
              Explore our wide range of services designed to help you secure loans, protect your assets, and achieve your financial dreams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cards */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-6 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-serif mb-3">Loans</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Get fast, transparent, and hassle-free loans custom-tailored for your personal or business milestones.
                </p>
              </div>
              <ul className="space-y-2 border-t pt-6 border-slate-50 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Personal & Business Loans</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Home & Mortgage Loans</li>
              </ul>
              <Link
                to="/loans/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Know More <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
 
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#081f45]/5 flex items-center justify-center text-[#081f45] mb-6 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-serif mb-3">Insurance</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Protect what matters most with GFS's wide-ranging and fully reliable health, life, and motor coverage plans.
                </p>
              </div>
              <ul className="space-y-2 border-t pt-6 border-slate-50 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Health & Life Insurance</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Term & Motor Insurance</li>
              </ul>
              <Link
                to="/insurance/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0B2144] hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Know More <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
 
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-slate-900 font-serif">Investments</h3>
                  <span className="px-2.5 py-0.5 text-[11px] font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-sm hover:scale-105 transition-transform cursor-default" title="CHITS – Chit Fund Investment">CHITS</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Build and preserve your wealth with specialized guidance designed to support smart, structured, and long-term security. Also includes <strong className="text-amber-600">CHITS</strong> – a reliable group savings and investment scheme.
                </p>
              </div>
              <ul className="space-y-2 border-t pt-6 border-slate-50 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Mutual Funds &amp; Fixed Deposits</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Customized Financial Advice</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> CHITS – Group Savings Scheme</li>
              </ul>
              <Link
                to="/investment/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Know More <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Careers Section ── */}
      <section id="careers" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-cyan-600 uppercase tracking-wider mb-2">Join Our Team</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif mb-4">Careers at Greetwell Financial Services</h3>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-12 h-px bg-slate-300" />
              <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span className="w-12 h-px bg-slate-300" />
            </div>
            <p className="text-slate-600 text-lg font-medium">Build Your Career with Purpose</p>
          </div>

          <div className="mb-16 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 relative group border-4 border-white">
            <img src="/careers_team.png" alt="Greetwell Team Collaborating" className="w-full h-[300px] md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent flex flex-col justify-end p-8 md:p-12">
              <div className="text-white max-w-2xl transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                <h3 className="text-3xl font-bold font-serif mb-3 text-white">Join a Culture of Growth & Impact</h3>
                <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                  Work with passionate individuals who are dedicated to helping people achieve financial freedom while building a rewarding career.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>
                At <strong>Greetwell Financial Services</strong>, we believe that success comes from helping others achieve financial security. We are looking for passionate, self-motivated, and ambitious individuals who want to build a rewarding career in the financial services industry.
              </p>
              <p>
                Whether you are a student, a working professional, a homemaker, or an entrepreneur, we provide an opportunity to earn, learn, and grow.
              </p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-4 text-lg">Why Join Us?</h4>
                <ul className="space-y-3">
                  {[
                    'Attractive Commission-Based Income',
                    'Performance Incentives & Rewards',
                    'Domestic & International Tour Opportunities',
                    'Flexible Working Hours',
                    'Professional Training & Mentorship',
                    'Career Growth & Leadership Opportunities',
                    'Opportunity to Make a Positive Impact on People\'s Lives'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="font-bold text-slate-900 mb-4 text-lg border-b pb-2 border-slate-100">Who Can Apply?</h4>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {['Graduates & Undergraduates', 'Sales Professionals', 'Homemakers', 'Retired Employees', 'Business Owners', 'Anyone interested in Financial Services'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-4 text-lg border-b pb-2 border-slate-100">Available Opportunities</h4>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {['Insurance Advisor', 'Financial Consultant', 'Team Leader', 'Business Development Associate', 'Investment & Insurance Relationship Manager'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-4 text-lg border-b pb-2 border-slate-100">What We Expect</h4>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {['Good Communication Skills', 'Positive Attitude', 'Willingness to Learn', 'Customer-Centric Approach', 'Commitment to Growth'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Premium Dynamic Side-by-Side Careers Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 items-stretch max-w-6xl mx-auto">
            {/* Card 1: Become Our Partner (Interactive Selector & Router Signup) */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-gradient-to-br from-[#0B2144] to-[#0A1931] text-white p-8 rounded-[2rem] shadow-2xl flex flex-col justify-between border border-white/5 relative overflow-hidden"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-0.5 bg-[#D4AF37] rounded-full" />
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Agent Program</span>
                </div>
                
                <h4 className="text-2xl font-bold font-serif text-white mb-2">Become Our Partner</h4>
                <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-4">
                  Choose your preferred field and start your journey with us.
                </p>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Earn premium commissions by providing leading Loan, Insurance, or Investment solutions to clients with dedicated RM support.
                </p>

                {/* 3 Modern Selector Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[
                    { id: 'loan-agent', label: 'Loan Agent', icon: <Trophy className="w-3.5 h-3.5" /> },
                    { id: 'insurance-agent', label: 'Insurance Agent', icon: <Award className="w-3.5 h-3.5" /> },
                    { id: 'investment-agent', label: 'Investment Agent', icon: <Sparkles className="w-3.5 h-3.5" /> }
                  ].map((field) => {
                    const isSelected = selectedAgentType === field.id;
                    return (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => setSelectedAgentType(field.id as any)}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-extrabold tracking-tight transition-all duration-300 transform hover:-translate-y-0.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-400/80 shadow-md shadow-cyan-500/10'
                            : 'bg-slate-950/40 text-slate-400 border-white/5 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {field.icon}
                        <span>{field.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Register Now main CTA */}
              <div className="mt-auto">
                <Link
                  to={`/signup/${selectedAgentType}`}
                  className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba5a] hover:to-[#0f7d70] text-white py-3.5 rounded-full font-extrabold text-sm shadow-lg shadow-green-500/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                >
                  <span>Register Now as {selectedAgentType === 'loan-agent' ? 'Loan Agent' : selectedAgentType === 'insurance-agent' ? 'Insurance Agent' : 'Investment Agent'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Card 2: Join Our Team Today (WhatsApp & Details) */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-gradient-to-br from-[#0B2144] to-[#0A1931] text-white p-8 rounded-[2rem] shadow-2xl flex flex-col justify-between border border-white/5 relative overflow-hidden w-full"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full pointer-events-none" />
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-0.5 bg-[#D4AF37] rounded-full" />
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Connect with GFS</span>
                </div>
                
                <h4 className="text-2xl font-bold font-serif text-white mb-3">Join Our Team Today</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Take the first step toward a successful and rewarding career. Partner with Greetwell Financial Services and access our premium client support, transparent processes, and excellent training systems.
                </p>
              </div>

              <div className="mt-auto">
                <a
                  href="https://wa.me/919866382525"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 rounded-full font-extrabold text-sm hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2.5 shadow-lg shadow-green-500/20"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.66.986 3.288 1.488 4.605 1.488 5.25 0 9.533-4.272 9.536-9.519.001-2.546-.993-4.932-2.799-6.735-1.807-1.805-4.205-2.8-6.753-2.801-5.256 0-9.539 4.274-9.543 9.52-.002 2.032.547 3.81 1.588 5.351l-.994 3.632 3.86-.987zm11.252-5.466c-.099-.166-.367-.266-.77-.466-.403-.2-2.378-1.173-2.747-1.306-.37-.133-.639-.2-.907.2-.268.4-.1.77.302.266-.402-.2-1.373-1.272-1.742-1.405-.269-.134-.537-.066-.739.068-.201.133-.872.868-.872 2.115 0 1.247.907 2.451 1.008 2.618.101.166 1.782 2.72 4.318 3.814.603.26 1.074.415 1.442.531.606.192 1.158.165 1.594.1.486-.073 1.493-.6 1.701-1.18.208-.579.208-1.077.146-1.18-.063-.101-.33-.166-.734-.366z"/>
                  </svg>
                  <span>Contact Now: 98663 82525</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Gallery Section (Achievements Gallery) ── */}
      <section id="gallery" className="py-28 bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 relative overflow-hidden">
        {/* Decorative subtle background gradients */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
          
          {/* Modern Premium Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100/60 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-4"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Milestones & Success</span>
            </motion.div>
            
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 font-serif mb-6 tracking-tight">
              Achievements Gallery
            </h3>
            
            <div className="flex items-center justify-center gap-2.5 mb-6">
              <span className="w-16 h-0.5 bg-slate-300/80 rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="w-16 h-0.5 bg-slate-300/80 rounded-full" />
            </div>
            
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore our journey of excellence, community contribution, recognition awards, and powerful team collaborations.
            </p>
          </div>

          {/* Interactive Category Filter Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16 max-w-4xl mx-auto">
            {['All', 'Awards', 'Events', 'Recognition', 'Team Meet', 'CSR Activities'].map((cat) => {
              const icons: Record<string, React.ReactNode> = {
                All: <Sparkles className="w-3.5 h-3.5" />,
                Awards: <Trophy className="w-3.5 h-3.5" />,
                Events: <Calendar className="w-3.5 h-3.5" />,
                Recognition: <Award className="w-3.5 h-3.5" />,
                'Team Meet': <Users className="w-3.5 h-3.5" />,
                'CSR Activities': <Heart className="w-3.5 h-3.5" />
              };
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 border ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white border-cyan-600 shadow-lg shadow-cyan-500/25 scale-105' 
                      : 'bg-white/80 backdrop-blur-md text-slate-600 border-slate-100 hover:border-slate-300/75 hover:bg-slate-50'
                  }`}
                >
                  {icons[cat]}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Premium Achievements Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {GALLERY_ITEMS
                .filter(item => activeCategory === 'All' || item.category === activeCategory)
                .map((item, idx) => {
                  const catColors: Record<string, string> = {
                    Awards: 'bg-amber-50 text-amber-700 border-amber-100/50',
                    Events: 'bg-indigo-50 text-indigo-700 border-indigo-100/50',
                    Recognition: 'bg-cyan-50 text-cyan-700 border-cyan-100/50',
                    'Team Meet': 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
                    'CSR Activities': 'bg-rose-50 text-rose-700 border-rose-100/50'
                  };
                  const icons: Record<string, React.ReactNode> = {
                    Awards: <Trophy className="w-3 h-3" />,
                    Events: <Calendar className="w-3 h-3" />,
                    Recognition: <Award className="w-3 h-3" />,
                    'Team Meet': <Users className="w-3 h-3" />,
                    'CSR Activities': <Heart className="w-3 h-3" />
                  };
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      key={item.src}
                      onClick={() => setSelectedImage(item.src)}
                      whileHover={{ y: -8 }}
                      className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2rem] p-4.5 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 ease-out flex flex-col cursor-pointer group"
                      style={{
                        boxShadow: '0 12px 40px rgba(15, 23, 42, 0.04)'
                      }}
                    >
                      {/* Balanced Aspect Container */}
                      <div className="relative h-52 w-full rounded-[1.5rem] overflow-hidden bg-slate-50 mb-5 flex items-center justify-center border border-slate-100">
                        <img 
                          src={item.src} 
                          alt={item.title} 
                          className="w-full h-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105 animate-fade-in p-2" 
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>

                      {/* Elegant Labels and Typography Section */}
                      <div className="px-1.5 pb-2 flex-grow flex flex-col justify-between">
                        <div>
                          {/* Styled Category Badge with Icon */}
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border w-fit mb-3.5 ${
                            catColors[item.category] || 'bg-slate-50 text-slate-600'
                          }`}>
                            {icons[item.category]}
                            <span>{item.category}</span>
                          </div>

                          {/* Title - Modern Premium Geometric Font Styling */}
                          <h4 className="text-slate-800 font-sans font-extrabold text-[16px] tracking-tight leading-snug group-hover:text-cyan-600 transition-colors duration-300 mb-2">
                            {item.title}
                          </h4>
                        </div>

                        {/* Description Subtitle */}
                        <p className="text-slate-500 font-sans font-medium text-xs leading-relaxed line-clamp-2 mt-auto">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
              
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-5xl max-h-[80vh] w-full flex items-center justify-center rounded-2xl overflow-hidden"
              >
                <img 
                  src={selectedImage} 
                  alt="Enlarged gallery view" 
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl border-4 border-white/10 shadow-2xl"
                />
              </motion.div>

              <div className="mt-6 text-center max-w-2xl">
                <p className="text-white text-lg font-medium tracking-wide">
                  {(() => {
                    const item = GALLERY_ITEMS.find(i => i.src === selectedImage);
                    return item ? `${item.title} (${item.category})` : "";
                  })()}
                </p>
                <p className="text-slate-400 text-xs mt-1">Click anywhere outside the image to close</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Contact Us & Footer ── */}
      <footer id="contact" className="bg-[#070b12] text-slate-300 py-6 border-t-2 border-cyan-600 font-sans relative overflow-hidden">
        {/* Subtle background texture/gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-900/10 to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-6">
            
            {/* Left Column: Stay in touch & Details */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
              <h3 className="text-xl text-white font-serif mb-1">Stay in touch</h3>
              
              {/* Socials */}
              <div className="flex gap-3">
                <a href="https://instagram.com/greetwell_finacial_services" target="_blank" rel="noreferrer" className="text-pink-500 hover:opacity-80 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://facebook.com/GreetwellFinacialServices" target="_blank" rel="noreferrer" className="text-blue-500 hover:opacity-80 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="https://www.youtube.com/@Greetwell_financialservices" target="_blank" rel="noreferrer" className="text-red-600 hover:opacity-80 transition-opacity">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582 6.186a2.632 2.632 0 0 0-1.85-1.865C18.096 3.882 12 3.882 12 3.882s-6.096 0-7.732.439a2.632 2.632 0 0 0-1.85 1.865C2 7.828 2 12 2 12s0 4.172.418 5.814a2.632 2.632 0 0 0 1.85 1.865C5.904 20.118 12 20.118 12 20.118s6.096 0 7.732-.439a2.632 2.632 0 0 0 1.85-1.865C22 16.172 22 12 22 12s0-4.172-.418-5.814zm-11.83 8.784V9.03L15.348 12l-5.596 2.97z"/></svg>
                </a>
                <a href="https://wa.me/919866382525" target="_blank" rel="noreferrer" className="text-green-500 hover:opacity-80 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </a>
              </div>
              
              <div className="flex flex-col gap-2 mt-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=PNO+71+Hno+1-36+road+no+6+jawahar+colony+chandanagar+near+yelamma+temple+Hyderabad+500050"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-[#D4AF37] transition-colors underline-offset-2 hover:underline"
                  >
                    PNO 71, Hno 1-36/1/2/6/A/P-71, Road No 6, Jawahar Colony, Chandanagar, Near Yelamma Temple, 500050
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <a href="tel:+919866382525" className="text-slate-400 hover:text-white transition-colors">+91 98663 82525</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <a href="mailto:gfsgreetwell@gmail.com" className="text-slate-400 hover:text-white transition-colors">gfsgreetwell@gmail.com</a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-wrap gap-8 justify-between">
              <div className="flex flex-col gap-3">
                <h4 className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest mb-1">Services</h4>
                <a href="#services" className="text-xs hover:text-white transition-colors">Loans</a>
                <a href="#services" className="text-xs hover:text-white transition-colors">Insurance</a>
                <a href="#services" className="text-xs hover:text-white transition-colors">Investments</a>
                <a href="#services" className="text-xs hover:text-white transition-colors">Business Accounts</a>
                <a href="#services" className="text-xs hover:text-white transition-colors">Mortgages</a>
              </div>
              
              <div className="flex flex-col gap-3">
                <h4 className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest mb-1">Company</h4>
                <a href="#about" className="text-xs hover:text-white transition-colors">About Us</a>
                <a href="#gallery" className="text-xs hover:text-white transition-colors">Gallery</a>
                <a href="#contact" className="text-xs hover:text-white transition-colors">Contact Us</a>
                <a href="#services" className="text-xs hover:text-white transition-colors">Community</a>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest mb-1">Solutions</h4>
                <Link to="/login" className="text-xs hover:text-white transition-colors">Small Medium Business</Link>
                <Link to="/login" className="text-xs hover:text-white transition-colors">Mid-Size Companies</Link>
                <Link to="/login" className="text-xs hover:text-white transition-colors">Personal Finance</Link>
              </div>
              
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 relative z-20">
                <img src="/logo.png" alt="GFS Logo" className="h-10 w-10 object-cover rounded-full shadow-md border border-slate-700/50" />
                <span className="text-sm font-extrabold tracking-tight uppercase font-serif whitespace-nowrap hidden sm:inline text-white">
                  Greetwell Financial Services
                </span>
              </div>
              <span className="text-[10px] text-slate-500 hidden md:inline ml-2 border-l border-slate-700 pl-4">All rights reserved - © {new Date().getFullYear()}</span>
            </div>
            
            <div className="flex gap-4 text-[10px] text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms & conditions</a>
              <a href="#" className="hover:text-white transition-colors">Cookie policy</a>
            </div>
            
            {/* Mobile Copyright */}
            <span className="text-[10px] text-slate-500 md:hidden text-center w-full">All rights reserved - © {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
