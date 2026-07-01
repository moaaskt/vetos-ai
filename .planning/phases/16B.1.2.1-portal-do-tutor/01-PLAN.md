# Plano de Implementação — Phase 16B.1.2.1: Tutor Platform (Bootstrap & Core)

Este plano detalha o pipeline técnico de desenvolvimento para a fundação da **Tutor Platform**, estruturando a base de dados de identidades digitais (`TutorIdentity`), fluxo de acesso seguro por Magic Link e a Timeline da Vida do Pet.

---

## 1. Ondas de Entrega (Waves)

### Wave 1: Modelagem de Dados & Migrations (Prisma Schema) — CONCLUÍDA

*   **Novas Entidades:**
    *   `enum PreferredChannel { EMAIL, WHATSAPP, BOTH }`
    *   `model TutorIdentity` com: `id`, `publicId` (unique), `name`, `primaryEmail` (unique, nullable), `primaryWhatsapp` (nullable, indexado, **não unique**), `cpf` (unique, nullable), `preferredChannel`, `locale`, `timezone`, `createdAt`, `updatedAt`.
    *   `model TutorPortalToken` com: `id`, `tokenHash` (unique), `tutorIdentityId`, `expiresAt`, `usedAt`, `requestedBy`, `createdAt`.
    *   `model TutorSession` com: `id`, `tutorIdentityId`, `refreshTokenHash` (unique), `expiresAt`, `lastUsedAt`, `createdAt`, `revokedAt`.
*   **Modificações de Entidades Existentes:**
    *   `Client`: Campo relacional opcional `tutorIdentityId String?` + `@@index([tutorIdentityId])`.
    *   `ClinicalAttachment`: Campo `visibleToTutor Boolean @default(false)`.
*   **Validação:** `npx prisma validate` → OK.
*   **Sync:** `npx prisma db push` → banco sincronizado.
*   **Build:** `npm run build` → compilação TypeScript bem-sucedida.

---

### Wave 2: Backend — Autenticação & Escopo do Tutor

*   **Módulo NestJS:** `tutor-auth` (isolado do módulo `auth` administrativo).
*   **Estratégia de Vínculo de Identidades:**
    *   Ao solicitar o Magic Link por e-mail, buscar `Client` com `email` ou `emailAlt` correspondente.
    *   Criar ou reaproveitar a `TutorIdentity` correspondente.
    *   Vincular `Client.tutorIdentityId` nos registros sem vínculo.
*   **Geração de Magic Link:**
    *   Endpoint `POST /tutor/auth/request-link` — gera token aleatório de 32 bytes, salva hash SHA-256 em `TutorPortalToken` (validade 24h) e dispara e-mail via SMTP.
*   **Validação de Tokens:**
    *   Endpoint `POST /tutor/auth/verify` — valida token, registra `usedAt`, cria `TutorSession` (com hash do Refresh Token) e retorna Access Token JWT (15 min).
*   **Renovação de Sessão:**
    *   Endpoint `POST /tutor/auth/refresh` — valida `refreshTokenHash` na `TutorSession`, atualiza `lastUsedAt` e retorna novos tokens.
*   **Isolamento de Segurança:**
    *   `TutorPortalAuthGuard`: Guard exclusivo para rotas `/tutor/*`.
    *   `@CurrentTutor()`: Decorator que injeta contexto do tutor autenticado:
        *   `tutorIdentityId`
        *   `publicId`
        *   `allowedClientIds[]`
        *   `allowedClinicIds[]`
        *   `allowedPetIds[]`

---

### Wave 3: Frontend — Login & Navegação Isolada (/tutor/*)

*   Configuração de grupo de rotas `/tutor/*` no React Router.
*   Tela de Login do Tutor: campo único de e-mail para solicitar Magic Link.
*   Tela de processamento do token da URL (`/tutor/auth/verify?token=...`): valida, persiste sessão, redireciona ao dashboard.
*   Layout mobile-first completamente independente da navegação administrativa.
*   Compartilhamento apenas de: design tokens CSS, Axios configurado e utils globais.
*   **Armazenamento de Tokens:** Access Token em memória/estado React; Refresh Token em `localStorage` com prefixo exclusivo `tutor_` — **nunca misturar com tokens administrativos**.

---

### Wave 4: Timeline da Vida do Pet & Documentos

*   Endpoint `GET /tutor/pets/:id/timeline` agregando eventos por data:
    *   Vacinas aplicadas e agendadas.
    *   Consultas passadas e futuras.
    *   Receitas emitidas.
    *   Exames com `visibleToTutor: true`.
    *   Termos de consentimento assinados e pendentes.
*   Componente visual de Timeline mobile-first no frontend.
*   Máscaras de privacidade LGPD: CPF exibido como `***.***.789-00`.

---

### Wave 5: Seed Demo, Testes & Walkthrough

*   Atualizar `backend/prisma/seed.ts` com instâncias de `TutorIdentity` vinculadas aos clientes demo existentes via `tutorIdentityId`.
*   Testes de integração no backend validando o ciclo completo de Magic Link e sessão.
*   Testes de escopo garantindo que tutor X nunca acessa pets do tutor Y.
*   Escrita do walkthrough de finalização da fase.

---

## 2. Verificação e Validação

### Testes Automatizados
- `npm run build` no backend e frontend.
- Testes unitários/integração do ciclo de autenticação.

### Verificação Manual
- Fluxo completo do Magic Link de ponta a ponta.
- Validação de mascaramento de dados sensíveis.
- Confirmação de isolamento de dados entre tutores distintos.
