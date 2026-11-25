# AquaTrack

Aplicativo mobile para gerenciamento e monitoramento de aquários (água doce, salgada e salobra): parâmetros da água, fauna e flora, manutenções e evolução histórica.

> Status: **Fase 2 (aquários e persistência)** concluída. Cadastro, edição, exclusão e detalhes de aquários com foto; fauna e flora com catálogo inicial e cadastro manual; tudo salvo localmente em SQLite.

## Funcionalidades implementadas

- Navegação com 5 abas (Início, Aquários, Monitorar, Manutenção, Perfil).
- Aquários: criar, editar, excluir (com confirmação), listar e ver detalhes. Campos: nome, tipo de água, volume, dimensões, data de montagem, temperatura desejada, descrição e foto opcional.
- Fauna e flora: adicionar organismos a partir de um catálogo filtrado pelo tipo de água, buscar por nome popular ou científico, cadastrar manualmente espécies fora do catálogo, editar quantidade/data/observações e remover.
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
| lucide-react-native + react-native-svg | 1.x / 15.x | Ícones |

Todas as bibliotecas nativas acima fazem parte do Expo Go, então não é preciso development build.

Planejado para as próximas fases: biblioteca de gráficos e Expo Notifications.

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
```

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
├── components/
│   ├── ui/                     # AppText, Button, Card, Chip, Badge, EmptyState, Screen, estados de carga/erro
│   └── forms/                  # Field, FormTextField, SegmentedControl, DateField
├── features/
│   ├── aquariums/              # components, hooks, schemas, services, types
│   └── species/                # components, hooks, schemas, services, types
├── database/
│   ├── database.ts             # abertura, PRAGMAs e execução das migrations
│   ├── migrations/             # migrations versionadas por PRAGMA user_version
│   ├── repositories/           # todo o SQL do app
│   └── seeds/                  # catálogo inicial de espécies
├── hooks/useFocusQuery.ts      # consulta que recarrega quando a tela ganha foco
├── theme/                      # design tokens
└── utils/                      # formatação, validação, ids
```

Fluxo de dados: **tela → hook da feature → service → repository → SQLite**. Telas não contêm SQL; services concentram regras (ex.: copiar/remover a foto, transação ao criar espécie manual).

## Modelo de dados (schema v1)

| Tabela | Destaques |
|---|---|
| `aquariums` | `type` com CHECK (`freshwater`, `saltwater`, `brackish`); `volume > 0`; dimensões e temperatura opcionais (NULL = não informado) |
| `species` | catálogo + espécies do usuário (`is_custom`); `water_type` permite filtrar o catálogo pelo tipo do aquário |
| `aquarium_species` | `aquarium_id` com `ON DELETE CASCADE`; `species_id` com `ON DELETE RESTRICT`; `quantity > 0` |

- `PRAGMA foreign_keys = ON` em toda abertura (o SQLite vem com ele desligado).
- Cada migration roda em transação e atualiza `PRAGMA user_version`. Para evoluir o schema, crie `002_...ts` e registre em `migrations/index.ts`.
- Ids são UUID (preparação para sincronização futura).
- Datas de calendário são `YYYY-MM-DD` no fuso local; carimbos de tempo (`created_at`) são ISO 8601 UTC.
- Parâmetros e manutenções entram na migration 2 (Fase 3).

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
- **Tema somente claro** (`userInterfaceStyle: light`) e **fontes do sistema**.

## Roadmap

1. Fundação: navegação, design system, telas iniciais ✅
2. Aquários e persistência (SQLite, CRUD, fauna e flora) ✅
3. Monitoramento e manutenção (medições, gráficos, recorrência, notificações)
4. Dashboard integrado e finalização

## Funcionalidades futuras

Sensores IoT, sincronização em nuvem/Supabase, autenticação, compartilhamento de aquários, compatibilidade entre espécies, recomendações, catálogo ampliado, controle de equipamentos.
