# Multi-Tenant Isolation Infrastructure

Este documento descreve a infraestrutura de segurança implementada na **Sprint 1.3** para isolamento de dados por clínica (tenant) baseado em contextos assíncronos e extensões de ORM.

---

## 1. Fluxo de Execução da Requisição

Para garantir que o isolamento seja transparente e seguro, o ciclo de vida de cada requisição HTTP passa pelas seguintes etapas:

```text
HTTP Request (com JWT)
  ↓
[TenantMiddleware] ─── Decodifica clinicId/isSuperAdmin do Token
  ↓
[TenantContextService] ─── Abre escopo AsyncLocalStorage.run()
  ↓
[AuthGuard / NestJS Controller] ─── Executa a lógica da rota (Controller/Service)
  ↓
[TenantPrismaService (Extension)] ─── Acessa clinicId do TenantContext
  ↓
Banco de Dados (PostgreSQL)
```

### Por que Middleware em vez de Guard?
Utilizamos um **Middleware** (`TenantMiddleware`) em vez de um Guard para a criação do escopo do `AsyncLocalStorage`.
* **Justificativa Técnica**: Os middlewares do NestJS são executados no início do ciclo da requisição, antes de qualquer Interceptador, Guard ou Pipe. Como o `AsyncLocalStorage.run()` requer uma função de callback para envolver toda a execução subsequente da thread, o middleware é o único ponto da arquitetura do Express/NestJS capaz de envelopar o ciclo de vida completo da requisição de forma limpa, garantindo que o context esteja disponível desde o momento em que a rota é resolvida até a execução da query final.

---

## 2. Componentes da Infraestrutura

A infraestrutura é modular e composta por quatro partes essenciais:

### 1. TenantContextService
Gerencia o `AsyncLocalStorage` nativo do Node.js. Oferece métodos seguros para obter ou definir o `clinicId` e a flag `isSuperAdmin` na thread de execução corrente.
* [tenant-context.service.ts](file:///home/moa-dev/projetos/vetos-ai/backend/src/tenant/tenant-context.service.ts)

### 2. TenantMiddleware
Responsável por ler o cabeçalho `Authorization` da requisição HTTP, extrair o token Bearer, decodificar os metadados do payload (sem verificação de assinatura, que é delegada ao `JwtAuthGuard`) e inicializar a execução do fluxo no contexto do tenant.
* [tenant.middleware.ts](file:///home/moa-dev/projetos/vetos-ai/backend/src/tenant/tenant.middleware.ts)

### 3. TenantPrismaExtension
Extensão nativa do Prisma Client (`$extends`) que intercepta queries. Nesta fase (Sprint 1.3), ela apenas extrai o `clinicId` do contexto para provar a integração e a disponibilidade dos dados em nível de ORM.
* [tenant-prisma.extension.ts](file:///home/moa-dev/projetos/vetos-ai/backend/src/prisma/tenant-prisma.extension.ts)

### 4. TenantPrismaService
Serviço preparado que instancia o `PrismaClient` já acoplado com a extensão do tenant. Ele está registrado globalmente no `PrismaModule` para injeção futura nos Services operacionais.
* [tenant-prisma.service.ts](file:///home/moa-dev/projetos/vetos-ai/backend/src/prisma/tenant-prisma.service.ts)

---

## 3. Validação de Isolamento (Testes)

Para provar a robustez e integridade da infraestrutura, os testes unitários em [tenant-isolation.spec.ts](file:///home/moa-dev/projetos/vetos-ai/backend/src/tenant/tenant-isolation.spec.ts) cobrem:
1. **Armazenamento e Recuperação**: Validação simples de escrita/leitura de dados.
2. **Isolamento de Concorrência (No Leakage)**: Dispara múltiplas requisições assíncronas concorrentes com tempos de atraso variados e comprova que a thread de um tenant **nunca** tem acesso aos dados de outro tenant, provando a integridade do `AsyncLocalStorage`.
3. **Acesso na Extension**: Comprova que a extensão do Prisma consegue extrair com sucesso o `clinicId` configurado na requisição HTTP.

---

## 4. Próximos Passos (Para a Sprint 1.4)

A migração ocorrerá na Sprint seguinte através das etapas:
1. Ativar a injeção do filtro automático `{ where: { clinicId } }` na `TenantPrismaExtension` para todas as queries de tabelas multi-tenant.
2. Substituir a injeção de dependência do `PrismaService` pelo `TenantPrismaService` nos Services clínicos operacionais.
3. Ajustar as queries de escritas para garantir que as mutações individuais também herdem a blindagem.
