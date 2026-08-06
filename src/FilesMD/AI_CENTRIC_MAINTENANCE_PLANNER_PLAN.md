# 🧠 AI-Centric Maintenance Planner — Transformation Plan

> **Goal**: Transform `MaintenancePlannerPage.tsx` from a traditional calendar-based planner into a next-generation **AI-Centric Autonomous Planning Tool** that gives plant planners AI-powered insights, auto-generated plans, multi-plan comparison, and multi-horizon (week → month → quarter → year) cascading optimization.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Market Research & Competitive Landscape](#2-market-research--competitive-landscape)
3. [Vision & Architecture Overview](#3-vision--architecture-overview)
4. [Multi-Horizon Cascading Framework](#4-multi-horizon-cascading-framework)
5. [Feature 1: AI Plan Generation & Preview](#5-feature-1-ai-plan-generation--preview)
6. [Feature 2: Multi-Plan Comparison & Trade-offs](#6-feature-2-multi-plan-comparison--trade-offs)
7. [Feature 3: AI Assistant Upgrade — Context-Aware Copilot](#7-feature-3-ai-assistant-upgrade--context-aware-copilot)
8. [Feature 4: Multi-Agent Specialized Intelligence](#8-feature-4-multi-agent-specialized-intelligence)
9. [Feature 5: Constraint & Feasibility Engine](#9-feature-5-constraint--feasibility-engine)
10. [Feature 6: Risk Reduction & Explainability Layer](#10-feature-6-risk-reduction--explainability-layer)
11. [Feature 7: Cascading Impact Propagation Engine](#11-feature-7-cascading-impact-propagation-engine)
12. [Feature 8: Coverage Heatmap & Skills Gap Visualization](#12-feature-8-coverage-heatmap--skills-gap-visualization)
13. [Feature 9: Approval Workflow & Role-Based Sign-off](#13-feature-9-approval-workflow--role-based-sign-off)
14. [Feature 10: Bundled Maintenance Packages](#14-feature-10-bundled-maintenance-packages)
15. [Implementation Phases](#15-implementation-phases)
16. [Component Architecture](#16-component-architecture)
17. [Data Model Extensions](#17-data-model-extensions)
18. [UX/UI Design Principles](#18-uxui-design-principles)

---

## 1. Current State Analysis

### What Exists Today (7,643 lines)

The current `MaintenancePlannerPage.tsx` is a **monolithic, calendar-focused planner** with these capabilities:

| Capability | Status | Component |
|---|---|---|
| **Weekly Calendar View** | ✅ Fully built | `WeeklyCalendarBoard` — Drag-and-drop cards on a 7-day × Day/Night shift grid |
| **Monthly Calendar View** | ✅ Fully built | `MonthCalendarBoard` — 6-week grid with aggregate badges |
| **Quarterly Gantt View** | ✅ Fully built | `GanttBoard` — 3-month timeline per asset group |
| **Annual PM Plan View** | ✅ Fully built | `AnnualCalendarBoard` — 12-month × weekday matrix per equipment |
| **Planning Queue (Backlog)** | ✅ Basic | `PlanningPanel` — Flat list of 8 static WOs with Preventive/Corrective filters |
| **AI Assistant Panel** | ✅ Copilot slice | `PlannerAiCopilotPanel` — collapsible tabbed copilot (chat / signals / actions) |
| **Drag-and-Drop Scheduling** | ✅ Functional | Work order cards + technician badge DnD with shift/day targeting |
| **Reschedule Modal** | ✅ Rich | `CalendarRescheduleDialog` — PM compliance, floating/fixed schedule, reason tracking |
| **Staff Workload Panel** | ✅ Functional | `CalendarOperationsSummary` — Per-day staff load bars with DnD assignment |
| **Technician Assignment** | ✅ Rich | `AdditionalAssigneesDialog` + `CalendarAssignTechnicianDialog` — AI recommendation badges |
| **Filter System** | ✅ Complete | `PlannerFilterPanel` — Type, Priority, Criticality, Area, Assigned To, Asset Hierarchy |
| **Surface Switcher** | ✅ Complete | `PlannerSurfaceSwitcher` — Weekly / Monthly / Quarterly / Annual tab bar |
| **Preventive Schedule Logic** | ✅ Complex | Floating vs Fixed window calculation, PM compliance extension detection |

### What's Missing (The AI Gap)

| Missing Capability | Impact | Jul 2026 status |
|---|---|---|
| **AI Plan Generation** | No ability to auto-generate optimized schedules | ✅ Mock weekly strategies |
| **Multi-Plan Comparison** | No side-by-side plan evaluation | ✅ Compare dialog |
| **Cascading Impact Analysis** | Week ↔ Month ↔ Year changes don't propagate | ⚠️ Weekly apply + horizon badges/overlays |
| **Multi-Agent Orchestration** | No specialized agents (Safety, Spare Parts, Labor) | ✅ Mock orchestrator |
| **Constraint Validation Engine** | PM compliance checks are per-card, not system-wide | ⚠️ Feasibility checklist in preview |
| **Risk Quantification** | No numeric risk scores or before/after comparisons | ✅ Impact metrics in preview |
| **Approval Workflow** | No role-based sign-off chain | ✅ Interactive mock approvals |
| **Skills Coverage Heatmap** | No visualization of technician capability gaps | ✅ Shift-aware heatmap in status strip |
| **Natural Language Reasoning** | AI assistant is read-only static list, not interactive | ✅ Copilot + explainer panels |
| **Bundled Maintenance Packages** | No grouping of work by shared constraints (LOTO, crew, zone) | ✅ In preview/cascade |
| **Client-grade layout** | Copilot overwhelms calendar | ✅ Side drawer + compact command bar |
| **Readiness tooltip on cards** | No per-WO readiness breakdown on grid | ✅ `plannerWoReadiness.ts` + tooltip chip |

### Code Architecture Notes

- **Single file (7,643 lines)**: The entire planner lives in one TSX file. Before major AI features are added, the file should be decomposed into sub-components.
- **Static mock data**: All work orders, calendar cards, technician data, and AI alerts are hardcoded constants. The AI layer will need to generate these dynamically.
- **4 surface modes** already exist (`calendar`, `monthly`, `gantt`, `annual`) — the AI layer should operate across all of them.
- **Theme system** is mature (design tokens, brand colors, dark mode support) — AI components should follow the same pattern.
- **Drag-and-drop primitives** are already implemented — AI suggestions should integrate with the existing DnD system.

---

## 2. Market Research & Competitive Landscape

### Industry Trends (2025-2026)

| Trend | Description | Relevance |
|---|---|---|
| **Predictive → Prescriptive AI** | Systems now tell operators *what to do*, not just *what might fail*. Explainable AI (XAI) traces recommendations back to specific data points. | Core to our AI Plan Generation feature |
| **Multi-Agent Frameworks** | Specialized agents (Planning Agent, Solution Finder, Execution Agent) collaborate via orchestrator patterns (LangGraph, CrewAI). | Core to our Multi-Agent Architecture |
| **Rolling Horizon Scheduling** | Schedules are continuously re-evaluated as real-time sensor data provides updated Remaining Useful Life (RUL) estimates. | Core to our Cascading Impact Engine |
| **Human-in-the-Loop Controls** | Interfaces where humans approve, reject, or modify agent-generated plans — critical for safety-critical environments. | Core to our Approval Workflow |
| **Digital Twins for Simulation** | Organizations simulate failure modes and validate maintenance schedules before real-world execution. | Future enhancement for Plan Comparison |
| **Edge Analytics** | Diagnostic models run locally for near-instant response on critical failures. | Integration opportunity |
| **Generative AI for Documentation** | AI drafts SOPs, summarizes technician notes, extracts instructions from machine manuals. | Enhancement for Work Order drafting |

### Benchmark: What Leading Tools Do

| Feature | IBM Maximo | SAP PM | Limble CMMS | UptimeAI | **Our Target** |
|---|---|---|---|---|---|
| AI Plan Generation | ⚠️ Rules-based | ⚠️ Rules-based | ✅ Basic ML | ✅ Advanced | ✅ **Multi-agent with confidence scores** |
| Multi-Plan Comparison | ❌ | ❌ | ❌ | ⚠️ Single | ✅ **Side-by-side with trade-off matrix** |
| Cascading Horizons | ⚠️ Manual | ⚠️ Manual | ❌ | ⚠️ Partial | ✅ **Auto-propagation week↔month↔year** |
| Explainable AI | ❌ | ❌ | ❌ | ✅ | ✅ **Natural language reasoning per decision** |
| Skills Heatmap | ❌ | ⚠️ Basic | ❌ | ❌ | ✅ **Interactive coverage visualization** |
| Bundled Maintenance | ⚠️ Manual grouping | ⚠️ Manual | ❌ | ❌ | ✅ **AI-auto-grouped by LOTO/crew/zone** |

---

## 3. Vision & Architecture Overview

### The AI Planner Paradigm

```
┌─────────────────────────────────────────────────────────────────┐
│                    HUMAN PLANNER INTERFACE                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Weekly   │ │ Monthly  │ │Quarterly │ │  Annual  │          │
│  │ Calendar  │ │ Calendar │ │  Gantt   │ │  PM Plan │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │             │            │             │                 │
│  ┌────┴─────────────┴────────────┴─────────────┴──────────┐    │
│  │          AI COPILOT LAYER (Context-Aware Bar)           │    │
│  │   [Generate Plan] [Compare Plans] [Explain Risks]       │    │
│  └────┬─────────────┬────────────┬─────────────┬──────────┘    │
│       │             │            │             │                 │
│  ┌────┴─────────────┴────────────┴─────────────┴──────────┐    │
│  │              CASCADING IMPACT ENGINE                     │    │
│  │   Week ←→ Month ←→ Quarter ←→ Year propagation          │    │
│  └────┬─────────────┬────────────┬─────────────┬──────────┘    │
│       │             │            │             │                 │
│  ┌────┴────┐  ┌─────┴────┐ ┌────┴────┐  ┌─────┴────┐         │
│  │ Safety  │  │  Spare   │ │  Labor  │  │Production│         │
│  │ Agent   │  │  Parts   │ │  Agent  │  │  Agent   │         │
│  │         │  │  Agent   │ │         │  │          │         │
│  └─────────┘  └──────────┘ └─────────┘  └──────────┘         │
│       │             │            │             │                 │
│  ┌────┴─────────────┴────────────┴─────────────┴──────────┐    │
│  │           CONSTRAINT & FEASIBILITY ENGINE                │    │
│  │  Labor Availability | Spare Parts | QA Holds | Safety    │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Multi-Horizon Cascading Framework

### The Core Insight: Planning Happens in Different Time Boxes, But Each Impacts the Others

```
                      ┌─────────────────────────┐
                      │       ANNUAL PLAN        │
                      │  Budget, Turnarounds,    │
                      │  Major Overhauls,        │
                      │  Vendor Contracts        │
                      │  Strategic PM Strategy   │
                      └───────────┬─────────────┘
                                  │ constrains ↓ / triggers ↑
                      ┌───────────┴─────────────┐
                      │     QUARTERLY PLAN       │
                      │  Seasonal adjustments,   │
                      │  Equipment rotation,     │
                      │  Skills re-allocation,   │
                      │  Vendor scheduling       │
                      └───────────┬─────────────┘
                                  │ constrains ↓ / triggers ↑
                      ┌───────────┴─────────────┐
                      │      MONTHLY PLAN        │
                      │  PM route scheduling,    │
                      │  Resource leveling,      │
                      │  Parts procurement,      │
                      │  Crew rotation           │
                      └───────────┬─────────────┘
                                  │ constrains ↓ / triggers ↑
                      ┌───────────┴─────────────┐
                      │       WEEKLY PLAN        │
                      │  Daily assignments,      │
                      │  Shift scheduling,       │
                      │  Emergency response,     │
                      │  Real-time adjustments   │
                      └─────────────────────────┘
```

### Cascade Rules

| Change At | Propagates Down | Propagates Up |
|---|---|---|
| **Annual** | Quarterly budgets recalculate, Monthly PM route counts change, Weekly labor caps adjust | — (top level) |
| **Quarterly** | Monthly resources re-level, Weekly slot availability changes | Annual forecast updates, Budget variance alerts |
| **Monthly** | Weekly assignments shift, Daily technician loads recalculate | Quarterly completion rates update, Risk score delta surfaces |
| **Weekly** | — (execution level) | Monthly PM compliance %, Quarterly KPIs recalculate, Annual trend projection changes |

### Cascade Impact Indicators (New UI Elements)

When a planner makes a change at any level, the system shows:

1. **Impact Badge** on each affected horizon tab (e.g., Monthly tab shows "⚡ 3 changes propagated from weekly reschedule")
2. **Cascade Preview Panel** — Before confirming, shows ripple effects across all horizons
3. **Conflict Markers** — Red flags where a lower-level change violates an upper-level constraint

---

## 5. Feature 1: AI Plan Generation & Preview

### `PreviewAIPlanModal` — The Core AI Output Surface

This is the **primary AI interaction point**. When the planner clicks **"Generate AI Plan"**, the system:

1. Collects current state (all WOs, assignments, constraints, sensor data)
2. Runs multi-agent optimization (Safety, Spare Parts, Labor, Production agents)
3. Presents a comprehensive preview before the planner commits

### Sub-Features

#### 5.1 AI Plan Summary Header
- **AI Confidence Score**: Overall confidence (0-100%) with breakdown per agent
- **Generation Time**: How long the optimization took
- **Agents Involved**: Visual badges showing which specialized agents contributed
  - 🔒 Safety Agent
  - 🔧 Spare Parts Agent
  - 👥 Labor Agent
  - 🏭 Production Agent
  - 📊 Reliability Agent

#### 5.2 Impact Metric Cards (Before/After)
Key metric cards showing deltas, highlighting the projected impact on overall plant efficiency:

| Metric | Before | After | Delta |
|---|---|---|---|
| Projected OEE | 81.2% | 86.5% | **+5.3%** ↑ |
| Planned Downtime | 18.5h | 12.2h | **-34%** ↓ |
| PM Compliance | 78% | 94% | **+16%** ↑ |
| Breakdown Risk | High (72) | Low (23) | **-68%** ↓ |
| Parts Readiness | 61% | 89% | **+28%** ↑ |

*Note: Projected OEE breakdown (Availability, Performance, and Quality deltas) can be viewed by expanding the OEE Metric Card.*

#### 5.3 Recommended Schedule Changes Table

| # | Action | Work Order | Asset | Reason | Impact |
|---|---|---|---|---|---|
| 1 | **Move** | PM-WO-2026-205 | Molding M-301 | Mon → Wed: aligns with shutdown window | -2h downtime |
| 2 | **Pull Forward** | PM-WO-2026-209 | Boiler Feed Pump | Sensor trend → 72h to failure | Prevents breakdown |
| 3 | **Re-sequence** | CM-WO-2026-208 | Extrusion Machine | After LOTO buddy in same zone | -45min changeover |
| 4 | **Bundle** | PM-WO-2026-206 + CM-WO-2026-210 | Labeler LB-210 | Same crew, same area | -1.5h travel time |

#### 5.4 Bundled Maintenance Packages
AI identifies work orders that share constraints and groups them:

```
┌─ Bundle #1: "Molding Bay Package" ──────────────────┐
│  Constraint: Same LOTO area + Same mechanical crew   │
│  WOs: PM-WO-2026-205, CM-WO-2026-208                │
│  Savings: 2h production interruption reduced to 45min│
└──────────────────────────────────────────────────────┘
┌─ Bundle #2: "Packaging Line Sweep" ─────────────────┐
│  Constraint: Same zone + sequential equipment        │
│  WOs: PM-WO-2026-206, CM-WO-2026-210, CM-WO-2026-216│
│  Savings: 3 crew mobilizations reduced to 1          │
└──────────────────────────────────────────────────────┘
```

#### 5.5 AI Draft Work Orders & PM Strategy Changes
The AI proposes:
- **New condition-based inspections** triggered by sensor anomalies
- **Strategy shifts** from time-based to condition-based maintenance where data supports it
- **Draft WO auto-fill** with equipment, procedure, parts list, estimated duration

#### 5.6 Constraints & Feasibility Checklist
Automated validation before plan approval:

- ✅ Labor availability confirmed for all shifts
- ✅ Spare parts in stock or ordered (ETA before scheduled date)
- ⚠️ QA hold on Molding M-301 — requires Quality Supervisor sign-off
- ✅ Safety permits valid for all planned LOTO activities
- ⚠️ Holiday constraint: May 01 has limited support coverage

#### 5.7 Risk Reduction Explanation
Natural language summary:

> *"This plan reduces breakdown risk from 72 to 23 by pulling forward the Boiler Feed Pump PM (sensor data shows vibration trending 15% above threshold). It bundles 3 packaging-zone WOs into a single crew mobilization, saving 2.5h of travel and changeover time. The main trade-off is a 45-min longer Monday shutdown window, but the AI compensates by freeing up Wednesday for an uninterrupted production run."*

---

## 6. Feature 2: Multi-Plan Comparison & Trade-offs

### `ComparePlansModal` — Strategic Decision Support

#### 6.1 Side-by-Side Plan Cards
Compare up to 4 plans simultaneously:

| Aspect | Current Plan | AI Recommended | Min Downtime | Max Reliability |
|---|---|---|---|---|
| **Label** | As-is schedule | AI optimal | Aggressive | Conservative |
| **Downtime** | 18.5h | 12.2h | **9.8h** | 14.6h |
| **PM Compliance** | 78% | **94%** | 82% | **96%** |
| **Breakdown Risk** | 72 | 23 | 35 | **18** |
| **Cost Impact** | Baseline | -12% | **-18%** | +5% |
| **Labor Strain** | Medium | Low | **High** | Low |

#### 6.2 Detailed Metric Comparison Table
Color-coded cells: 🟢 Best value = green, 🔴 Worst value = red, 🟡 Middle = yellow.

#### 6.3 Schedule Delta View
Line-by-line diff showing which assets/WOs differ:

```diff
+ [AI Recommended] Move PM-WO-2026-205 from Mon Day → Wed Day
+ [AI Recommended] Add new inspection: Boiler Feed Pump vibration check
- [AI Recommended] Remove PM-WO-2026-032 from Thu (parts not available)
~ [Min Downtime] Compress all PMs into Mon-Tue window (high labor strain)
```

#### 6.4 Risk vs. Downtime Trade-off Matrix
Visual 2×2 quadrant chart:

```
        High Risk │ ● Min Downtime
                  │
    ──────────────┼──────────────
                  │
        Low Risk  │ ● AI Recommended
                  │ ● Max Reliability
                  │
     High Downtime         Low Downtime
```

#### 6.5 Agent Reasoning Panel
For the AI's top recommendation, show the reasoning chain:

> **Safety Agent**: "All LOTO requirements met. No overlapping hazardous activities."
> **Spare Parts Agent**: "92% parts availability. 2 items on express order, ETA within window."
> **Labor Agent**: "Peak load on Tuesday at 85% capacity. Thursday freed up as buffer."
> **Production Agent**: "Wednesday production uninterrupted. Total output impact: -1.2%."

#### 6.6 Key Trade-off Breakdown (Pros & Cons)
For each plan strategy:

**AI Recommended Plan:**
- ✅ PRO: Lowest breakdown risk (23)
- ✅ PRO: Highest PM compliance (94%)
- ⚠️ CON: Requires QA sign-off for Molding M-301 reschedule
- ⚠️ CON: Tuesday labor at 85% capacity

#### 6.7 Long-term Metric Deltas
Track high-level annual impacts:

| Metric | Current Trend | With AI Plan | Delta |
|---|---|---|---|
| Annual Cost | $2.4M | $2.1M | **-$300K** |
| Total Planned Downtime | 890h/yr | 620h/yr | **-30%** |
| Breakdown Risk (avg) | 58 | 29 | **-50%** |
| Tech Resource Strain | 72% | 64% | **-8pts** |

#### 6.8 Strategic Scenario Comparison
Dedicated view for annual-level strategy comparison:

| Strategy | Description | 5-Year Cost | Reliability Target |
|---|---|---|---|
| **Aggressive PM** | Maximum preventive coverage | $12.5M | 99.2% |
| **Balanced (AI)** | Data-driven optimization | $10.8M | 98.5% |
| **Cost-Optimized** | Minimal PM, rely on CBM | $8.2M | 96.1% |

#### 6.9 Approval Impact Breakdown
Lists which roles need sign-off for specific changes:

| Change | Approver Role | Status |
|---|---|---|
| Reschedule Molding M-301 PM | Quality Supervisor | ⏳ Pending |
| Express parts order for Boiler Pump | Parts Manager | ✅ Auto-approved (under $500) |
| Add night shift coverage Mar 25 | Shift Supervisor | ⏳ Pending |

#### 6.10 Coverage Heatmap
Visualizes technician skill-set coverage across zones:

```
              Zone 1    Zone 2    Utilities   Packaging
Mechanical    ████ 4    ███░ 3    ██░░ 2      █░░░ 1
Electrical    ███░ 3    ██░░ 2    ████ 4      ██░░ 2
Instrumentation ██░░ 2  █░░░ 1    ███░ 3      █░░░ 1
```
🔴 Red cells = critical gap (≤1 qualified technician)
🟡 Yellow = thin coverage (2 technicians)
🟢 Green = adequate coverage (3+)

---

## 7. Feature 3: AI Assistant Upgrade — Context-Aware Copilot

### Transform `AssistantPanel` from Static Alerts to Interactive AI Copilot

#### Current State
The existing `AssistantPanel` renders a static `assistantQueue` array of 8 hardcoded alerts.

#### Target State

##### 7.1 Proactive Insights (AI-Generated)
- Real-time sensor anomaly alerts with predicted failure windows
- Resource conflict detection across all horizons
- PM compliance risk forecasting
- Parts availability alerts with procurement lead times

##### 7.2 Interactive Chat Interface
- Natural language queries: *"What's my riskiest asset this week?"*
- Context-aware suggestions based on current view (e.g., different suggestions in Monthly vs. Weekly)
- Drag-to-schedule: AI suggests optimal slot, planner drags recommendation to calendar

##### 7.3 Scenario Simulation
- "What-if" analysis: *"What happens if I move this PM to next week?"*
- Instant impact preview across all horizons before committing
- Undo/redo with AI re-optimization

---

## 8. Feature 4: Multi-Agent Specialized Intelligence

### Agent Architecture

Each agent is a specialized AI module that evaluates plans from its domain perspective:

#### 8.1 Safety Agent 🔒
- Validates LOTO requirements and overlap conflicts
- Checks permit validity windows
- Ensures no concurrent hazardous activities in same zone
- Flags safety holds and regulatory compliance gaps

#### 8.2 Spare Parts Agent 🔧
- Real-time inventory check against planned WO BOM
- Lead time forecasting for out-of-stock items
- Substitute parts recommendation
- Cost optimization (bulk ordering, kitting)

#### 8.3 Labor Agent 👥
- Skill-based matching (technician certification vs. WO requirements)
- Fatigue management (max hours, rest periods, consecutive shift limits)
- Availability cross-referencing (PTO, training, shift rotation)
- Load balancing across technicians

#### 8.4 Production Agent 🏭
- **Production Schedule Alignment**: Minimizes schedule conflicts with high-priority production runs.
- **Changeover & Tooling Synchronization**: Co-schedules maintenance alongside product changeovers to leverage open windows.
- **OEE Optimization**: Calculates projected OEE delta (specifically Availability and Performance sub-metrics) based on downtime changes.
- **Shutdown/Blackout Awareness**: Respects hard plant production constraints and scheduled shutdowns.
- **Downtime Cost Quantification**: Computes projected cost impact ($ loss per hour of downtime) to aid trade-off negotiations.

#### 8.5 Reliability Agent (including CBM & PdM Sub-Systems) 📊
- **Predictive Maintenance (PdM)**: Evaluates real-time and historical sensor telemetry (vibration, temperature, pressure, acoustic signature) to calculate degradation curves.
- **Condition-Based Maintenance (CBM)**: Triggers dynamic plan adjustments when thresholds are breached, avoiding over-maintenance and preventing unexpected breakdowns.
- **OEE Quality Factor Analysis**: Analyzes calibration drift and tool wear patterns that degrade product Quality (the third pillar of OEE).
- **RUL & Failure Estimation**: Calculates dynamic Remaining Useful Life (RUL) and failure probability scoring (0-100) per asset.
- **PM Strategy Optimization**: Proposes shifts from static time-based PM intervals to dynamic condition-based intervals when telemetry patterns support it.
- **Criticality Alignment**: Prioritizes tasks based on asset criticality classes (A, B, C) and failure impact.

### Agent Orchestration Pattern

```
User triggers "Generate AI Plan"
         │
         ▼
┌─────────────────┐
│   ORCHESTRATOR   │  ← Collects current state, distributes to agents
└────────┬────────┘
         │
    ┌────┴────┬────────┬──────────┬────────────┐
    ▼         ▼        ▼          ▼            ▼
 Safety    Spare    Labor    Production   Reliability
 Agent     Parts    Agent      Agent        Agent
    │         │        │          │            │
    └────┬────┘────────┘──────────┘────────────┘
         │
         ▼
┌─────────────────┐
│   RESOLVER      │  ← Merges agent outputs, resolves conflicts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PLAN GENERATOR │  ← Produces final optimized schedule
└────────┬────────┘
         │
         ▼
   PreviewAIPlanModal
```

---

## 9. Feature 5: Constraint & Feasibility Engine

### Automated Validation Checklist

Every generated plan passes through these validation gates:

| Gate | Check | Source |
|---|---|---|
| **Labor** | Sufficient qualified technicians for each shift | HR/Roster system |
| **Parts** | All BOM items in stock or arriving before scheduled date | Inventory/Procurement |
| **QA Holds** | No quality holds blocking scheduled equipment | QA system |
| **Safety** | Valid permits, no LOTO conflicts, no hazardous overlaps | Safety management |
| **Production** | No conflict with critical production windows | Production schedule |
| **Regulatory** | PM compliance windows respected (fixed/floating) | Compliance rules |
| **Budget** | Plan cost within allocated maintenance budget | Finance system |
| **Capacity** | No technician exceeds max daily/weekly hours | Labor rules |

### Visual Output
A checklist in the AI Plan Preview modal with:
- ✅ Green = Passed
- ⚠️ Yellow = Warning (can proceed with approval)
- ❌ Red = Blocker (must resolve before scheduling)

---

## 10. Feature 6: Risk Reduction & Explainability Layer

### 10.1 Risk Scoring Model

Each asset gets a dynamic risk score (0-100) based on:

| Factor | Weight | Data Source |
|---|---|---|
| Sensor anomaly severity | 30% | IoT sensors (vibration, temp, pressure) |
| Time since last PM | 25% | CMMS WO history |
| Historical failure rate | 20% | Failure log analysis |
| Asset criticality class | 15% | Asset registry (A/B/C) |
| Operating environment stress | 10% | Environmental sensors |

### 10.2 Natural Language Explainability

Every AI decision includes a **"Why?"** panel:

> **Decision**: Move PM-WO-2026-205 (Molding M-301) from Monday to Wednesday
> **Why**: 
> - Molding M-301 has a floating schedule with a 5-day window (earliest: May 23, latest: May 27)
> - Wednesday aligns with a planned Molding Bay Tool Swap changeover, allowing both activities to share the same production stop
> - This eliminates 2 separate production interruptions, saving approximately 2h of downtime
> - The Safety Agent confirmed no LOTO conflicts with the changeover activity
> - The Spare Parts Agent confirmed the PM kit is ready in Crib A

### 10.3 Confidence Breakdown

For each recommendation, show confidence contributors:

```
Overall Confidence: 87%
├── Sensor Data Quality:     92% (12 of 13 sensors reporting)
├── Historical Pattern Match: 84% (similar to 23 past events)
├── Parts Availability:      95% (all items confirmed in stock)
├── Labor Availability:      78% (1 technician on PTO buffer)
└── Production Schedule Fit:  86% (changeover window confirmed)
```

---

## 11. Feature 7: Cascading Impact Propagation Engine

### How Changes Cascade Across Horizons

#### 11.1 Weekly → Monthly Propagation
When a planner reschedules a WO in the weekly calendar:
- Monthly PM compliance % recalculates
- Monthly aggregate badges update
- If the WO crosses a month boundary, it appears in the correct month cell

#### 11.2 Monthly → Quarterly Propagation
When a monthly PM route is adjusted:
- Quarterly Gantt bars shift
- Quarterly resource allocation adjusts
- Quarterly KPI forecast updates

#### 11.3 Quarterly → Annual Propagation
When a quarterly strategy changes:
- Annual PM plan tags reposition
- Annual cost forecast recalculates
- Annual overdue risk indicators update

#### 11.4 Reverse Cascade (Bottom-Up)
When emergency corrective work consumes planned resources:
- Weekly: Technician load exceeds capacity → flags
- Monthly: PM compliance at risk → yellow alert
- Quarterly: Maintenance backlog growing → strategy adjustment needed
- Annual: Budget variance → finance alert

### Cascade Preview UI

Before confirming any change, the planner sees a **Cascade Impact Panel**:

```
┌─ Cascade Impact Preview ────────────────────────────────┐
│                                                          │
│  📅 WEEKLY                                               │
│  └─ PM-WO-2026-205 moves from Mon Day → Wed Day         │
│     └─ Mike Johnson freed up 4h on Monday                │
│     └─ Wednesday peak load: 85% → capacity warning       │
│                                                          │
│  📆 MONTHLY                                              │
│  └─ May PM compliance: 78% → 81% (+3%)                  │
│  └─ May aggregate: Preventive count unchanged            │
│                                                          │
│  📊 QUARTERLY                                            │
│  └─ Q2 planned downtime: 220h → 218h (-2h)              │
│  └─ Q2 PM completion rate: stable                        │
│                                                          │
│  📈 ANNUAL                                               │
│  └─ Annual downtime forecast: 890h → 888h               │
│  └─ Annual cost impact: negligible                       │
│                                                          │
│  [Cancel]                              [Confirm Change]  │
└──────────────────────────────────────────────────────────┘
```

---

## 12. Feature 8: Coverage Heatmap & Skills Gap Visualization

### 12.1 Interactive Heatmap

A visual matrix showing technician skill coverage across zones and work types:

| | Zone 1 Mech. | Zone 1 Elec. | Zone 2 Mech. | Zone 2 Elec. | Utilities | Packaging |
|---|---|---|---|---|---|---|
| **Day Shift** | 🟢 4 | 🟡 2 | 🟢 3 | 🔴 1 | 🟡 2 | 🟢 3 |
| **Night Shift** | 🟡 2 | 🔴 1 | 🟡 2 | 🔴 0 | 🟢 3 | 🟡 2 |

### 12.2 AI Gap Analysis
The AI identifies critical coverage gaps and suggests:
- Cross-training recommendations
- Overtime authorization for understaffed windows
- Contractor engagement for specialized skills
- Shift swap suggestions to balance coverage

### 12.3 Workload Equity Visualization
Shows technician load distribution fairness over time (prevents burnout):
- Gini coefficient of workload distribution
- Flagging technicians consistently above 80% capacity
- Suggesting rebalancing through AI-optimized assignment

---

## 13. Feature 9: Approval Workflow & Role-Based Sign-off

### 13.1 Approval Chain Configuration

| Change Type | Required Approvers | Auto-Approve Threshold |
|---|---|---|
| Standard PM reschedule (within floating window) | None (auto-approved) | Always |
| PM reschedule (beyond floating window) | Quality Supervisor | Never |
| Emergency WO insertion | Shift Supervisor | Priority = Emergency |
| Parts express order | Parts Manager | Cost < $500 |
| Overtime authorization | Shift Supervisor + HR | < 4h per person |
| Strategy change (time → condition-based) | Reliability Engineer + Plant Manager | Never |
| Budget variance > 10% | Finance Controller | Never |

### 13.2 Approval Dashboard
- Pending approvals with context and AI recommendation
- One-click approve/reject with mandatory comment on reject
- Escalation timer (auto-escalate after 4h without response)
- Mobile-friendly for supervisors on the floor

---

## 14. Feature 10: Bundled Maintenance Packages

### 14.1 Bundling Criteria (AI-Detected)

The AI groups WOs based on:

| Criterion | Description |
|---|---|
| **Same LOTO Zone** | WOs requiring lockout/tagout in the same area |
| **Same Crew Required** | WOs needing the same skill set/technician |
| **Sequential Equipment** | WOs on equipment in the same production line (do while walking through) |
| **Shared Downtime Window** | WOs that can share a single production stop |
| **Same Parts Crib** | WOs where parts are in the same storage location |

### 14.2 Bundle Optimization Metrics
For each bundle, the AI calculates:
- **Time saved** (reduced mobilization, travel, changeover)
- **Production impact** (one stop vs. multiple stops)
- **Resource efficiency** (crew utilization during the bundle window)
- **Risk of bundling** (if one WO delays, does it cascade to others?)

---

## 15. Implementation Phases

### Phase 1: Foundation & Decomposition (2-3 Weeks)

| Task | Description |
|---|---|
| **Component decomposition** | Break `MaintenancePlannerPage.tsx` (7,643 lines) into ~15 focused components |
| **AI data types** | Define TypeScript types for AI plans, agents, metrics, cascading impacts |
| **State management** | Create context/store for AI plan state (generated plans, comparison data) |
| **API contracts** | Define mock API interfaces for AI plan generation, agent communication |
| **Cascade engine skeleton** | Build the propagation logic between horizon layers |

### Phase 2: AI Plan Generation & Preview (3-4 Weeks)

| Task | Description |
|---|---|
| **PreviewAIPlanModal** | Build the full plan preview modal with all sub-features |
| **Impact Metric Cards** | Before/after comparison cards with animated deltas |
| **Schedule Changes Table** | Detailed action table with drag-to-apply |
| **Feasibility Checklist** | Automated constraint validation display |
| **Risk Reduction Explanation** | Natural language reasoning panel |
| **Mock AI backend** | Simulated plan generation with realistic delays and confidence scores |

### Phase 3: Multi-Plan Comparison (2-3 Weeks)

| Task | Description |
|---|---|
| **ComparePlansModal** | Side-by-side plan cards layout |
| **Trade-off Matrix** | Interactive 2×2 quadrant visualization |
| **Schedule Delta View** | Diff-style line-by-line comparison |
| **Agent Reasoning Panel** | Per-agent explanations for the recommended plan |
| **Long-term Metric Deltas** | Annual impact projection display |

### Phase 4: AI Assistant Copilot (2-3 Weeks)

| Task | Description |
|---|---|
| **Interactive assistant** | Upgrade static list to conversational AI interface |
| **Context awareness** | Different suggestions based on active horizon view |
| **What-if simulation** | Instant impact preview for hypothetical changes |
| **Drag-to-schedule** | AI suggestion cards that can be dragged onto calendar |

### Phase 5: Multi-Agent System (3-4 Weeks)

| Task | Description |
|---|---|
| **Agent framework** | Build the orchestrator-specialist communication pattern |
| **Safety Agent** | LOTO validation, permit checks, hazard overlap detection |
| **Spare Parts Agent** | Inventory check, lead time forecasting, substitute parts |
| **Labor Agent** | Skill matching, fatigue management, load balancing |
| **Production Agent** | Production schedule alignment, changeover optimization |
| **Reliability Agent** | Failure scoring, RUL estimation, strategy recommendation |

### Phase 6: Cascading Impact & Advanced Features (3-4 Weeks)

| Task | Description |
|---|---|
| **Cascade engine** | Full bi-directional propagation (weekly ↔ annual) |
| **Cascade Preview Panel** | Visual ripple effect display before committing changes |
| **Coverage Heatmap** | Interactive skills gap visualization |
| **Approval Workflow** | Role-based sign-off chain with escalation |
| **Bundled Maintenance Packages** | AI-detected WO grouping with optimization metrics |

### Phase 7: Polish & Integration (2-3 Weeks)

| Task | Description |
|---|---|
| **End-to-end flow testing** | Generate plan → compare → approve → schedule → cascade |
| **Performance optimization** | Virtualize large plan comparison tables, memo heavy components |
| **Accessibility** | ARIA labels, keyboard navigation for all new modals |
| **Dark mode** | Ensure all new components follow design token system |
| **Documentation** | User guide, component storybook, API documentation |

### Implementation Status Update (Jul 2026)

#### Completed: Phase 1

Phase 1 is implemented as a focused foundation + vertical slice rather than a full planner rewrite.

**What was delivered**
- **Shared planner AI domain** created under `src/Maintenance/ai/types.ts`
  - normalized planner inputs
  - AI risk signals
  - parts readiness
  - impact metrics
  - recommended action types
- **Read-only adapters** created under `src/Maintenance/ai/adapters/`
  - `followUpAdapter.ts`
  - `cbmAdapter.ts`
  - `sparePartsAdapter.ts`
- **Reusable CBM monitoring seed data** extracted to `src/Maintenance/data/cbmMonitoringData.ts`
- **Planner AI hook** created in `src/Maintenance/hooks/usePlannerAi.ts`
- **AI planner entry surface** created in `src/Maintenance/components/ai/PlannerAiOverviewPanel.tsx`
- **Initial preview/apply flow** integrated into `src/Maintenance/pages/MaintenancePlannerPage.tsx`

**Behavior now available**
- User can generate an AI weekly plan from:
  - planner cards / planning queue
  - Follow-Up backlog and scheduled work
  - CBM/PdM monitoring signals
  - spare-parts readiness logic
- User can review AI recommendations before applying
- User can apply constrained actions back into weekly planner state:
  - reschedule existing weekly cards
  - schedule a planning-queue item into the weekly board
  - promote a Follow-Up request into the planner queue

**Intentional Phase 1 limit**
- The weekly planner is the only horizon with direct AI apply behavior
- Monthly / quarterly / annual boards remain consumers, not cascade-aware planners

#### Completed: Phase 2

Phase 2 is implemented as the productization of the AI preview and generation flow built in Phase 1.

**What was delivered**
- **Richer AI plan contract** added in `src/Maintenance/ai/types.ts`
  - generation metadata
  - per-action confidence
  - execution readiness
  - agent contributor labels
  - feasibility checklist
  - rationale / trade-off summary
- **Mock AI service layer** added in `src/Maintenance/ai/mockPlannerAiService.ts`
  - simulated async generation
  - realistic generation duration metadata
- **Generator upgraded** in `src/Maintenance/ai/generatePlannerAiPlan.ts`
  - richer before/after impact metrics
  - feasibility output
  - stronger natural-language explanation
  - more explicit action readiness and reasoning
- **Preview dialog refactored into focused components** under `src/Maintenance/components/ai/`
  - `AIConfidenceBadge.tsx`
  - `AIImpactMetricCard.tsx`
  - `AIFeasibilityChecklist.tsx`
  - `AINaturalLanguageExplainer.tsx`
  - `AIScheduleChangesTable.tsx`
- **Preview shell upgraded** in `src/Maintenance/components/ai/PreviewAiPlanDialog.tsx`
- **Selective apply state** added in `src/Maintenance/hooks/usePlannerAi.ts`

**Behavior now available**
- AI preview shows:
  - confidence and generation metadata
  - stronger before/after impact cards
  - structured schedule-changes review table
  - feasibility checklist
  - risk explanation and trade-offs
  - parts readiness and blockers
- User can:
  - select/deselect individual recommendations
  - select all / clear all
  - apply only the chosen recommendations

#### Completed: Phase 3

Phase 3 is implemented as a mock-backed multi-plan comparison layer on top of the existing weekly AI planner flow.

**What was delivered**
- **Comparison-capable planner AI contract** added in `src/Maintenance/ai/types.ts`
  - plan strategy labels
  - comparison session container
  - variant summary metrics
  - schedule delta items
  - per-agent reasoning entries
  - long-term metric projections
  - trade-off positioning data
- **Comparison generation flow** added in `src/Maintenance/ai/generatePlannerAiPlan.ts`
  - shared weekly input analysis reused across variants
  - deterministic strategy variants from one generation run
  - recommended plan still mapped back into the existing preview/apply path
- **Mock comparison service** added in `src/Maintenance/ai/mockPlannerAiService.ts`
  - async comparison-session generation
  - preserved mock latency / generation metadata behavior
- **Planner AI hook upgraded** in `src/Maintenance/hooks/usePlannerAi.ts`
  - comparison-session state
  - active strategy state
  - per-variant action selection state
  - compare-dialog open / close behavior
  - variant-aware apply behavior
- **Comparison UI components** added under `src/Maintenance/components/ai/`
  - `ComparePlansDialog.tsx`
  - `AIPlanComparisonCard.tsx`
  - `AIPlanTradeoffMatrix.tsx`
  - `AIPlanScheduleDeltaView.tsx`
  - `AIAgentReasoningPanel.tsx`
  - `AILongTermMetricsPanel.tsx`
- **Planner AI entry surfaces upgraded**
  - `src/Maintenance/components/ai/PlannerAiOverviewPanel.tsx`
  - `src/Maintenance/components/ai/PreviewAiPlanDialog.tsx`
- **Planner page integration updated** in `src/Maintenance/pages/MaintenancePlannerPage.tsx`

**Behavior now available**
- AI generation now produces multiple weekly strategies from the same planner context:
  - Recommended
  - Min Downtime
  - Max Reliability
  - Backlog Burn-down
- User can compare strategies side-by-side before applying anything
- User can inspect:
  - summary comparison cards
  - risk vs. downtime trade-off positioning
  - schedule delta view per strategy
  - per-agent reasoning for the selected strategy
  - long-term annualized impact projections
- User can choose one active strategy, then:
  - review it in the existing preview dialog
  - keep action selection scoped to that variant
  - apply the chosen strategy back into weekly planner state
- Existing Phase 2 selective-apply behavior remains intact for the active recommended strategy flow

#### Completed: Phase 4

Phase 4 is implemented as an initial **interactive AI Assistant Copilot** slice on top of the existing phase 3 planner flow.

**What was delivered**
- **Copilot-capable planner AI contract** added in `src/Maintenance/ai/types.ts`
  - assistant horizon context
  - assistant messages / quick prompts
  - horizon-aware insight cards
  - actionable copilot suggestions
  - what-if scenarios and simulation results
- **Mock copilot generation flow** added in `src/Maintenance/ai/generatePlannerAiPlan.ts`
  - horizon-aware prompts and replies
  - insight generation from planner / follow-up / CBM / spare-parts signals
  - actionable weekly suggestion generation
  - what-if simulation output
- **Mock copilot service endpoints** added in `src/Maintenance/ai/mockPlannerAiService.ts`
  - `requestMockPlannerAiInsights`
  - `requestMockPlannerAiSuggestions`
  - `requestMockPlannerAiWhatIf`
- **Planner AI hook upgraded into a copilot orchestrator** in `src/Maintenance/hooks/usePlannerAi.ts`
  - horizon-aware copilot state
  - conversation transcript state
  - insight / suggestion refresh behavior
  - what-if execution state
  - drag-capable suggestion state
  - preserved phase 3 generation / comparison / preview / apply behavior
- **New copilot UI components** added under `src/Maintenance/components/ai/`
  - `PlannerAiCopilotPanel.tsx`
  - `PlannerAiConversation.tsx`
  - `PlannerAiInsightList.tsx`
  - `PlannerAiSuggestionCard.tsx`
  - `PlannerAiWhatIfPanel.tsx`
- **Planner page integration updated** in `src/Maintenance/pages/MaintenancePlannerPage.tsx`
  - planner surface mode mapped into assistant horizon context
  - copilot panel mounted in place of the summary-only assistant shell
  - existing preview / compare flow kept accessible
  - weekly board extended to accept one AI suggestion drag type

**Behavior now available**
- Planner now has a visible conversational copilot surface
- Copilot replies and insight cards change with planner horizon:
  - Weekly
  - Monthly
  - Quarterly
  - Annual
- User can:
  - click quick prompts
  - ask free-text planner questions
  - run mock what-if simulations
  - trigger the existing weekly reschedule flow from assistant suggestions
  - drag at least one assistant suggestion into the weekly board
- Existing phase 3 flow still works:
  - Generate AI plan
  - Review plan
  - Compare plans
  - Selective apply

#### Completed: Phase 5

Phase 5 is implemented as a **mock-backed multi-agent orchestration layer** underneath the existing phase 4 planner experience.

**What was delivered**
- **Expanded multi-agent planner AI contract** in `src/Maintenance/ai/types.ts`
  - specialist agent ids and contributor expansion
  - per-action agent assessments
  - agent findings / conflicts
  - orchestration summary state
  - agent commentary for what-if output
- **Shared planner analysis extraction** added in `src/Maintenance/ai/agents/plannerAiAnalysis.ts`
  - centralized planner context building
  - risk / backlog / parts-readiness aggregation
  - reusable baseline signal derivation
- **Specialist agent evaluators** added under `src/Maintenance/ai/agents/`
  - `safetyAgent.ts`
  - `sparePartsAgent.ts`
  - `laborAgent.ts`
  - `productionAgent.ts`
  - `reliabilityAgent.ts`
- **Planner AI orchestrator + resolver** added in `src/Maintenance/ai/agents/plannerAiOrchestrator.ts`
  - shared-context specialist evaluation
  - conflict detection across agent recommendations
  - merged readiness / warning / blocker resolution
  - confidence rollup and orchestration summaries
- **Plan generation and copilot upgraded** in `src/Maintenance/ai/generatePlannerAiPlan.ts`
  - strategy variants now route through the multi-agent orchestrator
  - preview / comparison outputs now carry agent-backed reasoning and conflicts
  - copilot insight, suggestion, and explanation outputs now reflect agent results
- **Existing async mock service preserved** in `src/Maintenance/ai/mockPlannerAiService.ts`
  - same generation UX
  - richer multi-agent output payloads
- **Phase 5 traceability UI added** across `src/Maintenance/components/ai/`
  - `AIAgentReasoningPanel.tsx`
  - `AIConfidenceBadge.tsx`
  - `AIFeasibilityChecklist.tsx`
  - `PreviewAiPlanDialog.tsx`
  - `ComparePlansDialog.tsx`
  - `PlannerAiCopilotPanel.tsx`
  - `PlannerAiInsightList.tsx`
  - `PlannerAiSuggestionCard.tsx`
  - `PlannerAiWhatIfPanel.tsx`

**Behavior now available**
- Generated plans are now shaped by explicit specialist agents:
  - Safety
  - Spare Parts
  - Labor
  - Production
  - Reliability
- The planner now shows:
  - orchestration summary state
  - per-agent stance and confidence
  - cross-agent warnings / blockers
  - conflict-aware readiness in preview and comparison flows
- Copilot responses are now grounded in multi-agent outputs rather than only centralized narrative heuristics
- Existing phase 4 flow still works:
  - Generate AI plan
  - Review plan
  - Compare plans
  - Selective apply
  - Run what-if simulation
  - Drag at least one AI suggestion into the weekly board

#### Current Completion Boundary

At this point, **Phase 1 through Phase 7 are implemented** for the current local mock-backed planner slice.

**Intentional current boundary**
- The multi-agent system is still **mock-backed and deterministic**, not backend- or LLM-orchestrated
- Monthly / quarterly / annual horizons receive **propagated impact overlays and conflict markers**, not direct board mutation
- Full page decomposition (weekly/monthly/gantt/annual boards) remains deferred; `PlannerAiShell` is extracted
- Cross-module integrations in Section 19 remain future work (Phase 8+)

#### Completed: Phase 6

Phase 6 is implemented as the **cascade-aware multi-horizon decision layer** on top of phases 1–5.

**What was delivered**
- **Shared planner snapshot** in `src/Maintenance/ai/buildPlannerAiSnapshot.ts`
- **Cascade preview engine** in `src/Maintenance/ai/generatePlannerAiCascadePreview.ts`
- **Phase 6 UI** under `src/Maintenance/components/ai/`
  - `AICascadePreviewDialog.tsx`
  - `AIHorizonImpactBadges.tsx`
  - `AICoverageHeatmap.tsx`
  - `AIApprovalWorkflowPanel.tsx` (read-only first slice)
  - `AIBundleCard.tsx`
- **Hook integration** in `src/Maintenance/hooks/usePlannerAi.ts`
  - `openCascadePreview()` / `confirmCascadeApply()` for AI apply
  - horizon impact badges and coverage summary overlays

**Behavior now available**
- AI apply routes through cascade preview before weekly board mutation
- Propagated impact badges appear across weekly / monthly / quarterly / annual contexts
- Bundles, approvals, conflicts, and coverage are visible in cascade preview

#### Completed: Phase 7

Phase 7 is implemented as **hardening, integration, and production-readiness** for the cascade layer.

**What was delivered**
- **Universal change contracts** in `src/Maintenance/ai/types.ts`
  - `PlannerAiChangeIntent`, `PlannerAiUndoSnapshot`, `PlannerAiHorizonProjection`
  - shift-aware coverage cells; enriched bundle metadata (`constraintType`, `lotoZone`, `crewLabel`)
- **Change intent builders** in `src/Maintenance/ai/buildPlannerChangeIntent.ts`
- **Extracted cascade engine** in `src/Maintenance/hooks/useCascadeEngine.ts`
- **Actionable approvals** in `src/Maintenance/hooks/usePlannerApprovalState.ts`
  - approve / reject with mandatory reject comment
  - demo override with comment
  - confirm blocked while pending approvals remain
- **Enhanced bundling** in `src/Maintenance/ai/buildMaintenanceBundles.ts` (LOTO / crew / crib / shared-downtime)
- **Gap analysis** in `src/Maintenance/ai/buildCoverageGapAnalysis.ts` + `AIGapAnalysisPanel.tsx`
- **UI upgrades**
  - interactive `AIApprovalWorkflowPanel.tsx`
  - shift-aware `AICoverageHeatmap.tsx` with cell drill-down
  - `AICascadeConflictMarker.tsx` on horizon tabs
  - `PlannerAiUndoBanner.tsx` for one-level revert
  - `PlannerAiShell.tsx` (status strip + dialog host)
- **Page wiring** in `src/Maintenance/pages/MaintenancePlannerPage.tsx`
  - reschedule modal → cascade preview
  - copilot drag → cascade preview
  - surface switcher conflict markers

**Behavior now available**
- Reschedule and copilot drag no longer bypass cascade gating
- Approval workflow is interactive and gates confirm apply
- Coverage heatmap includes day/night shift rows with gap recommendations
- Bundles use LOTO / crew / crib criteria in addition to shared downtime
- One-level undo restores weekly state after a confirmed cascade apply
- Horizon tabs show conflict markers when propagated impacts exist

**Implemented files most relevant for continuation**
- `src/Maintenance/hooks/useCascadeEngine.ts`
- `src/Maintenance/hooks/usePlannerApprovalState.ts`
- `src/Maintenance/ai/buildPlannerChangeIntent.ts`
- `src/Maintenance/ai/buildMaintenanceBundles.ts`
- `src/Maintenance/ai/buildCoverageGapAnalysis.ts`
- `src/Maintenance/components/planner/PlannerAiShell.tsx`
- `src/Maintenance/components/ai/AIGapAnalysisPanel.tsx`
- `src/Maintenance/components/ai/AICascadeConflictMarker.tsx`
- `src/Maintenance/components/ai/PlannerAiUndoBanner.tsx`

**Not implemented yet (pre–UX remediation)**
- real backend / LLM orchestration
- direct mutation of monthly / quarterly / annual board data
- production planning bi-directional sync
- full `MaintenancePlannerPage.tsx` board extraction

#### Completed: UX Execution Checklist (Jul 2026)

A focused **4-week mock slice** was executed to make the agentic flow legible for client demos without requiring a live backend.

| Week | Goal | Status | Key deliverables |
|---|---|---|---|
| **Week 1** | UX de-confusion — one mental model: Analyze → Review → Apply | ✅ Done | `plannerAiWorkflow.ts`, `PlannerAiWorkflowStepper`, `PlannerAiHowItWorks`, state-gated copilot buttons, unified cascade success snackbar |
| **Week 2** | AI on the grid | ✅ Mostly done | `plannerCardSignals.ts`, `CalendarWorkCardSignalChips`, insight → board highlight/scroll, board-first insight linking |
| **Week 3** | One review path | ✅ Done | `buildCopilotReviewPlan.ts`, copilot/what-if → Step 2 preview, `PlannerAiAgentSummaryStrip`, unified `reviewPlan` / `previewPlan` flow |
| **Week 4** | Demo polish (mock cross-module) | ✅ Done | Parts ETA column, follow-up backlog snapshot, Control Tower planner widget |

**Week 2 backlog**
- **B3** Readiness score tooltip on weekly cards (chips exist; tooltip breakdown not wired)

**Week 4 deliverables (detail)**
- **D1 Parts ETA** — `plannerPartsEta.ts` + `AIScheduleChangesTable` column with ready/tight/late styling
- **D2 Follow-up backlog** — `followUpBacklogSummary` on planner snapshot + `PlannerAiFollowUpBacklogPanel`
- **D4 Control Tower widget** — `ControlTowerMaintenancePlannerWidget.tsx` + `buildControlTowerPlannerWidgetSnapshot.ts`

#### UX Remediation (Jul 2026) — Layout / Client Demo Readiness

**Problem observed (client screenshot review)**  
The copilot surface stacked stepper, how-it-works, agent summary, chat, follow-up backlog, insights, suggestions, and what-if **above** the weekly calendar. This violated §18.2 Progressive Disclosure and pushed the primary planner artifact (the board) below the fold.

**Remediation delivered**
- **Collapsed-by-default copilot** on Step 1 — compact command bar with signal chips + primary CTAs only
- **Tabbed expansion** — Chat | Signals | Actions instead of one vertical wall
- **Calendar-first framing** — “Calendar-first” chip and hint text on Step 1
- **Agent summary only when relevant** — shown after analyze / what-if / review, not on empty state
- **Reduced page spacing** — tighter margin between copilot shell and toolbar/calendar

**Files**
- `src/Maintenance/components/ai/PlannerAiCopilotPanel.tsx` (collapsible + tabs)
- `src/Maintenance/components/ai/PlannerAiFollowUpBacklogPanel.tsx` (`compact` mode)
- `src/Maintenance/pages/MaintenancePlannerPage.tsx` (spacing)

**Still recommended for client-grade UX (next)**
- Side drawer copilot (reuse `AiCopilotDrawer` pattern) so calendar always owns the viewport
- Dedupe insights that repeat the same asset (e.g. multiple CV-101 cards)
- Sticky workflow bar only; move heatmap/undo/horizon badges to a slim status rail
- First-run empty state: hide Signals/Actions tabs until Analyze completes
- Mobile: copilot as full-screen sheet, calendar as default route

#### Must-Have Features — Status vs Plan

| Must-have (demo / plan) | Status | Notes |
|---|---|---|
| Analyze → Review → Apply workflow | ✅ | Stepper + dialogs + cascade gate |
| Multi-strategy compare | ✅ | `ComparePlansDialog` |
| Cascade preview before weekly apply | ✅ | All paths including copilot drag & reschedule |
| Interactive approvals | ✅ | Mock approve/reject/override |
| Copilot chat + what-if | ✅ | Mock-backed |
| CBM health on weekly cards | ✅ | Chips on `CalendarWorkCard` |
| Parts readiness on cards | ✅ | Chips; ETA in Step 2 table |
| Insight → board navigation | ✅ | Highlight + scroll |
| Unified review for copilot / what-if | ✅ | Week 3 |
| Follow-up backlog in AI context | ✅ | Week 4 D2 |
| Control Tower executive view | ✅ | Week 4 D4 (mock widget) |
| **Readiness score tooltip (B3)** | ✅ | Materials / labor / tooling breakdown on hover |
| **Progressive disclosure / layout** | ✅ | Side drawer copilot; calendar-first command bar |
| **Page decomposition** | ⚠️ | `MaintenancePlannerCopilotSection` extracted; page still large |
| **Non-weekly horizon mutation** | ⚠️ | Planning items + horizon banners update on cascade apply |
| **Insight deduplication** | ✅ | `dedupeCopilotInsights.ts` |
| **Gap analysis in main surface** | ✅ | Always visible in `PlannerAiShell` status strip |
| **Production ↔ maintenance sync** | ❌ | Phase 8 |
| **Equipment Ledger AI feed** | ❌ | Phase 8 |
| **Follow-Up auto-draft on apply** | ❌ | Phase 8 |
| **Real LLM / backend orchestration** | ❌ | Out of mock scope |
| **Accessibility pass on AI modals** | ❌ | Phase 7 docs item not verified |
| **Gap analysis in main surface** | ⚠️ | `AIGapAnalysisPanel` exists; not in default planner view |

#### Recommended Next Starting Point

**Priority order for client demos**
1. **UX Week 5** — copilot side drawer + insight dedupe + sticky calendar
2. **B3** — readiness tooltip on weekly cards
3. **Phase 8** — production window feed (highest wow after layout fix)

The broader Phase 8 cross-module list remains in Section 19, beginning with live CBM feed polish and spare-parts procurement suggestions.

**Execution references**
- `src/FilesMD/AI_CENTRIC_MAINTENANCE_PLANNER_PHASE_7_PLAN.md`

---

## 16. Component Architecture

### New Components to Create

```
src/Maintenance/
├── components/
│   ├── ai/
│   │   ├── AIConfidenceBadge.tsx          # Agent confidence score display
│   │   ├── AIImpactMetricCard.tsx         # Before/after delta card
│   │   ├── AIAgentReasoningPanel.tsx      # Per-agent explanation
│   │   ├── AIRiskScoreGauge.tsx           # 0-100 risk visualization
│   │   ├── AINaturalLanguageExplainer.tsx # "Why?" reasoning panel
│   │   ├── AIBundleCard.tsx              # Bundled maintenance package
│   │   └── AICascadePreview.tsx          # Cross-horizon impact preview
│   ├── comparison/
│   │   ├── PlanComparisonCard.tsx         # Single plan summary card
│   │   ├── PlanTradeoffMatrix.tsx         # 2×2 quadrant chart
│   │   ├── PlanScheduleDelta.tsx          # Diff view
│   │   ├── PlanMetricTable.tsx            # Color-coded metric comparison
│   │   └── PlanStrategyComparison.tsx     # Annual strategy comparison
│   ├── coverage/
│   │   ├── SkillsCoverageHeatmap.tsx      # Zone × Skill matrix
│   │   ├── WorkloadEquityChart.tsx        # Technician fairness viz
│   │   └── GapAnalysisPanel.tsx           # AI cross-training suggestions
│   ├── approval/
│   │   ├── ApprovalChain.tsx              # Role-based sign-off chain
│   │   ├── ApprovalDashboard.tsx          # Pending approvals list
│   │   └── ApprovalImpactBreakdown.tsx    # Per-change approver list
│   └── cascade/
│       ├── CascadeImpactBadge.tsx         # Tab-level impact indicator
│       ├── CascadePreviewPanel.tsx        # Full cascade visualization
│       └── CascadeConflictMarker.tsx      # Red flag for constraint violations
├── modals/
│   ├── PreviewAIPlanModal.tsx             # Full AI plan preview
│   ├── ComparePlansModal.tsx              # Multi-plan comparison
│   └── CascadeImpactModal.tsx            # Full cascade impact detail
├── hooks/
│   ├── useAIPlanGeneration.ts            # Hook for AI plan generation flow
│   ├── usePlanComparison.ts              # Hook for plan comparison state
│   ├── useCascadeEngine.ts              # Hook for cascade propagation logic
│   ├── useAgentOrchestrator.ts          # Hook for multi-agent coordination
│   └── useConstraintValidation.ts       # Hook for feasibility checking
└── types/
    ├── aiPlan.ts                         # AI plan, agent, metric types
    ├── comparison.ts                     # Comparison, trade-off types
    ├── cascade.ts                        # Cascade propagation types
    └── approval.ts                       # Approval workflow types
```

---

## 17. Data Model Extensions

### New TypeScript Types

```typescript
// AI Plan Types
type AIPlanConfidence = {
  overall: number;           // 0-100
  safetyAgent: number;
  sparePartsAgent: number;
  laborAgent: number;
  productionAgent: number;
  reliabilityAgent: number;
};

type AIImpactMetric = {
  name: string;
  before: number;
  after: number;
  unit: string;
  deltaPct: number;
  direction: 'improvement' | 'regression' | 'neutral';
  oeeBreakdown?: {
    availability: { before: number; after: number };
    performance: { before: number; after: number };
    quality: { before: number; after: number };
  };
};

type AIScheduleChange = {
  action: 'move' | 'pull-forward' | 're-sequence' | 'bundle' | 'add' | 'remove';
  workOrderId: string;
  asset: string;
  reason: string;
  impactSummary: string;
  fromDate?: Date;
  toDate?: Date;
  confidence: number;
};

type AIMaintenanceBundle = {
  id: string;
  name: string;
  constraint: string;
  workOrders: string[];
  timeSaved: string;
  productionImpact: string;
  riskOfBundling: 'low' | 'medium' | 'high';
};

type AIPlan = {
  id: string;
  label: string;
  strategy: 'recommended' | 'min-downtime' | 'max-reliability' | 'cost-optimized' | 'custom';
  confidence: AIPlanConfidence;
  generationTime: number;
  metrics: AIImpactMetric[];
  scheduleChanges: AIScheduleChange[];
  bundles: AIMaintenanceBundle[];
  feasibilityChecklist: AIFeasibilityCheck[];
  riskExplanation: string;
  agentReasonings: Record<string, string>;
};

// Cascade Types
type CascadeHorizon = 'weekly' | 'monthly' | 'quarterly' | 'annual';

type CascadeImpact = {
  horizon: CascadeHorizon;
  description: string;
  metricChanges: Array<{
    metric: string;
    before: string;
    after: string;
    direction: 'up' | 'down' | 'stable';
  }>;
  conflicts: CascadeConflict[];
};

type CascadeConflict = {
  severity: 'blocker' | 'warning' | 'info';
  description: string;
  resolution?: string;
};

// Approval Types
type ApprovalStep = {
  role: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'auto-approved';
  reason?: string;
  timestamp?: Date;
  escalationDeadline?: Date;
};
```

---

## 18. UX/UI Design Principles

### 18.1 AI-First, But Human-in-Control
- AI suggests, human decides — every AI output has Accept/Reject/Modify buttons
- AI reasoning is always visible (no black-box decisions)
- Undo/redo support for all AI-applied changes

### 18.2 Progressive Disclosure
- Default view: Clean summary with key metrics
- Click to expand: Detailed agent reasoning, constraint details, cascade impacts
- Power user mode: Full comparison tables, raw risk scores, override controls

**Jul 2026 implementation note:** Copilot now uses a **side drawer** (`PlannerAiCopilotDrawer`) with a compact **calendar-first command bar** on the page. Chat, signals, and actions live in the drawer; the weekly board owns the viewport.

### 18.3 Visual Language for AI
- **Sparkle icon (✨)**: Marks any AI-generated content
- **Confidence ring**: Circular progress showing AI certainty (green > 80%, yellow 50-80%, red < 50%)
- **Agent badges**: Color-coded icons showing which agent contributed
- **Cascade arrows**: Visual flow showing impact propagation direction

### 18.4 Consistent with Existing Design System
- Use existing `tokenBrand`, `tokenError`, `tokenWarning`, `tokenSuccess`, `tokenInfo`, `tokenNeutral` design tokens
- Follow established Paper/Box/Typography patterns from current codebase
- Maintain the dark mode compatibility via `activeTheme` references
- Use existing `borderRadius` conventions (xSmall/Medium/Large)

### 18.5 Performance
- Memoize heavy computation (plan comparisons, cascade calculations)
- Virtualize large tables (schedule delta view, approval list)
- Lazy-load modals (PreviewAIPlanModal, ComparePlansModal)
- Debounce cascade recalculations on rapid changes

---

## 19. Cross-Module AI Integration Features (Full Codebase Analysis)

> The following features were discovered by analyzing every module in the platform. They represent **high-impact AI integration opportunities** that leverage existing data, components, and workflows to make the AI Planner dramatically more powerful — and to show the client the true cross-platform power of AI.

### 📊 Modules Analyzed

| Module | File | Lines | Key Data Available |
|---|---|---|---|
| **CBM & PdM** | `MaintenanceCbmPdmPage.tsx` | 2,739 | Sensor telemetry, health scores, severity levels, days-to-failure, asset hierarchy, post-intervention items |
| **Performance KPIs** | `MaintenancePerformancePage.tsx` | 1,889 | MTBF, MTTR, Backlog aging, Cycle time, PM compliance %, AI insights with trend/driver/recommendation |
| **Spare Parts** | `SparePartsManagementPage.tsx` | 7,081 | Full inventory (SAP numbers, stock state, suppliers, site availability), purchase orders, consumption history |
| **Equipment Ledger** | `EquipmentLedgerPage.tsx` | 4,151 | Asset timeline (PM, WO, CIL, Repair, Safety, Quality, Cost events), AI recommendations, BOM, spare parts usage, cavity maps |
| **Follow-Up Board** | `MaintenanceFollowUpBoardPage.tsx` | 8,992 | Full WO lifecycle (Request → Planning → Scheduled → In Progress → Review → Closed), work order drafts, execution tracking |
| **Maintenance Plans** | `MaintenancePlan.tsx` | 6,230 | PM plans with frequency, criticality, compliance, scheduling config, task lists, safety/quality config |
| **My Team** | `MaintenanceMyTeamPage.tsx` | 610 | Team members with shift, capacity, machines, PTO, team assignment |
| **Production Planning** | `ProductionPlanningScreen.tsx` + `aiSequenceSimulationMock.ts` | 117K + 38K | AI sequence simulation, changeover optimization, material risk, readiness status, line utilization |
| **Scenario Planning** | `ScenarioPlanningPage.tsx` | 21K | Multi-scenario comparison, what-if simulation |
| **WO Readiness** | `WoReadinessPage.tsx` | 49K | Readiness scoring, blocking constraints, material/labor/tooling checks |
| **Control Tower** | `ControlTowerScreen.tsx` | 1,663 | Executive dashboard, site-level KPIs, AI assistant integration point |
| **Action Tracker** | `actionTracker/types.ts` | 167 | QCDPS categories, corrective/preventive actions, AI-assisted flag, approval workflows |
| **Shift Management** | `shiftManagement/` | Multiple | Shift logbook, crew patterns, line assignments, holiday calendar, shift requests |
| **Shopfloor** | `shopfloor/` | Multiple | CIL/CILT tasks, equipment changeover, work order hub, OEE dashboard |
| **Tier Meeting** | `tierMeeting/` | Multiple | Tier 1/2/3 escalation, lane-based issue tracking |

---

### 19.1 🔗 Feature: Production Planning ↔ Maintenance Bi-Directional Sync

**What exists**: `productionPlanning/aiSequenceSimulationMock.ts` has a complete `AISequenceSimulation` type with `confidencePercent`, `optimizationObjective`, `lineSequences`, `reasoning`, `keyChanges`, `assumptions`, and `risks`. Each `AISequenceItem` has `materialRisk`, `qualityRisk`, `laborRisk`, and `changeoverGroup`.

**What to add to the AI Planner**:
- **Production Schedule Feed**: The AI Planner should ingest the production planning AI sequence simulation to automatically identify optimal maintenance windows (when lines are idle or during changeovers)
- **Mutual Conflict Detection**: When the AI Planner proposes scheduling a PM during a production run, it should flag the conflict and show the production impact (units lost, changeover cost)
- **Shared Changeover Intelligence**: Production changeover events (`AISequenceChangeType`) should feed directly into the Planner's `CalendarBlock` system, so maintenance can piggyback on production downtime
- **Joint Optimization Mode**: "Generate plan considering production schedule" — the AI simultaneously optimizes both production sequence and maintenance placement

**Business Impact**: *Eliminates the #1 conflict between production and maintenance teams: fighting over machine availability. AI arbitrates automatically.*

---

### 19.2 🔬 Feature: Live CBM/PdM Sensor Feed Integration

**What exists**: `MaintenanceCbmPdmPage.tsx` has `CbmMonitoringCard` with `currentReading`, `warningThreshold`, `criticalThreshold`, `trend`, `severity` (critical/mediumCritical/lessCritical/normal), `healthScore`, and `daysToFailure`. Also has `PostInterventionItem` and a full asset hierarchy tree with status indicators (healthy/warning/critical).

**What to add to the AI Planner**:
- **Real-Time Health Badges on Calendar Cards**: Each work order card on the weekly/monthly calendar shows a live health indicator (🟢🟡🔴) pulled from CBM sensor data
- **Predictive Pull-Forward Alerts**: When the PdM model detects `daysToFailure < floating window`, the AI automatically suggests pulling the PM forward
- **Post-Intervention Verification Integration**: After a PM is executed, the Planner checks post-intervention sensor readings to verify the maintenance was effective (closed-loop)
- **Asset Health-Weighted Prioritization**: The AI Plan Generation uses `healthScore` as a primary input for prioritization — low health score assets get scheduled first

**Business Impact**: *Moves from "schedule-based" to "condition-aware" planning. Prevents 30-50% of unplanned breakdowns per industry benchmarks.*

---

### 19.3 🔧 Feature: Spare Parts AI — Inventory-Aware Planning

**What exists**: `SparePartsManagementPage.tsx` (7,081 lines) has complete `InventoryPart` types with `sapNumber`, `stockState` (in-stock/low-stock/out-of-stock), `condition`, `suppliers`, `siteAvailability`. Also has purchase order tracking, consumption history trends, and a full work-order-to-parts linking system.

**What to add to the AI Planner**:
- **Parts Availability Gate**: Before scheduling any WO, the AI checks the BOM against real-time inventory. WOs with missing parts are flagged (already in the plan) — but now with **auto-procurement suggestions** (express order, cross-site transfer, substitute part)
- **Consumption Forecasting**: AI predicts future parts demand based on the generated plan and current consumption trends, proactively triggering reorders
- **Kitting Optimization**: When WOs are bundled, the AI also bundles the parts kits to minimize crib visits
- **Parts Lead Time Impact**: The Schedule Changes table shows "Parts ETA: May 28" alongside the proposed schedule date, clearly flagging when parts won't arrive in time

**Business Impact**: *"Parts not available" is the #1 reason maintenance WOs get delayed. AI eliminates this by making inventory awareness automatic.*

---

### 19.4 📋 Feature: Equipment Ledger Intelligence — Historical Context for AI Decisions

**What exists**: `EquipmentLedgerPage.tsx` (4,151 lines) has a full event timeline per asset (PM, Predictive, WO, CIL, Centerline, Repair, Safety, Quality, Spare Parts, Cost), `AiRecommendation` types (with title, body, impact, status, actions), and a Performance/Reliability tab with trend charts.

**What to add to the AI Planner**:
- **Historical Pattern Recognition**: When the AI suggests a schedule change, it references the asset's ledger history: *"Molding M-301 has had 3 unplanned repairs in the last 90 days on this same component — recommending PM strategy upgrade"*
- **Cost-Aware Planning**: The AI pulls maintenance cost history from the ledger and projects cost impact of different plan strategies
- **AI Recommendation Feed**: The Equipment Ledger's `AiRecommendation` entries (which already have `actions` arrays) should auto-populate the AI Planner's suggestion queue
- **Reliability Tab Integration**: MTBF/MTTR trends from the ledger feed directly into the Reliability Agent's failure probability calculations

**Business Impact**: *AI decisions aren't made in a vacuum — they're grounded in the specific asset's actual history, making recommendations dramatically more trustworthy.*

---

### 19.5 📌 Feature: Follow-Up Board Lifecycle Sync

**What exists**: `MaintenanceFollowUpBoardPage.tsx` (8,992 lines) manages the complete WO lifecycle with lanes: Request → Autonomous Maintenance → Planning → Scheduled → In Progress → Review → Closed. Has `WorkOrderDraft`, `CreateWorkOrderDrawer`, execution state tracking (active/paused), and rejection workflows.

**What to add to the AI Planner**:
- **Backlog-Aware Plan Generation**: The AI ingests ALL WOs from the Follow-Up Board (including backlog in "Planning" lane) and prioritizes them in the generated plan
- **Auto-Draft from AI Plan**: When the AI Plan is approved, it auto-creates `WorkOrderDraft` entries and pushes them to the correct Follow-Up Board lane
- **Execution Feedback Loop**: When a WO in the Follow-Up Board moves from "In Progress" → "Review" → "Closed", the Planner automatically updates its metrics (actual vs. planned duration, PM compliance)
- **Blocked WO Visibility**: WOs that are stuck in "Planning" due to missing parts or approvals surface as warnings in the AI Plan

**Business Impact**: *Single source of truth for all maintenance work. No more duplicate tracking between the planner and the follow-up board.*

---

### 19.6 👥 Feature: AI-Powered Shift & Team Integration

**What exists**: `MaintenanceMyTeamPage.tsx` has team members with shift assignments, capacity descriptions, machine certifications, and PTO schedules. `shiftManagement/` has `ShiftConfigItem`, `CrewPatternItem`, `LinePatternAssignmentItem`, `HolidayItem`, and `ShiftRequestItem` types.

**What to add to the AI Planner**:
- **Shift-Aware Scheduling**: The AI only assigns WOs to technicians who are actually on shift during the proposed slot (cross-referencing `CrewPatternItem` rotation)
- **PTO-Aware Load Balancing**: When generating plans, the AI considers upcoming PTO requests and vacation schedules to avoid over-loading remaining staff
- **Holiday Constraint Propagation**: `HolidayItem` events (Plant Shutdown, Maintenance Window, Training Event) auto-populate the calendar's blocked slots
- **Certification Matching**: The AI matches WO skill requirements against team member `capacity` (e.g., "Electrical Troubleshooting") — only suggesting qualified technicians

**Business Impact**: *Planners currently spend 30% of their time cross-referencing shift schedules and vacation calendars. AI does this automatically.*

---

### 19.7 ✅ Feature: AI Work Order Readiness Scoring

**What exists**: `productionPlanning/woReadiness/` has a complete readiness assessment system with types for material availability, labor, tooling, and blocking constraint checks.

**What to add to the AI Planner**:
- **Readiness Score per Calendar Card**: Every WO card on the calendar displays a readiness score (0-100%) with breakdown: Materials ✅, Labor ✅, Tooling ⚠️, Permits ❌
- **Plan-Level Readiness Dashboard**: Overall plan readiness percentage showing how many WOs are fully ready vs. blocked
- **Auto-Deferred Queue**: WOs that fail readiness checks automatically move to a "Deferred" holding area with AI-suggested resolution steps
- **Readiness Trend**: Track readiness over time — is the team getting better at having everything ready before scheduled dates?

**Business Impact**: *Reduces "day-of" surprises where a technician shows up and can't start because something is missing. Industry data shows 15-25% of scheduled maintenance is delayed due to readiness gaps.*

---

### 19.8 🎯 Feature: Auto-Generated Action Tracker Items

**What exists**: `actionTracker/types.ts` has `ActionTrackerRow` with QCDPS categories (Quality, Cost, Delivery, People, Safety), `aiAssisted` flag, `source` field (which already includes 'Maintenance' and 'BLU.AI'), and complete approval/reassignment workflows.

**What to add to the AI Planner**:
- **AI → Action Tracker Bridge**: When the AI identifies a systemic issue (e.g., "Conveyor CV-101 has failed 3 times in 60 days"), it auto-creates an Action Tracker item categorized as "DELIVERY" or "QUALITY" with `aiAssisted: true`
- **Plan Approval → Actions**: When a plan is approved with PM strategy changes, auto-create tracking actions for each change (e.g., "Transition Boiler Feed Pump from time-based to condition-based PM")
- **Tier Meeting Escalation**: Critical maintenance risks identified by the AI can auto-escalate to Tier 1/2/3 meetings via the existing tier meeting system

**Business Impact**: *Bridges the gap between maintenance planning and the continuous improvement cycle. AI-generated actions ensure nothing falls through the cracks.*

---

### 19.9 🔮 Feature: Scenario Planning Bridge (What-If Engine)

**What exists**: `productionPlanning/scenarioPlanning/` has a complete scenario comparison system with multi-scenario simulation, utilities, and component architecture.

**What to add to the AI Planner**:
- **Maintenance Scenario Simulation**: "What if we defer all non-critical PMs for 2 weeks?" — AI generates the risk impact, cost savings, and reliability forecast
- **Budget Scenario Modeling**: "What if maintenance budget is cut by 15%?" — AI shows which PMs would be dropped and the resulting breakdown risk increase
- **Seasonal Scenario Planning**: "Generate a plan for the summer shutdown period" — AI accounts for reduced staffing, increased heat-related failures, and production ramp-down

**Business Impact**: *Gives plant managers the ability to explore trade-offs before committing. This is the most executive-visible AI feature — perfect for client demos.*

---

### 19.10 🏗️ Feature: Control Tower Executive AI View

**What exists**: `ControlTowerScreen.tsx` is an executive-level dashboard with site-level KPIs, AI assistant integration (`onOpenAiAssistant`), and cross-functional metrics.

**What to add to the AI Planner**:
- **Planner Summary Widget for Control Tower**: A compact widget showing: Current Plan Health %, AI Recommendations Pending, Breakdown Risk Score, OEE Projection
- **Executive AI Narrative**: A natural language paragraph auto-generated daily: *"Today's maintenance plan is 87% ready. 2 WOs are blocked by parts availability. The AI recommends pulling forward the Boiler PM (sensor alert). Projected OEE impact: +2.1% if recommendations are adopted."*
- **Cross-Site Plan Comparison**: For multi-site operations, compare AI plan effectiveness across plants

**Business Impact**: *The Control Tower is what executives see. Having AI maintenance intelligence there demonstrates cross-platform AI value to leadership.*

---

### 19.11 💰 Feature: AI Maintenance Cost Intelligence

**What exists**: `data.ts` has `monthlyMaintenanceCost` data and `monthlyConsumed` per asset. `EquipmentLedgerPage` tracks cost events per asset. `MaintenancePerformancePage` has budget-related KPIs.

**What to add to the AI Planner**:
- **Cost Projection per Plan**: Each AI-generated plan shows projected monthly/quarterly/annual maintenance cost with breakdown (labor, parts, contractor, overtime)
- **Cost-per-Unit Impact**: Show how maintenance costs translate to cost-per-unit-produced — directly linking maintenance to business profitability
- **Budget Compliance Check**: Flag when a plan would exceed the allocated maintenance budget for the period
- **AI Cost Optimization Mode**: "Generate the most cost-effective plan that maintains 95% PM compliance" — AI minimizes cost while meeting reliability targets

**Business Impact**: *Connects maintenance directly to the bottom line. Plant managers and finance controllers can see the ROI of AI-optimized planning in dollar terms.*

---

### 19.12 🔄 Feature: Digital Shift Handover Intelligence

**What exists**: `shiftManagement/` has shift logbook with tickets categorized as 'Maintenance Request', 'Work Order', 'OEE', 'Non-Conformance', etc. Each ticket has `reporterType: 'Human' | 'BLU.AI'` and `dateScope`.

**What to add to the AI Planner**:
- **Shift Handover Context**: When the day shift planner opens the AI Planner, it shows a "Last Shift Summary" panel: *"Night shift completed 3 of 5 scheduled WOs. CM-WO-2026-213 was paused at 60% due to parts. 1 new corrective request logged."*
- **Pending Work Carry-Over**: WOs that weren't completed in the previous shift auto-carry to the current shift's plan with priority boost
- **AI Shift Insight**: Cross-referencing shift logbook entries with calendar data: *"Night shift consistently takes 20% longer on Extrusion Machine WOs — consider adding a second technician for night shifts on this asset."*

**Business Impact**: *Eliminates the "tribal knowledge" problem at shift handover. AI ensures continuity between shifts — critical for 24/7 operations.*

---

### Summary: Cross-Module Integration Impact

| Feature | Modules Connected | Effort | Client Wow Factor |
|---|---|---|---|
| Production ↔ Maintenance Sync | Production Planning + Planner | High | ⭐⭐⭐⭐⭐ |
| Live CBM/PdM Feed | CBM Page + Planner | Medium | ⭐⭐⭐⭐⭐ |
| Spare Parts AI | Spare Parts + Planner | Medium | ⭐⭐⭐⭐ |
| Equipment Ledger Intelligence | Equipment Ledger + Planner | Medium | ⭐⭐⭐⭐ |
| Follow-Up Board Sync | Follow-Up Board + Planner | Medium | ⭐⭐⭐ |
| Shift & Team Integration | My Team + Shift Mgmt + Planner | Medium | ⭐⭐⭐⭐ |
| WO Readiness Scoring | WO Readiness + Planner | Low | ⭐⭐⭐⭐ |
| Action Tracker Auto-Creation | Action Tracker + Planner | Low | ⭐⭐⭐ |
| Scenario Planning Bridge | Scenario Planning + Planner | High | ⭐⭐⭐⭐⭐ |
| Control Tower Executive View | Control Tower + Planner | Low | ⭐⭐⭐⭐⭐ |
| AI Cost Intelligence | Cost Data + Planner | Medium | ⭐⭐⭐⭐⭐ |
| Digital Shift Handover | Shift Logbook + Planner | Low | ⭐⭐⭐⭐ |

---

> **Next Steps**: Phases 1–7 and the Jul 2026 UX execution checklist (Weeks 1–4) are implemented as a mock-backed slice. **Immediate priority:** layout remediation (copilot drawer, calendar-first). Then Phase 8 cross-module integrations (Section 19), starting with production-window feed and equipment-ledger context.
