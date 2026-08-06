# Dark Mode Contrast Audit and Token Recommendations

**Screen reviewed:** Maintenance Technician / Autoguard Shielded IV Catheter / Line 10  
**Token file reviewed:** `Dark.tokens.json`  
**Goal:** Identify contrast problems visible in the provided dark-mode screen and recommend token-level fixes that can be applied across the product.

---

## 1. Executive summary

The screen is visually strong and the hierarchy is clear at a dashboard level, but several contrast risks appear in dense operational areas: work-order cards, badge labels, filters, small metadata rows, and semantic status indicators.

The biggest issue is not the base dark palette. The core dark surfaces are usable. The problems come from using medium-intensity semantic colors as small text, using low-opacity borders/dividers, and placing colored text on mid-level elevated surfaces such as `background.paper-elevation-3` and `background.paper-elevation-4`.

For this type of maintenance dashboard, the interface must support quick scanning under pressure. Contrast should be optimized for small labels, status chips, and alarm states, not only for large headings.

---

## 2. Standards used for the review

Use WCAG contrast targets as the baseline:

| Content type | Minimum target | Recommended target for this screen |
|---|---:|---:|
| Normal text under 18px | 4.5:1 | 5.0:1 or higher |
| Large/bold text | 3.0:1 | 4.5:1 |
| Icons, borders, controls, focus indicators | 3.0:1 | 3.5:1 or higher |
| Critical operational alerts | 4.5:1 | 5.5:1 or higher |

Because this UI has many small labels, metadata values, badges, and operational statuses, the safer design target is **5.0:1+ for small text**.

---

## 3. Main contrast problems found in the screen

### 3.1 Small blue labels are too low contrast on elevated cards

Examples visible in the screen:

- `Line 10` in the header.
- Work order IDs such as `WO 606034603`.
- Small action buttons such as `Review schedule`, `Complete WO...`, and `Open My Work Orders`.
- Blue pill labels and links inside dense rows.

The current `brand.main` token is `#3E83FF`. It works on the darkest background, but becomes weak on elevated surfaces.

| Token | Background | Contrast | Result |
|---|---|---:|---|
| `brand.main` `#3E83FF` | `paper-elevation-2` `#1F2937` | 4.12:1 | Fails normal text |
| `brand.main` `#3E83FF` | `paper-elevation-3` `#2F3945` | 3.29:1 | Fails normal text |
| `brand.main` `#3E83FF` | `paper-elevation-4` `#3C4652` | 2.69:1 | Fails normal text |

**Recommendation**

For text links, IDs, and small blue chips on dark cards, use `brand.lighter` instead of `brand.main`.

| Recommended token | Hex | Contrast on `paper-elevation-3` | Contrast on `paper-elevation-4` |
|---|---:|---:|---:|
| `brand.lighter` | `#76B9FF` | 5.67:1 | 4.64:1 |
| `brand.lightest` | `#CDEBFF` | 9.44:1 | 7.73:1 |

Use `brand.lighter` for normal links and `brand.lightest` only for very small text, selected states, or critical blue call-to-action text.

Suggested token additions:

```json
{
  "text": {
    "link": { "$value": "{brand.lighter}" },
    "linkHover": { "$value": "{brand.lightest}" }
  }
}
```

---

### 3.2 Error/red text fails on several dark card surfaces

Examples visible in the screen:

- `Overdue Jan 13`
- `Stopped / Internal`
- `Missing Parts`
- Red status pills and red outlined cards
- Critical equipment state text

Current red tokens work as large visual accents, but not as small text on cards.

| Token | Background | Contrast | Result |
|---|---|---:|---|
| `error.main` `#EF5350` | `paper-elevation-2` `#1F2937` | 4.21:1 | Fails normal text |
| `error.main` `#EF5350` | `paper-elevation-3` `#2F3945` | 3.36:1 | Fails normal text |
| `error.main` `#EF5350` | `paper-elevation-4` `#3C4652` | 2.75:1 | Fails normal text |
| `error.darker` `#E53935` | `paper-elevation-3` `#2F3945` | 2.77:1 | Fails normal text |

**Recommendation**

Use `error.lighter` for small error text in dark mode. Keep `error.main` or `error.darker` for borders, icons, and fills only.

| Recommended token | Hex | Contrast on `paper-elevation-3` | Contrast on `paper-elevation-4` |
|---|---:|---:|---:|
| `error.light` | `#E57373` | 3.92:1 | 3.21:1 |
| `error.lighter` | `#EF9A9A` | 5.45:1 | 4.46:1 |

`error.lighter` is the best current token for small red text. On `paper-elevation-4`, it is still slightly below 4.5:1, so avoid placing small red text directly on `paper-elevation-4`, or create a stronger text-specific token.

Suggested token additions:

```json
{
  "statusText": {
    "negative": { "$value": "{error.lighter}" },
    "negativeStrong": { "$value": "#FFB4B4" }
  }
}
```

---

### 3.3 White text on colored fills fails for several semantic colors

Several badge patterns appear to use colored backgrounds with white text. This is risky because white text does not contrast enough on many of the current semantic `main` tokens.

| Background token | Hex | White text contrast | Result |
|---|---:|---:|---|
| `brand.main` | `#3E83FF` | 3.56:1 | Fails normal text |
| `error.main` | `#EF5350` | 3.49:1 | Fails normal text |
| `warning.main` | `#FFA726` | 1.94:1 | Fails |
| `success.main` | `#81C784` | 2.01:1 | Fails |
| `info.main` | `#29B6F6` | 2.30:1 | Fails |
| `accent.main` | `#F67450` | 2.79:1 | Fails |

**Recommendation**

Do not use white text on `main` semantic fills in dark mode. Use one of these patterns instead:

1. **Soft fill + light semantic text** for status chips.
2. **Dark fill + white text** for high-emphasis buttons.
3. **Light fill + black text** for warning, success, and info labels.

Suggested mapping:

| Component type | Background | Text | Notes |
|---|---|---|---|
| Primary filled button | `brand.darker` `#0042C5` | `text.primary` | White contrast is 8.12:1 |
| Primary link/chip text | transparent or soft blue fill | `brand.lighter` | Better for small text |
| Error filled badge | `error.darkest` or custom dark red | `text.primary` | Avoid `error.main` + white |
| Warning filled badge | `warning.main` | `common.black_states.main` | Black contrast is 10.81:1 |
| Success filled badge | `success.main` | `common.black_states.main` | Black contrast is 10.44:1 |
| Info filled badge | `info.main` | `common.black_states.main` | Black contrast is 9.12:1 |

---

### 3.4 Borders and dividers are too subtle for dense cards

The dashboard uses many nested panels and row cards. Current borders are subtle, which creates a premium dark look, but the density makes scanning harder.

Current tokens:

| Token | Value | Risk |
|---|---|---|
| `divider` | white at 12% alpha | Too weak between nested surfaces |
| `elevation.outlined` | white at 10% alpha | Too weak for card boundaries |
| `_components.input.outlined.enabledBorder` | white at 23% alpha | Better, but still weak for small controls |

Visible areas affected:

- Separation between work-order rows.
- Card boundaries inside `My Work Orders` and `Maintenance Backlog`.
- Filters in the top-right header.
- Scrollable table sections.
- Pill/chip outlines.

**Recommendation**

Add stronger dark-mode border tokens with different strengths instead of reusing the same subtle divider everywhere.

```json
{
  "border": {
    "subtle": { "$value": "rgba(255,255,255,0.12)" },
    "default": { "$value": "rgba(255,255,255,0.18)" },
    "strong": { "$value": "rgba(255,255,255,0.28)" },
    "interactive": { "$value": "rgba(118,185,255,0.65)" },
    "focus": { "$value": "{brand.lightest}" }
  }
}
```

Use `border.default` for cards, `border.strong` for input/filter controls, and `border.focus` for keyboard focus.

---

### 3.5 Disabled and secondary text may be overused

The token `text.disabled` is white at 38% alpha. It produces low contrast on every background level and should not be used for operational metadata unless the item is truly disabled.

| Token | Background | Contrast |
|---|---|---:|
| `text.disabled` | `paper-elevation-1` | 3.56:1 |
| `text.disabled` | `paper-elevation-2` | 3.41:1 |
| `text.disabled` | `paper-elevation-3` | 3.11:1 |
| `text.disabled` | `paper-elevation-4` | 2.84:1 |

**Recommendation**

Use three text roles instead of relying on disabled opacity:

```json
{
  "text": {
    "primary": { "$value": "#FFFFFF" },
    "secondary": { "$value": "rgba(255,255,255,0.78)" },
    "tertiary": { "$value": "rgba(255,255,255,0.62)" },
    "disabled": { "$value": "rgba(255,255,255,0.42)" }
  }
}
```

Guidance:

- Use `text.secondary` for dates, locations, labels, and metadata.
- Use `text.tertiary` only for helper text and non-critical metadata.
- Use `text.disabled` only when an action is unavailable.

---

### 3.6 Chart axis and grid tokens are too low for labels and structure

The current chart and grid colors are too low contrast when used on elevated panels.

| Token | Background | Contrast | Risk |
|---|---|---:|---|
| `chart.axis` `#808285` | `paper-elevation-3` | 3.04:1 | Borderline for non-text UI |
| `chart.axis` `#808285` | `paper-elevation-4` | 2.49:1 | Fails non-text UI |
| `chart.grid` `#626465` | `paper-elevation-3` | 1.97:1 | Too low |
| `chart.grid` `#626465` | `paper-elevation-4` | 1.61:1 | Too low |

**Recommendation**

For dashboard charts or small KPI visuals:

```json
{
  "chart": {
    "axis": { "$value": "#A9B4C0" },
    "grid": { "$value": "rgba(255,255,255,0.18)" },
    "label": { "$value": "rgba(255,255,255,0.78)" }
  }
}
```

Keep grid lines subtle, but do not make axis lines and tick labels as low as decorative dividers.

---

## 4. Component-specific recommendations

### Header

**Problem:** The `Line 10` blue text and edit icon are small and compete with the large white product title.

**Fix:**

- Use `brand.lighter` for `Line 10`.
- Use a stronger circular icon affordance with `border.interactive`.
- Keep the header title white and the role label in `text.secondary`.

---

### BLU.AI Insights panel

**Problem:** The insight text is small, long, and uses low-emphasis text. Action buttons are very small blue pills.

**Fix:**

- Increase body text from ~12px to at least 13px.
- Use `text.secondary` at 78% opacity rather than lower-opacity text.
- Use `brand.lighter` for action text.
- Give the actions a minimum chip height of 28px.
- Use stronger icon colors for warning/error/neutral severity.

---

### Work order cards

**Problem:** Work-order rows contain many small semantic labels, colored IDs, asset names, due dates, and icons. Some of these use color alone to communicate state.

**Fix:**

- Use light semantic text tokens: `statusText.negative`, `statusText.caution`, `statusText.positive`, and `statusText.info`.
- Add a clear left severity stripe with at least 3px width.
- Use a background tint plus text label, not colored text alone.
- Avoid red text smaller than 12px.
- Increase row vertical spacing by 4px where possible.

Recommended chip pattern:

```css
.status-chip--negative {
  color: #FFB4B4;
  background: rgba(244, 67, 54, 0.14);
  border: 1px solid rgba(244, 67, 54, 0.55);
}

.status-chip--warning {
  color: #FFD28A;
  background: rgba(255, 167, 38, 0.14);
  border: 1px solid rgba(255, 167, 38, 0.55);
}

.status-chip--info {
  color: #76B9FF;
  background: rgba(62, 131, 255, 0.14);
  border: 1px solid rgba(118, 185, 255, 0.55);
}
```

---

### Maintenance Backlog and Spare Parts Monitor

**Problem:** The summary metric cards use colored borders and tinted fills, but some labels are small and low contrast. Red/yellow cards are visually similar in weight, which can reduce priority clarity.

**Fix:**

- Make the number the strongest element, but use accessible semantic text colors.
- Use different severity structure, not only different hue:
  - Error: red left rail + stronger border.
  - Warning: amber left rail + dashed or standard border.
  - Info/planning: blue left rail.
- Keep card background consistent and apply severity as an accent, not as the entire surface.

---

### Equipment Status section

**Problem:** Table-like data uses small labels and status text. Downtime pills are readable but the surrounding metadata is less readable.

**Fix:**

- Use `text.secondary` for table labels and values.
- Use `statusText.negativeStrong` for downtime values.
- Increase row divider contrast to `border.default`.
- Avoid placing important equipment status in `text.disabled` or low-opacity gray.

---

### Top-right filters

**Problem:** Filter borders are visible but could be stronger for interactive affordance.

**Fix:**

- Use `border.interactive` for the outline.
- Use `brand.lighter` for the small filter labels.
- Increase selected value contrast using `text.primary`.
- Ensure hover/focus states are visible with a 2px focus ring.

---

## 5. Recommended dark-mode semantic token layer

Add a semantic layer specifically for text-on-dark and badge-on-dark. This avoids using the same `main` color for backgrounds, borders, icons, and text.

```json
{
  "statusText": {
    "info": { "$value": "#76B9FF" },
    "positive": { "$value": "#A5D6A7" },
    "caution": { "$value": "#FFD28A" },
    "negative": { "$value": "#FFB4B4" }
  },
  "statusBg": {
    "info": { "$value": "rgba(62, 131, 255, 0.14)" },
    "positive": { "$value": "rgba(129, 199, 132, 0.14)" },
    "caution": { "$value": "rgba(255, 167, 38, 0.14)" },
    "negative": { "$value": "rgba(239, 83, 80, 0.14)" }
  },
  "statusBorder": {
    "info": { "$value": "rgba(118, 185, 255, 0.55)" },
    "positive": { "$value": "rgba(165, 214, 167, 0.55)" },
    "caution": { "$value": "rgba(255, 210, 138, 0.55)" },
    "negative": { "$value": "rgba(255, 180, 180, 0.55)" }
  }
}
```

---

## 6. Recommended immediate fixes

### Priority 1: Fix small semantic text

Replace these usages in dense cards:

| Current usage | Replace with |
|---|---|
| `brand.main` for small text | `brand.lighter` |
| `error.main` for small text | `error.lighter` or `#FFB4B4` |
| `success.darker` for small text | `success.light` |
| `info.main` on elevated cards | `info.light` |
| `text.disabled` for metadata | `text.secondary` or `text.tertiary` |

### Priority 2: Fix filled badges

Do not use white text on `brand.main`, `error.main`, `warning.main`, `success.main`, `info.main`, or `accent.main` fills.

Use:

- Darker background + white text, or
- Light/bright background + black text, or
- Soft transparent background + light semantic text.

### Priority 3: Improve borders and row separation

Increase border visibility for nested cards and controls:

- Default card border: white 18% alpha.
- Interactive control border: blue 65% alpha.
- Focus ring: `brand.lightest` with 2px width.

### Priority 4: Increase tiny text size

The screen has several labels that appear around 10-11px. For this dashboard:

- Minimum metadata text: 12px.
- Recommended metadata text: 13px.
- Minimum chip height: 24px.
- Recommended action chip height: 28px.

---

## 7. Practical implementation checklist

- [ ] Create `statusText`, `statusBg`, and `statusBorder` tokens for dark mode.
- [ ] Replace `brand.main` text links on cards with `brand.lighter`.
- [ ] Replace red small text with `error.lighter` or `statusText.negative`.
- [ ] Stop using white text on semantic `main` fills.
- [ ] Add `border.default`, `border.strong`, `border.interactive`, and `border.focus` tokens.
- [ ] Audit any use of `text.disabled`; keep it only for disabled states.
- [ ] Raise metadata text opacity to 78% where the information is operationally relevant.
- [ ] Use icons plus text for severity, not color alone.
- [ ] Test the screen in normal, hover, focus, selected, disabled, and high-density states.

---

## 8. Suggested revised token patch

```json
{
  "text": {
    "secondary": {
      "$type": "color",
      "$value": "rgba(255,255,255,0.78)"
    },
    "tertiary": {
      "$type": "color",
      "$value": "rgba(255,255,255,0.62)"
    },
    "link": {
      "$type": "color",
      "$value": "{brand.lighter}"
    },
    "linkHover": {
      "$type": "color",
      "$value": "{brand.lightest}"
    }
  },
  "border": {
    "subtle": {
      "$type": "color",
      "$value": "rgba(255,255,255,0.12)"
    },
    "default": {
      "$type": "color",
      "$value": "rgba(255,255,255,0.18)"
    },
    "strong": {
      "$type": "color",
      "$value": "rgba(255,255,255,0.28)"
    },
    "interactive": {
      "$type": "color",
      "$value": "rgba(118,185,255,0.65)"
    },
    "focus": {
      "$type": "color",
      "$value": "{brand.lightest}"
    }
  },
  "statusText": {
    "info": {
      "$type": "color",
      "$value": "#76B9FF"
    },
    "positive": {
      "$type": "color",
      "$value": "#A5D6A7"
    },
    "caution": {
      "$type": "color",
      "$value": "#FFD28A"
    },
    "negative": {
      "$type": "color",
      "$value": "#FFB4B4"
    }
  },
  "statusBg": {
    "info": {
      "$type": "color",
      "$value": "rgba(62,131,255,0.14)"
    },
    "positive": {
      "$type": "color",
      "$value": "rgba(129,199,132,0.14)"
    },
    "caution": {
      "$type": "color",
      "$value": "rgba(255,167,38,0.14)"
    },
    "negative": {
      "$type": "color",
      "$value": "rgba(239,83,80,0.14)"
    }
  },
  "statusBorder": {
    "info": {
      "$type": "color",
      "$value": "rgba(118,185,255,0.55)"
    },
    "positive": {
      "$type": "color",
      "$value": "rgba(165,214,167,0.55)"
    },
    "caution": {
      "$type": "color",
      "$value": "rgba(255,210,138,0.55)"
    },
    "negative": {
      "$type": "color",
      "$value": "rgba(255,180,180,0.55)"
    }
  },
  "chart": {
    "axis": {
      "$type": "color",
      "$value": "#A9B4C0"
    },
    "grid": {
      "$type": "color",
      "$value": "rgba(255,255,255,0.18)"
    },
    "label": {
      "$type": "color",
      "$value": "rgba(255,255,255,0.78)"
    }
  }
}
```

---

## 9. Final design direction

Keep the current dark foundation, but separate color roles more clearly:

- `main` colors should not be used for every purpose.
- Small text needs dedicated light semantic tokens.
- Filled badges need explicit contrast text tokens.
- Dense dashboards need stronger borders than marketing-style dark UI.
- Critical states must use more than color: icon, label, left rail, border, and readable text.

The fastest improvement is to replace small `brand.main` and `error.main` text with lighter text-specific tokens, then introduce a formal badge/status token layer.
