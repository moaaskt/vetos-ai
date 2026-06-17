---
phase: 16A
slug: uploads-de-exames-e-anexos-cl-nicos
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-16
---

# Phase 16A — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Client-Server Boundary | Upload de arquivos via requisições multipart/form-data | Laudos em PDF e imagens (JPEG, PNG, WEBP) do prontuário |
| Storage Boundary | Persistência física de arquivos em disco local pelo StorageService | Armazenamento de arquivos no diretório isolado por clínica |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-16A-01 | Elevation of Privilege / RCE | Backend (Multer / LocalStorageService) | mitigate | Restrição estrita a MIME-types permitidos (PDF, JPEG, PNG, WEBP) no Multer e nomes gerados por UUID sem execução. | closed |
| T-16A-02 | Information Disclosure | Backend (ClinicalAttachments) | mitigate | Validação de clinicId (tenant) extraída do token JWT em todas as ações de leitura/exclusão. | closed |
| T-16A-03 | Denial of Service | Backend (Multer limit) | mitigate | Limite de tamanho máximo de arquivo fixado em 10MB. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

No accepted risks.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-16 | 3 | 3 | 0 | Antigravity |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-16
