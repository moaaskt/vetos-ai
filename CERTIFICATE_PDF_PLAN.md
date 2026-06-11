# Plano de Geração de Certificados em PDF — VetOS AI

Este plano detalha a viabilidade técnica, arquitetura de endpoints e proposta de interface (UX) para a emissão de certificados de vacinação no **VetOS AI**.

---

## 1. Infraestrutura de PDF Existente

- **Atualidade**: **Nenhuma** infraestrutura ou biblioteca de geração de PDF está instalada no backend ou no frontend do projeto.
- **Dependências atuais**:
  - Backend: usa NestJS puramente com TypeScript e Prisma.
  - Frontend: usa React 19, Vite, Tailwind CSS e Axios.

---

## 2. Análise de Bibliotecas Candidatas

Para suprir esta lacuna técnica, duas bibliotecas são propostas com base no local de renderização:

### Geração no Backend (Recomendado)
1. **`pdfkit`**:
   - *Como funciona*: Geração programática desenhando layouts com canvas 2D.
   - *Prós*: Extremamente rápido, baixo consumo de memória, controle preciso de layout e sem dependências externas pesadas de sistema.
   - *Contras*: Curva de aprendizado para posicionamento de elementos em layouts complexos.
2. **`html-pdf` / `puppeteer`**:
   - *Como funciona*: Renderiza HTML/CSS comum e exporta como PDF usando um navegador headless.
   - *Prós*: Layouts fáceis de programar usando HTML e Tailwind CSS.
   - *Contras*: Puppeteer adiciona mais de 100MB à imagem Docker do backend e tem alto consumo de CPU e RAM no servidor.

### Geração no Frontend
1. **`jspdf` + `html2canvas`**:
   - *Como funciona*: Captura um elemento DOM do React, transforma em imagem e insere em um documento PDF.
   - *Prós*: Sem impacto na CPU do servidor.
   - *Contras*: A qualidade do PDF varia dependendo da resolução de tela do cliente (podendo ficar borrado) e impede o envio de PDFs automáticos por WhatsApp/E-mail em background pelo cron.

> [!IMPORTANT]
> **Recomendação**: Geração no **Backend usando `pdfkit`** (ou `pdf-lib`), pois garante uniformidade perfeita de rendering, segurança na extração de dados e permite automações de envio assíncrono em background.

---

## 3. Design de Endpoint no Backend

Propõe-se o endpoint `GET /vaccines/pet/:petId/certificate` no `VaccinesController`:

```typescript
  @Get('pet/:petId/certificate')
  @Header('Content-Type', 'application/pdf')
  async generateCertificate(
    @Param('petId') petId: string,
    @CurrentUser() user: any,
    @Query('includeScheduled') includeScheduled?: string,
    @Res() res: Response
  ) {
    const stream = await this.vaccinesService.buildPdfStream(user.clinicId, petId, {
      includeScheduled: includeScheduled === 'true'
    });
    
    res.setHeader('Content-Disposition', `inline; filename="certificado-vacinas.pdf"`);
    stream.pipe(res);
  }
```

- **Isolamento de Segurança**: Validação rígida se o `petId` pertence ao `clinicId` do usuário logado.
- **Caching**: Possibilidade de salvar em bucket S3 caso a clínica queira salvar registros históricos assinados de forma imutável.

---

## 4. Proposta de Interface e UX (Frontend)

1. **Botão de Ação**: Na página do prontuário (`PetDetails.tsx`), na aba de Vacinas, adicionar um botão flutuante ou botão principal de topo: `Exportar Certificado` (ícone `Printer` ou `Download`).
2. **Modal de Opções**:
   - Opção de filtro: "Apenas vacinas aplicadas" vs "Incluir doses futuras planejadas".
   - Botão **Visualizar**: Abre o PDF inline em uma nova aba do navegador (`target="_blank"`), permitindo ao veterinário conferir e imprimir usando o atalho padrão do browser.
   - Botão **Compartilhar**: Gera o PDF em segundo plano no backend e envia o link direto para o WhatsApp do tutor cadastrado.

```
+------------------------------------------------------+
|             Certificado de Imunização                |
+------------------------------------------------------+
| Filtro de Exportação:                                |
| (o) Apenas aplicadas    ( ) Incluir planejadas       |
|                                                      |
| [ Visualizar PDF ]           [ Enviar WhatsApp ]      |
+------------------------------------------------------+
```

---

## 5. Dados Disponíveis em `VaccineRecord` Hoje

Embora o modelo de dados atual seja minimalista, ele já contém as informações fundamentais para renderizar um certificado útil:

- **Dados da Clínica (Cabeçalho)**: `clinic.name`, `clinic.address`, `clinic.phone`.
- **Dados do Tutor**: `pet.client.name`, `pet.client.email`, `pet.client.phone`.
- **Dados do Paciente**: `pet.name`, `pet.species` (cão/gato), `pet.breed` (raça).
- **Lista de Vacinas (Corpo do PDF)**:
  - Nome da Vacina (`name`)
  - Data de Aplicação (`date`)
  - Próxima Dose (`nextDoseDate`)

> [!TIP]
> **Próximo Passo**: Na Fase 14B, ao adicionar `lotNumber` e `appliedBy` (CRMV/Veterinário aplicador) ao banco de dados, o PDF passará a incluir essas colunas automaticamente, alcançando 100% de conformidade regulatória.
