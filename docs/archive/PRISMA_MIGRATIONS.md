# Prisma Migrations Architecture Audit

Este documento descreve o histórico, estado atual, problemas identificados e correções aplicadas na estrutura de migrations do banco de dados do VetOS AI.

## 1. Histórico das Migrations

O banco de dados do VetOS AI foi originalmente inicializado com a migration `20260626194014_init` em 26 de Junho de 2026. A tabela interna do Prisma (`_prisma_migrations`) registrou o seguinte evento original:
- **ID da Migration**: `f3df2023-9a89-452c-9d10-d09505bcdd29`
- **Nome da Migration**: `20260626194014_init`
- **Checksum no Banco**: `226a6b0f775bf2a1281f6de13a0dea7ecfb2e445dfe32ac6e168678033e12a45`
- **Passos Aplicados**: 1

No entanto, em algum momento do ciclo de desenvolvimento, o diretório físico `backend/prisma/migrations` foi removido do controle de versão ou deletado do projeto, deixando a base de dados sem histórico local de migrations.

---

## 2. Estado Atual e Diagnóstico (Drift Audit)

Durante a auditoria realizada na **Sprint 1.1**, foram levantados os seguintes fatos:
- **Quantidade de migrations locais**: 0 (no início da sprint).
- **Tabelas existentes no PostgreSQL**: 25 tabelas (incluindo `_prisma_migrations`, `Clinic`, `User`, `Pet`, etc.).
- **Tabelas sem migration**: Todas as tabelas estavam órfãs de arquivos locais de migration, embora o banco de dados contivesse a estrutura correta.
- **Drift Identificado**:
  1. A pasta `prisma/migrations` estava vazia.
  2. O banco de dados continha o registro da migration `20260626194014_init` na tabela `_prisma_migrations`.
  3. Qualquer nova tentativa de deploy em ambientes limpos (ex: CI/CD, novas instâncias de homologação/produção) falharia ao executar `prisma migrate deploy` por não possuir o arquivo SQL físico correspondente, impedindo a criação das tabelas.
  4. Comandos de desenvolvimento (`prisma migrate dev`) exigiriam o reset destrutivo do banco de dados local para criar a primeira migration do zero.

### Grau de Criticidade: **Alto**
A ausência da migration inicial bloqueia deploys automatizados em novos ambientes e gera o risco de perda acidental de dados em produção caso um desenvolvedor tente forçar um sincronismo destrutivo.

---

## 3. Correções Realizadas

Para sanar o drift sem alterar a estrutura do banco e sem risco de perda de dados:
1. **Recriação do Script SQL da Migration de Origem**:
   - Foi utilizado o utilitário `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` para extrair o script SQL exato que cria a estrutura atual do banco de dados a partir do zero.
2. **Restauração da Pasta Física de Migration**:
   - Criamos o diretório `/backend/prisma/migrations/20260626194014_init/`.
   - Gravamos o SQL extraído no arquivo `migration.sql` correspondente.
3. **Validação do Alinhamento**:
   - Executamos `npx prisma migrate status` e `npx prisma migrate deploy` no ambiente atual. Ambos confirmaram que a estrutura do banco de dados local está 100% atualizada e alinhada com a migration recriada, eliminando o drift.

---

## 4. Validação Técnica do Ambiente

As seguintes validações foram executadas com sucesso no diretório `backend`:
- **Validação de Schema (`npx prisma validate`)**:
  ```text
  The schema at prisma/schema.prisma is valid 🚀
  ```
- **Geração de Client (`npx prisma generate`)**:
  ```text
  ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 441ms
  ```
- **Status do Migration (`npx prisma migrate status`)**:
  ```text
  1 migration found in prisma/migrations
  Database schema is up to date!
  ```

---

## 5. Recomendações e Pendências para Produção

> [!IMPORTANT]
> **Políticas de Deploy Seguro**
> - **NUNCA** utilize o comando `prisma db push` em ambientes de homologação ou produção. Sempre prefira migrations rastreáveis.
> - **CI/CD**: Em ambientes novos ou pipelines automatizados, execute apenas `npx prisma migrate deploy`. Isso garante a criação determinística das tabelas sem o risco de resetar o banco.
> - **Desenvolvimento Local**: Sempre que alterar o `schema.prisma`, execute `npx prisma migrate dev --name <nome_da_alteracao>` para gerar o novo arquivo SQL de forma incremental na pasta de migrations.
