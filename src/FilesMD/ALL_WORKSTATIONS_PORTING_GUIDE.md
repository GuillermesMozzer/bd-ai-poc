# All Workstations Porting Guide

Este arquivo documenta como portar as telas mostradas no print para outro projeto:

- `Workstations`
- `Connection Path`
- `Users`
- `Hierarchy Explorer` na lateral esquerda
- cards de resumo, tabelas e mapa de conexao

## 1. Arquivo principal da tela

O componente principal esta aqui:

- `src/workstation/components/WorkstationsLibraryScreen.tsx`

Esse componente concentra:

- tabs `Workstations`, `Connection Path`, `Users`
- `Selected Context`
- summary cards
- busca, filtros, bulk actions
- tabela de workstations
- tabela de users
- mapa de conexao
- explorer hierarquico lateral

## 2. Arquivos que compoem a feature

Se voce quiser levar a feature inteira com o minimo de retrabalho, estes sao os arquivos mais importantes:

### Nucleo visual

- `src/workstation/components/WorkstationsLibraryScreen.tsx`

### Dados e persistencia

- `src/workstation/publishedWorkstations.ts`
- `src/workstation/workstationAssignment.ts`
- `src/workstation/escalationPathState.ts`

### Catalogos e apoio

- `src/workstation/data/widgetRegistry.ts`
- `src/workstation/theme.ts`
- `src/workstation/types.ts`

### Ponto de entrada atual

- `src/App.tsx`
- `src/workstation/components/WorkstationSubMenu.tsx`

## 3. Melhor estrategia de portabilidade

Se o objetivo for reproduzir a tela fielmente em outro projeto, a melhor abordagem e:

1. Copiar `WorkstationsLibraryScreen.tsx`.
2. Copiar os arquivos de suporte de dados e tipos.
3. Adaptar imports de `@mui/material` e `@mui/icons-material`.
4. Conectar a rota no novo projeto.
5. Se necessario, substituir `localStorage` e mocks por API real.

Se voce tentar recriar tudo do zero so por prompt, a outra LLM provavelmente vai gerar algo parecido visualmente, mas nao igual ao comportamento atual.

## 4. Trechos de codigo-chave

### 4.1 Renderizacao da tela em `App.tsx`

Use esse trecho para plugar a tela no novo projeto:

```tsx
import WorkstationsLibraryScreen from './workstation/components/WorkstationsLibraryScreen';

// ...

{currentScreen === 'workstations' ? (
  <WorkstationsLibraryScreen
    onCreateNew={openBlankWorkstationDraft}
    onOpenWorkstation={openPublishedWorkstation}
    onOpenPredefined={openPredefinedWorkstation}
  />
) : null}
```

### 4.2 Item de menu `All Workstations`

```tsx
{
  id: 'all-workstations',
  label: 'All Workstations',
  parentKey: 'workstation',
  selected: currentScreen === 'workstations',
}
```

### 4.3 Funcao que abre a tela

```tsx
const openWorkstationsLibrary = () => {
  setIsWorkstationSubMenuOpen(false);
  setIsAppLibraryOpen(false);
  setIsMobileSideNavOpen(false);
  setCurrentScreen('workstations');
};
```

### 4.4 Assinatura do componente principal

```tsx
type WorkstationsLibraryScreenProps = {
  onCreateNew: () => void;
  onOpenWorkstation: (workstationId?: string) => void;
  onOpenPredefined: (title: string) => void;
};

export default function WorkstationsLibraryScreen({
  onCreateNew,
  onOpenPredefined,
  onOpenWorkstation,
}: WorkstationsLibraryScreenProps) {
  const [activeTab, setActiveTab] = useState<'workstations' | 'escalation' | 'users'>('workstations');
  const [search, setSearch] = useState('');
  const [savedWorkstations, setSavedWorkstations] = useState<PublishedWorkstation[]>(() => readPublishedWorkstations());
  const [selectedHierarchyNodeId, setSelectedHierarchyNodeId] = useState<string | null>(null);

  // restante da tela...
}
```

### 4.5 Tabs principais

```tsx
<Tabs
  value={activeTab}
  onChange={(_, value) => setActiveTab(value)}
  sx={{
    minHeight: 42,
    borderBottom: '1px solid #E2E8F0',
    '& .MuiTabs-flexContainer': {gap: 2},
    '& .MuiTabs-indicator': {height: 2.5, borderRadius: 999, bgcolor: '#1663FF'},
  }}
>
  <Tab value="workstations" label="Workstations" />
  <Tab value="escalation" label="Connection Path" />
  <Tab value="users" label="Users" />
</Tabs>
```

### 4.6 Cards de resumo

```tsx
function SummaryCard({
  color,
  icon,
  label,
  value,
}: {
  color: string;
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.6,
        border: '1px solid #E4EAF3',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FCFDFF 100%)',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.45}}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color,
            bgcolor: `${color}12`,
            border: `1px solid ${color}22`,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography sx={{fontSize: 13, color: '#243B7A', fontWeight: 700}}>{label}</Typography>
          <Typography sx={{fontSize: 24, color, fontWeight: 800, lineHeight: 1.1, mt: 0.35}}>{value}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
```

### 4.7 Toolbar da aba `Workstations`

```tsx
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: {xs: '1fr', lg: 'minmax(0, 1fr) auto auto auto'},
    gap: 1.3,
    alignItems: 'center',
  }}
>
  <Paper
    elevation={0}
    sx={{
      height: 44,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 2,
      borderRadius: 1.8,
      border: '1px solid #DDE6F1',
      bgcolor: '#FFFFFF',
    }}
  >
    <SearchIcon sx={{fontSize: 20, color: '#6A7EA5'}} />
    <InputBase
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      placeholder="Search workstations..."
      sx={{flex: 1, fontSize: 14, color: '#2B3E71'}}
    />
  </Paper>

  <Button variant="outlined" startIcon={<FilterIcon sx={{fontSize: 18}} />}>
    Filters
  </Button>

  <Button variant="outlined" startIcon={<CopyIcon sx={{fontSize: 18}} />}>
    Bulk Actions
  </Button>

  <Button variant="contained" startIcon={<AddIcon sx={{fontSize: 18}} />} onClick={onCreateNew}>
    Add Workstation
  </Button>
</Box>
```

### 4.8 Estrutura da tabela `Workstations`

```tsx
<Paper elevation={0} sx={{borderRadius: 2.4, border: '1px solid #E2E8F0', overflow: 'hidden'}}>
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '0.55fr 2fr 1fr 1fr 1.75fr 1.1fr 1.3fr 118px',
      px: 2.4,
      py: 1.55,
      bgcolor: '#FBFCFE',
      borderBottom: '1px solid #E7EDF6',
      alignItems: 'center',
    }}
  >
    {['Workstation', 'Type', 'Level', 'Assigned To', 'Status', 'Last Activity', 'Actions'].map((label) => (
      <Typography key={label} sx={{fontSize: 13, color: '#233D82', fontWeight: 800}}>
        {label}
      </Typography>
    ))}
  </Box>

  {filteredRows.map((row) => (
    <Box
      key={row.id}
      sx={{
        display: 'grid',
        gridTemplateColumns: '0.55fr 2fr 1fr 1fr 1.75fr 1.1fr 1.3fr 118px',
        px: 2.4,
        py: 1.75,
        alignItems: 'center',
        borderBottom: '1px solid #EDF2F8',
      }}
    >
      {/* conteudo da linha */}
    </Box>
  ))}
</Paper>
```

### 4.9 Hierarquia lateral

A arvore lateral depende desta estrutura:

```ts
export type AccessNode = {
  children?: AccessNode[];
  id: string;
  label: string;
};

export const accessSelectionTree: AccessNode[] = [
  {
    id: 'plant-columbus-west',
    label: 'Columbus West',
    children: [
      {
        id: 'plant-columbus-west-area-assembly',
        label: 'Area A',
        children: [
          {
            id: 'plant-columbus-west-area-assembly-unit-a',
            label: 'Unit A',
            children: [
              {
                id: 'plant-columbus-west-area-assembly-unit-a-line-10',
                label: 'Line 10',
              },
              {
                id: 'plant-columbus-west-area-assembly-unit-a-line-nexiva',
                label: 'Nexiva',
              },
            ],
          },
        ],
      },
    ],
  },
];
```

No projeto atual ela esta em:

- `src/workstation/workstationAssignment.ts`

### 4.10 Dados salvos de workstations

```ts
export type PublishedWorkstation = {
  assignment: WorkstationAssignment;
  id: string;
  title: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  domains: string[];
  history?: PublishedWorkstationHistoryEntry[];
  widgetCount: number;
  layoutStorageKey: string;
  snapshot: unknown;
  bookmarked: boolean;
  sharedWith: string[];
};
```

Esses dados hoje sao lidos de `localStorage` por:

- `readPublishedWorkstations()`
- `writePublishedWorkstations()`

Arquivo:

- `src/workstation/publishedWorkstations.ts`

## 5. O que a outra LLM precisa gerar no novo projeto

Se voce quiser pedir para outra LLM inserir isso em um projeto novo, o pedido ideal e:

```md
Crie uma tela administrativa chamada "All Workstations" em React + TypeScript + MUI.

A tela deve ter:

1. Sidebar esquerda fixa com um "Hierarchy Explorer" em formato arvore.
2. Area principal com 3 tabs:
   - Workstations
   - Connection Path
   - Users
3. Cabecalho com "Selected Context" e botao "View Context Details".
4. Cards de resumo:
   - Total Workstations
   - Active
   - With Alerts
   - Inactive
5. Na tab Workstations:
   - busca
   - botao Filters
   - botao Bulk Actions
   - botao Add Workstation
   - tabela com colunas Workstation, Type, Level, Assigned To, Status, Last Activity, Actions
6. Na tab Connection Path:
   - mapa visual de conexoes entre workstations
   - botoes Edit Paths, Auto Layout, Legend e controles de zoom
7. Na tab Users:
   - cards Total Users, Active, Pending Invite, Inactive
   - busca
   - botoes Filters, Bulk Actions, Add User
   - tabela de usuarios
8. Use tema claro, bordas suaves, cards brancos, azul principal `#1663FF`, tipografia compacta e layout corporativo.
9. Use dados mockados separados em arquivos:
   - hierarchy tree
   - workstation rows
   - users
   - connection map
10. Crie a implementacao em componentes separados:
   - AllWorkstationsPage.tsx
   - HierarchyExplorer.tsx
   - SummaryCard.tsx
   - WorkstationsTable.tsx
   - UsersTable.tsx
   - ConnectionPathCanvas.tsx
   - workstationData.ts
   - hierarchyData.ts

Entregue codigo pronto para colar, com imports completos.
```

## 6. Steps para replicar em outro projeto

### Opcao A: portar quase igual

1. Instale dependencias do projeto destino:
   - `@mui/material`
   - `@mui/icons-material`
   - `@emotion/react`
   - `@emotion/styled`

2. Copie os arquivos:
   - `src/workstation/components/WorkstationsLibraryScreen.tsx`
   - `src/workstation/publishedWorkstations.ts`
   - `src/workstation/workstationAssignment.ts`
   - `src/workstation/escalationPathState.ts`
   - `src/workstation/data/widgetRegistry.ts`
   - `src/workstation/theme.ts`
   - `src/workstation/types.ts`

3. No projeto novo, ajuste paths de import.

4. Crie uma rota ou page wrapper:

```tsx
export default function AllWorkstationsPage() {
  return (
    <WorkstationsLibraryScreen
      onCreateNew={() => {}}
      onOpenWorkstation={() => {}}
      onOpenPredefined={() => {}}
    />
  );
}
```

5. Se o novo projeto nao tiver a logica de abrir workstation, troque callbacks por `console.log` ou navegacao local.

6. Se nao quiser persistencia local, substitua `readPublishedWorkstations()` por mock estatico.

7. Se quiser API real, troque:
   - `readPublishedWorkstations`
   - `writePublishedWorkstations`
   por chamadas REST ou GraphQL.

### Opcao B: recriar a mesma UX com menos dependencias

1. Copie apenas o layout e os dados mockados.
2. Separe a tela em componentes menores.
3. Reimplemente a arvore lateral com base em `accessSelectionTree`.
4. Reimplemente a tabela de workstations e de users.
5. Reimplemente o mapa de `Connection Path` com dados simplificados.
6. Depois conecte com API real.

## 7. Dependencias implicitas da tela atual

Antes de portar, voce precisa saber que o arquivo principal nao e pequeno e mistura:

- UI
- estado
- dados mockados
- persistencia local
- logica do mapa de conexao
- selecao de hierarquia

Por isso, no projeto novo, eu recomendo dividir assim:

- `AllWorkstationsPage.tsx`
- `HierarchyExplorer.tsx`
- `WorkstationsTab.tsx`
- `ConnectionPathTab.tsx`
- `UsersTab.tsx`
- `workstation.types.ts`
- `workstation.mock.ts`

## 8. Sugestao de prompt para migracao assistida por LLM

Use este prompt quando for pedir a insercao em outro repositorio:

```md
Vou te passar uma feature existente chamada "All Workstations". Quero que voce a recrie no meu projeto atual usando React + TypeScript + Material UI.

Requisitos:
- manter layout corporativo claro
- sidebar esquerda com hierarchy explorer
- tabs Workstations, Connection Path e Users
- cards de resumo no topo
- tabela de workstations
- tabela de users
- canvas de connection path
- componentes desacoplados
- dados mockados em arquivos separados
- codigo pronto para producao e facil de substituir por API real

Importante:
- nao invente design novo
- siga exatamente a estrutura visual do anexo
- entregue arquivos completos
- entregue tambem o wiring de rota
- use TypeScript estrito
- use Material UI
```

## 9. Recomendacao final

Se voce quer fidelidade visual e funcional, a melhor instrucao para outra LLM nao e "crie uma tela parecida".

A melhor instrucao e:

- "copie a estrutura desta feature"
- "quebre em componentes menores"
- "preserve a hierarquia lateral, tabs, cards, tabela e mapa"
- "substitua apenas os dados e os callbacks"

Se quiser, no proximo passo eu posso criar tambem um segundo `.md` mais agressivo, com:

- lista completa dos arquivos a copiar
- ordem exata de importacao
- checklist de adaptacao
- prompt pronto para `Cursor`, `Copilot` ou outra LLM aplicar no projeto novo
