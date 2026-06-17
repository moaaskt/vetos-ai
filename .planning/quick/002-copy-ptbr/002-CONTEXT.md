# Quick Task 002: Tradução e Copywriting PT-BR para VetOS AI - Contexto

**Data:** 2026-05-16
**Status:** Pronto para planejamento

<domain>
## Escopo e Limite da Tarefa

Refinar a linguagem da plataforma VetOS AI e UX copywriting. Traduzir toda a experiência do administrador da clínica (tenant) e do super admin para o Português do Brasil (PT-BR), utilizando vocabulário profissional de software de gestão veterinária. A lógica de negócios, rotas, chamadas de API e autenticação devem permanecer estritamente inalteradas.
</domain>

<decisions>
## Decisões de Implementação

### Tom e Linguagem
- Tom profissional, limpo, operacional e acolhedor. Vocabulário comum em clínicas e hospitais veterinários do Brasil.
- Substituição de jargões genéricos em inglês por termos assertivos em português.

### Glossário Padrão
- Dashboard → Painel
- Client Directory → Clientes
- Patients & Pets → Pacientes
- Appointments → Consultas
- Workspace Summary → Resumo Operacional
- Recent Clinic Activity → Atividade Recente
- Super Admin / Platform Overview → Administração Geral / Plataforma
- Register Patient / Client → Cadastrar Paciente / Cliente
- Reason / Consultation → Motivo / Atendimento

### Status e Lógica de Mapeamento
- Status da API (`SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`): Manter as strings exatas no envio/recebimento com o backend, mas formatar visualmente no frontend como `Agendado`, `Confirmado`, `Concluído` e `Cancelado`.
- Impersonation: Usar "Acessar como Clínica" e, no banner superior, "Sessão de Suporte Ativa".
</decisions>
