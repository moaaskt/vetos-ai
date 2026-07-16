# Checklist de Execução — Phase 16B.1.2.1: Tutor Platform

## Wave 1: Prisma Schema & Modelagem de Dados ✅

- [x] Enum `PreferredChannel { EMAIL, WHATSAPP, BOTH }` adicionado ao schema.
- [x] Model `TutorIdentity` criado com `publicId`, `primaryEmail`, `primaryWhatsapp` (indexado, não unique), `cpf`, `preferredChannel`, `locale`, `timezone`.
- [x] Model `TutorPortalToken` criado com `tokenHash`, `expiresAt`, `usedAt`, `requestedBy`.
- [x] Model `TutorSession` criado com `refreshTokenHash`, `expiresAt`, `lastUsedAt`, `revokedAt`.
- [x] `Client.tutorIdentityId` (opcional) adicionado com índice e relação.
- [x] `ClinicalAttachment.visibleToTutor Boolean @default(false)` adicionado.
- [x] `npx prisma validate` → schema válido.
- [x] `npx prisma db push` → banco sincronizado com sucesso.
  - *Nota:* Banco local sincronizado diretamente via `db push` devido ao ambiente de execução não-interativo que bloqueia `prisma migrate dev`.
  - *Pendência Obrigatória Pré-Produção:* Criar migration formal versionada no PostgreSQL de staging/produção para a Tutor Platform.
- [x] `npm run build` → compilação TypeScript bem-sucedida.

---

## Wave 2: Backend — Autenticação do Tutor ✅

- [x] Criar módulo NestJS `tutor-platform` (bounded context).
- [x] Implementar `TutorPortalAuthGuard` (com validação exclusiva para Tutor).
- [x] Implementar decorator `@CurrentTutor()`.
- [x] Endpoint `POST /tutor/auth/request-link` (solicitar Magic Link por e-mail).
- [x] Endpoint `POST /tutor/auth/verify` (validar token, criar sessão, retornar JWT e dados básicos do tutor).
- [x] Endpoint `POST /tutor/auth/refresh` (renovar sessão via Refresh Token).
- [x] Lógica de vínculo: buscar `Client.email`/`emailAlt` → criar/reusar `TutorIdentity` → vincular `tutorIdentityId`.
  - *Pendência Obrigatória Pré-Produção:* Definir `TUTOR_JWT_SECRET` e remover hardcoded fallbacks de dev no guard e serviço.
  - *Pendência Obrigatória Pré-Produção:* Implementar testes automatizados de integração do ciclo de auth do tutor (magic link, tokens, sessões).

---

## Wave 3: Frontend — /tutor/* Layout & Login ✅

- [x] Configurar rotas `/tutor/*` no React Router.
- [x] Criar tela de login do tutor (solicitar e-mail para Magic Link).
- [x] Criar tela de validação de token (`/tutor/auth/verify?token=...`).
- [x] Criar layout mobile-first isolado do painel administrativo.
- [x] Configurar gerenciamento de tokens separado do admin (`TutorAuthContext`).
- [x] Redirecionamento para dashboard `/tutor` pós-verificação.
- [x] Compilação do Frontend (`npm run build`) validada.

---

## Wave 4: Timeline da Vida do Pet & Documentos

- [ ] Endpoint `GET /tutor/pets/:id/timeline` no backend.
- [ ] Componente visual de Timeline no frontend.
- [ ] Mascaramento de CPF e dados sensíveis no portal.
- [ ] Listar documentos (receitas, termos) acessíveis ao tutor.

---

## Wave 5: Setup, Seed & Finalização

- [ ] Atualizar script de seed (`seed.ts`) para injetar dados mock do Tutor.
- [ ] Rodar testes de integração se aplicável.
- [ ] Registrar documentação / walkthrough final (walkthrough.md).
- [ ] **Obrigatório:** Criar migration formal versionada para a Tutor Platform (a Wave 1 usou `db push`).

## Pendências Pós-MVP / Deferred

- [ ] **Ambiental:** Subir Evolution API local ou ajustar URL base (localhost:8080) antes de validar WhatsApp real.
- [ ] **Funcionalidade:** Adicionar seleção explícita de clínica no Portal do Tutor quando este possuir vínculos em múltiplas clínicas, de modo a permitir um disparo transacional específico. Atualmente, utiliza a clínica vinculada mais antiga para rotear o envio de e-mails.
