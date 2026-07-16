# ADR 001: Tenant Isolation Infrastructure

## Contexto
O VetOS AI opera como um software SaaS onde múltiplas clínicas veterinárias independentes compartilham o mesmo banco de dados (Single Database, Shared Schema). É de extrema criticidade garantir que dados de um inquilino (tenant) nunca vazem para outro, com tolerância zero a falhas.

## Decisão
Implementar isolamento lógico nativo na camada de persistência utilizando **Prisma Client Extensions** e contexto assíncrono via **AsyncLocalStorage** do Node.js.

### Justificativa
1. **Redução de Erro Humano**: O desenvolvedor não precisa adicionar filtros `{ clinicId }` manualmente em cada consulta do controller ou service; o próprio ORM injeta a cláusula automaticamente.
2. **Contexto de Thread Lógica**: O `AsyncLocalStorage` permite propagar o `clinicId` decodificado do JWT no início da requisição HTTP (via `TenantMiddleware`) por todo o ciclo de vida sem necessidade de passá-lo manualmente como argumento de método.
3. **Modo de Operação e Logs**: A extensão suporta modos dinâmicos controlados por Feature Flags (como `LOG` para homologação e `FULL` para produção) com geração de logs transparentes de auditoria.
