# TODO List - VetOS AI

Lista de tarefas pendentes e evoluções técnicas do sistema, ordenadas por prioridade.

## Prioridade Alta (Sprint Atual & Segurança Crítica)
* [ ] **Edição de Pets (Sprint 002)**: Implementar PATCH e preenchimento de formulário no frontend para editar nome, espécie, raça, idade e tutor do pet.
* [ ] **Isolamento de Tenant no Escrita**: Refatorar as 22 queries vulneráveis (Validate-then-Operate) nos controllers e services (Clients, Prescription, ClinicalAttachment, ConsentTerm, Vaccine) para usar mutações em lote (`updateMany` / `deleteMany`) incluindo `{ clinicId }`.
* [ ] **Rate Limiter (Throttler)**: Implementar limite de requisições por IP nas rotas de login, cadastro, Magic Link e testes de disparo.

## Prioridade Média (Refatorações & Infraestrutura)
* [ ] **Refatoração do PetDetails.tsx**: Separar o componente React de 36KB em subcomponentes isolados (CRUD de pesos, vacinas, alergias, evolução).
* [ ] **NestJS Wrapper para Redis**: Substituir instanciação direta de `ioredis` em `scheduler.service.ts` por injeção de dependência via RedisModule.
* [ ] **Criptografia Persistente no Dev**: Salvar a `ENCRYPTION_KEY` de forma persistente em ambiente de desenvolvimento local para evitar perda de credenciais a cada boot.
* [ ] **Validação de Uploads**: Configurar guards de upload limitando o tamanho dos anexos e validando o tipo MIME do arquivo (PDF, imagens).

## Prioridade Baixa (Futuras Fases & Gaps de Cobertura)
* [ ] **Testes e2e**: Criar cobertura ponta a ponta com Playwright/Cypress simulando fluxos de agendamento e disparos externos.
* [ ] **Testes de UI**: Cobertura de testes unitários em React para componentes críticos de prontuário e agenda.
* [ ] **Sanitização de Templates**: Prevenir injeção de XSS na interpolação de e-mails em HTML.
