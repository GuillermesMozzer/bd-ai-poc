# Guide for Creating and Standardizing Workstation Widgets

This guide establishes the strict architectural pattern, visual layout rules, and data visualization guidelines for the Workstation Dashboard widgets. All widgets must adhere to these standards to ensure a cohesive, modern, and data-dense user experience.

---

## 1. Architectural Guidelines

To maintain compatibility with the responsive grid layout, state management, and the overall design system, every widget must adhere to the following core principles:

1. **Unified Frame**: All widgets MUST be wrapped in the `<WidgetShell />` component. Do not implement custom outer `Paper` or border wrappers.
2. **Strict Props Schema**: Every widget component must accept a standard set of properties to facilitate layout binding, temporal filtering, and user interactions.
3. **State and Callback Preservation**: Do not remove active business logic, notification bindings, or click callbacks. Maintain state boundaries locally or via the appropriate context provider.
4. **Theme Alignment**: Never use hardcoded hex values or ad-hoc border/shadow utilities. Reference tokens from `theme.ts` exclusively.

---

## 2. Standard Props Interface

All workstation widgets should implement the `WorkstationWidgetProps` interface (or a subset where applicable):

```typescript
import type { CSSProperties } from 'react';

export interface WorkstationWidgetProps {
  /** Grid items receive layout className and styles from react-grid-layout */
  className?: string;
  style?: CSSProperties;
  
  /** Temporal filter states from the dashboard context */
  timeframe?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'shift';
  shift?: string;
  
  /** Callback for resizing or mode switches (e.g. Hourly vs Cumulative) */
  onViewModeChange?: (viewMode: 'graph' | 'table') => void;
  onExpand?: () => void;
  
  /** Category context (e.g., 'Production', 'Safety', 'Quality') */
  domain?: string;
}
```

---

## 3. Widget Boilerplate

Here is the standard boilerplate for a clean workstation widget:

```tsx
import { useState } from 'react';
import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import {
  Add as AddIcon,
  ArrowOutward as ArrowOutwardIcon,
  CalendarMonth as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { 
  tokenBrand,
  tokenNeutral,
  tokenCommon,
  workstationVisuals, 
  workstationWidgetTitleSx, 
  workstationSoftBadgeSx, 
  workstationStatusPillSx,
  workstationTableSx,
  workstationTableHeaderCellSx,
  workstationTableCellSx
} from '../theme';
import WidgetShell from './WidgetShell';
import type { WorkstationWidgetProps } from '../types';

// Standardized filter and action button styling (height 26px, 8px border-radius)
const filterButtonSx = {
  height: 26,
  borderRadius: '8px',
  px: 1.25,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  color: 'rgba(15, 23, 42, 0.7)',
  bgcolor: tokenCommon.white,
  textTransform: 'none',
  fontSize: '0.72rem',
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: tokenNeutral.lightest,
    borderColor: 'rgba(15, 23, 42, 0.16)',
  },
  '& .MuiButton-startIcon': { mr: 0.3, '& svg': { fontSize: 13 } },
  '& .MuiButton-endIcon': { ml: 0.2, '& svg': { fontSize: 13 } },
} as const;

export default function WorkstationSampleWidget({
  className,
  style,
  timeframe,
  shift,
  onExpand,
}: WorkstationWidgetProps) {
  const [dateFilter, setDateFilter] = useState('Current Month');
  const [dateAnchor, setDateAnchor] = useState<null | HTMLElement>(null);
  
  // Custom right actions (standardized buttons with 8px border radius)
  const headerAction = (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
      <Button
        variant="outlined"
        startIcon={<CalendarIcon />}
        endIcon={<ExpandMoreIcon />}
        onClick={(event) => setDateAnchor(event.currentTarget)}
        sx={filterButtonSx}
      >
        {dateFilter}
      </Button>
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => {/* action logic */}}
        sx={filterButtonSx}
      >
        Create
      </Button>
      <IconButton size="small" onClick={onExpand} sx={{ width: 24, height: 24, p: 0, color: tokenBrand.main }}>
        <ArrowOutwardIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );

  return (
    <WidgetShell
      title="Sample Widget"
      action={headerAction}
      className={className}
      style={style}
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* KPI / Metric Block inside a subtle light-bordered card (tight gap: 1) */}
        <Box sx={{
          border: '1px solid rgba(15, 23, 42, 0.06)',
          borderRadius: '8px',
          p: 1.5,
          bgcolor: tokenCommon.white,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1,
          mb: 1.2
        }}>
          {/* KPI Card 1: Horizontal baseline alignment */}
          <Box sx={{ display: 'flex', flexDirection: 'column', pl: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 0.8 }}>
              <Typography sx={{ fontSize: '1.25rem', color: tokenBrand.main, fontWeight: 600, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
                42
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textPrimary, fontWeight: 500, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily }}>
                Active Tasks
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, mt: 0.4, fontFamily: workstationVisuals.fontFamily }}>
              Assigned this shift
            </Typography>
          </Box>

          {/* KPI Card 2: Horizontal baseline alignment */}
          <Box sx={{ display: 'flex', flexDirection: 'column', pl: 1, borderLeft: '1px solid rgba(15, 23, 42, 0.06)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 0.8 }}>
              <Typography sx={{ fontSize: '1.25rem', color: tokenBrand.main, fontWeight: 600, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
                95%
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textPrimary, fontWeight: 500, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily }}>
                Efficiency
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, mt: 0.4, fontFamily: workstationVisuals.fontFamily }}>
              Target: 98%
            </Typography>
          </Box>
        </Box>

        {/* Clean, borderless table content layout */}
        <Box component="table" sx={workstationTableSx}>
          <thead>
            <tr>
              <Box component="th" sx={workstationTableHeaderCellSx}>Component</Box>
              <Box component="th" sx={{ ...workstationTableHeaderCellSx, textAlign: 'right' }}>Qty</Box>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Box component="td" sx={workstationTableCellSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                    Servo Motor SM-204
                  </Typography>
                  <Box sx={workstationSoftBadgeSx}>BOM-003</Box>
                </Box>
              </Box>
              <Box component="td" sx={{ ...workstationTableCellSx, textAlign: 'right', fontWeight: 600 }}>
                4
              </Box>
            </tr>
          </tbody>
        </Box>
      </Box>

      <Menu anchorEl={dateAnchor} open={Boolean(dateAnchor)} onClose={() => setDateAnchor(null)}>
        <MenuItem onClick={() => { setDateFilter('Current Month'); setDateAnchor(null); }}>Current Month</MenuItem>
        <MenuItem onClick={() => { setDateFilter('Last Month'); setDateAnchor(null); }}>Last Month</MenuItem>
      </Menu>
    </WidgetShell>
  );
}
```

---

## 4. Visual & Styling Standards

### Canonical Reference Widget
- **Primary visual reference**: `src/workstation/components/MyEsoWidget.tsx` is the canonical implementation for workstation widget styling. When this guide and an existing widget differ, match `MyEsoWidget.tsx` unless the user explicitly requests a different pattern.
- **Header controls**: Header filters and minor actions must use `filterButtonSx` exactly. Do not override action button text to `workstationVisuals.textPrimary`, `tokenBrand.main`, or a status color. The `Create`, `Open ESO`, and similar header actions should remain the same muted control style as filters: white background, subtle border, `rgba(15, 23, 42, 0.7)` text, `0.72rem`, and `fontWeight: 500`.
- **Section headers**: Section/card titles such as `My Team ESOs by Status`, `Team Engagement`, `My ESOs by Category`, and `My ESOs Submission` must use the `MyEsoWidget.tsx` heading style: `fontSize: '0.82rem'`, `fontWeight: 600`, `color: workstationVisuals.textPrimary`, and `fontFamily: workstationVisuals.fontFamily`. Do not style section headers with `workstationVisuals.textSecondary`, brand blue, or status colors.
- **Semantic color restraint**: Use semantic colors on metric values, chart marks, progress bars, status badges, and legend dots only. Do not use semantic colors for ordinary labels, subtitles, section headers, table body text, category names, or descriptive copy. Those text elements must use `workstationVisuals.textPrimary` for primary labels and `workstationVisuals.textSecondary` for supporting text.
- **KPI row reference**: KPI summary rows should match `MyEsoWidget.tsx`: one bordered white card wrapper, compact grid, no icons unless explicitly requested, metric value and label aligned on the baseline, and secondary notes below in muted text.

### Card & Surface Design
- **Background**: Flat, clean solid white surfaces (`tokenCommon.white` / `#FFFFFF`). Avoid background gradients inside widget frames to ensure a crisp layout.
- **Borders, Shadow & Radius**: Card edges must have a subtle, clean border (`border: 1px solid ${workstationVisuals.tierBorder}`) to clearly define widget boundaries, along with extremely subtle drop-shadows (`workstationVisuals.tierShadow`) and border-radius (`workstationVisuals.cardRadius` / `14px`).
- **Inner Card Grouping (Inset Cards)**: Standardize inner subdivisions or sections within parent containers using a light border (`border: '1px solid rgba(15, 23, 42, 0.06)'`), small border-radius (`borderRadius: '8px'`), padding (`p: 1.5` or `p: 2`), and solid white background (`bgcolor: tokenCommon.white`). This ensures sections (e.g. KPI blocks, donut charts, list grids) are clearly grouped without blending together.
- **Whitespace & Separators**: Spacing between inner components/cards must be tight and consistent to ensure high data density. Use small layout gaps (specifically `gap: 1` to `gap: 1.2`, or `8px` to `10px`) between nested cards, grid elements, or columns. For separating elements inside a layout (like individual KPIs in a row), use a light divider line (e.g. `1px solid rgba(15, 23, 42, 0.06)`) rather than heavy borders or wide spaces.

### Button & Input Styling
- **No Pill Buttons**: Pill-shaped action elements and filters (`borderRadius: 999` or `borderRadius: '999px'`) are deprecated and must not be used.
- **Modern Rectangular Corners**: All buttons, filters, toggles, and action elements in headers or footers must use modern, smaller rounded corners (specifically `borderRadius: '8px'`).
- **Standardized Header Filters**: Use `filterButtonSx` (height: `26px`, border: `1px solid rgba(15, 23, 42, 0.08)`, color: `rgba(15, 23, 42, 0.7)`, background: white, hover background: `tokenNeutral.lightest`, and font size: `0.72rem`) for all header-level filter selectors and minor action buttons (e.g., "Create").
- **No Header Action Overrides**: Do not override standardized header action buttons with dark text, brand text, contained variants, shadows, or higher font weights. Header actions must remain visually quiet and consistent with filters.

### KPI & Metric Layout Guidelines
- **Horizontal Value-Label Alignment**: In KPI cards or summary metrics, always align the numerical value and the text label horizontally on the same line. Use `display: 'flex'`, `flexDirection: 'row'`, `alignItems: 'baseline'`, and a small gap (specifically `gap: 0.8` to `gap: 1`).
- **Subtitle / Notes Wrapping**: Any secondary details (e.g., "Submitted this period", "Target: 2.3", or "(21 / 27)") must be placed on a separate line *underneath* the horizontal number-label line, styled with a smaller font (e.g., `0.62rem` to `0.68rem`) and a top margin of `mt: 0.4` or `mt: 0.5`. Do not let secondary notes or tags run inline on the same row as the primary number.
- **Target Comparison Coloring**: When a metric has a defined target and its value falls below that target, the numerical value must be styled with the error/danger color (`tokenError.main` / red). If the target is met or normal, use the success color (`tokenSuccess.main` / green) or primary colors as defined in the semantic color mapping.
- **Target Progress Bars**: Target-based progress indicators must follow the same comparison color as the metric value. If actual is below target, both the value (e.g., `80%`) and the progress bar fill must use `tokenError.main`. If actual meets or exceeds target, both the value and progress fill may use `tokenSuccess.main`. Do not use green for partial progress when the label says the target has not been reached.

### Strict Semantic Color Mapping Rules
To maintain visual consistency and avoid "rainbow dashboards", widgets must adhere strictly to these defined semantic roles:
- **Brand (Dark Blue - `tokenBrand.main`)**: General branding, primary metrics, normal non-status counts, action progress (e.g. "Action In Progress", "Total Team ESOs").
- **Info (Light Blue - `tokenInfo.main`)**: Information alerts, created items (e.g. "Action Created", "Open Actions").
- **Warning (Orange - `tokenWarning.main`)**: Needs review, pending conditions, yellow alert (e.g. "Awaiting Review", "Conditions with Unresolved Issues").
- **Success (Green - `tokenSuccess.main`)**: Positive outcomes, targets met, active/nominal state (e.g. "Team Target Progress", "Closed ESOs", "Closed Actions").
- **Error (Red - `tokenError.main`)**: Incidents, critical issues, serious potential outcomes, red alerts (e.g. "SPO Near Misses", "Near Misses with Unresolved Issues").
- **Neutral (Gray - `workstationVisuals.textPrimary` / `tokenNeutral.main`)**: Default metrics, plain counts with no specific status (e.g. "Open ESOs").

> [!IMPORTANT]
> Any color choice outside of this standard semantic mapping is strictly disallowed. If the AI agent is unsure what color to use for a particular metric, status, or card element, it MUST ask the user for clarification before applying it. Do not guess or introduce other colors.


### Typography Hierarchy (Inter)
- **Widget Title**: `0.92rem` | Weight: 600 | Color: `workstationVisuals.textPrimary` | Font Family: `workstationVisuals.fontFamily` | Normal Case.
- **Section Headers**: `0.82rem` | Weight: 600 | Color: `workstationVisuals.textPrimary` | Font Family: `workstationVisuals.fontFamily` | Normal Case.
- **Action Buttons / Filters**: `0.72rem` | Weight: 500 | Color: `rgba(15, 23, 42, 0.7)` | Font Family: `workstationVisuals.fontFamily`.
- **Main Metric Figures**: `1.4rem` - `1.8rem` | Weight: 600 or 700 | Color: `workstationVisuals.textPrimary`.
- **Labels**: `0.72rem` - `0.85rem` | Weight: 500 | Color: `workstationVisuals.textPrimary`.
- **Meta Details / Subtitles**: `0.62rem` - `0.72rem` | Weight: 400 - 500 | Color: `workstationVisuals.textSecondary`.

### KPI & Status Badges
To convey quick status across all metrics, use the shared badge styles in `theme.ts` instead of inline overrides:
- **Soft Filled Badge (`workstationSoftBadgeSx`)**: Used for identification codes or serial numbers (e.g. `BOM-001`). Clean, light-blue background (`rgba(31, 99, 234, 0.06)`) with blue text.
- **Status Pill Badge (`workstationStatusPillSx(severity)`)**:
  - `warning`: Orange outline and text for warnings or low stock.
  - `success`: Green outline and text for nominal/active state.
  - `neutral`: Grey/dark outline and text for standard in-stock status.

---

## 5. Visualizations, Tables & Lists

### 5.1 Tables and Lists Guidelines
- **Borderless Structure**: Do not use thick lines or dark borders between table rows or columns. Rely on `workstationTableSx`, `workstationTableHeaderCellSx`, and `workstationTableCellSx` which provide a very faint `1px solid rgba(15, 23, 42, 0.04)` bottom separator.
- **Neutral Row Text Only**: Standard table/list row content must use neutral typography. IDs, names, dates, types, labels, descriptions, and ordinary values must use `workstationVisuals.textPrimary` for primary text or `workstationVisuals.textSecondary` for muted supporting text. Do not color IDs, dates, names, or row labels with `tokenBrand.main`, `tokenInfo.main`, `tokenWarning.main`, `tokenSuccess.main`, or `tokenError.main`.
- **Semantic Color Exceptions**: Semantic colors in tables/lists are allowed only for status badges, severity badges, small legend dots, chart marks, progress bars, or explicit alert indicators. If a row value is clickable, indicate clickability with interaction styling such as hover underline/cursor, not by making normal table text blue.
- **Tree-like Nested Lists**: For nested hierarchies (like a Bill of Materials):
  - Indent child items using left margin spacing (e.g. `pl: 2` or `pl: 3`).
  - Prefix with small open circle indicators (e.g. `o` or standard list icons) for visual cues.
  - Align numbers/metrics (like quantities) to the far right.
- **Bottom Full-Width Actions**: Buttons like "Scan QR Code on Asset" should span the full width at the bottom of the card, using `workstationActionButtonSx` (flat white background, thin border, centered text and icon).

### 5.2 Recharts Standard
All charts must be constructed using **Recharts** and apply the shared chart style tokens from `theme.ts` to ensure styling consistency:

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { workstationRechartsTheme, workstationVisuals } from '../theme';

// Example:
<ResponsiveContainer width="100%" height="100%">
  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
    <CartesianGrid 
      vertical={false} 
      stroke={workstationRechartsTheme.gridColor} 
      strokeDasharray={workstationRechartsTheme.gridDash} 
    />
    <XAxis 
      {...workstationRechartsTheme.axisProps}
      tick={workstationRechartsTheme.axisTickStyle}
      dataKey="time"
    />
    <YAxis 
      {...workstationRechartsTheme.axisProps}
      tick={workstationRechartsTheme.axisTickStyle}
    />
    <Tooltip 
      contentStyle={workstationRechartsTheme.tooltipContentStyle}
      labelStyle={workstationRechartsTheme.tooltipLabelStyle}
      itemStyle={workstationRechartsTheme.tooltipItemStyle}
      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
    />
    <Bar dataKey="actual" fill={workstationVisuals.blue} radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### 5.3 Custom Status Timelines (Gantt style)
For machine availability or shift schedule tracks, render horizontal bars with segmented state colors:
- **Running (Good)**: `tokenSuccess.main` (`#66BB6A`)
- **Idle (Warning)**: `tokenWarning.main` (`#FF9800`)
- **Down (Bad)**: `tokenError.main` (`#F44336`)
- **Offline / Setup**: `tokenNeutral.main` (`#E9EDEF`)

---

## 6. Registration & Integration Checklist

1. **Registry Entry**: Ensure standard grid widths and heights are configured inside `widgetRegistry.ts` and `workstationConstants.ts`.
2. **Dashboard Mounting**: Connect the widget inside `PersonalWorkstationDashboard.tsx` in the `renderPersonalWidget` switch statement.
3. **Published Workstations Rule**: Add the new widget's ID to `presetHiddenWidgetIds` in [publishedWorkstations.ts](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/workstation/publishedWorkstations.ts) so that new widgets do not show on the default published workstations unless explicitly asked.
4. **Verification**: Verify that the widget compiles correctly under typescript, is drag-and-drop enabled, and resizes smoothly in standard and edit modes.

---

## 7. Widget Resize & Responsiveness Best Practices

To ensure widgets resize beautifully and adapt dynamically to different grid item sizes, adhere to the following best practices:

### 7.1 Grid Constraints (widgetRegistry.ts)
- **Define Min/Max Bounds**: Configure explicit `minW` (minimum grid width columns) and `minH` (minimum grid height rows) for each widget inside `widgetRegistry.ts`.
- **Match Grid Aspect Ratio**: Smaller layouts (e.g., 2x2 grids) should focus on single summary metrics. Data-dense layouts (e.g., tables, detail lists, full calendars) must require larger minimum grid bounds (e.g., `minW: 3`, `minH: 3`).

### 7.2 Scrollbar Strategy (Content-Driven Scrolling)
- **Lists and Tables**: For widgets that display list rows (e.g., recent submissions, task lists), apply `overflow: 'auto'` (or `overflow-y: 'auto'`) and `minHeight: 0` to the list container. This permits vertical scrolling within the card while keeping header stats anchored.
- **Charts and Gauges**: Do NOT show scrollbars on charts, gauges, or timelines. Wrap them in layouts that automatically scale using `<ResponsiveContainer>` and flexbox, using `overflow: 'hidden'` to prevent rendering artifacts.

### 7.3 Flexible Layout Structure
- **Use Flexbox for Proportional Scaling**: Ensure content grows and shrinks predictably. Avoid hardcoded heights on inner content elements. Use flex containers:
  ```tsx
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
    <Box sx={{ flexShrink: 0 }}>Header/Stats</Box>
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>Scrollable Content List</Box>
  </Box>
  ```

### 7.4 Container-Aware Styling
- **Use Container Queries (`@container`)**: Instead of media queries, style responsive columns (e.g., switching from a 5-column grid to 2 columns) based on the widget width.
- **Fluid Sizes (`clamp` and `cqw`)**: Use `clamp()` with Container Query Width (`cqw`) units for margins, padding, and font sizes (e.g. `fontSize: 'clamp(14px, 4cqw, 20px)'`). This guarantees smooth element scaling as the user drags and resizes the widget.

---

## 8. Usability, Hierarchy, and Design Principles

All widgets must adhere strictly to these UX and design principles to ensure readability, trust, and zero cognitive strain.

### 8.1 Clarity Over Decoration
Rule: If it doesn't improve understanding, remove it.

| REMOVE | USE |
| :--- | :--- |
| ❌ Heavy/dark borders | ✅ Subtle light borders (`workstationVisuals.tierBorder`) / White space |
| ❌ Shadows | ✅ Alignment |
| ❌ 3D effects | ✅ Subtle hierarchy |
| ❌ Excess colors | ✅ Minimal framing |
| ❌ Visual noise | ✅ Minimal framing |
| ❌ Thick gridlines | ✅ Minimal framing |

### 8.2 Create Visual Hierarchy (Guide the Eye)
- **Most Important (High Priority)**: Larger, darker, higher contrast, and positioned top-left.
- **Less Important (Low Priority)**: Smaller, greyed out, lower contrast.

### 8.3 Use Color Strategically (Color Signals Meaning)
- **Best Practice**: 80–90% neutral colors, with 1 accent color for emphasis.
- **Good**: Grey + one highlight color.
- **Bad**: 
  - ❌ Rainbow dashboards
  - ❌ Saturated everything
  - ❌ Competing highlights

### 8.4 Reduce Cognitive Load (Don't Make Me Think)
- **Make Things Easy**:
  - ✅ Direct labels
  - ✅ Clear sorting
  - ✅ Consistent layouts
  - ✅ Short titles
  - ✅ Simple legends
- **Avoid**:
  - ❌ Excess scrolling
  - ❌ Too many widgets
  - ❌ Tiny text
  - ❌ Dense clutter

### 8.5 KPIs Should Not Dominate (Use Space Efficiently)
- **Bad**:
  - ❌ Huge numbers
  - ❌ Giant tiles
  - ❌ Dashboard vanity
- **Better**:
  - ✅ Compact KPIs
  - ✅ Trends beside numbers

### 8.6 Remove Unnecessary Containers
Too many cards, frames, nested boxes, and thick separators cause fragmentation, space waste, and visual heaviness.
- **Prefer**:
  - ✅ Alignment
  - ✅ Spacing
  - ✅ Subtle grouping
  - ✅ Subtle light borders to clearly define card boundaries and separate distinct widgets

### 8.7 Consistency Builds Trust
Keep the following consistent across all widgets:
- ✅ Spacing (use small layout gaps of `1.2` to `1.5` / `10px` to `12px` between cards/grid items)
- ✅ Typography
- ✅ Colors
- ✅ Widget behavior
- ✅ Alignment
