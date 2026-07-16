# Backlog de Desenvolvimento & Dívidas Técnicas

Este documento reúne itens pendentes de desenvolvimento, melhorias técnicas e correções de segurança mapeadas.

## 1. Débitos Técnicos (Tech Debt)

* [ ] **NestJS Wrapper para Redis**: Substituir inst instanciação manual de `ioredis` em `scheduler.service.ts` por injeção de dependência nativa do NestJS (RedisModule).
* [ ] **Criptografia Persistente no Dev**: Evitar a chave randômica efêmera no `EncryptionService` quando `ENCRYPTION_KEY` estiver ausente, facilitando testes locais de provedores salvos.
* [ ] **Refatoração do PetDetails.tsx**: Dividir o arquivo gigante (36KB) contendo os formulários inline de alergias, vacinas, pesos e evolução em subcomponentes atômicos.
* [ ] **Filtros Automáticos de Tenant no Escrita**: Refatorar as 22 queries vulneráveis a "Validate-then-Operate" para que utilizem atualizações/exclusões em lote (`updateMany` / `deleteMany`) contendo `{ clinicId }`.

## 2. Segurança & Infraestrutura

* [ ] **Rate Limiting (Throttler)**: Proteger rotas públicas de login, registro, assinatura de termos e testes de mensageria contra flood e abuso de requisições.
* [ ] **Validação de Uploads**: Implementar checagem rígida de tamanho e tipo MIME de arquivos para uploads de exames e laudos no prontuário.
* [ ] **Sanitização de Placeholders**: Garantir que a interpolação em `TemplateService` proteja contra ataques de Cross-Site Scripting (XSS) em HTML de e-mails.

## 3. Testes Automatizados

* [ ] Testes e2e (Playwright ou Cypress) para fluxo de mensageria e agendamentos.
* [ ] Cobertura de testes unitários para componentes e hooks customizados no frontend (React).
