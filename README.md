# AquaTrack

Aplicativo mobile para gerenciamento e monitoramento de aquários (água doce, salgada e salobra): parâmetros da água, fauna e flora, manutenções e evolução histórica.

> Status: **Fase 1 (fundação)** concluída. Navegação com 5 abas, design system e telas iniciais. Ainda sem persistência nem regras de negócio.

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Expo SDK | 58 | Ambiente e runtime (compatível com o Expo Go 58) |
| React Native | 0.88 | UI mobile |
| TypeScript | 6.0 (strict) | Tipagem |
| Expo Router | 58 | Navegação baseada em arquivos |
| lucide-react-native + react-native-svg | 1.x / 15.x | Ícones |

Planejado para as próximas fases (instalado só quando necessário): Expo SQLite, React Hook Form, Zod, biblioteca de gráficos, Expo Notifications.

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

## Estrutura

```
src/
├── app/                 # Rotas (Expo Router). Só composição de telas.
│   ├── _layout.tsx      # Stack raiz
│   └── (tabs)/          # 5 abas: index, aquariums, monitoring, maintenance, profile
├── components/ui/       # Componentes reutilizáveis (AppText, Card, Button, Screen, EmptyState)
└── theme/               # Design tokens: cores, tipografia, espaçamento, raios, elevação, tamanhos
```

As pastas `features/`, `database/`, `hooks/`, `utils/` e `types/` serão criadas nas fases em que tiverem conteúdo, para não manter diretórios vazios.

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
- **Tema somente claro** (`userInterfaceStyle: light`), conforme a identidade visual definida.
- **Fontes do sistema** (San Francisco / Roboto): evitam dependência extra e carregamento de fontes na Fase 1.

## Roadmap

1. Fundação: navegação, design system, telas iniciais ✅
2. Aquários e persistência (SQLite, CRUD, fauna e flora)
3. Monitoramento e manutenção (medições, gráficos, recorrência, notificações)
4. Dashboard integrado e finalização
