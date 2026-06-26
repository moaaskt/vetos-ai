# AI & Automação — Estratégia de Produto

> **Status:** Rascunho
> **Última atualização:** 2026-06-26

---

## 1. Visão Geral

**Inteligência artificial veterinária integrada ao fluxo clínico.** O VetOS AI não será apenas um sistema de gestão com IA como feature decorativa — a IA será o diferencial competitivo central, permeando cada interação do veterinário com o sistema.

### 1.1. Princípios

1. **IA como copiloto, não como substituto:** A IA sugere, o veterinário decide
2. **Contexto é tudo:** Cada sugestão considera o histórico completo do pet
3. **Privacidade primeiro:** Dados clínicos nunca saem do ambiente controlado (LGPD)
4. **Custo consciente:** Otimização de tokens e caching para viabilidade financeira
5. **Evidência sobre intuição:** Sugestões baseadas em literatura veterinária e dados históricos

---

## 2. Módulo 1 — AI Copilot (Assistente de Anamnese)

### 2.1. Descrição

Assistente inteligente integrado ao fluxo de criação do prontuário clínico que auxilia o veterinário durante a anamnese e elaboração de diagnósticos.

### 2.2. Fluxo de Uso

```
Veterinário inicia consulta
    ↓
Registra sintomas e notas clínicas (texto livre)
    ↓
AI Copilot analisa em tempo real
    ↓
Painel lateral sugere:
  • Diagnósticos prováveis (com % de confiança)
  • Diagnósticos diferenciais a considerar
  • Exames recomendados para confirmação
  • Alertas de interação medicamentosa
  • Protocolos terapêuticos sugeridos
    ↓
Veterinário aceita, descarta ou modifica sugestões
    ↓
Sugestões aceitas são registradas no prontuário
```

### 2.3. Entradas (Input)

| Dado | Fonte | Tipo |
|---|---|---|
| Sintomas relatados | Input do veterinário | Texto livre |
| Notas clínicas | Input do veterinário | Texto livre |
| Histórico do pet | `PetDetails` / prontuário | Estruturado |
| Espécie, raça, idade, peso | Cadastro do pet | Estruturado |
| Vacinas aplicadas | Vaccine records | Estruturado |
| Medicações anteriores | Prescrições | Estruturado |
| Exames anteriores | Prontuário | Estruturado/Texto |

### 2.4. Saídas (Output)

| Saída | Formato | Exibição |
|---|---|---|
| Diagnósticos sugeridos | Lista ranqueada com % | Painel lateral |
| Diagnósticos diferenciais | Lista com justificativa | Expandível |
| Exames recomendados | Lista com prioridade | Checkbox para solicitação direta |
| Alertas de interação | Badge de alerta | Destaque em vermelho |
| Protocolos terapêuticos | Texto estruturado | Modal detalhado |

### 2.5. Tecnologia

- **LLM primário:** OpenAI GPT-4o (custo-benefício para produção)
- **LLM alternativo:** Anthropic Claude 3.5 Sonnet (fallback e comparação de qualidade)
- **Estratégia de prompt:**
  - System prompt com persona de médico veterinário especialista
  - Few-shot examples com casos clínicos reais (anonimizados)
  - Contexto injetado: histórico do pet + dados estruturados
  - Instruções de output: JSON estruturado com campos definidos
- **Caching:** Cache de respostas por hash de input (economia de 30-40% em tokens)
- **Latência alvo:** < 3 segundos para sugestões iniciais (streaming)

### 2.6. Ponto de Integração

- **Frontend:** Painel lateral no fluxo de criação de registro clínico dentro de `PetDetails.tsx`
- **Backend:** Novo serviço `/api/ai/copilot` com rate limiting por clínica
- **Acionamento:** Automático ao detectar >= 20 caracteres de notas clínicas, ou manual via botão

---

## 3. Módulo 2 — Smart Reengagement (Reengajamento Inteligente)

### 3.1. Descrição

Sistema de geração automática de mensagens personalizadas para reconquistar clientes inativos, considerando o contexto completo do pet e do tutor.

### 3.2. Lógica de Identificação de Inativos

```
Para cada cliente (tutor):
  última_visita = MAX(data de todas as consultas dos pets do tutor)
  
  SE última_visita > 90 dias:
    classificar como "inativo"
    gerar mensagem de reengajamento
```

### 3.3. Contexto para Geração de Mensagem

| Dado Contextual | Uso na Mensagem |
|---|---|
| Nome do tutor | Personalização |
| Nome(s) do(s) pet(s) | Personalização afetiva |
| Idade do pet | Alertas de saúde por faixa etária |
| Vacinas pendentes | Urgência de retorno |
| Último procedimento | Continuidade de cuidado |
| Tempo desde última visita | Tom da mensagem (3 meses vs 1 ano) |
| Serviços mais utilizados | Sugestão de agendamento direcionada |

### 3.4. Exemplo de Mensagem Gerada

```
Olá, Maria! 🐾

Faz 4 meses que não vemos o Thor aqui na clínica. 
Como ele está com 7 anos, é super importante fazer o 
check-up anual — nessa fase, exames de sangue e 
ultrassom ajudam a prevenir problemas comuns da idade.

Além disso, a vacina V10 dele está vencendo em 15 dias!

Quer agendar uma visita? Responda aqui ou acesse 
seu portal: [link]

Equipe [Nome da Clínica] 💙
```

### 3.5. Canais de Envio

| Canal | Integração | Prioridade |
|---|---|---|
| WhatsApp | Sistema de notificações existente | Principal |
| E-mail | Sistema de notificações existente | Secundário |
| Push (futuro) | Portal do Tutor (PWA) | Complementar |

### 3.6. Controles da Clínica

- Ativar/desativar reengajamento automático
- Definir período de inatividade (padrão: 90 dias)
- Revisar e aprovar mensagens antes do envio (modo supervisionado)
- Ou envio automático sem revisão (modo confiança)
- Frequência máxima de mensagens por tutor (anti-spam)
- Opt-out do tutor respeitado (LGPD)

---

## 4. Módulo 3 — No-Show Predictor (Preditor de Faltas)

### 4.1. Descrição

Modelo de machine learning que prevê a probabilidade de um tutor faltar a uma consulta agendada, permitindo ações preventivas.

### 4.2. Features do Modelo

| Feature | Tipo | Descrição |
|---|---|---|
| `historico_faltas` | Numérica | % de faltas históricas do tutor |
| `dia_semana` | Categórica | Segunda a Sábado |
| `horario` | Categórica | Manhã, Tarde, Noite |
| `antecedencia_agendamento` | Numérica | Dias entre agendamento e consulta |
| `tipo_servico` | Categórica | Consulta, vacina, retorno, etc. |
| `distancia_clinica` | Numérica | Distância estimada (CEP) |
| `clima_previsto` | Categórica | Chuva, sol (API externa) |
| `confirmou_lembrete` | Booleana | Respondeu ao lembrete? |
| `canal_agendamento` | Categórica | Portal, telefone, presencial |
| `tempo_desde_ultima_visita` | Numérica | Dias desde última consulta |

### 4.3. Output e Ações

| Probabilidade de Falta | Ação Sugerida |
|---|---|
| **< 20% (Baixo)** | Lembrete padrão (D-1) |
| **20-50% (Médio)** | Lembrete D-2 + D-1, solicitar confirmação |
| **50-80% (Alto)** | Lembrete D-3 + D-1, contato direto, sugerir reagendamento |
| **> 80% (Crítico)** | Overbooking inteligente no mesmo slot, contato imediato |

### 4.4. Tecnologia

- **Modelo:** Gradient Boosted Trees (XGBoost ou LightGBM)
- **Treinamento:** Batch semanal com dados históricos da clínica
- **Inferência:** Real-time no momento da criação do agendamento
- **Mínimo de dados:** 200 agendamentos com desfecho (compareceu/faltou) para ativar
- **Cold start:** Usar média global de no-show do setor (~20%) até ter dados suficientes

---

## 5. Módulo 4 — Document AI (IA de Documentos)

### 5.1. Descrição

Automação inteligente na geração e processamento de documentos clínicos.

### 5.2. Funcionalidades

#### 5.2.1. Auto-preenchimento de Prescrições

- Ao criar uma prescrição, a IA preenche automaticamente:
  - Medicamento baseado no diagnóstico
  - Dosagem ajustada ao peso e espécie do pet
  - Posologia padrão
  - Duração do tratamento
- Veterinário revisa e ajusta antes de salvar

#### 5.2.2. Geração Inteligente de Termos de Consentimento

- Input: tipo de procedimento (cirurgia, anestesia, internação, etc.)
- Output: termo de consentimento pré-preenchido com:
  - Riscos específicos do procedimento
  - Dados do pet e do tutor (preenchidos automaticamente)
  - Linguagem adequada para leigos
- Integração com o `ConsentTerm` existente

#### 5.2.3. OCR para Resultados de Exames Externos

- Tutor ou clínica faz upload de resultado de exame externo (imagem/PDF)
- OCR extrai dados estruturados:
  - Tipo de exame
  - Valores e unidades
  - Valores de referência
  - Data de realização
- Dados extraídos vinculados ao prontuário do pet

### 5.3. Tecnologia

| Funcionalidade | Tecnologia | Custo Estimado |
|---|---|---|
| Auto-fill prescrição | GPT-4o (prompt) | ~$0,005 por prescrição |
| Geração de termos | GPT-4o (prompt) | ~$0,008 por termo |
| OCR de exames | Google Vision AI ou AWS Textract | ~$0,01 por página |

---

## 6. Privacidade e Ética (LGPD)

### 6.1. Princípios de Conformidade

| Princípio LGPD | Implementação |
|---|---|
| **Finalidade** | IA usada exclusivamente para assistência clínica veterinária |
| **Necessidade** | Apenas dados clinicamente relevantes enviados à LLM |
| **Transparência** | Tutor informado que IA é utilizada (termos de uso) |
| **Segurança** | Dados anonimizados antes de envio a APIs externas |
| **Consentimento** | Clínica consente ao ativar módulo; tutor consente nos termos |

### 6.2. Anonimização de Dados

Antes de enviar qualquer dado a uma API de LLM externa:
- **Remover:** Nome do tutor, CPF, endereço, telefone, e-mail
- **Generalizar:** Data de nascimento → idade aproximada
- **Manter:** Dados clínicos (espécie, raça, peso, sintomas, histórico)
- **Nunca enviar:** Dados financeiros da clínica

### 6.3. Aviso ao Veterinário

Todas as sugestões da IA exibem disclaimer:

> ⚠️ *Sugestões geradas por inteligência artificial. O diagnóstico final e a decisão terapêutica são de responsabilidade exclusiva do médico veterinário.*

---

## 7. Build vs Buy

| Componente | Build | Buy | Recomendação |
|---|---|---|---|
| AI Copilot (prompts) | Prompts proprietários + orquestração | — | **Build** (diferencial competitivo) |
| LLM (modelo base) | — | OpenAI API / Claude API | **Buy** (inviável treinar modelo próprio) |
| No-Show Predictor | ML pipeline interno | — | **Build** (dados proprietários) |
| OCR | — | Google Vision / AWS Textract | **Buy** (commoditizado) |
| Reengagement (prompts) | Prompts + orquestração | — | **Build** (personalização é o valor) |

---

## 8. Projeção de Custos de API

### 8.1. Cenário: Clínica Média (30 consultas/dia)

| Módulo | Chamadas/mês | Custo estimado/mês |
|---|---|---|
| AI Copilot | ~660 (30/dia × 22 dias úteis) | R$ 50-80 |
| Smart Reengagement | ~50 mensagens | R$ 5-10 |
| Document AI (prescrições) | ~300 | R$ 10-15 |
| Document AI (OCR) | ~50 | R$ 5-10 |
| **Total** | | **R$ 70-115/mês** |

### 8.2. Estratégias de Otimização de Custo

1. **Caching semântico:** Consultas similares reutilizam respostas cacheadas
2. **Modelos menores para tarefas simples:** GPT-4o-mini para auto-fill, GPT-4o para diagnósticos
3. **Batching:** Reengagement processado em lote (noite) para evitar picos
4. **Rate limiting:** Limite de chamadas de IA por clínica (plano define teto)
5. **Embedding local:** Busca semântica em protocolos veterinários via embedding local (sem API)

---

## 9. Fases de Implementação

### Fase 1 — AI Copilot MVP (6-8 semanas)

- [ ] Serviço backend `/api/ai/copilot`
- [ ] System prompt veterinário com few-shot examples
- [ ] Painel lateral no fluxo de prontuário
- [ ] Sugestões de diagnóstico e exames (texto)
- [ ] Streaming de resposta para UX responsiva
- [ ] Disclaimer e controles de aceite/descarte

### Fase 2 — Smart Reengagement (4-5 semanas)

- [ ] Job de identificação de clientes inativos
- [ ] Geração de mensagens personalizadas
- [ ] Dashboard de campanhas de reengajamento
- [ ] Integração com notificações (e-mail + WhatsApp)
- [ ] Modo supervisionado (revisão antes do envio)

### Fase 3 — Document AI (4-5 semanas)

- [ ] Auto-fill de prescrições baseado no diagnóstico
- [ ] Geração de termos de consentimento
- [ ] OCR de exames externos (upload + extração)
- [ ] Vinculação automática ao prontuário

### Fase 4 — No-Show Predictor (6-8 semanas)

- [ ] Pipeline de coleta de features históricas
- [ ] Treinamento do modelo (XGBoost)
- [ ] Scoring em tempo real nos agendamentos
- [ ] Dashboard de previsões para a clínica
- [ ] Ações automáticas (lembretes escalonados)

---

## 10. Métricas de Sucesso

| Módulo | Métrica | Meta |
|---|---|---|
| AI Copilot | % de sugestões aceitas pelo veterinário | > 40% |
| AI Copilot | Tempo médio de consulta | Redução de 15% |
| Reengagement | Taxa de retorno de clientes inativos | > 20% |
| Reengagement | ROI da campanha | > 3x |
| No-Show Predictor | Acurácia de previsão | > 75% |
| No-Show Predictor | Redução de faltas | > 25% |
| Document AI | Tempo de preenchimento de prescrição | Redução de 50% |
