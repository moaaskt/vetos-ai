# Análise de Concorrentes — VetOS AI

Este documento detalha o posicionamento competitivo do **VetOS AI** perante os principais players de software veterinário e sistemas legados de gestão no mercado brasileiro.

---

## 1. Visão Geral do Mercado

O mercado de softwares de gestão veterinária no Brasil é majoritariamente composto por três tipos de soluções:
1.  **Sistemas Legados/Tradicionais:** Softwares desktop instalados localmente, lentos e com baixa capacidade de automação moderna ou conectividade móvel.
2.  **Sistemas SaaS Consolidados (Primeira Onda):** Excelentes em gestão financeira básica e cadastros simples, porém carentes de inteligência artificial, automação real de engajamento e com experiência mobile defasada.
3.  **VetOS AI (SaaS Moderno + AI):** Focado em máxima eficiência operacional por automação inteligente, prontuário premium com assinaturas digitais nativas e IA como copiloto do veterinário.

---

## 2. Matriz Competitiva

A tabela abaixo compara o VetOS AI com os concorrentes mais consolidados no mercado brasileiro:

| Funcionalidade / Aspecto | VetOS AI | SimplesVet | GuruVet | Vetwork | VetDigital |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Multi-Tenant Nativo** | Sim | Sim | Sim | Sim | Sim |
| **Prontuário Premium (Timeline)**| Sim | Parcial | Sim | Parcial | Não |
| **Agenda Interativa Premium** | Sim | Sim | Parcial | Sim | Parcial |
| **Automação de WhatsApp Nativa** | Sim | Pago Extra | Parcial | Não | Parcial |
| **Assinatura Digital do Tutor** | Sim | Não | Não | Não | Não |
| **Portal do Tutor Autônomo** | Planejado | Não | Não | Não | Não |
| **IA Copilot / Anamnese** | Planejado | Não | Não | Não | Não |
| **Módulo Petshop / PDV** | Planejado | Sim | Não | Sim | Não |
| **SaaS Billing & Limits** | Planejado | Sim | Sim | Sim | Sim |
| **Analytics e Insights** | Sim | Parcial | Não | Parcial | Não |

---

## 3. Diferenciais Defensáveis do VetOS AI

Para competir e se destacar no mercado, o VetOS AI constrói seus diferenciais sobre três pilares principais:

### 3.1 Assinaturas Digitais e Aceites Legais Sem Custos de Terceiros
*   Diferente de sistemas que exigem integração com DocuSign/Clicksign gerando cobranças por envelope, o VetOS AI oferece uma tela de visualização pública (`PublicDocumentView`) onde o tutor assina e o sistema registra metadados de auditoria (IP, User Agent, CPF, data/hora) nativamente na base PostgreSQL isolada por tenant, garantindo validade jurídica e custo zero de transação.

### 3.2 O "Copiloto" Clínico por IA
*   A inclusão da inteligência artificial diretamente no editor de prontuário, reduzindo em até 60% o tempo gasto pelo veterinário na redação de exames físicos, anamnese e sugestões de diagnósticos diferenciais. O médico dita ou digita tópicos curtos e a IA expande e formata o prontuário.

### 3.3 Automações Ativas e Lembretes Vacinais Não-Spam
*   O motor de agendamento acoplado ao BullMQ calcula janelas de vacinação e contata tutores de maneira inteligente via WhatsApp e e-mail. O anti-spam embutido previne fadiga de mensagens, disparando lembretes personalizados com alta conversão em retorno à clínica.
