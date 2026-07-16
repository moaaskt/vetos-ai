# Landing Page & Marketing — Estratégia de Produto

> **Status:** Rascunho
> **Última atualização:** 2026-06-26

---

## 1. Visão Geral

**Objetivo:** Criar o site público do VetOS AI para converter clínicas veterinárias em clientes pagantes. A landing page é o principal canal de aquisição orgânica e paga, funcionando como vitrine do produto e ponto de entrada do funil de vendas.

### 1.1. Público-Alvo

| Persona | Perfil | Motivação |
|---|---|---|
| **Veterinário proprietário** | Dono de clínica pequena/média, 1-5 vets | Quer modernizar, perder menos tempo com burocracia |
| **Gestor de clínica** | Administrador de clínica média/grande | Busca eficiência operacional e dados para decisão |
| **Veterinário empregado** | Influenciador interno | Quer ferramenta que facilite o dia a dia clínico |

### 1.2. Posicionamento

> **VetOS AI** — O sistema veterinário com inteligência artificial que cuida da sua clínica enquanto você cuida dos pets.

**Diferenciação:**
- IA integrada nativamente (não é um plugin)
- Portal do tutor (nenhum concorrente tem)
- Interface moderna (concorrentes têm UX dos anos 2000)
- Foco em automação (reduz trabalho manual)

---

## 2. Estrutura da Página

### 2.1. Hero Section

**Conteúdo:**
- Headline: Proposta de valor principal (1 frase)
- Subheadline: Descrição de suporte (2-3 linhas)
- CTA primário: "Comece seu teste grátis" (botão destaque)
- CTA secundário: "Agende uma demonstração" (botão outline)
- Visual: Screenshot/mockup do dashboard com overlay de IA em ação
- Selo de confiança: "Usado por X clínicas em Y cidades"

**Exemplo de copy:**
```
Headline:   Sua clínica veterinária com superpoderes de IA
Subheadline: Prontuário inteligente, agendamento automático e um portal 
             exclusivo para seus clientes. Tudo em um só sistema.
```

### 2.2. Feature Showcase

Organizado em 3 blocos com ícones animados e screenshots:

#### Bloco 1 — Gestão Clínica
- Prontuário eletrônico completo
- Agendamento inteligente
- Controle de vacinas
- Prescrições e documentos digitais
- Financeiro e faturamento

#### Bloco 2 — Automação & IA
- AI Copilot: assistente de diagnóstico
- Reengajamento inteligente de clientes
- Predição de faltas
- Documentos gerados por IA
- Lembretes automáticos

#### Bloco 3 — Portal do Tutor
- Acesso do tutor ao histórico do pet
- Agendamento online pelo tutor
- Assinatura digital de termos
- Calendário de vacinas
- Comunicação direta clínica-tutor

### 2.3. Tabela de Preços

| Característica | Starter | Professional | Enterprise |
|---|---|---|---|
| **Preço** | R$ X/mês | R$ Y/mês | Sob consulta |
| Prontuário eletrônico | ✅ | ✅ | ✅ |
| Agendamento | ✅ | ✅ | ✅ |
| Vacinas e lembretes | ✅ | ✅ | ✅ |
| Financeiro | Básico | Completo | Completo |
| Portal do Tutor | — | ✅ | ✅ |
| AI Copilot | — | ✅ | ✅ |
| Smart Reengagement | — | — | ✅ |
| No-Show Predictor | — | — | ✅ |
| Suporte | E-mail | E-mail + Chat | Dedicado |
| Usuários | Até 2 | Até 10 | Ilimitado |
| **Teste grátis** | 14 dias | 14 dias | Demo personalizada |

> **Nota:** Valores a definir com base em pesquisa de mercado. Concorrentes cobram entre R$ 99-499/mês.

### 2.4. Prova Social / Depoimentos

- Depoimentos de clínicas beta-testers (quando disponíveis)
- Logos de clínicas parceiras
- Números de impacto:
  - "Redução de 40% no tempo de preenchimento de prontuário"
  - "25% menos faltas com lembretes inteligentes"
  - "NPS de 9.2 entre veterinários usuários"
- Selo de conformidade LGPD
- Badge de segurança (dados criptografados)

### 2.5. Demo Request / Free Trial CTA

**Seção dedicada com formulário:**
- Nome completo
- E-mail profissional
- Nome da clínica
- Telefone/WhatsApp
- Cidade/Estado
- Número de veterinários
- Botão: "Começar teste grátis" ou "Solicitar demonstração"

**Automação pós-formulário:**
1. E-mail de boas-vindas com credenciais de acesso
2. WhatsApp com link para onboarding
3. Acompanhamento automático D+3, D+7, D+12
4. Contato comercial se clínica > 5 vets

### 2.6. FAQ

Perguntas frequentes organizadas por categoria:

**Produto:**
- O VetOS AI funciona em qualquer computador?
- Preciso instalar algum software?
- Como faço a migração dos dados da minha clínica?

**Preço:**
- O teste grátis tem todas as funcionalidades?
- Existe taxa de implantação?
- Posso cancelar a qualquer momento?

**Segurança:**
- Meus dados estão seguros?
- O sistema atende à LGPD?
- E se eu quiser exportar meus dados?

**IA:**
- Como a IA do diagnóstico funciona?
- A IA substitui o veterinário?
- Os dados dos meus pacientes são usados para treinar IA?

### 2.7. Rodapé / Contato

- Links institucionais: Sobre, Blog, Carreiras, Termos de Uso, Política de Privacidade
- Contato: E-mail, WhatsApp, Telefone
- Redes sociais: Instagram, LinkedIn, YouTube
- Endereço da empresa
- CNPJ

---

## 3. Abordagem Técnica

### 3.1. Stack — Decisão Pendente

**Opção A: Astro (recomendado)**

```
landing/
├── src/
│   ├── pages/
│   │   ├── index.astro        # Landing page principal
│   │   ├── precos.astro       # Página de preços detalhada
│   │   ├── funcionalidades.astro
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── components/
│   ├── layouts/
│   └── content/              # Blog posts em Markdown
├── public/
│   ├── images/
│   └── fonts/
└── astro.config.mjs
```

- **Prós:** Performance excepcional (zero JS por padrão), Content Collections para blog, Islands Architecture para componentes interativos
- **Contras:** Equipe precisa aprender Astro

**Opção B: Next.js (App Router)**

- **Prós:** Equipe já conhece React, SSG + SSR, ecossistema maduro
- **Contras:** Bundle maior que Astro para site estático, over-engineering para landing page

**Opção C: Hugo (estático puro)**

- **Prós:** Build mais rápido, sem runtime JS, excelente para SEO
- **Contras:** Templating em Go, menos flexibilidade para interações

> **Recomendação:** Astro para landing + blog. Next.js como fallback se a equipe resistir à curva de aprendizado.

### 3.2. SEO

#### Otimização On-Page

| Elemento | Implementação |
|---|---|
| Title tag | `VetOS AI — Sistema Veterinário com Inteligência Artificial` |
| Meta description | `Gerencie sua clínica veterinária com IA. Prontuário inteligente, portal do tutor, agendamento automático. Teste grátis por 14 dias.` |
| H1 único | Headline da hero section |
| Hierarquia H2-H6 | Cada seção com heading adequado |
| URL slugs | `/funcionalidades`, `/precos`, `/blog/titulo-do-post` |
| Schema markup | Organization, Product, FAQ, BreadcrumbList |
| Sitemap XML | Gerado automaticamente |
| robots.txt | Configurado para indexação |
| Open Graph | Imagens e metadata para compartilhamento social |
| Alt text | Todas as imagens com descrição |

#### Palavras-chave Alvo

| Palavra-chave | Volume estimado | Dificuldade | Prioridade |
|---|---|---|---|
| sistema veterinário | Alto | Alta | Alta |
| software para clínica veterinária | Médio | Média | Alta |
| prontuário veterinário digital | Baixo | Baixa | Alta |
| gestão clínica veterinária | Médio | Média | Alta |
| sistema pet shop e veterinária | Médio | Alta | Média |
| agendamento veterinário online | Baixo | Baixa | Média |
| IA para veterinários | Baixo | Baixa | Alta (diferencial) |

### 3.3. Analytics e Conversão

| Ferramenta | Propósito |
|---|---|
| Google Analytics 4 | Tráfego, comportamento, atribuição |
| Google Tag Manager | Gerenciamento de tags e eventos |
| Google Search Console | Performance de SEO |
| Hotjar / Clarity | Heatmaps e gravações de sessão |
| Conversion tracking | Formulário preenchido, teste iniciado |

**Eventos de conversão a rastrear:**
- `cta_click` — Clique em qualquer CTA
- `form_start` — Início de preenchimento do formulário
- `form_submit` — Envio do formulário de demo/trial
- `pricing_view` — Visualização da tabela de preços
- `faq_expand` — Interação com FAQ
- `scroll_depth` — 25%, 50%, 75%, 100%

---

## 4. Design

### 4.1. Identidade Visual

| Atributo | Direção |
|---|---|
| **Tom** | Profissional mas acessível, moderno, confiável |
| **Cores primárias** | Azul clínico + verde saúde (a definir paleta exata) |
| **Cores de acento** | Gradientes suaves, branco generoso |
| **Tipografia** | Inter ou Outfit (moderna, limpa, boa legibilidade) |
| **Ícones** | Linha fina, consistentes, com animação sutil |
| **Imagens** | Fotos reais de clínicas e pets (evitar stock genérico) |

### 4.2. Princípios de Design

1. **Confiança:** Visual limpo, profissional, sem excessos
2. **Clareza:** Informação hierarquizada, sem ruído
3. **Modernidade:** Glassmorphism sutil, micro-animações, gradientes
4. **Responsividade:** Mobile-first, perfeito em qualquer tela
5. **Acessibilidade:** WCAG 2.1 AA mínimo, contraste adequado

### 4.3. Requisitos de Performance

| Métrica (Core Web Vitals) | Meta |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| Performance Score (Lighthouse) | > 95 |
| Accessibility Score | > 90 |
| SEO Score | 100 |

### 4.4. Modo Escuro / Claro

- Detecção automática de preferência do sistema
- Toggle manual no header
- Transição suave entre modos
- Cores otimizadas para ambos os modos

---

## 5. Estratégia de Marketing

### 5.1. Canais de Aquisição

| Canal | Tipo | Prioridade | Investimento |
|---|---|---|---|
| SEO / Blog | Orgânico | Alta | Tempo (conteúdo) |
| Google Ads | Pago | Alta | R$ 2-5K/mês inicial |
| Instagram | Orgânico + Pago | Alta | R$ 1-2K/mês |
| LinkedIn | Orgânico | Média | Tempo (conteúdo) |
| YouTube | Orgânico | Média | Tempo (vídeos) |
| Parcerias (CRMV, associações) | Orgânico | Alta | Networking |
| Indicação de clientes | Orgânico | Alta | Programa de referral |
| Eventos veterinários | Presencial | Média | Custo de evento |

### 5.2. Content Marketing — Blog Veterinário

**Objetivo:** Atrair tráfego orgânico de veterinários buscando soluções.

**Categorias de conteúdo:**

1. **Gestão de clínica:**
   - "Como reduzir faltas na sua clínica veterinária"
   - "5 erros comuns na gestão financeira de pet shops"
   - "Prontuário eletrônico: por que sua clínica precisa de um"

2. **Tecnologia veterinária:**
   - "IA na medicina veterinária: o futuro já chegou"
   - "Como a automação pode liberar 2 horas do seu dia"
   - "LGPD para clínicas veterinárias: guia completo"

3. **Marketing veterinário:**
   - "Como fidelizar clientes na sua clínica"
   - "WhatsApp Business para veterinários: guia prático"
   - "Como criar um programa de lembretes de vacinas eficiente"

**Frequência:** 2-4 posts por mês

### 5.3. Funil de Conversão

```
Visitante (landing page / blog)
    ↓ CTA: "Teste grátis"
Trial (14 dias gratuitos)
    ↓ Onboarding automatizado
    ↓ E-mails de nutrição (D+1, D+3, D+7, D+12)
    ↓ Check-in humano (D+5 para clínicas > 3 vets)
Conversão (plano pago)
    ↓ Programa de referral
    ↓ Upsell para planos superiores
Expansão (mais funcionalidades, mais usuários)
```

### 5.4. Programa de Indicação (Referral)

- Clínica indica outra clínica
- Indicador ganha: 1 mês grátis (ou desconto)
- Indicado ganha: trial estendido (30 dias ao invés de 14)
- Tracking via código único de indicação
- Dashboard de indicações para a clínica

---

## 6. Integração com Billing

### 6.1. Fluxo Free Trial → Pago

```
1. Cadastro na landing page
2. Provisioning automático do tenant (multi-tenant)
3. Trial de 14 dias (todas as features do plano Professional)
4. Dia 10: Alerta de expiração + oferta de conversão
5. Dia 13: Último aviso + facilidades de pagamento
6. Dia 14: Trial expira → downgrade para plano limitado (read-only)
7. Dados preservados por 30 dias → exclusão após 60 dias
```

### 6.2. Gateway de Pagamento

- **Primário:** Stripe ou Pagar.me (recorrência + boleto + Pix)
- **Modalidades:** Mensal e anual (desconto de 20% no anual)
- **Boleto bancário:** Essencial para clínicas menores no Brasil
- **Pix:** Integração para pagamento instantâneo
- **Nota fiscal:** Emissão automática via integração com e-Notas ou similar

---

## 7. Fases de Implementação

### Fase 1 — Landing Page MVP (3-4 semanas)

- [ ] Estrutura do site (Astro ou Next.js)
- [ ] Hero section com copy e CTAs
- [ ] Feature showcase (3 blocos)
- [ ] Formulário de demo/trial
- [ ] Design responsivo (mobile-first)
- [ ] SEO básico (title, meta, schema)
- [ ] GA4 + conversion tracking
- [ ] Deploy (Vercel ou Cloudflare Pages)

### Fase 2 — Conteúdo e Preços (2-3 semanas)

- [ ] Tabela de preços funcional
- [ ] FAQ completo
- [ ] Depoimentos / prova social
- [ ] Página de funcionalidades detalhada
- [ ] Modo escuro/claro
- [ ] Otimização de Core Web Vitals

### Fase 3 — Blog e Content Marketing (3-4 semanas)

- [ ] Setup do blog (Content Collections ou CMS)
- [ ] 5 posts iniciais para lançamento
- [ ] Calendário editorial (3 meses)
- [ ] Integração com newsletter
- [ ] Schema markup para artigos

### Fase 4 — Conversão e Automação (2-3 semanas)

- [ ] Integração com billing (trial automático)
- [ ] E-mails de onboarding automatizados
- [ ] Programa de referral
- [ ] A/B testing de CTAs e copy
- [ ] Chatbot de suporte (Intercom / Crisp)

---

## 8. Métricas de Sucesso

| Métrica | Meta 3 meses | Meta 6 meses |
|---|---|---|
| Visitantes únicos/mês | 1.000 | 5.000 |
| Taxa de conversão (visitante → trial) | 3% | 5% |
| Taxa de conversão (trial → pago) | 15% | 25% |
| CAC (Custo de Aquisição de Cliente) | < R$ 300 | < R$ 200 |
| Posição média Google (keywords alvo) | Top 20 | Top 10 |
| Blog posts publicados | 10 | 25 |
| Lighthouse Performance Score | > 90 | > 95 |

---

## 9. Análise Competitiva — Presença Digital

| Concorrente | Landing Page | Blog | Portal Tutor | IA |
|---|---|---|---|---|
| SimplesVet | ✅ Boa | ✅ Ativo | ❌ | ❌ |
| Vetwork | ✅ Básica | ❌ | ❌ | ❌ |
| DrVet | ✅ Média | ⚠️ Inativo | ❌ | ❌ |
| Vet+i | ✅ Básica | ❌ | ❌ | ❌ |
| **VetOS AI** | 🔨 A construir | 🔨 A construir | ✅ Planejado | ✅ Planejado |

**Oportunidade:** Nenhum concorrente combina landing page moderna + blog ativo + portal do tutor + IA. O VetOS AI será o primeiro a ter todos os quatro pilares.
