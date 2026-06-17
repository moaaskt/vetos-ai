# Phase 16B: Prontuário Avançado, Layout de Impressão e Assinatura Digital - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 16B - Prontuário Avançado, Layout de Impressão e Assinatura Digital
**Areas discussed:** Geração de PDF/Impressão, Documentos cobertos (Receita + Termo), Modelo de dados Prisma, Assinatura digital

---

## Geração de PDF / Layout de Impressão

### Q1: Estratégia de geração de PDF

| Option | Description | Selected |
|--------|-------------|----------|
| Páginas dedicadas por tipo (/print/prontuario/:petId, etc.) | Isola layout de impressão do resto da UI | |
| Componentes isolados em modal fullscreen | Preview antes de chamar window.print() | ✓ |
| CSS @media print nas páginas existentes | Menor refatoração, acopla layout à UI de visualização | |

**User's choice:** Componentes de layout de impressão isolados renderizados dentro de um modal fullscreen ou aba — o usuário clica "Imprimir" e vê o preview antes de chamar window.print()

---

### Q2: Estrutura visual dos documentos impressos

| Option | Description | Selected |
|--------|-------------|----------|
| Cabeçalho com logo + dados do pet + corpo + rodapé com assinatura | Estrutura completa com todos os dados | ✓ |
| Cabeçalho minimalista + dados em linha única | Sem rodapé de assinatura | |
| Layout configurável pelo veterinário | Flexível mas complexo | |

**User's choice:** Cabeçalho com logo da clínica + nome/endereço, dados do pet (nome, espécie, raça, tutor), corpo do documento, rodapé com data e assinatura do vet

---

### Q3: Ponto de entrada para impressão

| Option | Description | Selected |
|--------|-------------|----------|
| Botão "Imprimir" fixo no PetDetails + nos cards | Múltiplos pontos de acesso | |
| Botão apenas dentro de cada documento | Um passo adicional por documento | |
| Menu de ações (dropdown) centralizado | "Imprimir prontuário" / "Imprimir receita" / "Imprimir termo" | ✓ |

**User's choice:** Menu de ações (dropdown) com opções: "Imprimir prontuário completo" / "Imprimir receita" / "Imprimir termo" — centralizado em um único ponto de acesso

---

## Documentos cobertos (Receita Médica + Termo de Consentimento)

### Q4: Formato da receita médica

| Option | Description | Selected |
|--------|-------------|----------|
| Campos estruturados | Medicamento, dosagem, frequência, duração, via | |
| Texto livre | O veterinário digita livremente | |
| Híbrido | Campos estruturados + campo de observações livres | ✓ |

**User's choice:** Opção híbrida. Campos estruturados: Medicamento, Dosagem, Frequência, Duração, Via de administração + campo adicional de observações livres. Motivo: mantém boa UX, gera documentos padronizados, preserva flexibilidade clínica e facilita futuras funcionalidades de IA.

---

### Q5: Formato do Termo de Consentimento

| Option | Description | Selected |
|--------|-------------|----------|
| Texto padrão editável (template) | Texto base por tipo de procedimento, editável antes de salvar | ✓ |
| Campos estruturados fixos | Tipo, data, tutor, pet, assinatura — sem texto livre | |
| Texto 100% livre | O veterinário escreve do zero | |

**User's choice:** Templates padrão editáveis. Cada termo inicia de um modelo base por tipo de procedimento, preenchendo automaticamente dados do tutor/pet/clínica. O veterinário pode editar antes de imprimir/assinar. O ConsentTerm armazena o texto final renderizado. Motivo: padronização jurídica + redução de tempo + flexibilidade + biblioteca de templates futura.

---

### Q6: Onde receitas e termos aparecem no VetOS AI

| Option | Description | Selected |
|--------|-------------|----------|
| Timeline integrada no PetDetails.tsx | Junto com notas, procedimentos, anexos — diferenciados por badge | ✓ |
| Abas separadas ("Receitas" e "Termos") | Fragmenta o prontuário | |
| Filtro por tipo na timeline | Filtros: nota, procedimento, receita, termo | |

**User's choice:** Timeline integrada (📝 Nota, 💊 Receita, 📄 Termo, 📎 Anexo). Motivo: histórico cronológico, evita fragmentação, facilita auditoria, preserva contexto da consulta.

---

## Modelo de Dados Prisma

### Q7: Relações do modelo Prescription

| Option | Description | Selected |
|--------|-------------|----------|
| Vinculada obrigatoriamente ao ClinicalRecord | Rastreia consulta que gerou receita | |
| Vinculada apenas ao Pet e Clinic (avulsa) | Sem contexto de consulta | |
| Pet + Clinic obrigatórios; ClinicalRecord OU Appointment opcionais e independentes | Máxima flexibilidade | ✓ |

**User's choice:** Prescription vinculada ao Pet, Clinic (obrigatório) e opcionalmente a um ClinicalRecord OU Appointment (ambos opcionais, independentes).

---

### Q8: Relações do modelo ConsentTerm

| Option | Description | Selected |
|--------|-------------|----------|
| Pet + Clinic obrigatório; Appointment opcional | Permite termo sem consulta agendada | ✓ |
| Pet + Clinic apenas | Simples, sem contexto de appointment | |
| Pet + Clinic + Appointment obrigatórios | Obriga consulta para todo termo | |

**User's choice:** Opção recomendada — Pet e Clinic obrigatórios, Appointment opcional. Justificativa: fluxo atual permite registros clínicos avulsos; não criar Appointment automaticamente.

---

### Q9: Templates de termos de consentimento

| Option | Description | Selected |
|--------|-------------|----------|
| Modelo ConsentTemplate separado | Templates reutilizáveis por clínica, CRUD próprio | ✓ |
| Template dentro do ConsentTerm como JSON | Menos complexidade, não compartilhável | |
| Templates como constants no código | Sem CRUD, edição antes de cada novo termo | |

**User's choice:** Criar modelo ConsentTemplate separado vinculado à Clinic. Campos: id, clinicId, name, procedureType, baseText, isActive, createdAt, updatedAt. O ConsentTerm armazena o texto final editado (histórico jurídico preservado).

---

## Assinatura Digital

### Q10: Mecanismo de verificação de integridade

| Option | Description | Selected |
|--------|-------------|----------|
| Hash SHA-256 + timestamp + clinicId + QR code → /verify/:hash | Verificação online integrada ao VetOS AI | ✓ |
| Hash simples sem verificador online | Hash impresso, sem URL de confirmação | |
| Apenas data/hora + nome do veterinário | Sem criptografia, registro de intenção | |

**User's choice:** Hash SHA-256 do conteúdo final + timestamp do servidor + clinicId. QR code aponta para /verify/:hash que confirma integridade sem expor conteúdo.

---

### Q11: Fluxo de assinatura na UI

| Option | Description | Selected |
|--------|-------------|----------|
| Botão "Assinar" no modal de preview | Assinatura integrada ao fluxo de impressão | ✓ |
| Botão "Assinar" nos cards da timeline | Separado do fluxo de impressão | |
| Assinatura automática ao imprimir | Sem ação explícita do usuário | |

**User's choice:** Botão "Assinar documento" no modal de preview. Fluxo: criar → visualizar → revisar → assinar (gera hash + QR code) → documento SIGNED (imutável) → imprimir versão oficial.

---

### Q12: Campos de assinatura no schema

| Option | Description | Selected |
|--------|-------------|----------|
| status + signedAt + documentHash + verificationUrl nos modelos | Dados de assinatura embutidos nos modelos Prescription e ConsentTerm | ✓ |
| Modelo separado DocumentSignature | Flexível, join adicional | |
| Hash no campo notes | Minimalista, sem estrutura formal | |

**User's choice:** Campos embutidos nos modelos: status (DRAFT→SIGNED), signedAt, documentHash (SHA-256), verificationUrl.

---

### Q13: Endpoint de verificação pública

| Option | Description | Selected |
|--------|-------------|----------|
| GET /verify/:hash retorna dados básicos (tipo, pet, clínica, data, status SIGNED) | Sem expor conteúdo completo | ✓ |
| GET /verify/:hash retorna documento completo em HTML | Expõe conteúdo total do documento | |
| QR code → serviço externo (blockchain timestamp) | Fora do escopo desta fase | |

**User's choice:** Rota pública GET /verify/:hash retorna dados básicos do documento sem expor conteúdo completo.

---

## the agent's Discretion

- Nomenclatura exata das rotas REST (ex: POST /pets/:petId/prescriptions, POST /pets/:petId/consent-terms).
- Biblioteca de geração de QR code no backend (ex: `qrcode` npm package).
- Estilos CSS @media print — cores, margens, fontes respeitando paleta OKLCH.
- Estratégia de seed de ConsentTemplates padrão (castração, cirurgia eletiva, internação).

## Deferred Ideas

- Integração real com ICP-Brasil / Clicksign / BirdSign — fase futura.
- Filtros por tipo na timeline (Todos / Notas / Procedimentos / Receitas / Termos / Anexos) — fase posterior.
- CRUD completo de ConsentTemplates no frontend (painel admin de templates) — escopo futuro.
- Download em lote de documentos — fase futura.
- Timestamp externo em blockchain — out of scope.
