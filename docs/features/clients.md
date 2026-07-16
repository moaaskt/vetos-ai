# Feature: Clients (Tutors) Management

Gerenciamento de fichas cadastrais de proprietários de pets (tutores de animais).

## Entidade Client
Mapeada no Prisma com os seguintes campos:
* `id` (UUID)
* `name` (Nome do tutor)
* `cpf` (Cadastro de pessoa física - único por clínica)
* `email` (E-mail de contato)
* `phone` (Telefone celular)
* `whatsapp` (Número com WhatsApp ativo)
* Endereço (logradouro, número, bairro, cidade, uf, cep)
* `tutorIdentityId` (Identidade global opcional no portal do tutor)
* `clinicId` (ID da clínica correspondente)

## Regras de Negócio
1. **Unicidade de CPF**: O mesmo CPF não pode ser cadastrado em duplicidade dentro de uma mesma clínica (`@@unique([clinicId, cpf])`).
2. **Propagação de Identidade Global**: Tutores cadastrados em clínicas diferentes podem se conectar à mesma `TutorIdentity` via e-mail e CPF unificados, permitindo a visualização unificada no Portal do Tutor.
