# Sprint 001 - Multi-Tenancy Isolation

## Objetivos
* Implementar isolamento lógico de inquilinos (tenants) no nível do ORM Prisma.
* Assegurar que dados de clínicas diferentes permaneçam estritamente isolados sem a necessidade de cláusulas `where` manuais em cada ponto do sistema.

## Entregas
1. **Contexto Assíncrono**: Criação do `TenantContextService` baseado em `AsyncLocalStorage` do Node.js.
2. **Interceptação HTTP**: `TenantMiddleware` extrai o `clinicId` do cabeçalho JWT e inicializa o escopo na thread de execução lógica.
3. **Prisma Client Extension**: Implementação de `TenantPrismaExtension` interceptando operações de leitura e escrita e aplicando `{ where: { clinicId } }` automaticamente.
4. **Modos de Feature Flag**: Variável `TENANT_EXTENSION_MODE` suportando `OFF`, `LOG`, `FILTER_READ`, `FILTER_WRITE` e `FULL`.
5. **Auditoria de Queries**: Varredura das queries Prisma e catalogação das operações ("Validate-then-Operate") que precisam ser migradas para escrita/exclusão direta por lote.
