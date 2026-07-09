---
target: frontend/src/pages/tutor/TutorDashboard.tsx
total_score: 17
p0_count: 1
p1_count: 2
timestamp: 2026-07-09T01-31-02Z
slug: frontend-src-pages-tutor-tutordashboard-tsx
---
Method: dual-agent (A: 5dc6d597-53ed-47d6-8c9a-7ae5b3d5fbd7 · B: e59a5e66-9837-49ee-80df-66fe81d411e4)

# Relatório de Avaliação de Design (Critique) - TutorDashboard.tsx

## Design Usability Health Score

A usabilidade e o design do [TutorDashboard.tsx](file:///home/moa-dev/projetos/vetos-ai/frontend/src/pages/tutor/TutorDashboard.tsx) foram avaliados com base nos princípios heurísticos de Nielsen.

| # | Heurística | Nota (0-4) | Principal Problema |
|---|---|---|---|
| 1 | Visibilidade do Status do Sistema | **2/4** | Estado de carregamento básico em texto plano ("Carregando..."). Ausência de skeletons de carregamento ou indicação clara de falhas. |
| 2 | Compatibilidade com o Mundo Real | **3/4** | Mapeamento lógico básico utilizando emojis por espécie, mas sem identificação formal mais humanizada ou clínica. |
| 3 | Controle e Liberdade do Usuário | **2/4** | Links básicos, mas sem facilidade de retorno rápido, retry para falhas de rede ou atualização forçada. |
| 4 | Consistência e Padrões | **3/4** | Coerente com templates genéricos do Tailwind CSS, mas ignora os padrões do sistema de design definidos em DESIGN.md. |
| 5 | Prevenção de Erros | **1/4** | Tratamento silencioso de erros na chamada de API. Falhas no fetch resultam em uma tela limpa informando erro no console. |
| 6 | Reconhecimento em vez de Recordação | **3/4** | As informações básicas do pet estão visíveis, mas o usuário precisa clicar no pet para saber status imediatos (ex: alertas de vacinas). |
| 7 | Flexibilidade e Eficiência | **1/4** | Nenhum atalho ou ação rápida disponível na listagem (como botão direto para agendamento). |
| 8 | Estética e Design Minimalista | **2/4** | visual genérico e cru. O bloco de boas-vindas é maior que a listagem interativa em si. |
| 9 | Ajuda no Diagnóstico e Recuperação de Erros | **0/4** | A falha na API esconde o erro, deixando o dashboard com "Olá, undefined" e sem pets, sem qualquer banner explicativo. |
| 10 | Ajuda e Documentação | **0/4** | Sem acesso a FAQ, suporte ou guias de auxílio de uso do portal. |
| **Total** | | **17/40** | **[Poor / Ruim]** |

---

## Anti-Patterns Verdict

* **LLM Assessment:** **High Slop**. O visual atual apresenta todos os "tells" clássicos de código gerado por IA sem acabamento:
  - Uso excessivo de bordas cruas e sombras pesadas (`bg-white shadow sm:rounded-lg`).
  - Utilização de paleta padrão cinza/índigo (`text-gray-900`, `bg-indigo-100`) em vez da identidade definida para a marca (Teal Clínico).
  - Uso de emojis (`🐶`, `🐱`, `🐾`) como única representação gráfica, enfraquecendo o tom corporativo médico/clínico premium.
* **Deterministic Scan:** O analisador automático retornou `[]`. Isso ocorreu devido ao escopo simples e ausência de problemas complexos de sintaxe no arquivo estático de marcação, o que destaca que o problema principal é de UX/UI semântico e visual, e não de sintaxe HTML.

---

## Overall Impression
O painel do tutor está funcional, mas parece um esboço ou protótipo básico de banco de dados. Para um produto B2C premium que visa gerar empatia com tutores de pets e inspirar confiança em serviços médicos, o visual está estéril, rígido e sem alma.

---

## What's Working
- **Facilidade de clique:** O elemento `Link` usa o padrão de cobrir toda a área do card com um link absoluto embutido (`absolute inset-0`), facilitando a interação e o foco do teclado.
- **Estrutura simples:** A visualização em grid de duas colunas para desktop e uma coluna para mobile é limpa e segue padrões modernos de grid responsivo.

---

## Priority Issues

### [P0] Falha Silenciosa de Conexão (Erros Ocultos)
- **Por que importa:** Se o carregamento da API falhar, o portal oculta a falha e mostra a mensagem de boas-vindas com "undefined", além do card indicando erroneamente "Nenhum pet encontrado". O tutor ficará frustrado ou achará que seus pets sumiram.
- **Como corrigir:** Criar um estado de erro explícito no React (`error` state), exibindo um banner ilustrado informando a falha com um botão "Tentar Novamente".
- **Comando recomendado:** `/impeccable harden`

### [P1] Paleta de Cores e Estilo Genérico (Identidade Inconsistente)
- **Por que importa:** O uso do tom azul/índigo do Tailwind original quebra as diretrizes do [DESIGN.md](file:///home/moa-dev/projetos/vetos-ai/DESIGN.md) que estabelece o `Clinical Teal` e o `Sanctuary BG`.
- **Como corrigir:** Alterar as cores de destaque de `indigo` para os tokens correspondentes a `--primary` (`Clinical Teal`).
- **Comando recomendado:** `/impeccable colorize`

### [P1] Estado Vazio Inadequado
- **Por que importa:** A frase "Nenhum pet encontrado" em texto cinza sob um fundo branco não incentiva o tutor. Como primeira experiência B2C, o app precisa guiar o usuário na adição do primeiro pet.
- **Como corrigir:** Exibir um estado vazio caloroso, contendo um ícone de pata/pet estilizado, uma frase encorajadora ("Que tal cadastrar seu primeiro pet para começar?") e um botão de ação primária destacado de cadastro.
- **Comando recomendado:** `/impeccable onboard`

### [P2] Falta de Skeletons de Carregamento (Feedback de Layout)
- **Por que importa:** O texto "Carregando..." plano gera layout shifts bruscos no momento em que as informações dos pets aparecem.
- **Como corrigir:** Implementar cards de skeleton que piscam suavemente no mesmo formato dos cards de pet, garantindo uma transição fluida.
- **Comando recomendado:** `/impeccable animate`

---

## Persona Red Flags

- **Jordan (Confused First-Timer):** Jordan entra no portal sem nenhum pet cadastrado e se depara com a mensagem estéril "Nenhum pet encontrado". Não há botões para adicionar pet, suporte ou informações sobre como vincular o pet cadastrado na clínica. Jordan se sente perdido e desiste.
- **Alex (Impatient Power User):** Alex possui 5 pets e quer agendar rapidamente uma consulta ou ver as vacinas de um deles. O card só oferece o clique para a ficha detalhada. Alex precisa fazer múltiplos cliques extras para cada pet para conseguir realizar ações simples cotidianas.

---

## Minor Observations
- O bloco de cabeçalho "Olá, profile.name" ocupa muito espaço vertical à toa. Pode ser integrado ou reduzido em favor da área de pets.
- O nome da clínica é truncado na listagem, o que pode ocultar informações cruciais caso a clínica tenha um nome longo.

---

## Questions to Consider
- O que impediria o tutor de gerenciar/agendar uma consulta diretamente da tela inicial do dashboard?
- Podemos humanizar a saudação do tutor (ex: usar um tom mais empático como "Que bom ver você e seus pets por aqui!")?
