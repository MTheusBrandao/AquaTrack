# AquaTrack

Aplicativo mobile para gerenciamento e monitoramento de aquários (água doce, salgada e salobra): parâmetros da água, fauna e flora, manutenções e evolução histórica.

> Status: **MVP concluído (Fases 1 a 4).** Dashboard integrado, aquários, fauna e flora, medições com histórico e gráfico, manutenções recorrentes com lembretes e dados de exemplo removíveis, tudo salvo localmente em SQLite.

## Funcionalidades implementadas

- Navegação com 5 abas (Início, Aquários, Monitorar, Manutenção, Perfil).
- Dashboard com dados reais: totais (aquários, parâmetros em atenção, tarefas atrasadas), atalhos (novo aquário, registrar medição, nova tarefa, adicionar organismo), parâmetros fora da faixa, manutenções atrasadas e próximas (concluíveis ali mesmo), últimas medições e resumo de cada aquário.
- Calculadoras (Perfil → Calculadoras): litros de uma troca parcial, porcentagem de troca para baixar um parâmetro até um alvo, conversões (°dH ↔ ppm, dKH → meq/L, °C → °F, salinidade ↔ densidade), dosagem genérica por concentração e volume pelas medidas, usando o volume de um aquário cadastrado.
- Backup: exportar todos os dados para um arquivo JSON (folha de compartilhamento do iOS/Android) e restaurar a partir dele, com validação e confirmação. A restauração é atômica: um arquivo inválido não altera nada. Fotos não entram no backup.
- Dados de exemplo: dois aquários marcados como “Exemplo”, com um mês de medições, organismos e manutenções. Carregados pelo Perfil (ou pelo dashboard vazio) e removíveis sem afetar os dados do usuário.
- Aquários: criar, editar, excluir (com confirmação), listar e ver detalhes. Campos: nome, tipo de água, volume, dimensões, data de montagem, temperatura desejada, descrição e foto opcional.
- Fauna e flora: adicionar organismos a partir de um catálogo filtrado pelo tipo de água, buscar por nome popular ou científico, cadastrar manualmente espécies fora do catálogo, editar quantidade/data/observações e remover.
- Monitoramento: registrar medições (temperatura, pH, amônia, nitrito, nitrato, GH, KH e, para marinho, salinidade, cálcio, magnésio e fosfato) com data e hora; última leitura de cada parâmetro com status e tendência; histórico com filtro por período (7, 30, 90 dias ou tudo), gráfico com a faixa de referência e exclusão de medições.
- Manutenção: criar, editar, concluir e excluir tarefas (troca de água, filtros, testes, poda, limpeza, nutrientes, alimentação); recorrência diária, semanal, quinzenal ou mensal; status pendente/atrasada/concluída; histórico de conclusões; lembretes por notificação local.
- Estados de carregamento, vazio e erro; validação de formulários em português.

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Expo SDK | 58 | Ambiente e runtime (compatível com o Expo Go 58) |
| React Native | 0.88 | UI mobile |
| TypeScript | 6.0 (strict) | Tipagem |
| Expo Router | 58 | Navegação baseada em arquivos |
| expo-sqlite | 58 | Persistência local |
| React Hook Form + Zod + @hookform/resolvers | 7.x / 4.x / 7.x | Formulários e validação |
| expo-image-picker + expo-file-system + expo-image | 58 | Foto do aquário |
| @react-native-community/datetimepicker | 9.x | Seleção de datas |
| expo-crypto | 58 | Geração de UUIDs |
| expo-notifications | 58 | Lembretes locais de manutenção |
| expo-sharing + expo-document-picker | 58 | Exportar e importar backup |
| lucide-react-native + react-native-svg | 1.x / 15.x | Ícones |

Todas as bibliotecas nativas acima fazem parte do Expo Go, então não é preciso development build.

O gráfico de evolução é desenhado com `react-native-svg` (sem biblioteca de gráficos): assim ele mostra a faixa de referência sombreada e destaca pontos fora dela, com o visual do design system e sem dependência extra.

## Como apresentar

1. Abra o app pelo Expo Go (instruções abaixo).
2. No dashboard vazio, toque em **Explorar com dados de exemplo** (ou Perfil → Carregar dados de exemplo).
3. Roteiro sugerido: dashboard (nitrato em atenção e troca de água atrasada) → toque no nitrato para ver o gráfico com a faixa de referência → conclua a troca de água e veja-a reagendada → abra um aquário para ver fauna e flora → crie um aquário real com foto.
4. Ao terminar, Perfil → **Remover dados de exemplo**.

## Como executar

Pré-requisitos: Node.js 20+ e o app **Expo Go** (SDK 58) no celular.

```bash
npm install
npx expo start
```

No iPhone, abra a câmera e leia o QR code exibido no terminal (no Android, leia pelo próprio Expo Go). O computador e o celular precisam estar na mesma rede Wi-Fi. Se a rede bloquear a conexão, use `npx expo start --tunnel`.

Verificações:

```bash
npx tsc --noEmit     # TypeScript
npx expo-doctor      # compatibilidade de dependências
npm test             # testes (Node 22.6+)
```

Os testes rodam as migrations, repositories e services reais contra o SQLite embutido do Node (`node:sqlite`), sem emulador. Módulos nativos do Expo (notificações, arquivos, crypto) são substituídos por stubs em `tests/stubs`. Cobertura: migrations (incluindo atualização de banco existente), CRUD e cascatas, backup e restauração, calculadoras, recorrência por calendário, status das faixas, validação, agendamento/cancelamento de lembretes, dados de exemplo e dashboard.

## Arquitetura

```
src/
├── app/                        # Rotas (Expo Router). Só composição de telas.
│   ├── _layout.tsx             # SQLiteProvider + Stack raiz
│   ├── (tabs)/                 # 5 abas
│   └── aquarium/
│       ├── create.tsx
│       ├── [id].tsx            # detalhes do aquário
│       ├── edit/[id].tsx
│       ├── add-species/[id].tsx  # id = aquário
│       └── species/[id].tsx      # id = organismo (registro de aquarium_species)
│   ├── monitoring/
│   │   ├── add-measurement/[id].tsx  # id = aquário
│   │   └── history/[id].tsx          # id = aquário (?parameter=ph)
│   └── maintenance/
│       ├── create/[id].tsx           # id = aquário pré-selecionado
│       ├── details/[id].tsx          # id = tarefa
│       └── edit/[id].tsx             # id = tarefa
├── components/
│   ├── ui/                     # AppText, Button, Card, Chip, Badge, StatusPill, EmptyState, Screen, estados de carga/erro
│   ├── forms/                  # Field, FormTextField, SegmentedControl, DateField, DateTimeField
│   └── charts/                 # LineChart (SVG)
├── features/
│   ├── aquariums/              # components, hooks, schemas, services, types
│   ├── species/
│   ├── monitoring/             # + utils/parameterStatus
│   ├── maintenance/            # + utils/recurrence, services/reminderScheduler
│   ├── dashboard/              # agregação dos módulos para a tela inicial
│   ├── backup/                 # exportação/restauração em JSON
│   ├── calculators/            # funções puras de cálculo + cartões da tela /tools
│   └── demo/                   # carga e remoção dos dados de exemplo
├── database/
│   ├── database.ts             # abertura, PRAGMAs e execução das migrations
│   ├── migrations/             # migrations versionadas por PRAGMA user_version
│   ├── repositories/           # todo o SQL do app
│   └── seeds/                  # catálogo de espécies, parâmetros e faixas de referência
├── hooks/useFocusQuery.ts      # consulta que recarrega quando a tela ganha foco
├── theme/                      # design tokens
└── utils/                      # formatação, validação, ids
tests/                          # testes em Node (npm test) + stubs dos módulos nativos
```

Fluxo de dados: **tela → hook da feature → service → repository → SQLite**. Telas não contêm SQL; services concentram regras (ex.: copiar/remover a foto, transação ao criar espécie manual).

## Modelo de dados (schema v4)

| Tabela | Destaques |
|---|---|
| `aquariums` | `type` com CHECK (`freshwater`, `saltwater`, `brackish`); `volume > 0`; dimensões e temperatura opcionais (NULL = não informado); `is_demo` marca os dados de exemplo |
| `species` | catálogo + espécies do usuário (`is_custom`); `water_type` permite filtrar o catálogo pelo tipo do aquário |
| `aquarium_species` | `aquarium_id` com `ON DELETE CASCADE`; `species_id` com `ON DELETE RESTRICT`; `quantity > 0` |
| `parameter_types` | 11 parâmetros (7 gerais + salinidade, cálcio, magnésio e fosfato da migration 4), unidade e casas decimais |
| `parameter_references` | faixa geral por parâmetro **e tipo de água**; a existência da linha define se o parâmetro se aplica (ex.: GH não aparece em marinho); min/max nulos = sem faixa geral |
| `parameter_records` | uma linha por parâmetro medido; ausência de linha = não medido (zero é gravado como 0) |
| `maintenance_tasks` | definição da tarefa, `starts_at` (âncora da recorrência) e `scheduled_at` (próxima execução) |
| `maintenance_logs` | cada conclusão, com título copiado; sobrevive à exclusão da tarefa (`ON DELETE SET NULL`) |

- `PRAGMA foreign_keys = ON` em toda abertura (o SQLite vem com ele desligado).
- Cada migration roda em transação e atualiza `PRAGMA user_version`. Para evoluir o schema, crie `002_...ts` e registre em `migrations/index.ts`.
- Ids são UUID (preparação para sincronização futura).
- Datas de calendário são `YYYY-MM-DD` no fuso local; carimbos de tempo (`created_at`) são ISO 8601 UTC.
- Excluir um aquário remove em cascata organismos, medições, tarefas e histórico, e cancela os lembretes agendados.

## Design system

Todos os valores visuais ficam em `src/theme`. Nenhuma tela deve usar cor, espaçamento ou tamanho de fonte literal.

| Token | Cor |
|---|---|
| background | #F2F7F6 |
| surface (cards) | #FFFFFF |
| primary | #238D85 |
| secondary (mint) | #B7DED6 |
| textPrimary | #203D43 |
| textSecondary | #71858A |
| border | #E1EBE8 |
| success / warning / critical | #2E9D70 / #E5A23B / #D9534F |

## Decisões técnicas

- **Rotas em `src/app`** em vez de `app/` na raiz: é o padrão atual do template do Expo e mantém todo o código-fonte em `src/`.
- **Abas JavaScript (`expo-router/js-tabs`)** em vez de abas nativas: permitem ícones Lucide e estilo próprio igual em iOS e Android.
- **Sem Context para dados**: cada tela consulta o banco ao ganhar foco (`useFocusQuery`). Com SQLite local isso é rápido e evita estado global duplicado.
- **Foto salva por caminho relativo**: a imagem escolhida é copiada para o diretório de documentos do app e o banco guarda só o caminho relativo, porque no iOS o caminho absoluto muda entre instalações.
- **Excluir aquário remove seus organismos** (cascata), mas não as espécies cadastradas manualmente, que continuam disponíveis no catálogo.
- **Manutenção em duas tabelas** (tarefa + histórico) em vez de uma linha com `status`/`completed_at`: com uma tabela só, concluir uma tarefa recorrente apagaria a conclusão anterior.
- **Status "atrasada" é calculado na leitura**, nunca gravado; um valor gravado ficaria desatualizado sozinho.
- **Recorrência por calendário local**: dias somados com `setDate` (não milissegundos) e meses a partir da âncora, então 31/01 → 28/02 → 31/03 sem deriva. Concluir com atraso pula as ocorrências perdidas.
- **Faixas de referência são gerais** por tipo de água e o app avisa isso na tela; a sinalização é "fora da faixa" (atenção), sem recomendações automáticas a partir de uma única medição. Faixas por espécie ficam para o futuro.
- **Lembretes**: uma notificação local por tarefa, para a próxima execução, reagendada a cada conclusão/edição. A permissão é pedida só ao salvar a primeira tarefa com lembrete. Notificações locais funcionam no Expo Go; falhas de notificação nunca impedem salvar a tarefa.
- **Dados de exemplo pendem de aquários marcados** (`is_demo`): remover é só apagar esses aquários, e a cascata leva o resto. Nada fictício fica misturado com dados reais, e os lembretes de exemplo vêm desligados.
- **Backup em JSON, substituindo tudo**: mesclar dois conjuntos de dados geraria conflitos difíceis de explicar ao usuário. O arquivo traz `schemaVersion`; colunas ausentes (backup de versão anterior) recebem o padrão do schema atual e versões mais novas são recusadas. Nomes de tabela/coluna vêm de uma lista fixa no código, nunca do arquivo. Fotos e ids de notificação são específicos do aparelho e não são restaurados.
- **Calculadoras genéricas, sem dosagem por produto**: a dosagem usa só a concentração informada pelo usuário (C₁·V₁ = C₂·V₂). Receitas por marca comercial dariam orientação errada assim que o produto mudasse.
- **Tema somente claro** (`userInterfaceStyle: light`) e **fontes do sistema**.

## Roadmap

1. Fundação: navegação, design system, telas iniciais ✅
2. Aquários e persistência (SQLite, CRUD, fauna e flora) ✅
3. Monitoramento e manutenção (medições, gráficos, recorrência, notificações) ✅
4. Dashboard integrado e finalização ✅

## Limitações conhecidas

- Faixas de referência são gerais por tipo de água; não consideram as espécies do aquário.
- O backup é manual e não inclui as fotos dos aquários.
- No Expo Go o app roda dentro do container do Expo Go; para publicar, seria preciso um build próprio (EAS Build).

## Funcionalidades futuras

Faixas por espécie, alcalinidade em outras unidades (meq/L), sensores IoT, sincronização em nuvem/Supabase, autenticação, compartilhamento de aquários, compatibilidade entre espécies, recomendações, catálogo ampliado, controle de equipamentos.
