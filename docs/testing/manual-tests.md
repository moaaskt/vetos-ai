# Planos de Testes Manuais

Este documento reúne os roteiros de testes manuais para validação das principais regras de negócio da aplicação.

## Roteiro 1: Validação de Tenant & Edição de Pets

### Objetivo
Validar que a edição de pets funciona perfeitamente, persiste as alterações e respeita o isolamento de tenants (uma clínica Beta não pode ver nem editar os pets da clínica Alfa).

### Passos de Execução
1. **Login na Clínica Alfa**:
   * Logar com as credenciais da clínica Alfa no frontend.
   * Selecionar um pet cadastrado da clínica Alfa.
   * Clicar em "Editar", alterar o nome do pet, a idade ou raça, e salvar.
   * **Validação**: Verificar se a interface atualiza com o novo nome e se o banco reflete os dados corretos (via reload da página ou chamada do endpoint `/pets`).
2. **Isolamento de Tenant (Bloqueio da Clínica Beta)**:
   * Obter o UUID do pet da clínica Alfa.
   * Fazer logout e logar com as credenciais da clínica Beta.
   * Tentar forçar o acesso ao prontuário do pet da clínica Alfa digitando a URL diretamente no navegador: `/pets/<UUID-DA-CLINICA-ALFA>`.
   * **Validação**: A tela deve exibir "Paciente não localizado" (ou erro apropriado) e bloquear o carregamento de dados médicos da clínica Alfa.
3. **Bloqueio de Edição Cruzada (API)**:
   * Realizar uma chamada `PATCH /pets/<UUID-DA-CLINICA-ALFA>` com o token JWT de usuário da clínica Beta.
   * **Validação**: O servidor deve retornar `404 Not Found` ou `403 Forbidden`, impedindo a alteração dos dados.
