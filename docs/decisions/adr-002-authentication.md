# ADR 002: Authentication & RBAC

## Contexto
O sistema precisa autenticar funcionários (veterinários, staff e administradores) e garantir o controle de acesso com diferentes níveis de permissão em cada clínica.

## Decisão
Implementar autenticação baseada em tokens **JWT (JSON Web Tokens)** e controle de acesso baseado em papéis **RBAC (Role-Based Access Control)**.

### Detalhes
1. **JWT Autenticação**:
   * O payload do token decodificado contém `sub` (ID do usuário), `email`, `role`, `clinicId`, e flags adicionais.
   * Utiliza Passport com estratégia JWT (`JwtStrategy` e `JwtAuthGuard`).
2. **RBAC (Roles)**:
   * Três papéis suportados: `ADMIN` (acesso total às configurações e faturamento do tenant), `STAFF` (acesso clínico diário, sem faturamento) e `SUPERADMIN` (acesso global de suporte a todas as clínicas).
   * Guardas baseadas no decorator `@Roles(...)` e `RolesGuard` verificando o papel no JWT da requisição.
3. **Mecanismo de Impersonate**:
   * Permite que um `SUPERADMIN` acesse temporariamente dados de uma clínica em modo de simulação, gerando um log de auditoria na tabela `ImpersonationLog` para fins de segurança e conformidade.
