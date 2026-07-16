# Feature: Notifications & Messaging Hub

Sistema de automação e disparos manuais de mensagens para tutores.

## Provedores Suportados
1. **SMTP (E-mail)**: Envio direto de e-mails para os endereços cadastrados dos tutores.
2. **Evolution API (WhatsApp)**: Integração por API externa para disparo de mensagens de texto e arquivos diretamente para o WhatsApp do tutor.

## Funcionalidades do Hub
* **NotificationConfig**: Armazena chaves de acesso criptografadas com chave AES-256 local.
* **NotificationTemplate**: Permite a criação de modelos de mensagens interpoláveis contendo variáveis de contexto (ex: `{pet_name}`, `{date}`).
* **NotificationLog**: Registro de auditoria indicando o status de cada envio (`PENDING`, `SENT`, `FAILED`) e contendo a opção de re-disparo (retry) de erros.
* **Queue BullMQ**: Processamento assíncrono baseado em Redis para enfileiramento resiliente e controle de concorrência.
