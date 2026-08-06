# Radix Unified Design System Reference

> **Source of truth:** Figma Design System Document + [Light.tokens.json](../../design-system/Light.tokens.json) + [Dark.tokens.json](../../design-system/Dark.tokens.json)
> **Code tokens:** [theme.ts](../workstation/theme.ts)
> **Last updated:** 2026-06-26

---

## Index

1. [Token Architecture & Rules](#1-token-architecture--rules)
2. [Collections & Modes](#2-collections--modes)
3. [Naming Convention](#3-naming-convention)
4. [Color Tokens — Primitive Palettes](#4-color-tokens--primitive-palettes)
5. [Color Tokens — Semantic](#5-color-tokens--semantic)
6. [Color Tokens — Charts](#6-color-tokens--charts)
7. [Typography](#7-typography)
8. [Spacing](#8-spacing)
9. [Shape — Radius & Border Width](#9-shape--radius--border-width)
10. [Breakpoints](#10-breakpoints)
11. [Elevation & Shadows](#11-elevation--shadows)
12. [Code Aliases — Token → React/MUI Mapping](#12-code-aliases--token--reactmui-mapping)
13. [Component Specifications](#13-component-specifications)
14. [Layout Composition Patterns](#14-layout-composition-patterns)
15. [Screen-Specific Styling: Equipment Ledger](#15-screen-specific-styling-equipment-ledger)
16. [Screen-Specific Styling: Maintenance Follow Up Board](#16-screen-specific-styling-maintenance-follow-up-board)

---

## 1. Token Architecture & Rules

The Design System uses a **two-level architecture**:

```
colors/primary  (primitives — prefixed with `_`)
      ↓  alias
colors/semantic (semantic tokens)
      ↓  referenced in
   components / code
```

> [!CAUTION]
> **NEVER use primitive tokens directly in product code.** Always use the semantic alias. Primitives (prefixed with `_`) are documented here only for traceability.

> [!IMPORTANT]
> **NEVER invent new colors, spacing values, or component variants.** If a style is not in this document, do not use it. Always validate generated code against these tables before finalizing.

> [!IMPORTANT]
> **AI INSTRUCTIONS FOR REFACTORING:** Apply the design-system guidance from the markdown file as a styling-only refactor. Do not change content, labels, data, logic, behavior, features, routes, API calls, state handling, or user flows. Only fix layout, spacing, alignment, visual hierarchy, token usage, and component styling. Existing UI elements may be moved to their correct visual positions, but they must keep the same content, props, behavior, and functionality.

---

## 2. Collections & Modes

| Collection | Modes | Variables | Description |
|:---|:---|:---:|:---|
| `colors/semantic` | Light, **Dark** | 229 | Semantic tokens; supports Dark Mode |
| `colors/primary` | Mode 1 | 234 | Primitive palette (base colors) |
| `colors/charts` | Value | 61 | Exclusive palette for data visualizations |
| `spacing` | Mode 1 | 18 | Numeric spacing scale |
| `shape` | Mode 1 | 13 | Border radius and border width |
| `typography` | Mode 1 | 12 | Primitive font sizes |
| `breakpoints` | Mode 1 | 7 | Responsive layout breakpoints |

> The default mode for `colors/semantic` is **Light**. The **Dark** mode exists and can be activated via mode switching.

---

## 3. Naming Convention

### Structure

Variable names use `/` as the segment separator:

```
{category}/{variant}
{category}/{subcategory}/{state}
```

**Examples:**
- `brand/main` → category `brand`, variant `main`
- `error/states/hover` → category `error`, subcategory `states`, state `hover`
- `_blue/500` → primitive (prefix `_`), hue `blue`, step `500`

### Underscore Prefix (`_`)

Primitive variables that **must NOT be consumed directly** in product code are prefixed with `_`. Always use the corresponding semantic alias.

### Semantic Color Steps

| Step | Usage |
|:---|:---|
| `extraLight` | Very subtle background |
| `lightest` | Faint background |
| `lighter` | Light background |
| `light` | Light variant |
| `main` | **Primary value — use this** |
| `dark` | Hover / emphasis |
| `darker` | Strong emphasis |
| `darkest` | Maximum contrast |
| `contrastText` | Text on `main` background |

---

## 4. Color Tokens — Primitive Palettes

> [!WARNING]
> Use **only via semantic alias**. Documented here for reference and traceability.

### Blue (`_blue`)
| Token | Hex |
|:---|:---|
| `_blue/400` | `#3E83FF` |
| `_blue/500` | `#1F63EA` |
| `_blue/600` | `#0042C5` |

### Aurora (`_aurora`)
| Token | Hex |
|:---|:---|
| `_aurora/400` | `#F67450` |
| `_aurora/500` | `#F65428` |
| `_aurora/600` | `#EA3A0B` |

### Red (`_red`)
| Token | Hex |
|:---|:---|
| `_red/50` | `#FEEBEE` |
| `_red/100` | `#FECDD2` |
| `_red/200` | `#EF9A9A` |
| `_red/300` | `#E57373` |
| `_red/400` | `#EF5350` |
| `_red/500` | `#F44336` |
| `_red/600` | `#E53935` |
| `_red/700` | `#D32F2F` |
| `_red/800` | `#C62828` |
| `_red/900` | `#B71C1C` |

### Green (`_green`)
| Token | Hex |
|:---|:---|
| `_green/50` | `#E8F5E9` |
| `_green/100` | `#C8E6C9` |
| `_green/200` | `#A5D6A7` |
| `_green/300` | `#81C784` |
| `_green/400` | `#66BB6A` |
| `_green/500` | `#4CAF50` |
| `_green/600` | `#43A047` |
| `_green/700` | `#388E3C` |
| `_green/800` | `#2E7D32` |
| `_green/900` | `#1B5E20` |

### Orange (`_orange`)
| Token | Hex |
|:---|:---|
| `_orange/50` | `#FFF3E0` |
| `_orange/100` | `#FFE0B2` |
| `_orange/200` | `#FFCC80` |
| `_orange/300` | `#FFB74D` |
| `_orange/400` | `#FFA726` |
| `_orange/500` | `#FF9800` |
| `_orange/600` | `#FB8C00` |
| `_orange/700` | `#F57C00` |
| `_orange/800` | `#EF6C00` |
| `_orange/900` | `#E65100` |

### Light Blue (`_lightBlue`)
| Token | Hex |
|:---|:---|
| `_lightBlue/50` | `#E1F5FE` |
| `_lightBlue/100` | `#B3E5FC` |
| `_lightBlue/300` | `#4FC3F7` |
| `_lightBlue/400` | `#29B6F6` |
| `_lightBlue/500` | `#03A9F4` |
| `_lightBlue/600` | `#039BE5` |
| `_lightBlue/700` | `#0288D1` |
| `_lightBlue/900` | `#01579B` |

### Purple (`_purple`)
| Token | Hex |
|:---|:---|
| `_purple/50` | `#F3E5F5` |
| `_purple/100` | `#E1BEE7` |
| `_purple/200` | `#CE93D8` |
| `_purple/300` | `#BA68C8` |
| `_purple/400` | `#AB47BC` |
| `_purple/500` | `#9C27B0` |
| `_purple/600` | `#8E24AA` |
| `_purple/700` | `#7B1FA2` |
| `_purple/800` | `#6A1B9A` |
| `_purple/900` | `#4A148C` |

---

## 5. Color Tokens — Semantic

> [!IMPORTANT]
> These are the **only colors** you should reference in product code. Each token maps to a primitive via alias.

### 5.1 Brand
| Token | Hex | Alias | Description |
|:---|:---|:---|:---|
| `brand/main` | `#1F63EA` | `_blue/500` | **Primary brand color** |
| `brand/light` | `#3E83FF` | `_blue/400` | Light variant |
| `brand/dark` | `#0042C5` | `_blue/600` | Hover / emphasis |
| `brand/contrastText` | `#FFFFFF` | — | Text on brand/main |
| `brand/states/hover` | `#1F63EA` @ 4% | — | Hover overlay |
| `brand/states/selected` | `#1F63EA` @ 8% | — | Selection overlay |
| `brand/states/focus` | `#1F63EA` @ 12% | — | Focus overlay |
| `brand/states/focusVisible` | `#1F63EA` @ 30% | — | Visible focus outline |
| `brand/states/outlinedBorder` | `#1F63EA` @ 50% | — | Outlined button border |

### 5.2 Accent
| Token | Hex | Alias | Description |
|:---|:---|:---|:---|
| `accent/main` | `#F65428` | `_aurora/500` | Secondary brand accent |
| `accent/light` | `#F67450` | `_aurora/400` | |
| `accent/dark` | `#EA3A0B` | `_aurora/600` | |
| `accent/contrastText` | `#FFFFFF` | | |
| `accent/states/hover` | `#F65428` @ 4% | | |
| `accent/states/selected` | `#F65428` @ 8% | | |
| `accent/states/outlinedBorder` | `#F65428` @ 50% | | |

### 5.3 Error
| Token | Hex | Alias |
|:---|:---|:---|
| `error/main` | `#F44336` | `_red/500` |
| `error/light` | `#EF5350` | `_red/400` |
| `error/dark` | `#E53935` | `_red/600` |
| `error/contrastText` | `#FFFFFF` | |
| `error/states/hover` | `#E33A3A` @ 4% | |
| `error/states/selected` | `#E33A3A` @ 8% | |
| `error/states/focusVisible` | `#E33A3A` @ 30% | |
| `error/states/outlinedBorder` | `#E33A3A` @ 50% | |

### 5.4 Warning
| Token | Hex | Alias |
|:---|:---|:---|
| `warning/extraLight` | `#FFF3E0` | `_orange/50` |
| `warning/lightest` | `#FFE0B2` | `_orange/100` |
| `warning/lighter` | `#FFCC80` | `_orange/200` |
| `warning/light` | `#FFA726` | `_orange/400` |
| `warning/main` | `#FF9800` | `_orange/500` |
| `warning/dark` | `#FB8C00` | `_orange/600` |
| `warning/darker` | `#E65100` | `_orange/900` |
| `warning/darkest` | `#933400` | `_orange/950` |
| `warning/contrastText` | `#000000` | |

### 5.5 Success
| Token | Hex | Alias |
|:---|:---|:---|
| `success/extraLight` | `#E8F5E9` | `_green/50` |
| `success/lightest` | `#C8E6C9` | `_green/100` |
| `success/lighter` | `#81C784` | `_green/300` |
| `success/light` | `#66BB6A` | `_green/400` |
| `success/main` | `#66BB6A` | `_green/400` |
| `success/dark` | `#4CAF50` | `_green/500` |
| `success/darker` | `#43A047` | `_green/600` |
| `success/darkest` | `#2E7D32` | `_green/800` |
| `success/contrastText` | `#000000` | |

### 5.6 Info
| Token | Hex | Alias |
|:---|:---|:---|
| `info/extraLight` | `#E1F5FE` | `_lightBlue/50` |
| `info/lightest` | `#B3E5FC` | `_lightBlue/100` |
| `info/lighter` | `#4FC3F7` | `_lightBlue/300` |
| `info/light` | `#29B6F6` | `_lightBlue/400` |
| `info/main` | `#03A9F4` | `_lightBlue/500` |
| `info/dark` | `#039BE5` | `_lightBlue/600` |
| `info/darker` | `#0288D1` | `_lightBlue/700` |
| `info/darkest` | `#01579B` | `_lightBlue/900` |
| `info/contrastText` | `#000000` | |

### 5.7 Neutral
| Token | Hex | Alias |
|:---|:---|:---|
| `neutral/darkest` | `#9D9FA2` | `_grey/600` |
| `neutral/darker` | `#BCBEC0` | `_grey/500` |
| `neutral/dark` | `#DBDDDF` | `_grey/400` |
| `neutral/main` | `#E9EDEF` | `_grey/300` |
| `neutral/light` | `#EEF2F3` | `_grey/200` |
| `neutral/lighter` | `#F5F7F8` | `_grey/100` |
| `neutral/lightest` | `#FBFCFC` | `_grey/50` |
| `neutral/contrastText` | `#000000` | |

### 5.8 Background & Surface
| Token | Hex | Usage |
|:---|:---|:---|
| `background/background` | `#F6F9FE` | Global application background |
| `background/background-container` | `#FFFFFF` @ 64% | Container with opacity |
| `background/paper-elevation-0` | `#FFFFFF` | Base surface (cards, drawers) |
| `background/paper-elevation-1` | `#FBFCFC` | Surface elevation 1 |
| `background/paper-elevation-2` | `#F5F7F8` | Surface elevation 2 |
| `background/paper-elevation-3` | `#EEF2F3` | Surface elevation 3 |
| `background/paper-elevation-4` | `#E9EDEF` | Surface elevation 4–6 |
| `background/drawer` | `#EEF2F3` | Drawer background |

### 5.9 Text
| Token | Opacity | Usage |
|:---|:---|:---|
| `text/primary` | 87% (`rgba(0,0,0,0.87)`) | Titles, primary labels |
| `text/secondary` | 60% (`rgba(0,0,0,0.60)`) | Body text, inactive tabs |
| `text/disabled` | 38% (`rgba(0,0,0,0.38)`) | Disabled text, timestamps |

### 5.10 Action
| Token | Opacity | Usage |
|:---|:---|:---|
| `action/active` | 54% | Active icons |
| `action/hover` | 4% | Generic hover overlay |
| `action/selected` | 8% | Generic selection overlay |
| `action/focus` | 12% | Generic focus overlay |
| `action/disabled` | 26% | Disabled icons and labels |
| `action/disabledBackground` | 12% | Disabled element background |

### 5.11 Divider & Common
| Token | Value | Opacity |
|:---|:---|:---|
| `divider` | `#000000` | 12% (`rgba(0,0,0,0.12)`) |
| `common/white_states/main` | `#FFFFFF` | 100% |
| `common/black_states/main` | `#000000` | 100% |

---

## 6. Color Tokens — Charts

| Series | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `dw-blue` | `#CDD8E3` | `#94C4DF` | `#5EABCC` | `#3A87B0` | `#1D6996` | `#145078` | `#0C3350` |
| `dw-red` | `#F7C9BB` | `#E89A86` | `#D97254` | `#C3462B` | `#9E3220` | `#7A1F10` | `#D32F2F` |
| `dw-green` | `#C2E0CE` | `#95C9AE` | `#6DB38F` | `#4A9C75` | `#2D7A57` | `#1A5C3E` | — |
| `dw-orange` | `#F9DEB0` | `#F2C27A` | `#E8A448` | `#E17C05` | `#B85E00` | `#8A4200` | — |
| `dw-purple` | `#D4C5E2` | `#B39DCC` | `#9278B5` | `#7B5EA7` | — | — | — |

---

## 7. Typography

### 7.1 Font Families
| Family | Usage |
|:---|:---|
| **Roboto** | Primary family — all UI styles |
| **FS Albert Pro** | Internal library use only |

> [!NOTE]
> The local codebase theme configures `fontFamily: '"Inter", "Segoe UI", sans-serif'` as a fallback via `workstationVisuals.fontFamily`. Use `Roboto` directly when matching Figma specifications.

### 7.2 Font Size Primitives (collection: typography)
| Token | rem | px |
|:---|:---:|:---:|
| `_fontSize/0,625rem` | 0.625rem | 10px |
| `_fontSize/0,75rem` | 0.75rem | 12px |
| `_fontSize/0,8125rem` | 0.8125rem | 13px |
| `_fontSize/0,875rem` | 0.875rem | 14px |
| `_fontSize/0,9375rem` | 0.9375rem | 15px |
| `_fontSize/1rem` | 1rem | 16px |
| `_fontSize/1,25rem` | 1.25rem | 20px |
| `_fontSize/1,5rem` | 1.5rem | 24px |
| `_fontSize/2,125rem` | 2.125rem | 34px |
| `_fontSize/3rem` | 3rem | 48px |
| `_fontSize/3,75rem` | 3.75rem | 60px |
| `_fontSize/6rem` | 6rem | 96px |

### 7.3 Typography Hierarchy — Headings & Body

| Style | Font Size | Line Height | Weight | Letter Spacing |
|:---|:---:|:---:|:---:|:---:|
| `typography/h1` | 96px (6rem) | ~112px (1.167) | 700 Bold | -1.5px |
| `typography/h2` | 60px (3.75rem) | 72px (1.2) | 700 Bold | -0.5px |
| `typography/h3` | 48px (3rem) | ~56px (1.167) | 700 Bold | 0px |
| `typography/h4` | 34px (2.125rem) | ~42px (1.235) | 700 Bold | 0.25px |
| `typography/h5` | 24px (1.5rem) | ~32px (1.334) | 700 Bold | 0px |
| `typography/h6` | 20px (1.25rem) | 32px (1.6) | 700 Bold | 0.15px |
| `typography/subtitle1` | 16px (1rem) | 28px (1.75) | 400 Regular | 0.15px |
| `typography/subtitle2` | 14px (0.875rem) | ~22px (1.57) | 500 Medium | 0.1px |
| `typography/body1` | 16px (1rem) | 24px (1.5) | 400 Regular | 0.15px |
| `typography/body2` | 14px (0.875rem) | ~20px (1.43) | 400 Regular | 0.17px |
| `typography/body3` | 12px (0.75rem) | ~16px (1.3) | 400 Regular | 0px |
| `typography/caption` | 12px (0.75rem) | ~16px (1.3) | 400 Regular | 0.4px |
| `typography/overline` | 12px (0.75rem) | ~16px (1.3) | 400 Regular | 1px |

### 7.4 Typography — Component Styles

| Style | Font Size | Line Height | Weight | Letter Spacing |
|:---|:---:|:---:|:---:|:---:|
| `button/large` | 15px | 26px | 500 Medium | 0.46px |
| `button/medium` | 14px | 24px | 500 Medium | 0.4px |
| `button/small` | 13px | 22px | 500 Medium | 0.46px |
| `input/label` | 12px | 12px | 400 Regular | 0.15px |
| `input/value` | 16px | 24px | 400 Regular | 0.15px |
| `input/helper` | 12px | ~20px (1.66) | 400 Regular | 0.4px |
| `chip/labelMd` | 13px | 18px | 400 Regular | 0.16px |
| `chip/labelSm` | 10px | 10px | 600 SemiBold | 5px |
| `tooltip/label` | 10px | 14px | 500 Medium | 0px |
| `badge/label` | 12px | 20px | 500 Medium | 0.14px |
| `table/header` | 14px | 24px | 500 Medium | 0.17px |
| `list/subheader` | 14px | 48px | 500 Medium | 0.1px |
| `menu/itemDefault` | 16px | 24px | 400 Regular | 0.15px |
| `menu/itemDense` | 14px | 24px | 400 Regular | 0.17px |
| `alert/title` | 16px | 24px | 500 Medium | 0.15px |
| `alert/description` | 14px | ~20px | 500 Medium | 0.15px |
| `avatar/initialsLg` | 20px | 20px | 400 Regular | 0.14px |
| `avatar/initialsMd` | 12px | 12px | 400 Regular | 0px |
| `avatar/initialsSm` | 10px | 10px | 400 Regular | 0px |
| `dataGrid/aggregationColumnHeaderLabel` | 12px | 12px | 500 Medium | 0.15px |
| `charts/group` | 12px | ~20px | 400 Regular | 0px |

### 7.5 Typography — Numeric Styles (KPIs / Dashboards)

| Style | Font Size | Line Height | Weight | Letter Spacing |
|:---|:---:|:---:|:---:|:---:|
| `number/numberLg` | 34px | 100% | 400 Regular | -3px |
| `number/numberMd` | 24px | 100% | 400 Regular | -3px |
| `number/numberSm` | 20px | 100% | 400 Regular | -3px |

---

## 8. Spacing

Map `gap`, `margin`, and `padding` properties directly to these tokens:

| Token | px | rem | MUI equivalent |
|:---|:---:|:---:|:---|
| `spacing/0` | 0px | 0rem | — |
| `spacing/25` | 1px | 0.0625rem | borders |
| `spacing/50` | 2px | 0.125rem | — |
| `spacing/100` | 4px | 0.25rem | `theme.spacing(0.5)` |
| `spacing/150` | 6px | 0.375rem | — |
| `spacing/200` | 8px | 0.5rem | `theme.spacing(1)` |
| `spacing/250` | 12px | 0.75rem | `theme.spacing(1.5)` |
| `spacing/300` | 16px | 1rem | `theme.spacing(2)` |
| `spacing/400` | 24px | 1.5rem | `theme.spacing(3)` |
| `spacing/500` | 32px | 2rem | `theme.spacing(4)` |
| `spacing/600` | 40px | 2.5rem | `theme.spacing(5)` |
| `spacing/700` | 48px | 3rem | `theme.spacing(6)` |
| `spacing/800` | 56px | 3.5rem | — |
| `spacing/900` | 64px | 4rem | `theme.spacing(8)` |
| `spacing/1000` | 72px | 4.5rem | — |
| `spacing/1100` | 80px | 5rem | — |
| `spacing/1200` | 88px | 5.5rem | — |
| `spacing/1300` | 96px | 6rem | — |

> [!TIP]
> **Figma Spacing Converter**: When converting visual spacings, snap to the nearest token if the difference is ≤ 2px. Otherwise, retain the exact value and document the mismatch.

---

## 9. Shape — Radius & Border Width

### 9.1 Border Radius

| Token | Value | Usage |
|:---|:---:|:---|
| `borderRadius/none` | 0px | No rounding |
| `borderRadius/xSmall` | **6px** | Chips, badges, compact buttons, inline tags, small icon wrappers |
| `borderRadius/Small` | **8px** | **Buttons (all variants)**, secondary nested cards, inner blocks |
| `borderRadius/Medium` | **12px** | Main cards, containers, panels, modals, default inputs |
| `borderRadius/Large` | **16px** | Large cards, prominent panels |
| `borderRadius/xLarge` | 24px | Oversized panels |
| `borderRadius/xxLarge` | 32px | Special large surfaces |
| `borderRadius/Pill` | **999px** | Capsule filters, tag badges, pill shapes |

> [!IMPORTANT]
> **Button Radius**: Per the Figma component spec, buttons use `borderRadius/Small` (8px). Use `borderRadius/xSmall` (6px) only for chips, badges, and compact inline controls.

### 9.2 Border Width
| Token | Value |
|:---|:---:|
| `borderWidth/None` | 0px |
| `borderWidth/Small` | 1px |
| `borderWidth/Medium` | 2px |
| `borderWidth/Large` | 4px |

---

## 10. Breakpoints

| Token | px | Alias |
|:---|:---:|:---|
| `xxSmall` | 360px | Very small devices |
| `xSmall` | 444px | Compact smartphones |
| `Small` | 600px | sm |
| `Medium` | 900px | md |
| `Large` | 1200px | lg |
| `xLarge` | 1536px | xl |
| `xxLarge` | 1920px | xxl |

---

## 11. Elevation & Shadows

Base shadow color: `rgba(0, 31, 155, α)`. Offset `x=0, y=0`.

| Level | Layer 1 | Layer 2 | Layer 3 |
|:---|:---|:---|:---|
| `elevation/1` | blur 2px / spread -2px @ 20% | blur 2px / 0px @ 14% | blur 6px / 0px @ 12% |
| `elevation/2` | blur 4px / spread -4px @ 20% | blur 4px / 0px @ 14% | blur 10px / 0px @ 12% |
| `elevation/3` | blur 6px / spread -4px @ 20% | blur 8px / 0px @ 14% | blur 16px / 0px @ 12% |
| `elevation/4` | blur 8px / spread -2px @ 20% | blur 10px / 0px @ 14% | blur 20px / 0px @ 12% |
| `elevation/5` | blur 10px / spread -2px @ 20% | blur 16px / 0px @ 14% | blur 28px / 0px @ 12% |

---

## 12. Code Aliases — Token → React/MUI Mapping

> [!IMPORTANT]
> Always use these code aliases when writing React/MUI `sx` props. Import from `../../workstation/theme`.

### 12.1 Color Token Mapping

| Design System Token | Code Alias | Value |
|:---|:---|:---|
| `brand/main` | `tokenBrand.main` | `#1F63EA` |
| `brand/light` | `tokenBrand.light` | `#3E83FF` |
| `brand/dark` | `tokenBrand.dark` | `#0042C5` |
| `brand/lightest` | `tokenBrand.lightest` | `#94D5FF` |
| `brand/contrastText` | `tokenBrand.contrast` | `#FFFFFF` |
| `brand/states/hover` | `tokenBrand.softBg` | `rgba(31,99,234,0.08)` |
| `brand/states/selected` | `tokenBrand.selectedBg` | `rgba(31,99,234,0.12)` |
| `error/main` | `tokenError.main` | `#F44336` |
| `error/dark` | `tokenError.dark` | `#E53935` |
| `error/lightest` | `tokenError.lightest` | `#FECDD2` |
| `warning/main` | `tokenWarning.main` | `#FF9800` |
| `warning/dark` | `tokenWarning.dark` | `#FB8C00` |
| `success/main` | `tokenSuccess.main` | `#66BB6A` |
| `success/dark` | `tokenSuccess.dark` | `#4CAF50` |
| `success/darker` | `tokenSuccess.darker` | `#43A047` |
| `info/main` | `tokenInfo.main` | `#03A9F4` |
| `neutral/main` | `tokenNeutral.main` | `#E9EDEF` |
| `neutral/dark` | `tokenNeutral.dark` | `#DBDDDF` |
| `neutral/lighter` | `tokenNeutral.lighter` | `#F0F2F4` |
| `neutral/lightest` | `tokenNeutral.lightest` | `#F8FAFC` |
| `text/primary` | `tokenText.primary` | `rgba(0,0,0,0.87)` |
| `text/secondary` | `tokenText.secondary` | `rgba(0,0,0,0.60)` |
| `text/disabled` | `tokenText.disabled` | `rgba(0,0,0,0.38)` |
| `divider` | `tokenDivider` | `rgba(0,0,0,0.12)` |
| `common/white` | `tokenCommon.white` | `#FFFFFF` |
| `common/black` | `tokenCommon.black` | `#000000` |

### 12.2 Shape Token Mapping

| Design System Token | Code Value |
|:---|:---|
| `borderRadius/xSmall` | `borderRadius: '6px'` |
| `borderRadius/Small` | `borderRadius: '8px'` |
| `borderRadius/Medium` | `borderRadius: '12px'` |
| `borderRadius/Large` | `borderRadius: '16px'` |
| `borderRadius/Pill` | `borderRadius: '999px'` |

### 12.3 Import Statement

```tsx
import {
  tokenBrand,
  tokenError,
  tokenWarning,
  tokenSuccess,
  tokenInfo,
  tokenNeutral,
  tokenText,
  tokenDivider,
  tokenCommon,
} from '../../workstation/theme';
```

---

## 13. Component Specifications

### 13.1 Buttons

**Variants:** contained, outlined, text | **Sizes:** small, medium, large
**Radius:** `borderRadius/Small` (8px)

| Variant | Background | Text | Border |
|:---|:---|:---|:---|
| contained (primary) | `brand/main` | `brand/contrastText` | none |
| outlined (primary) | transparent | `brand/main` | `brand/states/outlinedBorder` |
| text | transparent | `brand/main` | none |

```tsx
// Contained Button
<Button
  variant="contained"
  sx={{
    bgcolor: tokenBrand.main,
    color: '#FFFFFF',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '8px', // borderRadius/Small
    boxShadow: 'none',
    '&:hover': {
      bgcolor: tokenBrand.dark,
      boxShadow: 'none',
    },
  }}
>
  Create Work Order
</Button>

// Outlined Button
<Button
  variant="outlined"
  sx={{
    color: tokenBrand.main,
    borderColor: tokenBrand.main,
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '8px', // borderRadius/Small
    '&:hover': {
      borderColor: tokenBrand.dark,
      bgcolor: tokenBrand.softBg,
    },
  }}
>
  Cancel
</Button>
```

### 13.2 Cards (Paper)

| Property | Token |
|:---|:---|
| Background | `background/paper-elevation-0` (`#FFFFFF`) |
| Border | `1px solid divider` |
| Radius | `borderRadius/Medium` (12px) to `borderRadius/Large` (16px) |

### 13.3 Tabs

| State | Text | Indicator |
|:---|:---|:---|
| Active | `text/primary` + fontWeight 700 | `2px solid brand/main` |
| Inactive | `text/secondary` + fontWeight 500 | — |

```tsx
<Box
  sx={{
    py: 1.5, // spacing/250 (12px)
    cursor: 'pointer',
    borderBottom: isActive ? `2px solid ${tokenBrand.main}` : '2px solid transparent',
    color: isActive ? tokenText.primary : tokenText.secondary,
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.875rem',
    letterSpacing: '0.1px',
    textTransform: 'uppercase',
    transition: 'all 0.2s ease',
    '&:hover': { color: tokenBrand.main },
  }}
>
  {label}
</Box>
```

### 13.4 Chips / Filters

| State | Background | Text |
|:---|:---|:---|
| Active | `brand/main` | `#FFFFFF` |
| Inactive | `neutral/light` | `text/primary` |

Radius: `borderRadius/Pill` (999px) | Text: `chip/labelMd` (13px, Regular)

### 13.5 Alert

| Severity | Token |
|:---|:---|
| Error | `error/main` |
| Warning | `warning/main` |
| Info | `info/main` |
| Success | `success/main` |

### 13.6 Input

| State | Border | Label |
|:---|:---|:---|
| Default | `divider` | `text/secondary` |
| Focused | `brand/main` | `brand/main` |
| Error | `error/main` | `error/main` |
| Disabled | `action/disabledBackground` | `text/disabled` |

### 13.7 Kanban Board

| Element | Value |
|:---|:---|
| Lane standalone | 370px |
| Sub-lane | 280px |
| Sub-lane bg | `background/paper-elevation-0` |
| Container parent | `background/background` |

Risk indicators (text-only): Downtime `#DC2626` / Quality `#EA580C` / EHS `#16A34A` / None `#6A6D70`

---

## 14. Layout Composition Patterns

### 14.1 Page Layout
- Background: `background/background` (`#F6F9FE`)
- Container: `background/paper-elevation-0` + `1px solid divider` + `borderRadius/Large`
- Page Header: title + global actions only. Tabs always **inside** the card.

### 14.2 Card Structure
```
[Card — white, borderRadius/Large]
  ├── [Header — white, padding top/horizontal]
  │     ├── Sub-header / context
  │     └── Navigation tabs
  ├── [Divider: 1px solid divider]
  └── [Content — padding: 16px]
```

### 14.3 Text Hierarchy

| Level | Style | Weight | Size |
|:---|:---|:---:|:---:|
| Page Title | `typography/h5` | 700 Bold | 24px |
| Section Header | `typography/h6` | 700 Bold | 20px |
| Card Title | `typography/subtitle2` | 500 Medium | 14px |
| Body | `typography/body2` | 400 Regular | 14px |
| Label / Tag | `typography/caption` | 700 Bold | 12px |

### 14.4 AI Insights Panel (BLU.AI)

| Property | Value |
|:---|:---|
| Background | `neutral/lightest` (`#FBFCFC`) |
| Radius | `borderRadius/Medium` (12px) |
| Border | none |
| Highlighted card | `rgba(0,0,0,0.03)` + `1px solid divider` |
| Error icon | `error/main` |
| Info icon | `brand/main` |

```tsx
function AssistantPanel({ insights, onAction }: {
  insights: InsightItem[];
  onAction?: (cardId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: '12px', // borderRadius/Medium
        bgcolor: tokenNeutral.lightest,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: expanded ? 2 : 0, px: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SparkleIcon sx={{ fontSize: 16, color: '#F97316' }} />
          <Typography sx={{ color: tokenBrand.main, fontSize: '0.875rem', fontWeight: 700 }}>
            BLU.AI analysis
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={() => setExpanded((c) => !c)}
          sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </Box>

      {/* Insights List */}
      {expanded && insights.map((item, i) => {
        const isHighlighted = i === 0;
        return (
          <Box
            key={item.title}
            sx={{
              px: isHighlighted ? 2 : 1,
              py: isHighlighted ? 1.5 : 0.5,
              borderRadius: '6px', // borderRadius/xSmall
              border: isHighlighted ? `1px solid ${tokenDivider}` : '1px solid transparent',
              bgcolor: isHighlighted ? 'rgba(0,0,0,0.03)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {/* Icon — adjacent to text, NO wrapper */}
            {item.severity === 'high' ? (
              <WarningAmberIcon sx={{ fontSize: 16, color: tokenError.main }} />
            ) : (
              <InfoOutlinedIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
            )}
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, flex: 1 }}>
              <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>{item.title}</Box>
              {' '}- {item.detail}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
```

---

## 15. Screen-Specific Styling: Equipment Ledger

### 15.1 Visual Hierarchy
- **Page Header**: Full width on `tokenNeutral.lighter`. Title uses `Typography variant="h5"` with `fontWeight: 700`, `lineHeight: 1.334`. Clean header — no badges above, no descriptions below. Right-aligned action buttons allowed.
- **Main Container**: Unified `<Paper>` with white surface, `borderRadius: '12px'`, and `1px solid ${tokenDivider}`.
- **Card Header**: White block housing asset context and navigation tabs, divided from content by `1px solid ${tokenDivider}`.
- **Navigation**: Text-based uppercase tabs with active accent underline (`2px solid brand/main`).
- **Filters**: Capsule pills (`borderRadius: '999px'`). Active = brand blue; inactive = light grey.
- **Timeline Events**: White cards with `12px` rounded corners and `1px` borders, plus a `6px` wide colored left border strip.
- **AI Insights**: Standard brand blue tokens — never use green.

### 15.2 Token Map

| Element | Token | Value |
|:---|:---|:---|
| Page background | `neutral/lighter` | `#F5F7F8` |
| Card background | `common/white` | `#FFFFFF` |
| Divider border | `divider` | `rgba(0,0,0,0.12)` |
| Primary accent | `brand/main` | `#1F63EA` |
| Hover accent | `brand/dark` | `#0042C5` |
| Error red | `error/main` | `#F44336` |
| Text primary | `text/primary` | `rgba(0,0,0,0.87)` |
| Text secondary | `text/secondary` | `rgba(0,0,0,0.60)` |
| Text muted | `text/disabled` | `rgba(0,0,0,0.38)` |
| Inactive pill | `neutral/lighter` | `#F0F2F4` |

### 15.3 Code Audit Checklist
1. Remove sidebar splitters. Main container card must be full-width.
2. No navigation tabs in the header title row.
3. Replace heavy grey controls with clean borderless text tabs.
4. Remove central bullet lines; render cards with left severity-coded strips (`width: 6`).
5. Replace green success indicators with standard blue theme tokens.

---

## 16. Screen-Specific Styling: Maintenance Follow Up Board

### 16.1 Board Layout
- Lane widths: All lanes (including Planning, Scheduled, In Progress) are uniform standalone lanes with a fixed width of `370px` (minWidth: `370px`). No sub-lanes or nested grouping backdrops are used, ensuring even card sizes and proper dark mode rendering.
- Backgrounds: All lanes use `activeTheme.backgroundDefault` for their background color, adapting natively to dark mode.
- Headers: Title text left-aligned with a clean `tokenText.primary` color (no blue highlight/active highlights), card counts right-aligned, and `userSelect: 'none'` applied to prevent browser text selection highlights.

### 16.2 Search & Filters
- Search icon: **`endAdornment`** (right side), not startAdornment.
- Label: floating `"Search"`, not a static placeholder.
- Priority legends: only in List views, not on the board toolbar.

### 16.3 Kanban Card Details
- Risk indicators: colored text-only symbols (`#DC2626`, `#EA580C`, `#16A34A`, `#6A6D70`), not solid badges.
- Assignees row: no dividing `border-top`.
- Date labels: clean values beside calendar icon, no `"Due "` prefix.

### 16.4 AI Insights Panel Rules
- Container: light grey `tokenNeutral.lightest` with `12px` radius. No bold borders.
- Highlighted alert: `bgcolor: 'rgba(0,0,0,0.03)'` with `1px solid ${tokenDivider}` and red warning icon.
- Icons: placed adjacent to text, **no circular background wraps**.

### 16.5 Dark Mode Container Guidelines (All Pages)
- **Avoid Hardcoded Colors**: Never use `#FFFFFF` or other hardcoded light/dark colors for container backgrounds or borders.
- **Use Theme Selectors**: Use standard MUI background selectors such as `'background.default'` (for page backgrounds) and `'background.paper'` (for container/Paper backgrounds). This ensures components automatically resolve to the correct color in both light and dark modes natively.

---

*Generated from direct inspection of the Figma Design System file and codebase theme tokens. Review after any Design System updates.*
