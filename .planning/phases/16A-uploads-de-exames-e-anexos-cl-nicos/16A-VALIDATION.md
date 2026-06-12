---
phase: 16A
slug: uploads-de-exames-e-anexos-cl-nicos
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-12
---

# Phase 16A — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 30.x |
| **Config file** | backend/package.json |
| **Quick run command** | `npm --prefix backend test` |
| **Full suite command** | `npm --prefix backend test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm --prefix backend test`
- **After every plan wave:** Run `npm --prefix backend test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 16A-01-01 | 01 | 1 | REQ-16A.1 | T-16A-01 | Isolation of directories by clinic | unit | `npm --prefix backend test` | ❌ W0 | ⬜ pending |
| 16A-01-02 | 01 | 1 | REQ-16A.2 | T-16A-02 | Validates file size (max 10MB) & MIME | unit | `npm --prefix backend test` | ❌ W0 | ⬜ pending |
| 16A-01-03 | 01 | 1 | REQ-16A.3 | T-16A-03 | Validates clinic ownership on download | unit | `npm --prefix backend test` | ❌ W0 | ⬜ pending |
| 16A-02-01 | 02 | 2 | REQ-16A.4 | — | N/A | manual | see Manual Verifications | ✅ N/A | ⬜ pending |
| 16A-02-02 | 02 | 2 | REQ-16A.5 | — | N/A | manual | see Manual Verifications | ✅ N/A | ⬜ pending |
| 16A-02-03 | 02 | 2 | REQ-16A.6 | — | N/A | manual | see Manual Verifications | ✅ N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/src/clinical-attachments/clinical-attachments.service.spec.ts` — stubs for REQ-16A.1, REQ-16A.2, REQ-16A.3

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Arrastar e soltar arquivos na Dropzone | REQ-16A.4 | Envolve drag and drop interativo | Abrir a página do pet, acessar a aba de anexos, arrastar um arquivo PDF ou imagem e verificar se a área reage mudando a borda para azul e se o progresso é exibido. |
| Visualizar arquivos na lista e baixar | REQ-16A.5 | Envolve renderização e download do browser | Carregar um PDF, verificar o card de anexo com ícone de arquivo correto e clicar em Baixar para verificar o download no navegador. |
| Abrir Lightbox com preview de imagem | REQ-16A.6 | Envolve modal e exibição visual de mídia | Fazer upload de um arquivo PNG ou JPEG, clicar sobre o card e verificar se o modal Lightbox abre no centro da tela com o preview em tamanho real e botão de fechar. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-12
