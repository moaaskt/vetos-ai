# Princípios de Produto — VetOS AI

Este documento estabelece os princípios de decisão que guiam o design, desenvolvimento e a evolução de novas funcionalidades no **VetOS AI**, definindo os critérios de priorização do nosso roadmap e delimitando os limites do escopo do produto.

---

## 1. Princípios de Decisão de Funcionalidades

Toda e qualquer nova funcionalidade introduzida no VetOS AI deve obrigatoriamente estar alinhada com os seguintes princípios:

1. **Reduzir o Trabalho Operacional (Eficiência)**
   - O software deve automatizar tarefas repetitivas. Se uma funcionalidade adiciona carga de trabalho manual sem um retorno claro de inteligência, ela deve ser redesenhada ou descartada.
2. **Aumentar a Receita ou Retenção da Clínica**
   - As funcionalidades devem ajudar as clínicas a reterem mais tutores (ex.: lembretes de vacinas, alertas de consultas) e aumentar o ticket médio ou a produtividade dos veterinários.
3. **Melhorar a Experiência do Tutor**
   - O tutor é um elemento central. O sistema deve facilitar a jornada de comunicação, assinatura de documentos e acompanhamento clínico do pet.
4. **Gerar Dados Úteis e Estruturados**
   - Funcionalidades devem estruturar informações de modo a permitir análises futuras de performance e alimentar modelos preditivos de inteligência artificial.
5. **Respeitar Estritamente o Multi-Tenant**
   - Isolamento de dados absoluto e total por clínica (`clinicId`). Nenhuma funcionalidade deve abrir margem para vazamento de dados inter-clínicas.
6. **Segurança por Padrão e LGPD-Ready**
   - Auditoria nativa de logs de acessos, criptografia de dados sensíveis e governança no compartilhamento de registros de saúde animal e dados pessoais de tutores.
7. **Preparação Nativa para Inteligência Artificial**
   - Interfaces e APIs devem ser modeladas para que dados de prontuário e histórico de atendimentos possam ser facilmente consumidos por copilotos de anamnese e geradores de conteúdo.

---

## 2. Critérios de Priorização do Roadmap

Utilizamos o framework adaptado de priorização baseado no impacto ao cliente vs. complexidade técnica:

| Critério | Peso / Foco | Descrição |
| :--- | :--- | :--- |
| **Valor de Retenção** | Altíssimo | Automações que reduzem ausências (no-shows) e trazem clientes de volta (vacinas). |
| **Legal e Segurança** | Altíssimo | Assinaturas de termos de consentimento e LGPD. Sem isso a clínica opera sob risco legal. |
| **Facilidade de Adoção** | Alto | Funcionalidades que não demandam treinamento massivo e começam a agregar valor no primeiro dia. |
| **SaaS Billing & Limits** | Alto | O motor que permite monetizar a plataforma baseando-se no uso de recursos. |

---

## 3. O que NÃO Entra no Produto (Fora de Escopo / Não Metas)

Para manter o foco estratégico e evitar o inchamento desnecessário do produto (feature creep), as seguintes categorias estão explicitamente fora de escopo:

*   **Sistemas de Folha de Pagamento Complexos (RH):** O VetOS AI gerencia comissões de veterinários e produtividade, mas não atuará como software de recursos humanos ou departamento pessoal.
*   **ERP Corporativo Não-Veterinário:** Gestão de grandes frotas, contas patrimoniais complexas ou contabilidade geral devem ser delegadas via integrações de API com softwares dedicados.
*   **Rede Social Geral de Pets:** O Portal do Tutor serve para propósitos transacionais, de saúde e agendamento. Recursos de compartilhamento social público ou rede de contatos de pets não serão desenvolvidos.
*   **Armazenamento Ilimitado de Arquivos de Vídeo Brutalmente Longos:** Imagens de exames, laudos e PDFs de até um limite estipulado são permitidos. Gravações contínuas de cirurgias ou câmeras de monitoramento local não serão hospedadas na nossa nuvem.
