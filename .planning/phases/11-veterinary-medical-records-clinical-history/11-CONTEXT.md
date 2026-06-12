# Fase 11: Prontuário Veterinário e Histórico Clínico - Contexto

**Data de Criação:** 2026-05-19
**Status:** Pronto para Planejamento (Ready for Planning)

<domain>
## Limites da Fase

Implementar um módulo completo e premium de prontuários veterinários e histórico clínico de pacientes (pets). O módulo deve apoiar a rotina de médicos veterinários e equipe de atendimento com:
- Perfil detalhado e interativo do pet (Pet Profile).
- Linha do tempo clínica interativa (Clinical Timeline) que centraliza consultas, vacinas, procedimentos e notas.
- Registro e rastreamento histórico de peso com gráficos (Weight Tracking).
- Controle de alergias estruturado (Allergies).
- Registro e controle de vacinas (Vaccines) com data de aplicação e próxima dose.
- Registro de procedimentos veterinários realizados (Procedures).
- Anotações clínicas e observações gerais (Clinical Notes).
- Integração e histórico de agendamentos e consultas (Appointment History Integration).
- Interface de usuário premium, responsiva, com suporte a temas Light/Dark e rica em detalhes visuais e interações fluidas.
</domain>

<decisions>
## Decisões de Implementação Propostas

### Experiência do Usuário (UI/UX Premium)
- **D-01:** O perfil do pet em `/pets/:id` ou `/clinical-records/:id` deve se tornar a central do paciente, utilizando um layout premium estilo Dashboard (Bento Grid ou Abas estruturadas) integrado com os temas Light/Dark.
- **D-02:** A Linha do Tempo Clínica (Clinical Timeline) deve ser visualmente excelente, usando micro-animações, ícones intuitivos por tipo de evento (Vacina, Procedimento, Nota, Consulta) e filtros rápidos por tipo de registro.
- **D-03:** Rastreamento de Peso (Weight Tracking) deve apresentar um gráfico interativo (usando Chart.js ou similar já utilizado no projeto) que mostra a curva de crescimento/peso do paciente.
- **D-04:** Suporte completo a tags dinâmicas para Alergias com cores intuitivas por nível de severidade (ex: Vermelho para severo, Amarelo para moderado, Azul para leve).

### Arquitetura de Banco de Dados (Prisma Schema)
- **D-05:** Criar os seguintes modelos com escopo de tenant (`clinicId`) e paciente (`petId`):
  - `WeightRecord`: Histórico de medições de peso (`id`, `weight`, `measuredAt`, `petId`, `clinicId`).
  - `Allergy`: Alergias documentadas (`id`, `name`, `severity` (LOW, MEDIUM, HIGH), `notes`, `petId`, `clinicId`).
  - `VaccineRecord`: Registro de imunizações (`id`, `name`, `appliedAt`, `nextDoseAt`, `lot`, `veterinarian`, `petId`, `clinicId`).
  - `ClinicalRecord`: Entradas gerais de prontuário, como procedimentos e anotações (`id`, `type` (NOTE, PROCEDURE, CONSULTATION), `title`, `description`, `performedAt`, `petId`, `clinicId`).
- **D-06:** Manter integridade referencial com cascata de exclusão (`onDelete: Cascade`) para que, ao excluir um Pet, seus registros de prontuário associados também sejam removidos com segurança.

### API & Controladores Backend
- **D-07:** Criar um módulo unificado `ClinicalRecordsModule` (ou estender o `PetsModule`) com rotas RESTful para cada entidade sob o prefixo `/pets/:petId/clinical-records` (ou similar).
- **D-08:** Garantir validação estrita com DTOs específicos (`class-validator`) e escopo de tenant em cada operação. O backend só deve processar dados se pertencerem ao mesmo `clinicId` do usuário logado.

### Integração
- **D-09:** Integrar o histórico de consultas obtendo os dados de `Appointment` relacionados ao Pet, unificando agendamentos passados na timeline clínica.
</decisions>

<canonical_refs>
## Referências Canônicas

- `.planning/ROADMAP.md` - Definição da Fase 11.
- `.planning/STATE.md` - Estado atual de desenvolvimento.
- `backend/prisma/schema.prisma` - Modelo existente de `Pet` e `Appointment`.
- `frontend/src/pages/Pets.tsx` - Visualização atual de Pets.
- `frontend/src/lib/api.ts` - Tipagens e chamadas de API do frontend.
</canonical_refs>

<code_context>
## Insights do Código Existente

### Frontend
- Atualmente, as listagens de Pets mostram apenas as informações básicas armazenadas na tabela `Pet`.
- A criação da nova aba/página de prontuário premium pode ser integrada à navegação de detalhes do Pet, criando componentes modulares e reutilizáveis na pasta `frontend/src/components/clinical-records/`.
- O design system em `index.css` já possui variáveis de cor OKLCH para os modos Light/Dark, as quais devem ser estritamente seguidas nos cards, crachás de alergias, botões e elementos da timeline.

### Backend
- O backend usa NestJS e Prisma. Cada módulo realiza validação de tenant (`clinicId`) no nível de serviço e do controlador.
- A modelagem de banco de dados precisará de uma migração do Prisma (`npx prisma migrate dev`).
</code_context>

<deferred>
## Ideias Postergadas (Fora de Escopo)
- Anexos de exames laboratoriais e imagens em PDF/DICOM (requer armazenamento em nuvem S3).
- Receituário digital com assinatura ICP-Brasil ou integração com Mevo/Memed.
- Módulo de internação (Hospitalização) em tempo real.
</deferred>

---
*Fase 11: Veterinary medical records and patient clinical history*
*Contexto gerado em: 2026-05-19*
