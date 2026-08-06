# Architecture Diagnostic and Refactoring Roadmap

## Scope

This document reviews the current React prototype and outlines a path to make it maintainable for a mixed team of engineers and Business Analysts. The target stack is Material UI for interface consistency and Recharts for data visualization.

Current observations are based on the source tree under `src`, current package metadata, and targeted scans of routing, theme, chart, state, and build patterns.

## 1. Architecture Diagnostic Document

### Critical

| Item | Evidence | Risk | Recommendation |
| --- | --- | --- | --- |
| Provider state is split across nested `WorkstationProvider` instances | `src/App.tsx` wraps `AuthProvider` in one `WorkstationProvider`, then authenticated app content in another `WorkstationProvider` | Auth and app UI can read/write different context instances. This is a blocker for predictable multi-user behavior and makes debugging screen navigation or login side effects difficult. | Create a single `AppProviders` component with one instance of each provider. Make auth independent from workstation state, or inject app navigation through a small app shell context. |
| Screen routing is centralized in a large switch and prop bag | `src/navigation/AppRoutes.tsx`, `src/AppContent.tsx`, `src/navigation/navigationConfig.tsx` | Adding a screen requires editing multiple TypeScript files and passing unrelated props through the shell. BAs cannot safely add screens from a simple configuration. | Move to route/screen registry metadata: screen key, label, module loader, required providers, nav placement, and optional BA-facing config. |
| Very large feature files create merge conflicts and fragile edits | Largest files include `src/globalView/components/GlobalViewScreen.tsx` at about 202 KB, `src/workstation/components/WorkstationDashboard.tsx` at about 196 KB, `src/documentManagement/DocumentManagementScreen.tsx` at about 190 KB, and `src/workstation/components/ShiftEntryPanel.tsx` at about 161 KB | Multiple contributors editing the same file will collide. BAs will need to understand too much implementation detail to make small content or layout updates. | Split screens into `components`, `data`, `hooks`, `types`, and `screen.config.ts`. Start with the highest-change screens. |
| Visualization stack is inconsistent | Recharts exists in workstation widgets, but many screens still import `@mui/x-charts`; some control tower and workstation charts are hand-drawn SVG/HTML | The app cannot enforce one chart look and feel. BAs must learn multiple chart APIs, margins, colors, and responsive behavior. | Standardize on Recharts wrappers and migrate `@mui/x-charts` plus hand-built chart snippets behind common components. |
| Styling tokens are fragmented | `src/theme.ts`, `src/workstation/theme.ts`, hardcoded hex/RGBA values across many TSX files, component-level font imports in document screens | UI consistency depends on manual discipline. BAs will copy local styles and increase drift. | Make `src/theme.ts` the only MUI theme entry point. Move workstation-specific semantics into theme extensions or design-token modules consumed by wrappers. |
| Current quality gates are not dependable | `npm run lint` starts `tsc --noEmit` but did not complete within the attempted timeout. `npm run build` failed in sandbox with `spawn EPERM`, then timed out when rerun with approval. Existing `tsc_*` and `build_error.txt` logs are present but not fully current. | A team cannot trust a fast pass/fail signal before merging. | Add a reliable CI command set: `typecheck`, `build`, `test`, and `lint:styles`. Keep logs out of source control or archive them under diagnostics only. |
| TypeScript safety is too loose for scalable collaboration | `tsconfig.json` has `allowJs: true`, no `strict`, and the codebase contains many `any` props and state values | Data contracts are invisible. BAs and LLM agents can pass malformed objects without early feedback. | Introduce strictness incrementally per domain with shared types, runtime validation for BA JSON, and `noImplicitAny` once high-churn modules are typed. |
| Prototype persistence is scattered in `localStorage` | Workstation layout, tier meeting state, action tracker, notifications, and published workstations all directly use browser storage | User-specific, multi-user, and environment behavior will diverge. It is hard to replace mock persistence later. | Add a `storageGateway` abstraction with namespaced keys, versioning, migration helpers, and eventual API adapters. |

### Important

| Item | Evidence | Risk | Recommendation |
| --- | --- | --- | --- |
| Mock data is mixed with UI and large shared fixtures | `src/data/mockData.ts` is about 47 KB; feature screens also embed large arrays | BAs must modify TSX to update screen content. Engineers cannot distinguish sample data from UI logic. | Move BA-editable content into `*.config.ts` or JSON-like modules with typed schemas. Keep UI components data-driven. |
| `activeTheme` is passed as a prop instead of using MUI theme consistently | `AppContent`, `AppRoutes`, and many feature components receive or import `activeTheme` | The app has two styling APIs: MUI theme and custom object. That makes defaults, dark mode, and brand changes harder. | Expose required semantic tokens through MUI theme extensions and use `useTheme()` in components. |
| Navigation labels and app catalog are not fully declarative | `applicationMenuItems` lives in `navigationConfig.tsx`, but screen rendering lives elsewhere | BAs need to understand both menu and routing code. | Create `screenRegistry.tsx` and derive navigation, routes, app library cards, and search metadata from it. |
| Shared shell components exist but are not consistently used | Examples include `StandardDrawer`, `WidgetShell`, `AssistantBanner`, workstation card styles | Each feature reinvents drawers, cards, headers, and empty states. | Promote these into `src/common/ui` with documented props and examples. |
| Chart wrappers are started but domain-specific | `WorkstationSeriesLineWidget`, `WorkstationSeriesBarWidget`, `WorkstationAutoChartArea` | Useful patterns are trapped in workstation naming and token structure. | Generalize to `src/common/charts` and let workstation wrappers compose the common wrappers with domain presets. |
| `@mui/x-charts` remains in dependencies and screens | Multiple imports across maintenance, document management, shopfloor, tier meeting, workstation | The requirement says Recharts. Keeping both expands bundle size and API surface. | Migrate remaining chart instances to Recharts wrappers, then remove `@mui/x-charts` if no longer needed. |
| Global CSS imports Tailwind despite MUI requirement | `src/index.css` imports Tailwind; Vite includes `@tailwindcss/vite` | BAs may use classes or utility styling outside the MUI system. | Decide whether Tailwind is legacy. If MUI is the standard, remove Tailwind after confirming no production classes depend on it. |
| Vite config has unusual build settings | `vite.config.ts` sets `esbuild: false` | May slow builds or change expected Vite behavior. | Verify why this exists. Remove only after build and browser smoke tests pass. |
| Error handling exists in two places | `src/index.jsx` has a root error boundary, `src/App.tsx` also uses `AppErrorBoundary` | Useful, but duplicated presentation can drift. | Consolidate into one app-level error boundary plus route-level boundaries for lazy screens. |

### Nice-to-Have

| Item | Evidence | Value | Recommendation |
| --- | --- | --- | --- |
| Add path aliases inside `src` | Current alias points `@/*` to repo root | Cleaner imports and easier moves | Change alias to `@/*: ./src/*` or add `@app`, `@common`, `@features` aliases. |
| Add Storybook or a lightweight component gallery | Many UI patterns are reusable but undocumented | BAs can preview components before adding screens | Start with chart wrappers, cards, drawers, screen templates, and form patterns. |
| Add design token linting | Many hardcoded colors remain | Prevent visual drift | Add a custom ESLint/style rule or script that flags raw hex/RGBA in TSX outside token files. |
| Add accessibility defaults | MUI helps, but custom SVG charts and clickable boxes need audit | Better keyboard and screen-reader behavior | Use MUI controls for actions, add chart summaries, and test tab order for dashboard screens. |
| Add bundle analysis | Large screens and duplicate chart libraries can inflate bundles | Better load-time decisions | Use dynamic imports per screen and run bundle visualizer after route split cleanup. |

## 2. UI and Data Vis Consistency Strategy

### MUI Theme Strategy

Centralize all brand and product styling in `src/theme.ts`.

The theme should own:

| Area | What to centralize | BA benefit |
| --- | --- | --- |
| Palette | Primary, secondary, success, warning, error, neutral, background, divider, chart colors | BAs choose semantic names instead of hex values. |
| Typography | Font family, headings, labels, captions, table density, numeric metric styles | New screens inherit consistent hierarchy without custom CSS. |
| Shape and spacing | Border radius, card padding, toolbar height, drawer width, dense layout spacing | Components align without copy-pasted `sx`. |
| Component defaults | `MuiButton`, `MuiCard`, `MuiPaper`, `MuiChip`, `MuiTabs`, `MuiTableCell`, `MuiTextField`, `MuiDrawer`, `MuiTooltip` | Common controls look correct by default. |
| Semantic extensions | `theme.appTokens.status`, `theme.appTokens.chart`, `theme.appTokens.surface`, `theme.appTokens.workstation` | Domain semantics stay available while still flowing through MUI. |

Recommended pattern:

```ts
// src/theme.ts
export const theme = createTheme({
  palette: {
    primary: { main: '#044ED7' },
    secondary: { main: '#00C2EC' },
    background: { default: '#EBEDF0', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 700 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
});
```

Then add a theme augmentation file for app-specific tokens:

```ts
declare module '@mui/material/styles' {
  interface Theme {
    appTokens: {
      chart: {
        grid: string;
        axis: string;
        palette: string[];
        target: string;
      };
      status: {
        good: string;
        bad: string;
        neutral: string;
      };
    };
  }

  interface ThemeOptions {
    appTokens?: Theme['appTokens'];
  }
}
```

Rules for BAs and contributors:

1. New screens use MUI components first.
2. New styling uses `sx` with theme tokens, not raw color literals.
3. Reusable layout decisions go into component defaults or shared components.
4. Feature-specific visual tokens must be named semantically, not by color.

### Recharts Integration Strategy

Create standardized chart wrappers in `src/common/charts`.

Proposed files:

```txt
src/common/charts/
  chartTypes.ts
  ChartFrame.tsx
  ChartTooltip.tsx
  StandardLineChart.tsx
  StandardBarChart.tsx
  StandardPieChart.tsx
  StandardComposedChart.tsx
  chartAdapters.ts
  index.ts
```

The wrappers should use MUI `useTheme()` so chart colors are automatically synchronized with buttons, chips, cards, and backgrounds.

Example wrapper shape:

```tsx
import { useTheme } from '@mui/material/styles';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function StandardLineChart({ data, xKey, series, height = 240 }) {
  const theme = useTheme();
  const colors = theme.appTokens.chart.palette;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke={theme.appTokens.chart.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip />
        {series.map((item, index) => (
          <Line
            key={item.key}
            dataKey={item.key}
            name={item.label}
            stroke={item.color ?? colors[index % colors.length]}
            strokeWidth={2.5}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

Wrapper responsibilities:

| Concern | Wrapper owns it |
| --- | --- |
| Responsive sizing | Always use `ResponsiveContainer` or a shared measured frame. |
| Margins | Default margins live in the wrapper, not feature screens. |
| Axis styles | Theme-driven text color, font size, grid, tick visibility. |
| Tooltip | Shared MUI-looking tooltip content. |
| Empty states | Standard message when data is empty or malformed. |
| Loading states | Optional skeleton or spinner in `ChartFrame`. |
| Accessibility | Title, description, and text summary props. |
| Color selection | Series colors come from MUI theme unless explicitly semantic. |

### BA-Friendly Chart Components

BAs should pass a small JSON-like config, not chart internals.

Example:

```ts
export const outputTrendChart = {
  type: 'line',
  title: 'Output Trend',
  xKey: 'hour',
  data: [
    { hour: '06:00', actual: 81, target: 85 },
    { hour: '07:00', actual: 88, target: 85 },
  ],
  series: [
    { key: 'actual', label: 'Actual', semanticColor: 'primary' },
    { key: 'target', label: 'Target', semanticColor: 'target', dashed: true },
  ],
};
```

Usage:

```tsx
<StandardChart config={outputTrendChart} />
```

`StandardChart` decides whether to render line, bar, pie, or composed charts based on `config.type`. It validates the config, normalizes colors, applies standard margins, and wraps everything in the same MUI card/header/empty-state shell.

Recommended config contract:

| Field | Purpose |
| --- | --- |
| `type` | `line`, `bar`, `pie`, `composed`, `sparkline`, `rankedBar`. |
| `title` | Display title, optional if the parent card already has one. |
| `description` | Accessibility and hover/help text. |
| `data` | Array of records. |
| `xKey` | Category or time key. |
| `series` | Data keys, labels, and optional semantic color. |
| `options` | High-level options like `stacked`, `showLegend`, `percent`, `targetLine`. |
| `formatters` | Named formatter IDs, not inline functions, for BA safety. |

Avoid exposing these to BAs:

1. SVG margins.
2. Recharts component nesting.
3. Responsive container mechanics.
4. Tooltip JSX.
5. Raw hex colors.
6. Axis tick styling.

## 3. Step-by-Step Execution Plan and LLM Routing Strategy

| Step | Task Description | Complexity | LLM Model Recommendation |
| --- | --- | --- | --- |
| 1 | Establish quality baseline. Add reliable scripts: `typecheck`, `build`, `lint`, and a quick smoke test. Document current failures separately from historical log files. | Medium | Advanced/Reasoning Model for diagnosing build pipeline behavior and deciding whether `esbuild: false`, `@mui/x-charts`, or TypeScript config are causing slow or blocked checks. |
| 2 | Normalize provider hierarchy. Build `AppProviders`, remove duplicate `WorkstationProvider`, and decouple `AuthProvider` from workstation context. | High | Advanced/Reasoning Model because this touches app state ownership, login behavior, and screen navigation. |
| 3 | Create the global theme contract. Extend MUI theme with `appTokens`, migrate `activeTheme` and workstation semantics into typed theme tokens, and document token usage. | High | Advanced/Reasoning Model for the theme architecture. Fast/Economical Model can later replace straightforward hardcoded colors with token references. |
| 4 | Create `src/common/charts` wrappers. Implement `ChartFrame`, `StandardLineChart`, `StandardBarChart`, `StandardPieChart`, and `StandardChart` config renderer. | High | Advanced/Reasoning Model for wrapper API design, responsive behavior, and config validation. |
| 5 | Migrate low-risk charts to wrappers. Start with simple `@mui/x-charts` bar/line usages in notification, ESO, maintenance, and document detail screens. | Medium | Fast/Economical Model for repetitive chart replacement after the wrapper API is stable. Use Advanced/Reasoning Model when a chart has custom interaction or mixed series logic. |
| 6 | Migrate workstation Recharts widgets to common wrappers. Keep domain-specific workstation components, but compose them from `src/common/charts`. | Medium | Fast/Economical Model for mechanical migration; Advanced/Reasoning Model for dashboard layout or measurement changes. |
| 7 | Replace hand-drawn chart snippets. Convert control tower and custom workstation SVG/HTML charts into Recharts wrapper configs or explicitly named specialized wrappers. | High | Advanced/Reasoning Model because these charts likely encode visual logic, scale math, labels, and special interactions. |
| 8 | Introduce the screen registry. Create declarative metadata for screen keys, labels, navigation placement, lazy loader, permissions, and BA-editable page config. | High | Advanced/Reasoning Model for architecture and migration strategy. |
| 9 | Convert routes to registry-driven rendering. Replace the large switch in `AppRoutes` gradually, one domain at a time. | Medium | Fast/Economical Model for moving simple screens into the registry. Advanced/Reasoning Model for screens that require many handlers or cross-domain props. |
| 10 | Extract BA-editable screen config. For each domain, move cards, KPIs, chart configs, tables, and menu content into typed config modules. | Medium | Fast/Economical Model for repetitive extraction. Advanced/Reasoning Model for designing schemas and validation. |
| 11 | Split large files by feature boundary. Prioritize `GlobalViewScreen`, `WorkstationDashboard`, `DocumentManagementScreen`, and `ShiftEntryPanel`. | High | Advanced/Reasoning Model for the first split of each large screen; Fast/Economical Model for follow-up component extraction once boundaries are proven. |
| 12 | Add storage gateway. Wrap `localStorage` access with versioned keys, schema validation, and migration hooks. | Medium | Advanced/Reasoning Model for persistence contract. Fast/Economical Model for replacing direct calls once the gateway exists. |
| 13 | Tighten TypeScript. Add shared domain types, reduce `any` in shell and screen registry, and incrementally enable strict flags. | High | Advanced/Reasoning Model for type boundaries. Fast/Economical Model for obvious prop and state typing once contracts exist. |
| 14 | Add component gallery and BA authoring guide. Show examples for screen configs, chart configs, drawer forms, KPI cards, and common tables. | Medium | Fast/Economical Model for documentation and example generation after the components are stable. |
| 15 | Remove legacy dependencies and styling paths. Remove `@mui/x-charts` and Tailwind if no longer used, then enforce token usage with linting. | Low to Medium | Fast/Economical Model for dependency cleanup and import removal. Advanced/Reasoning Model if build or visual regressions appear. |

### Recommended Chronology

1. Make the app verifiable.
2. Fix provider/state ownership.
3. Lock down theme and chart wrapper architecture.
4. Migrate charts to Recharts wrappers.
5. Make screens declarative.
6. Split large screens.
7. Tighten types and persistence.
8. Add BA-facing documentation and guardrails.

### LLM Routing Rules of Thumb

Use a Fast/Economical Model for:

1. Replacing repeated hardcoded colors after tokens are defined.
2. Converting simple chart calls to existing wrappers.
3. Moving static arrays into config files.
4. Updating imports after file splits.
5. Writing component gallery examples.
6. Simple prop-drilling removal where context or registry contracts already exist.

Use an Advanced/Reasoning Model for:

1. Provider hierarchy and authentication flow changes.
2. Theme token architecture and MUI module augmentation.
3. Chart wrapper API design and config validation.
4. Complex chart migration with custom interactions or scale math.
5. Route registry design and migration sequencing.
6. Large-file decomposition where state, UI, and mock data are intertwined.
7. TypeScript strictness rollout and data contract design.
8. Build pipeline diagnosis.

## Target Architecture Sketch

```txt
src/
  app/
    App.tsx
    AppProviders.tsx
    screenRegistry.tsx
    routes/
  common/
    charts/
    ui/
    storage/
    types/
  features/
    aiHome/
    actionTracker/
    documentManagement/
    maintenance/
    shopfloor/
    shiftManagement/
    workstation/
  theme/
    index.ts
    tokens.ts
    themeAugmentation.d.ts
  ba-config/
    screens/
    charts/
    navigation/
```

The goal is not to rewrite everything at once. The goal is to make the next screen safer and easier than the previous one, until BAs can add content and charts through well-typed configuration while engineers own the platform components underneath.
