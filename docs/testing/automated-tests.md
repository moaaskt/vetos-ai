# Cobertura de Testes Automatizados

Este documento detalha o setup, execução e lacunas dos testes automatizados da plataforma.

## 1. Testes do Backend

O backend utiliza o framework **Jest** para execução de testes unitários e de integração.

### Comandos de Execução
* **Executar todos os testes**:
  ```bash
  npm run test
  ```
* **Executar um arquivo específico (ex: Pets Service)**:
  ```bash
  npm run test -- pets.service.spec
  ```
* **Modo Watch**:
  ```bash
  npm run test:watch
  ```

### Estrutura de Testes
* Os arquivos de especificação (`*.spec.ts`) encontram-se no mesmo diretório dos arquivos de implementação (`*.service.ts` ou `*.controller.ts`).
* Utiliza-se `jest.fn()` para mocar dependências de banco de dados do `PrismaService` sem persistir fisicamente dados locais.

## 2. Gaps de Testes

* **Frontend (React)**: Atualmente não há testes automatizados (unitários ou e2e) cobrindo componentes React ou hooks customizados.
* **Testes e2e (Backend + Frontend)**: Não há testes de fluxo ponta a ponta integrados.
