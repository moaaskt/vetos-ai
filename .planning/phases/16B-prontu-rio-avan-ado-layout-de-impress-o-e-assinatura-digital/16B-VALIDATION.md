---
phase: 16B
slug: prontu-rio-avan-ado-layout-de-impress-o-e-assinatura-digital
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-17
---

# Phase 16B — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest v30.0.0 |
| **Config file** | Configuração inline em `backend/package.json` |
| **Quick run command** | `npm run test -- {filename}` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- {filename}` (e.g. `npm run test -- prescriptions.service.spec.ts`)
- **After every plan wave:** Run `npm run test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 16B-01-01 | 01 | 1 | REQ-01 | T-16B-01 | Validação de pertencer do Pet à clínica ao salvar receitas | unit | `npm run test -- prescriptions.service.spec.ts` | ❌ Wave 1 | ⬜ pending |
| 16B-01-02 | 01 | 1 | REQ-02 | T-16B-02 | Geração de hash SHA-256 e status de imutabilidade | unit | `npm run test -- prescriptions.service.spec.ts` | ❌ Wave 1 | ⬜ pending |
| 16B-01-03 | 01 | 1 | REQ-03 | — | Resolução de placeholders dinâmicos em termos | unit | `npm run test -- consent-terms.service.spec.ts` | ❌ Wave 1 | ⬜ pending |
| 16B-02-01 | 02 | 2 | REQ-04 | T-16B-04 | Endpoint público de verificação de hashes de integridade | unit | `npm run test -- verification.controller.spec.ts` | ❌ Wave 2 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Nenhum — os stubs de testes unitários do backend serão gerados diretamente durante as tarefas de implementação da Wave 1.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Modal de Preview e Impressão | — | Interação nativa do navegador (`window.print`) | Abrir o prontuário do pet, clicar em "Imprimir prontuário completo", verificar o visual no modal fullscreen e disparar o diálogo nativo. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
