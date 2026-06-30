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

## Wave 2: Backend — Autenticação do Tutor

- [ ] Criar módulo NestJS `tutor-auth`.
- [ ] Implementar `TutorPortalAuthGuard`.
- [ ] Implementar decorator `@CurrentTutor()`.
- [ ] Endpoint `POST /tutor/auth/request-link` (solicitar Magic Link por e-mail).
- [ ] Endpoint `POST /tutor/auth/verify` (validar token, criar sessão, retornar JWT).
- [ ] Endpoint `POST /tutor/auth/refresh` (renovar sessão via Refresh Token).
- [ ] Lógica de vínculo: buscar `Client.email`/`emailAlt` → criar/reusar `TutorIdentity` → vincular `tutorIdentityId`.

---

## Wave 3: Frontend — /tutor/* Layout & Login

- [ ] Configurar rotas `/tutor/*` no React Router.
- [ ] Criar tela de login do tutor (solicitar e-mail para Magic Link).
- [ ] Criar tela de validação de token (`/tutor/auth/verify?token=...`).
- [ ] Criar layout mobile-first isolado do painel administrativo.
- [ ] Configurar gerenciamento de tokens separado do admin.

---

## Wave 4: Timeline da Vida do Pet & Documentos

- [ ] Endpoint `GET /tutor/pets/:id/timeline` no backend.
- [ ] Componente visual de Timeline no frontend.
- [ ] Mascaramento de CPF e dados sensíveis no portal.
- [ ] Listar documentos (receitas, termos) acessíveis ao tutor.

---

## Wave 5: Seed, Testes & Walkthrough

- [ ] Atualizar `seed.ts` com `TutorIdentity` vinculadas aos clientes demo.
- [ ] Testes de integração do ciclo de autenticação.
- [ ] Validar isolamento de dados entre tutores distintos.
- [ ] Executar UAT e escrever walkthrough de finalização.
