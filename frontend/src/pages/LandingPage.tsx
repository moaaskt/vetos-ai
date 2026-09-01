import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  PawPrint,
  ShieldCheck,
  Activity,
  Zap,
  Check,
  ArrowRight,
  ExternalLink,
  Server,
  Database,
  Lock,
  Moon,
  Sun,
  Users,
  Syringe,
  FileSignature,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Cpu,
  Workflow,
  Heart,
  QrCode,
  CheckCircle,
  Copy,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// ─── FRAMER MOTION VARIANTS ──────────────────────────────────────────────────
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

// ─── ACETERNITY SPOTLIGHT & GRID BACKGROUND ──────────────────────────────────
function SpotlightBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Radial Top Glow (Spotlight) */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-primary/35 via-teal-400/15 to-transparent blur-[120px] rounded-full" />
      <div className="absolute top-96 left-1/4 w-[450px] h-[350px] bg-emerald-500/10 blur-[100px] rounded-full" />
      <div className="absolute top-80 right-1/4 w-[400px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full" />
    </div>
  )
}

export function LandingPage() {
  const { isAuthenticated, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const dashboardUrl = user?.role === 'SUPERADMIN' ? '/super-admin/dashboard' : '/dashboard'

  const copyCredential = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEmail(text)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/25 selection:text-primary transition-colors duration-300 overflow-x-hidden font-sans">
      <SpotlightBackground />

      {/* ─── 1. NAVBAR (ACETERNITY GLASSMORPHISM) ───────────────────────────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-teal-400 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
              <PawPrint className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-foreground">VetOS</span>
                <span className="font-semibold text-xs px-1.5 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/25 shadow-sm">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider hidden sm:block">
                The Clinical Sanctuary
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#recursos" className="hover:text-foreground hover:text-primary transition-colors">
              Recursos
            </a>
            <a href="#mockup-3d" className="hover:text-foreground hover:text-primary transition-colors">
              Interface 3D
            </a>
            <a href="#arquitetura" className="hover:text-foreground hover:text-primary transition-colors">
              Arquitetura
            </a>
            <a href="#planos" className="hover:text-foreground hover:text-primary transition-colors">
              Planos
            </a>
            <Link
              to="/tutor/login"
              className="hover:text-primary transition-colors flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/80 text-foreground border border-border"
            >
              Portal do Tutor <span className="text-primary font-bold">B2C</span>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors shadow-sm"
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </motion.button>

            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={dashboardUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-teal-500 text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all"
                >
                  Acessar Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Entrar
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Criar Conta
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-border bg-card/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3"
            >
              <nav className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
                <a
                  href="#recursos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-2 rounded-lg hover:bg-secondary hover:text-foreground"
                >
                  Recursos
                </a>
                <a
                  href="#mockup-3d"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-2 rounded-lg hover:bg-secondary hover:text-foreground"
                >
                  Interface 3D
                </a>
                <a
                  href="#arquitetura"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-2 rounded-lg hover:bg-secondary hover:text-foreground"
                >
                  Arquitetura
                </a>
                <a
                  href="#planos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-2 rounded-lg hover:bg-secondary hover:text-foreground"
                >
                  Planos
                </a>
                <Link
                  to="/tutor/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-2 rounded-lg hover:bg-secondary text-primary font-semibold"
                >
                  Portal do Tutor (B2C)
                </Link>
              </nav>
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                {isAuthenticated ? (
                  <Link
                    to={dashboardUrl}
                    className="w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm"
                  >
                    Acessar Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full text-center py-2 rounded-xl border border-border text-foreground font-medium text-sm"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/register"
                      className="w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm"
                    >
                      Criar Conta Gratuita
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ─── 2. HERO SECTION COM GLOW ────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Headline com Gradiente Estilo Aceternity */}
          <motion.h1
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.1] mb-6"
          >
            O Sistema Operacional Inteligente para{' '}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent underline decoration-primary/30 decoration-wavy decoration-from-font">
              Clínicas Veterinárias
            </span>
          </motion.h1>

          {/* Subheadline com Alta Legibilidade */}
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Centralize prontuários eletrônicos, automações de lembretes vacinais com filas BullMQ, agendamentos e aceite
            digital de termos pelo tutor com máxima segurança e rastreabilidade jurídica.
          </motion.p>

          {/* Botões CTA com Efeito Magnético e Glow */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-teal-600 text-primary-foreground font-bold text-base shadow-[0_0_35px_-5px_rgba(20,140,139,0.5)] hover:shadow-[0_0_50px_-5px_rgba(20,140,139,0.7)] transition-all"
              >
                Acessar Demonstração Gratuita
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <a
                href="https://github.com/moaaskt/vetos-ai"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md text-foreground font-semibold text-base hover:bg-secondary/80 hover:border-primary/40 transition-all shadow-sm"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                Ver Código no GitHub
              </a>
            </motion.div>
          </motion.div>

          {/* Social Proof / Trust Badges */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left border-y border-border/60 py-6 mb-16 backdrop-blur-sm"
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Isolamento Seguro</p>
                <p className="text-sm font-bold text-foreground">Multi-tenant Lógico</p>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Filas Assíncronas</p>
                <p className="text-sm font-bold text-foreground">BullMQ & Redis 7</p>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <FileSignature className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aceite do Tutor</p>
                <p className="text-sm font-bold text-foreground">Trilha com IP e Hash</p>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Infraestrutura em Nuvem</p>
                <p className="text-sm font-bold text-foreground">Oracle VPS + CI/CD</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ─── 3. MOCKUP DO SISTEMA EM PERSPECTIVA 3D COM IMAGEM AFETIVA ──── */}
          <div id="mockup-3d" className="relative mx-auto max-w-6xl text-left [perspective:1200px] mb-8">
            <motion.div
              initial={{ rotateX: 10, y: 40, opacity: 0 }}
              whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl p-4 sm:p-7 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.4)] dark:shadow-[0_30px_100px_-20px_rgba(20,140,139,0.15)] relative overflow-hidden"
            >
              {/* Top Glass Glow Border */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              {/* Application Top Bar */}
              <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs font-semibold text-muted-foreground font-mono">
                    vetos-ai.app • Clínica Alfa Matriz
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>PostgreSQL & Redis Online</span>
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    TenantId: alfa-01
                  </span>
                </div>
              </div>

              {/* Inside Mockup Grid: Human Affective Touch + High-tech Operations */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column: Human Touch (Affective Photo & Patient Card) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Affective Photo Card with Floating Glass Badge */}
                  <div className="relative rounded-2xl overflow-hidden border border-border/80 group shadow-md aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-64 bg-secondary/50">
                    <img
                      src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80"
                      alt="Médica veterinária atendendo carinhosamente um pet"
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                    {/* Floating Glassmorphism Badge */}
                    <div className="absolute bottom-3 left-3 right-3 p-2.5 sm:p-3 rounded-xl bg-card/90 backdrop-blur-md border border-white/20 dark:border-border/80 shadow-lg text-left">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">
                          🩺
                        </span>
                        <div>
                          <p className="text-xs font-bold text-foreground leading-tight">
                            Cuidado que transforma a rotina clínica
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            99.8% de satisfação e acolhimento aos tutores
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient Highlight Summary */}
                  <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-base shadow-sm">
                          🐕
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            Sasha
                            <span className="text-xs font-normal text-muted-foreground">(Golden Retriever, 4a)</span>
                          </h3>
                          <p className="text-[11px] text-muted-foreground">Tutora: Fernanda Guimarães • 28.5 kg</p>
                        </div>
                      </div>
                      <span className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <Heart className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300">
                        <div className="flex items-center gap-1 font-semibold text-[11px]">
                          <CheckCircle className="h-3 w-3" /> Vacinas em Dia
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">V10 + Raiva aplicadas</p>
                      </div>
                      <div className="p-2 rounded-lg border border-primary/20 bg-primary/5 text-primary">
                        <div className="flex items-center gap-1 font-semibold text-[11px]">
                          <FileSignature className="h-3 w-3" /> Termo Assinado
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Auditoria IP confirmada</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: High-Tech Operations & Live Queue */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  {/* Metric Counter Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl border border-border bg-background/80 shadow-sm">
                      <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-medium">Pacientes</span>
                        <Users className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-2xl font-black text-foreground">1.248</p>
                      <span className="text-[10px] text-emerald-500 font-bold">+12% este mês</span>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-border bg-background/80 shadow-sm">
                      <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-medium">Vacinas D-7</span>
                        <Syringe className="h-3.5 w-3.5 text-teal-500" />
                      </div>
                      <p className="text-2xl font-black text-foreground">342</p>
                      <span className="text-[10px] text-primary font-bold">BullMQ no ar</span>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-border bg-background/80 shadow-sm">
                      <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-medium">Consultas</span>
                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-2xl font-black text-foreground">28</p>
                      <span className="text-[10px] text-emerald-500 font-bold">4 agora</span>
                    </div>
                  </div>

                  {/* Scheduled Appointments Preview */}
                  <div className="p-4 rounded-2xl border border-border bg-background/80 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        Fila de Consultas do Dia
                      </span>
                      <span className="text-[11px] text-muted-foreground">31 de Agosto</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-card">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          TH
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Thor (Labrador Retriever)</p>
                          <p className="text-[10px] text-muted-foreground">Dr. Rodrigo • Consulta Geral</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        14:30
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-card">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-xs">
                          MI
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Mia (Gato Siamês)</p>
                          <p className="text-[10px] text-muted-foreground">Dra. Camila • Imunização V4</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 border border-teal-500/20">
                        15:15
                      </span>
                    </div>
                  </div>

                  {/* Real-time Event Feed Badge */}
                  <div className="p-3 rounded-xl border border-border/80 bg-background/90 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-muted-foreground">Último evento:</span>
                      <span className="font-semibold text-foreground">Termo de Internação Assinado via IP</span>
                    </div>
                    <span className="text-[10px] text-primary font-mono font-semibold">audit: verified</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 4. BENTO GRID DE FUNCIONALIDADES (ESTILO ACETERNITY) ─────────── */}
      <section id="recursos" className="py-24 border-t border-border/60 bg-secondary/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              Bento Grid de Recursos
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mt-3 mb-4">
              Cada detalhe projetado para alta performance
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Solução arquitetural completa que atende desde o atendimento cirúrgico até a régua de notificações
              automáticas.
            </p>
          </div>

          {/* Bento Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 (Span 2): Multi-tenancy Lógico */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="md:col-span-2 rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/50 hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all pointer-events-none" />

              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-teal-500 text-primary-foreground flex items-center justify-center mb-6 shadow-md shadow-primary/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Multi-tenant Lógico com Zero Vazamento</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xl">
                O motor <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">TenantContextService</code>{' '}
                utiliza <code className="text-xs font-mono text-foreground">AsyncLocalStorage</code> no Node.js para
                propagar o identificador da clínica de forma isolada por thread lógica, aplicando filtros automáticos em
                100% das operações de banco de dados no modo <strong>ENFORCE</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
                <div className="p-3 rounded-xl border border-border bg-background">
                  <span className="text-primary font-bold">✓ Isolamento Estrito</span>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Segregação nativa por clinicId</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-background">
                  <span className="text-primary font-bold">✓ Prisma Extension</span>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Modos OFF, LOG e ENFORCE</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-background">
                  <span className="text-primary font-bold">✓ Role-Based Access</span>
                  <p className="text-muted-foreground text-[11px] mt-0.5">SuperAdmin, Admin e Staff</p>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 2 (Span 1): Assinatura Eletrônica */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/50 hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center mb-6 shadow-md shadow-cyan-500/20">
                <FileSignature className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Aceite Digital do Tutor</h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                Página pública com máscara de CPF e validação algorítmica para assinatura de termos de consentimento e
                internação.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2 text-foreground font-semibold">
                  <Check className="h-4 w-4 text-primary" /> Trilha com IP & User-Agent
                </li>
                <li className="flex items-center gap-2 text-foreground font-semibold">
                  <Check className="h-4 w-4 text-primary" /> Carimbo de tempo UTC auditado
                </li>
                <li className="flex items-center gap-2 text-foreground font-semibold">
                  <Check className="h-4 w-4 text-primary" /> Impressão e PDF limpos
                </li>
              </ul>
            </motion.div>

            {/* Bento Card 3 (Span 1): Filas BullMQ */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/50 hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Automações & Filas BullMQ</h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                Motor distribuído com Redis 7 para lembretes de vacinas nas janelas <strong>D0, D-1 e D-7</strong> com
                anti-spam persistido.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2 text-foreground font-semibold">
                  <Check className="h-4 w-4 text-primary" /> Delayed jobs resilientes
                </li>
                <li className="flex items-center gap-2 text-foreground font-semibold">
                  <Check className="h-4 w-4 text-primary" /> Cancelamento em remarcação
                </li>
                <li className="flex items-center gap-2 text-foreground font-semibold">
                  <Check className="h-4 w-4 text-primary" /> Logs em NotificationLog
                </li>
              </ul>
            </motion.div>

            {/* Bento Card 4 (Span 2): Prontuário & Prescrições */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="md:col-span-2 rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/50 hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all pointer-events-none" />

              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 text-primary-foreground flex items-center justify-center mb-6 shadow-md shadow-primary/20">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Prontuário Veterinário Unificado</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xl">
                Linha do tempo médica com histórico de consultas, histórico de peso, procedimentos cirúrgicos, alertas
                críticos de alergias do paciente e geração instantânea de prescrições médicas com QR Code.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
                <div className="p-3 rounded-xl border border-border bg-background flex items-center gap-2.5">
                  <QrCode className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="text-foreground font-bold">Prescrição QR Code</span>
                    <p className="text-muted-foreground text-[10px]">Validação pública rápida</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-background flex items-center gap-2.5">
                  <Syringe className="h-5 w-5 text-teal-500 shrink-0" />
                  <div>
                    <span className="text-foreground font-bold">Controle Vacinal</span>
                    <p className="text-muted-foreground text-[10px]">Doses futuras calculadas</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-background flex items-center gap-2.5">
                  <Heart className="h-5 w-5 text-rose-500 shrink-0" />
                  <div>
                    <span className="text-foreground font-bold">Alertas de Alergia</span>
                    <p className="text-muted-foreground text-[10px]">Destaque visual imediato</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 5. ARQUITETURA & TOPOLOGIA DE ENGENHARIA ───────────────────────── */}
      <section id="arquitetura" className="py-24 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texto Esquerdo */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                Engenharia de Infraestrutura
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Topologia em Nuvem & Padrões Corporativos
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Projetado com separação estrita de camadas, tipagem estrita de ponta a ponta e entrega contínua
                automatizada via GitHub Actions para VPS Oracle Cloud com SSL Let's Encrypt.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-border bg-card">
                  <Cpu className="h-5 w-5 text-primary mb-2" />
                  <h4 className="font-bold text-sm text-foreground">NestJS 11 & React 19</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    TypeScript estrito, guards de segurança e React Server/Client otimizado.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-card">
                  <Database className="h-5 w-5 text-primary mb-2" />
                  <h4 className="font-bold text-sm text-foreground">PostgreSQL & Redis 7</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Persistência relacional transacional e filas BullMQ assíncronas.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-card">
                  <Workflow className="h-5 w-5 text-primary mb-2" />
                  <h4 className="font-bold text-sm text-foreground">CI/CD GitHub Actions</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Deploy contínuo por SSH com migrações automáticas do Prisma.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-card">
                  <Lock className="h-5 w-5 text-primary mb-2" />
                  <h4 className="font-bold text-sm text-foreground">Segurança & Criptografia</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    AES-256-GCM para credenciais SMTP e JWT assinado por papel de usuário.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Topology Terminal à Direita */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-border bg-card/95 backdrop-blur-xl p-6 shadow-2xl font-mono text-xs text-muted-foreground space-y-4">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <span className="text-foreground font-semibold flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    Topologia de Produção • Oracle Cloud VPS
                  </span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    TLS 1.3 Active
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-1">
                  <div className="text-primary font-bold flex items-center justify-between">
                    <span>1. Ingress & Edge Proxy</span>
                    <span className="text-[10px] text-muted-foreground">Port 443 / 80</span>
                  </div>
                  <div className="text-foreground">Nginx Proxy Manager ➔ Certificados SSL Let's Encrypt</div>
                  <div className="text-[11px] text-muted-foreground">
                    Roteamento SPA (:80) e Proxy reverso para API (:3000)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-1">
                  <div className="text-teal-500 font-bold flex items-center justify-between">
                    <span>2. Backend Application Core</span>
                    <span className="text-[10px] text-muted-foreground">Node.js 22</span>
                  </div>
                  <div className="text-foreground">NestJS API ➔ AsyncLocalStorage TenantContext</div>
                  <div className="text-[11px] text-muted-foreground">
                    TenantPrismaExtension (ENFORCE) + Worker de Filas BullMQ
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-1">
                  <div className="text-emerald-500 font-bold flex items-center justify-between">
                    <span>3. Stateful Storage Layer</span>
                    <span className="text-[10px] text-muted-foreground">Volumes Docker</span>
                  </div>
                  <div className="text-foreground">PostgreSQL 15 (Relational) + Redis 7 (Queues & Cache)</div>
                  <div className="text-[11px] text-muted-foreground">
                    Persistência em disco e backups automatizados
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. TABELA DE PLANOS (SAAS PRICING) ─────────────────────────────── */}
      <section id="planos" className="py-24 border-t border-border/60 bg-secondary/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              Tabela de Planos
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mt-3 mb-4">
              Investimento Transparente & Escalável
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Escolha a modalidade ideal para o momento da sua clínica, sem fidelidade ou taxas ocultas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Starter Card */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground">Starter</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
                    Básico
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  Ideal para consultórios veterinários autônomos e atendimentos individuais.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-foreground">R$ 99</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>

                <ul className="space-y-3.5 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Até <strong>3 membros</strong> de equipe</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Até <strong>150 notificações</strong>/mês</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span><strong>1 GB</strong> de armazenamento clínico</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Prontuário eletrônico completo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Agenda diária e semanal</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className="w-full py-3.5 rounded-2xl border border-border bg-background text-foreground font-semibold text-center hover:bg-secondary transition-colors"
              >
                Começar no Starter
              </Link>
            </motion.div>

            {/* Professional Card (Destaque Aceternity) */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border-2 border-primary bg-card p-8 shadow-2xl shadow-primary/15 flex flex-col justify-between relative transform md:-translate-y-3"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-teal-500 text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md">
                ⭐ Mais Popular
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <h3 className="text-xl font-bold text-foreground">Professional</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                    Clínicas
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  Para clínicas veterinárias com equipe médica estruturada e alto fluxo.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-foreground">R$ 199</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>

                <ul className="space-y-3.5 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Até <strong>10 membros</strong> de equipe</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Até <strong>1.000 notificações</strong>/mês</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span><strong>10 GB</strong> de armazenamento clínico</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span><strong>Aceite & Assinatura Digital</strong> do Tutor</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Lembretes automáticos por E-mail</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Painel de Analytics & Métricas</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-teal-600 text-primary-foreground font-bold text-center shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02]"
              >
                Assinar Professional
              </Link>
            </motion.div>

            {/* Enterprise Card */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground">Enterprise</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
                    Hospitais
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  Para redes hospitalares 24h e operações de larga escala com múltiplas unidades.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-foreground">Personalizado</span>
                </div>

                <ul className="space-y-3.5 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Membros de equipe <strong>ilimitados</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Notificações e automações ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span><strong>100 GB+</strong> de armazenamento dedicado</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Suporte prioritário 24/7 com SLA</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Múltiplas unidades integradas</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className="w-full py-3.5 rounded-2xl border border-border bg-background text-foreground font-semibold text-center hover:bg-secondary transition-colors"
              >
                Falar com Especialista
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 7. CALLOUT DE DEMONSTRAÇÃO RÁPIDA (PORTFÓLIO) ─────────────────── */}
      <section className="py-20 border-t border-border/60 bg-background relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-8 sm:p-10 text-center relative overflow-hidden shadow-xl"
          >
            <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-primary/15 border border-primary/25 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Ambiente de Demonstração Interativo
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
              Experimente a plataforma em tempo real
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
              Acesse diretamente com as credenciais de teste pré-configuradas para explorar os módulos de SuperAdmin e
              Administrador da Clínica.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 text-xs font-mono mb-8">
              <div
                onClick={() => copyCredential('admin@alfa.com')}
                className="cursor-pointer px-4 py-3 rounded-xl bg-card border border-border/80 text-foreground flex items-center justify-between gap-3 hover:border-primary/50 transition-colors shadow-sm"
              >
                <div>
                  <span className="text-muted-foreground">Admin: </span>
                  <span className="text-primary font-bold">admin@alfa.com</span>
                </div>
                <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
              </div>

              <div
                onClick={() => copyCredential('superadmin@vetos.ai')}
                className="cursor-pointer px-4 py-3 rounded-xl bg-card border border-border/80 text-foreground flex items-center justify-between gap-3 hover:border-primary/50 transition-colors shadow-sm"
              >
                <div>
                  <span className="text-muted-foreground">SuperAdmin: </span>
                  <span className="text-primary font-bold">superadmin@vetos.ai</span>
                </div>
                <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
              </div>
            </div>

            {copiedEmail && (
              <p className="text-xs text-emerald-500 font-semibold mb-4 animate-in fade-in-0 duration-200">
                ✓ E-mail ({copiedEmail}) copiado para a área de transferência! Senha: <span className="font-mono">Senha123!</span>
              </p>
            )}

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
            >
              Entrar no Ambiente de Teste
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── 8. FOOTER ESTILO ACETERNITY (SIMPLE FOOTER WITH FOUR GRIDS) ──── */}
      <footer className="border-t border-border/80 bg-background text-muted-foreground pt-16 pb-0 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Brand on Left + Four Grids on Right */}
          <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">
            {/* Left: Brand info & copyright */}
            <div className="space-y-4 max-w-sm">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-teal-400 text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/20">
                  <PawPrint className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl text-foreground tracking-tight">VetOS</span>
                  <span className="font-semibold text-xs px-1.5 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/25">
                    AI
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Tecnologia e cuidado animal em perfeita harmonia. Sistema Operacional inteligente e SaaS Multi-tenant
                para clínicas veterinárias.
              </p>

              <p className="text-xs text-muted-foreground">
                © copyright VetOS AI {new Date().getFullYear()}. All rights reserved.
              </p>

              <div className="pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Todos os sistemas operacionais</span>
                </div>
              </div>
            </div>

            {/* Right: Four Grids */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12 flex-1">
              {/* Grid 1: Pages / Produto */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Produto</h4>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li>
                    <a href="#recursos" className="hover:text-foreground transition-colors">
                      Prontuário Inteligente
                    </a>
                  </li>
                  <li>
                    <a href="#recursos" className="hover:text-foreground transition-colors">
                      Linha do Tempo
                    </a>
                  </li>
                  <li>
                    <a href="#recursos" className="hover:text-foreground transition-colors">
                      Assinatura Digital
                    </a>
                  </li>
                  <li>
                    <a href="#recursos" className="hover:text-foreground transition-colors">
                      Automações BullMQ
                    </a>
                  </li>
                  <li>
                    <Link to="/tutor/login" className="hover:text-primary transition-colors font-medium">
                      Portal do Tutor (B2C)
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Grid 2: Arquitetura */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Arquitetura</h4>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li>
                    <a href="#arquitetura" className="hover:text-foreground transition-colors">
                      NestJS 11 & Node 22
                    </a>
                  </li>
                  <li>
                    <a href="#arquitetura" className="hover:text-foreground transition-colors">
                      React 19 & Vite 6
                    </a>
                  </li>
                  <li>
                    <a href="#arquitetura" className="hover:text-foreground transition-colors">
                      PostgreSQL 15 & Redis 7
                    </a>
                  </li>
                  <li>
                    <a href="#arquitetura" className="hover:text-foreground transition-colors">
                      Docker Compose & CI/CD
                    </a>
                  </li>
                  <li>
                    <a href="#arquitetura" className="hover:text-foreground transition-colors">
                      Oracle Cloud VPS
                    </a>
                  </li>
                </ul>
              </div>

              {/* Grid 3: Portfólio */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Portfólio</h4>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li>
                    <a
                      href="https://github.com/moaaskt/vetos-ai"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      GitHub Repo
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/moaaskt"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      Autor (moaaskt)
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <span className="text-muted-foreground">Licença MIT</span>
                  </li>
                  <li>
                    <a
                      href="https://vetos.moadev.com.br"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-emerald-500 transition-colors flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400"
                    >
                      Live Demo
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Grid 4: Acesso */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Acesso</h4>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li>
                    <Link to="/login" className="hover:text-foreground transition-colors">
                      Entrar no Sistema
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-foreground transition-colors">
                      Cadastrar Clínica
                    </Link>
                  </li>
                  <li>
                    <Link to="/tutor/login" className="hover:text-foreground transition-colors">
                      Área do Tutor
                    </Link>
                  </li>
                  <li>
                    <a href="#mockup-3d" className="hover:text-foreground transition-colors">
                      Painel Demo
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Giant Degrade Text (Aceternity Signature) */}
          <div className="mt-14 sm:mt-20 select-none pointer-events-none text-center overflow-hidden">
            <h2 className="text-[17vw] sm:text-[18vw] font-bold tracking-tight bg-gradient-to-b from-neutral-400/70 via-neutral-600/20 to-transparent dark:from-neutral-700/80 dark:via-neutral-800/25 dark:to-transparent bg-clip-text text-transparent leading-[0.8] translate-y-3 sm:translate-y-6">
              VetOS
            </h2>
          </div>
        </div>
      </footer>
    </div>
  )
}
