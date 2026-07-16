# Feature: Appointments Management

Gerenciamento de agenda e consultas clínicas dos pacientes.

## Entidade Appointment
* `id` (UUID)
* `date` (Data e hora do agendamento)
* `reason` (Motivo da consulta)
* `status` (Status: `SCHEDULED`, `COMPLETED`, `CANCELLED`)
* `petId` (Paciente animal)
* `clientId` (Tutor responsável)
* `clinicId` (Clínica / Tenant)

## Regras de Negócio
1. **Estados da Consulta**:
   * `SCHEDULED`: Consulta agendada.
   * `COMPLETED`: Atendimento finalizado. Libera a criação de receitas associadas.
   * `CANCELLED`: Consulta cancelada. Desativa lembretes automáticos associados.
2. **Lembretes Automáticos**: Consultas agendadas disparam notificações automáticas configuradas de antecedência aos tutores via e-mail ou WhatsApp.
