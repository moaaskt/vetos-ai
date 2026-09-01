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
  Syringe,
  FileSignature,
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
      {/* ─── 1. NAVBAR (GLASSMORPHISM) ──────────────────────────────────────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/75 backdrop-blur-xl transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-teal-400 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
              <PawPrint className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-foreground">VetOS</span>
                <span className="font-semibold text-xs text-primary font-mono">
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
              Interface Clínica
            </a>
            <a href="#arquitetura" className="hover:text-foreground hover:text-primary transition-colors">
              Arquitetura
            </a>
            <a href="#planos" className="hover:text-foreground hover:text-primary transition-colors">
              Planos
            </a>
            <Link
              to="/tutor/login"
              className="hover:text-foreground hover:text-primary transition-colors"
            >
              Portal do Tutor
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
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
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
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
                    <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
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
                  Interface Clínica
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
                  className="px-2 py-2 rounded-lg hover:bg-secondary text-foreground font-medium"
                >
                  Portal do Tutor
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

      {/* ─── 2. HERO IMERSIVO (CINEMATIC FULL BANNER INTEGRATION) ─────────── */}
      <section className="relative min-h-[85vh] lg:min-h-[760px] flex items-center justify-start overflow-hidden pt-8 pb-16 lg:py-24">
        {/* Camada do Banner de Fundo */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <img
            src="/hero-vetos.png"
            alt="Médico veterinário VetOS em atendimento com cão"
            className="w-full h-full object-cover object-[center_right] lg:object-right opacity-95 dark:opacity-85"
          />

          {/* Máscara suave apenas no lado esquerdo para dar leitura nítida ao texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent w-full lg:w-3/5" />

          {/* Máscara sutil na base para fusão com a próxima seção */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl lg:max-w-3xl space-y-6 text-left">
            {/* Categoria Monoespaçada */}
            <p className="text-xs font-semibold tracking-widest text-primary uppercase font-mono">
              The Clinical Operating System
            </p>

            {/* Headline Principal */}
            <motion.h1
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={0}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.12]"
            >
              O Sistema Operacional Inteligente para{' '}
              <span className="text-primary underline decoration-primary/40 decoration-wavy underline-offset-8">
                Clínicas Veterinárias
              </span>
            </motion.h1>

            {/* Subheadline com Alta Legibilidade */}
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              Centralize prontuários eletrônicos, automações de lembretes vacinais com filas BullMQ, agendamentos e aceite
              digital de termos pelo tutor com máxima segurança e conformidade jurídica.
            </motion.p>

            {/* Botões CTA com Acabamento Idêntico à Referência */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={2}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02]"
              >
                Acessar Demonstração Gratuita
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <a
                href="https://github.com/moaaskt/vetos-ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-border/80 bg-background/80 backdrop-blur-md text-foreground font-semibold text-sm hover:bg-secondary transition-all"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                Ver Código no GitHub
              </a>
            </motion.div>
          </div>

          {/* ─── 3. MOCKUP CLÍNICO FLUTUANTE (BOTTOM-LEFT FLOAT) ───────────── */}
          <div id="mockup-3d" className="mt-12 lg:mt-16 max-w-2xl lg:max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl shadow-black/10 dark:shadow-primary/5 relative overflow-hidden"
            >
              {/* Top Glass Highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              {/* Top Bar da Janela do Sistema */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-semibold text-muted-foreground font-mono">
                    vetos-ai.app • Clínica Alfa Matriz
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>PostgreSQL & Redis Online</span>
                  </span>
                </div>
              </div>

              {/* Grid Interno do Mockup */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Paciente com Foto e Status */}
                <div className="sm:col-span-7 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl overflow-hidden border border-border/80 shrink-0 bg-slate-900">
                      <img
                        src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80"
                        alt="Paciente canino"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        Larka
                        <span className="text-xs font-normal text-muted-foreground">(Golden Retriever, 3a)</span>
                      </h4>
                      <p className="text-xs text-muted-foreground">Tutora: Fernanda Guimarães • 24.8 kg</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl border border-border/70 bg-background/80">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Vacinas em Dia
                      </p>
                      <p className="text-[10px] text-muted-foreground">V10 + Antirrábica</p>
                    </div>
                    <div className="p-2 rounded-xl border border-border/70 bg-background/80">
                      <p className="font-semibold text-primary text-[11px] flex items-center gap-1">
                        <FileSignature className="h-3 w-3" /> Termo Assinado
                      </p>
                      <p className="text-[10px] text-muted-foreground">Auditoria IP e Hash</p>
                    </div>
                  </div>
                </div>

                {/* Métricas Rápidas ao Lado */}
                <div className="sm:col-span-5 p-3.5 rounded-2xl border border-border/70 bg-background/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Eficácia do atendimento:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">98,7%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[98.7%]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Syringe className="h-3 w-3 text-teal-500" />
                      Status de vacinação:
                    </span>
                    <span className="font-semibold text-foreground">OK</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 4. SOCIAL PROOF / FAIXA DE CONFIANÇA MINIMALISTA ───────────────── */}
      <section className="border-y border-border/60 bg-secondary/30 backdrop-blur-sm py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
            <div className="flex items-center gap-3.5 px-4 py-3 lg:py-0">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-bold text-foreground">Multi-tenant Lógico</p>
                <p className="text-xs text-muted-foreground">Isolamento estrito por thread</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-4 py-3 lg:py-0">
              <Zap className="h-6 w-6 text-primary shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-bold text-foreground">Filas Assíncronas</p>
                <p className="text-xs text-muted-foreground">BullMQ & Redis 7 persistido</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-4 py-3 lg:py-0">
              <FileSignature className="h-6 w-6 text-primary shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-bold text-foreground">Aceite do Tutor</p>
                <p className="text-xs text-muted-foreground">Trilha de auditoria IP & hash</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-4 py-3 lg:py-0">
              <Server className="h-6 w-6 text-primary shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-bold text-foreground">Cloud Architecture</p>
                <p className="text-xs text-muted-foreground">Oracle VPS + CI/CD contínuo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. RECURSOS & CAPACIDADES (DESIGN EDITORIAL CORPORATIVO) ──────── */}
      <section id="recursos" className="py-24 border-t border-border/60 bg-secondary/15 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase font-mono mb-3">
              Recursos & Capacidades
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
              Cada detalhe projetado para alta performance clínica
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
              className="md:col-span-2 rounded-3xl border border-border/80 bg-card p-8 shadow-sm hover:border-primary/50 hover:shadow-xl transition-all relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-primary flex items-center justify-center mb-6 shadow-sm">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Multi-tenant Lógico com Zero Vazamento</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xl">
                  O motor <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">TenantContextService</code>{' '}
                  utiliza <code className="text-xs font-mono text-foreground">AsyncLocalStorage</code> no Node.js para
                  propagar o identificador da clínica de forma isolada por thread lógica, aplicando filtros automáticos em
                  100% das operações de banco de dados no modo <strong>ENFORCE</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60">
                <div>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Isolamento Estrito
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 pl-3">Segregação nativa por clinicId</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Prisma Extension
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 pl-3">Modos OFF, LOG e ENFORCE</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Role-Based Access
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 pl-3">SuperAdmin, Admin e Staff</p>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 2 (Span 1): Assinatura Eletrônica */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-border/80 bg-card p-8 shadow-sm hover:border-primary/50 hover:shadow-xl transition-all relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-primary flex items-center justify-center mb-6 shadow-sm">
                  <FileSignature className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Aceite Digital do Tutor</h3>
                <p className="text-muted-foreground text-xs leading-relaxed mb-6">
                  Página pública com máscara de CPF e validação algorítmica para assinatura de termos de consentimento e
                  internação.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground pt-4 border-t border-border/60">
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} /> Trilha com IP & User-Agent
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} /> Carimbo de tempo UTC auditado
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} /> Impressão e PDF limpos
                </li>
              </ul>
            </motion.div>

            {/* Bento Card 3 (Span 1): Filas BullMQ */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-border/80 bg-card p-8 shadow-sm hover:border-primary/50 hover:shadow-xl transition-all relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-primary flex items-center justify-center mb-6 shadow-sm">
                  <Zap className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Automações & Filas BullMQ</h3>
                <p className="text-muted-foreground text-xs leading-relaxed mb-6">
                  Motor distribuído com Redis 7 para lembretes de vacinas nas janelas <strong>D0, D-1 e D-7</strong> com
                  anti-spam persistido.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground pt-4 border-t border-border/60">
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} /> Delayed jobs resilientes
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} /> Cancelamento em remarcação
                </li>
                <li className="flex items-center gap-2 text-foreground font-medium">
                  <Check className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} /> Logs em NotificationLog
                </li>
              </ul>
            </motion.div>

            {/* Bento Card 4 (Span 2): Prontuário & Prescrições */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="md:col-span-2 rounded-3xl border border-border/80 bg-card p-8 shadow-sm hover:border-primary/50 hover:shadow-xl transition-all relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-primary flex items-center justify-center mb-6 shadow-sm">
                  <Activity className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Prontuário Veterinário Unificado</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xl">
                  Linha do tempo médica com histórico de consultas, histórico de peso, procedimentos cirúrgicos, alertas
                  críticos de alergias do paciente e geração instantânea de prescrições médicas com QR Code.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60">
                <div>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <QrCode className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    Prescrição QR Code
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 pl-5.5">Validação pública rápida</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Syringe className="h-4 w-4 text-teal-500" strokeWidth={1.75} />
                    Controle Vacinal
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 pl-5.5">Doses futuras calculadas</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-rose-500" strokeWidth={1.75} />
                    Alertas de Alergia
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 pl-5.5">Destaque visual imediato</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 6. ARQUITETURA & TOPOLOGIA DE ENGENHARIA ───────────────────────── */}
      <section id="arquitetura" className="py-24 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texto Esquerdo */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase font-mono">
                Engenharia de Infraestrutura
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Topologia em Nuvem & Padrões Corporativos
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Projetado com separação estrita de camadas, tipagem estrita de ponta a ponta e entrega contínua
                automatizada via GitHub Actions para VPS Oracle Cloud com SSL Let's Encrypt.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-primary border border-border/60">
                      <Cpu className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">NestJS 11 & React 19</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    TypeScript estrito, guards de segurança e React Server/Client otimizado.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-primary border border-border/60">
                      <Database className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">PostgreSQL & Redis 7</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Persistência relacional transacional e filas BullMQ assíncronas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-primary border border-border/60">
                      <Workflow className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">CI/CD GitHub Actions</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Deploy contínuo por SSH com migrações automáticas do Prisma.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-primary border border-border/60">
                      <Lock className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">Segurança Criptográfica</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Bcrypt com 12 salt rounds, JWT assimétrico e HTTPS forçado.
                  </p>
                </div>
              </div>
            </div>

            {/* Diagrama Direito */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
                  <span className="text-xs font-mono font-semibold text-muted-foreground">
                    Topology: production-vps-oracle
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Cluster Ativo
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Camada 1 */}
                  <div className="p-4 rounded-2xl border border-border/70 bg-background flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                        Camada 1 • Gateway & Proxy
                      </span>
                      <h4 className="text-sm font-bold text-foreground mt-0.5">Nginx Reverse Proxy</h4>
                      <p className="text-xs text-muted-foreground">SSL Let's Encrypt • HTTP/2 • Gzip</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-muted text-muted-foreground border border-border">
                      Port 80/443
                    </span>
                  </div>

                  {/* Camada 2 */}
                  <div className="p-4 rounded-2xl border border-border/70 bg-background flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        Camada 2 • Aplicação Backend & Worker
                      </span>
                      <h4 className="text-sm font-bold text-foreground mt-0.5">NestJS Node 22 API</h4>
                      <p className="text-xs text-muted-foreground">Prisma ORM • BullMQ Processors • JWT Auth</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-muted text-muted-foreground border border-border">
                      Port 3000
                    </span>
                  </div>

                  {/* Camada 3 */}
                  <div className="p-4 rounded-2xl border border-border/70 bg-background flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Camada 3 • Dados & Persistência
                      </span>
                      <h4 className="text-sm font-bold text-foreground mt-0.5">PostgreSQL 15 & Redis 7</h4>
                      <p className="text-xs text-muted-foreground">Volumes Docker persistidos com backup diário</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-muted text-muted-foreground border border-border">
                      Port 5432 / 6379
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. TABELA DE PLANOS (DESIGN EDITORIAL) ─────────────────────────── */}
      <section id="planos" className="py-24 border-t border-border/60 bg-secondary/15 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase font-mono mb-3">
              Investimento & Planos
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
              Preços transparentes, escalabilidade contínua
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Escolha o plano ideal para a fase da sua clínica. Migração simples sem perda de dados históricos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Starter Card */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-border/80 bg-card p-8 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground">Starter</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para consultórios veterinários autônomos e atendimentos individuais.
                  </p>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-foreground">R$ 99</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>

                <ul className="space-y-3.5 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span>Até <strong>3 membros</strong> de equipe</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span>Até <strong>150 notificações</strong>/mês</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span><strong>1 GB</strong> de armazenamento clínico</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span>Prontuário eletrônico completo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
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

            {/* Professional Card */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border-2 border-primary bg-card p-8 shadow-2xl shadow-primary/10 flex flex-col justify-between relative transform md:-translate-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                    Mais Escolhido
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground">Professional</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para clínicas com equipe médica estruturada e alto fluxo diário.
                  </p>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-foreground">R$ 199</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>

                <ul className="space-y-3.5 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span>Até <strong>10 membros</strong> de equipe</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span>Até <strong>1.000 notificações</strong>/mês</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span><strong>10 GB</strong> de armazenamento clínico</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span><strong>Aceite & Assinatura Digital</strong> do Tutor</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span>Lembretes automáticos por E-mail</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
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
              className="rounded-3xl border border-border/80 bg-card p-8 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground">Enterprise</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para redes hospitalares 24h e operações com múltiplas unidades.
                  </p>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-foreground">Personalizado</span>
                </div>

                <ul className="space-y-3.5 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span>Membros de equipe <strong>ilimitados</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span>Notificações e automações ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span><strong>100 GB+</strong> de armazenamento dedicado</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
                    <span>Suporte prioritário 24/7 com SLA</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-foreground font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={1.75} />
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

      {/* ─── 8. CALLOUT DE DEMONSTRAÇÃO RÁPIDA (PORTFÓLIO) ─────────────────── */}
      <section className="py-20 border-t border-border/60 bg-background relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/80 to-background p-8 sm:p-10 text-center relative overflow-hidden shadow-xl"
          >
            <p className="text-xs font-semibold tracking-widest text-primary uppercase font-mono mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Ambiente de Demonstração Interativo
            </p>

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
                className="cursor-pointer px-4 py-3 rounded-xl bg-background border border-border/80 text-foreground flex items-center justify-between gap-3 hover:border-primary/50 transition-colors shadow-sm"
              >
                <div>
                  <span className="text-muted-foreground">Admin: </span>
                  <span className="text-primary font-bold">admin@alfa.com</span>
                </div>
                <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" strokeWidth={1.75} />
              </div>

              <div
                onClick={() => copyCredential('superadmin@vetos.ai')}
                className="cursor-pointer px-4 py-3 rounded-xl bg-background border border-border/80 text-foreground flex items-center justify-between gap-3 hover:border-primary/50 transition-colors shadow-sm"
              >
                <div>
                  <span className="text-muted-foreground">SuperAdmin: </span>
                  <span className="text-primary font-bold">superadmin@vetos.ai</span>
                </div>
                <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" strokeWidth={1.75} />
              </div>
            </div>

            {copiedEmail && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-4 animate-in fade-in-0 duration-200">
                ✓ E-mail ({copiedEmail}) copiado para a área de transferência! Senha: <span className="font-mono">Senha123!</span>
              </p>
            )}

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
            >
              Entrar no Ambiente de Teste
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── 9. FOOTER ESTILO ACETERNITY (SIMPLE FOOTER WITH FOUR GRIDS) ──── */}
      <footer className="border-t border-border/80 bg-background text-muted-foreground pt-16 pb-0 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Brand on Left + Four Grids on Right */}
          <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">
            {/* Left: Brand info & copyright */}
            <div className="space-y-4 max-w-sm">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-teal-400 text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/20">
                  <PawPrint className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl text-foreground tracking-tight">VetOS</span>
                  <span className="font-semibold text-xs text-primary font-mono">
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

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Sistemas operacionais</span>
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
                    <Link to="/tutor/login" className="hover:text-foreground hover:text-primary transition-colors">
                      Portal do Tutor
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
