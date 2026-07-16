# Feature: Medical Records

Conjunto de informações médicas e de saúde registradas no prontuário do paciente (Pet).

## 1. Evolução Clínica (`ClinicalRecord`)
Anotações diárias do médico veterinário descrevendo o quadro clínico, exames físicos e procedimentos executados.
* Tipos de registro: `NOTE` (Anotações gerais) e `PROCEDURE` (Procedimentos cirúrgicos ou exames).

## 2. Histórico de Vacinação (`VaccineRecord`)
Registo de imunizações aplicadas ou agendadas.
* Integração com `VaccineProtocol` (esquemas de doses criados pelas clínicas com intervalos de aplicação).
* Status: `APPLIED` (Aplicada) ou `SCHEDULED` (Agendada).

## 3. Curva de Peso (`WeightRecord`)
Registros de peso associados a datas, permitindo o acompanhamento de tendências corporais do paciente.

## 4. Alergias (`Allergy`)
Registro crítico de alergias alimentares ou medicamentosas que devem ser imediatamente visualizadas ao abrir a ficha do paciente.

## 5. Documentos Digitais
* **Receitas (`Prescription`)**: Emissão de prescrição com metadados detalhados, hash digital SHA-256 e status (rascunho ou assinada).
* **Termos de Consentimento (`ConsentTerm`)**: Termo gerado a partir de templates oficiais da clínica, exigindo assinatura e IP de auditoria do tutor.
