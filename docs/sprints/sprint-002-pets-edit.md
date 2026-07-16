# Sprint 002 - Pets Complete Edit

## Objetivos
Implementar a edição completa dos pets (pacientes) no backend e no frontend, garantindo integridade de tenant, reutilização de formulário e validação antes da implementação do upload de fotos.

## Requisitos

### Backend
1. Garantir que o endpoint `PATCH /pets/:id` respeite o isolamento multi-tenant (verificando se o pet pertence à clínica autenticada antes de atualizar).
2. Atualizar todos os campos editáveis do Pet (`name`, `species`, `breed`, `age`, `clientId`).
3. Retornar o registro atualizado.

### Frontend
1. Adicionar o botão "Editar" na tela de detalhes do pet (`PetDetails.tsx`).
2. Reutilizar o modal de cadastro `PetModal` para a edição.
3. Carregar e preencher os dados atuais do pet no formulário.
4. Salvar as alterações usando `api.patch`.
5. Atualizar os dados exibidos na tela após o sucesso e notificar o usuário com alertas.

## Critérios de Aceitação
- Usuários autorizados (da clínica proprietária) conseguem editar todas as informações do Pet.
- Usuários de outras clínicas (Beta) não conseguem ver, acessar ou editar o Pet de outra clínica (Alfa).
- Acessos diretos por URL bloqueiam visualizações não autorizadas.
