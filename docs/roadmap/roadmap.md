# Roadmap do Projeto - VetOS AI

Este é o roadmap oficial de desenvolvimento do VetOS AI, englobando as fases técnicas de infraestrutura e melhorias visuais do sistema.

## Fases Técnicas e de Negócio

### Fase 14B: Interface de Vacinas (Frontend UI)
* **Objetivo**: Prover visualização no frontend para o motor de lembretes de imunização (fila BullMQ, disparos manuais e conversões).

### Fase 15: SaaS Billing & Limites
* **Objetivo**: Checkout com Stripe/Asaas, controle de cotas (staff seats, notificações, storage) e bloqueio por inadimplência.

### Fase 16A: Uploads de Exames no Prontuário
* **Objetivo**: Laudos e imagens integradas ao prontuário médico de forma segura.

### Fase 16B: Prontuário Avançado & Assinatura Digital
* **Objetivo**: Layout de impressão e assinatura eletrônica qualificada (ICP-Brasil) de receitas e termos.

### Fase 16B.1: Compartilhamento com Tutor
* **Objetivo**: Envio de Receitas e Termos assinados via Email e WhatsApp do tutor.

### Fase 16B.1.1: Aceite Eletrônico do Tutor
* **Objetivo**: Rota pública para assinatura e aceite de termos de consentimento pelo tutor. (Concluído)

### Fase 16B.1.2: Cadastro Completo do Tutor
* **Objetivo**: Tela pública para captação cadastral completa do tutor e sincronismo em tempo real.

### Fase 16B.1.2.1: Portal do Tutor
* **Objetivo**: Área logada para o tutor visualizar dados de saúde, peso, e vacinas de seus animais.

### Fase 17: IA Assistente (AI Copilot)
* **Objetivo**: Copilot de anamnese com sugestão de diagnóstico, reengajamento de tutores inativos e predição de no-show.

### Fase 18: Segurança e e2e
* **Objetivo**: Redis wrapper, Rate Limiting (Throttler), divisão de componentes complexos do frontend e testes e2e de fluxo.

---

## Roadmap de Refinamento de UI/UX (Frontend)

* **Sprint 1: Portal do Tutor B2C** (Curva de peso, timeline agrupada, cards modularizados). (Concluído)
* **Sprint 2: Sistema de Design mínimo** (Consolidação de TailwindCSS v4 tokens e componentes básicos).
* **Sprint 3: Portal Admin - Eficiência** (Alta densidade, alertas destacados de alergias).
* **Sprint 4: Responsividade** (Uso em tablets e smartphones nos consultórios).
* **Sprint 5: Acessibilidade** (Nível WCAG AA, focus-visible contrastado).
* **Sprint 6: Motion** (Animações funcionais sob 200ms).
* **Sprint 7: Performance & Resiliência** (Bundling otimizado e tratamento de erro de rede).
