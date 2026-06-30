# Ecossistema de Integrações — VetOS AI

Este documento cataloga, detalha e monitora o status de todas as integrações de terceiros e serviços auxiliares internos/externos que compõem o ecossistema do **VetOS AI**.

---

## 1. Mapeamento Geral do Ecossistema

O VetOS AI funciona como um orquestrador central de dados clínicos e de relacionamento. Para isso, conecta-se com diferentes APIs e serviços de infraestrutura divididos de acordo com o status atual:

```
[VetOS AI Core]
  ├── (Fila & Mensagens) ── BullMQ / Redis / SMTP / Evolution API (WhatsApp)
  ├── (Dados & Storage)  ── PostgreSQL / Prisma / S3 ou Cloudflare R2
  ├── (Financeiro)       ── Stripe / Asaas
  └── (Inteligência)     ── OpenAI / Anthropic
```

---

## 2. Status das Integrações

### 2.1 Implementado
*   **Prisma / PostgreSQL:** Banco relacional primário com multi-tenant nativo por coluna (`clinicId`).
*   **Redis / BullMQ:** Gerenciador de filas e background jobs assíncronos usado para processar notificações e agendamentos.
*   **SMTP (Nodemailer):** Disparo de e-mails transacionais e de marketing com carregamento dinâmico de credenciais criptografadas por clínica.

### 2.2 Parcial
*   **WhatsApp / Evolution API:** Conexão para disparo de mensagens automatizadas (mensagens de texto e arquivos). O backend já possui os providers e logs estruturados, restando o dashboard de monitoramento de instâncias e status de conexão no frontend.
*   **Serviço de Criptografia Interno:** Utiliza chave efêmera em memória para campos sensíveis (como credenciais de SMTP e tokens das clínicas). Precisa de migração para variável de ambiente estática em produção para evitar perda de chaves em reinicializações do servidor.

### 2.3 Planejado
*   **Stripe / Asaas:** Integração para o gateway de pagamentos. Stripe para faturamento de assinaturas de cartão e Asaas para emissão nativa de PIX e Boletos no mercado brasileiro.
*   **Storage (AWS S3 ou Cloudflare R2):** Utilizado para upload e armazenamento permanente de exames clínicos, laudos e fotos de perfil dos pets. Atualmente mockado localmente.
*   **ViaCEP:** API pública brasileira para auto-preenchimento e validação de endereços de tutores no cadastro de clientes.

### 2.4 Futuro
*   **OpenAI / Anthropic APIs:** Integração de LLM para os módulos de IA Copilot, preenchimento inteligente de anamnese e tradução automática de queixas de tutores em termos clínicos.
*   **Google Calendar API:** Sincronização bidirecional de agendas de veterinários com suas agendas pessoais.
*   **Serviços de NFS-e (Nota Fiscal de Serviço Eletrônica):** Emissão automatizada de notas fiscais municipais de serviço após o pagamento da consulta ou plano.
*   **Integração com Laboratórios e Fornecedores:** Recepção automatizada de resultados de exames diretamente no prontuário do pet via webservice dos laboratórios parceiros.

---

## 3. Riscos, Dependências e Impactos

| Integração | Tipo de Dependência | Risco Associado | Mitigação Proposta |
| :--- | :--- | :--- | :--- |
| **Evolution API** | Crítica (WhatsApp) | Bloqueio de números por spam ou instabilidade na API de terceiros. | Fila com limites estritos de envio (`anti-spam` em `NotificationLog`) e rota de fallback para SMTP. |
| **Stripe / Asaas** | Crítica (Monetização) | Falhas de webhook que impedem liberação de planos ou geram cobranças duplicadas. | Filas exclusivas de processamento de webhook com idempotência garantida por ID de transação. |
| **S3 / R2** | Média (Arquivos) | Custos elevados por tráfego de download/upload e vazamento de dados. | URLs assinadas temporárias (`Presigned URLs`) com tempo de expiração curto (máx. 15 minutos). |
| **LLMs (OpenAI/Anthropic)** | Baixa (IA Copilot) | Latência alta e custos imprevisíveis de chamadas de tokens. | Cache de respostas comuns e chamadas em background assíncrono onde aplicável. |
