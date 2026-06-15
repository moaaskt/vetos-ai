---
phase: 16A-uploads-de-exames-e-anexos-cl-nicos
plan: 16A-01
subsystem: upload-storage
tags: [react, typescript, nestjs, prisma, local-storage, multer, webp]
requires:
  - phase: 11-veterinary-medical-records-clinical-history
    provides: Medical records layout and PetDetails template
provides:
  - Isolated file persistence service (StorageService / LocalStorageService)
  - Backend clinical attachment endpoints (upload, download, list, delete)
  - Strict tenant isolation and WebP format support end-to-end
  - Frontend tabs, dropzone, attachment cards, and image lightbox
affects: [attachments, clinic-dashboard, frontend-api, backend-api]
tech-stack:
  added: [multer, express]
  patterns: [abstract storage provider pattern, physical multi-tenant file separation]
key-files:
  created:
    - backend/src/storage/storage.module.ts
    - backend/src/storage/storage.service.ts
    - backend/src/storage/local-storage.service.ts
    - backend/src/storage/local-storage.service.spec.ts
    - backend/src/clinical-attachments/clinical-attachments.module.ts
    - backend/src/clinical-attachments/clinical-attachments.controller.ts
    - backend/src/clinical-attachments/clinical-attachments.service.ts
    - backend/src/clinical-attachments/clinical-attachments.service.spec.ts
  modified:
    - backend/prisma/schema.prisma
    - backend/src/app.module.ts
    - frontend/src/lib/api.ts
    - frontend/src/pages/PetDetails.tsx
key-decisions:
  - "Decoupled physical storage (StorageService) from business domain (ClinicalAttachmentsService)."
  - "Implemented strict clinicId (tenant) checks on every backend database and disk operation."
  - "Allowed PDF, JPEG, PNG, and WEBP file types under 10MB."
patterns-established:
  - "Multi-tenant physical storage paths: uploads/clinics/:clinicId/pets/:petId/:storedFileName"
  - "Blob response loading for authenticated downloads from NestJS REST API"
requirements-completed: [REQ-16A.1, REQ-16A.2, REQ-16A.3, REQ-16A.4, REQ-16A.5, REQ-16A.6]
duration: 40min
completed: 2026-06-12
---

# Phase 16A: Uploads de Exames e Anexos Clínicos Summary

**Upload, validação e armazenamento seguro de laudos e imagens no prontuário do pet com suporte completo a WEBP e isolamento multi-tenant.**

## Accomplishments

- **Prisma Schema Update**: Adicionado modelo `ClinicalAttachment` relacionado a pets, clínicas e registros clínicos com campo `fileSize` tipo `BigInt`.
- **Storage Module**: Criado `StorageModule` abstrato desacoplado para operações de gravação e exclusão física local em `uploads/clinics/:clinicId/pets/:petId/`.
- **Clinical Attachments API**: Criados endpoints de upload, download, listagem e exclusão com validação obrigatória de tenant (`clinicId`).
- **Frontend Refactoring**: Refatorado `PetDetails.tsx` para suporte a abas de navegação, Dropzone interativo (suportando WEBP, PNG, JPEG, PDF), listagem de anexos por cards, download seguro via Axios Blob e Lightbox integrado para visualização de imagens.
