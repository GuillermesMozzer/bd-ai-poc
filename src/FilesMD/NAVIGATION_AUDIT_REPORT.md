# Navigation Architecture Audit Report

This document presents a comprehensive review of the navigation architecture within the codebase. The application does not use external URL-based routers (like React Router or Next.js Router) for its core views. Instead, it relies on a **state-driven client-side switcher** built on top of Material UI (MUI) components. 

---

## 1. Global Navigation

Global navigation handles transitioning across major domain areas (e.g., Workstations, Document Management, Shift Logbook, and Maintenance Hub).

* **Pattern A: App Bar / Header Controls**
  * **Tech / Library Used:** Material UI `AppBar`, `Toolbar`, `IconButton`, and `Popover`.
  * **File Locations:**
    * **[src/navigation/MainLayout.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/navigation/MainLayout.tsx)** (Lines 139–356)
    * **[src/AppContent.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/AppContent.tsx)**
  * **Behavior / UX Note:** Serves as the persistent top header. It handles launching the Apps Library drawer, triggers the smart search popup, hosts site-hierarchy selectors, and includes quick icons for alerts and AI copilot panels.

* **Pattern B: App Library Launcher (Apps Menu Drawer)**
  * **Tech / Library Used:** Material UI `Drawer`, `List`, and lazy-loaded React panels.
  * **File Locations:**
    * **[src/workstation/components/AppLibraryDrawer.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/workstation/components/AppLibraryDrawer.tsx)**
    * **[src/AppContent.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/AppContent.tsx)** (Lines 69–104)
  * **Behavior / UX Note:** When clicked, it opens an overlay drawer displaying all workstation applications. Selecting an app switches the screen context programmatically.

* **Pattern C: Muted/Collapsible Sidebar (SideNav)**
  * **Tech / Library Used:** Material UI `Drawer` and `ListItemButton` lists.
  * **File Locations:**
    * **[src/navigation/SideNav.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/navigation/SideNav.tsx)**
    * **[src/navigation/navigationConfig.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/navigation/navigationConfig.tsx)**
  * **Behavior / UX Note:** Provides collapsible drawer options for desktop and full drawer overlays for mobile views. Currently hidden in standard layouts, but fully configured via `applicationMenuItems` mappings.

---

## 2. Contextual / Page-Level Navigation

Page-level navigation structures sub-pages, layout steps, and widgets inside a single screen view.

* **Pattern A: Secondary Tabbed Menus**
  * **Tech / Library Used:** Material UI `Tabs` and `Tab` elements.
  * **File Locations:**
    * **[src/productionPlanning/ProductionPlanningScreen.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/productionPlanning/ProductionPlanningScreen.tsx)**
    * **[src/Maintenance/pages/MaintenancePlannerPage.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/Maintenance/pages/MaintenancePlannerPage.tsx)**
    * **[src/shiftManagement/components/ShiftPlannerScreen.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/shiftManagement/components/ShiftPlannerScreen.tsx)** (Lines 307–321)
  * **Behavior / UX Note:** Divides complex screens into sub-views (e.g. splitting Shift Settings into Shift Configuration, Holidays, and Requests, or splitting Production Planning into Timeline, MRP, and MPS) without re-instantiating the screen wrapper.

* **Pattern B: Sub-Header Navigation Bars**
  * **Tech / Library Used:** Custom React components loaded into layout ports.
  * **File Locations:**
    * **[src/shiftManagement/components/ShiftNavigationHeader.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/shiftManagement/components/ShiftNavigationHeader.tsx)**
    * **[src/workstation/components/WorkstationSubMenu.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/workstation/components/WorkstationSubMenu.tsx)**
  * **Behavior / UX Note:** Displays context-sensitive secondary links immediately below the global App Bar for shift schedules, logs, planner hubs, and organograms.

---

## 3. Screen-Level Buttons & Sub-View Actions (Context Switches)

Buttons and actions within individual screen views handle context-switching to drill down or navigate to related modules.

* **Pattern A: Document Operations Callback Buttons**
  * **Tech / Library Used:** Material UI `Button` click handlers with callback props.
  * **File Locations:**
    * **[src/documentManagement/DocumentManagementScreen.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/documentManagement/DocumentManagementScreen.tsx)**
    * **[src/navigation/AppRoutes.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/navigation/AppRoutes.tsx)** (Lines 511-625)
  * **Behavior / UX Note:** Inner screens feature interactive buttons to trigger document sub-modules. Examples include the *Create New File* button (triggers template selection), *Approve Priority* (routes to approval dashboard), and *Audit Trail / Version History / E-Signature* button mappings.

* **Pattern B: Widget Expansion Back-Buttons**
  * **Tech / Library Used:** Material UI `Button` / `IconButton` with `onBack` callback hooks.
  * **File Locations:**
    * **[src/workstation/components/MyActionTrackerExpanded.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/workstation/components/MyActionTrackerExpanded.tsx)**
    * **[src/workstation/components/MyCiltCenterlineExpanded.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/workstation/components/MyCiltCenterlineExpanded.tsx)**
    * **[src/workstation/components/MyShiftOeeExpanded.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/workstation/components/MyShiftOeeExpanded.tsx)**
  * **Behavior / UX Note:** When a widget dashboard is expanded for detail configuration or execution, a "Back" button invokes the `onBack` prop to programmatically return user focus to the parent layout.

---

## 4. Programmatic / Dynamic Navigation

Dynamic navigation handles switching views based on authentication status, sidebar events, and AI commands.

* **Pattern A: State-Driven Switch Router**
  * **Tech / Library Used:** Custom React `useState` hook combined with a switch statement logic.
  * **File Locations:**
    * **[src/navigation/AppRoutes.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/navigation/AppRoutes.tsx)** (Lines 261–706)
  * **Behavior / UX Note:** Evaluates `currentScreen` and returns the matching lazy-loaded component, mimicking router pushes without page reloads or URL rewrites.

* **Pattern B: Auth-Driven Redirect**
  * **Tech / Library Used:** Custom React Auth Context hooks.
  * **File Locations:**
    * **[src/App.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/App.tsx)** (Lines 26–53)
    * **[src/auth/LoginScreen.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/auth/LoginScreen.tsx)**
  * **Behavior / UX Note:** Intercepts unauthenticated mount states and forces redirects to the login screen, returning back to the dashboard once auth resolves.

* **Pattern C: AI Copilot Prompt-Driven Transitions**
  * **Tech / Library Used:** Custom chat messaging action structures.
  * **File Locations:**
    * **[src/aiHome/components/AiCopilotDrawer.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/aiHome/components/AiCopilotDrawer.tsx)**
    * **[src/navigation/AppRoutes.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/navigation/AppRoutes.tsx)** (Lines 230–249)
  * **Behavior / UX Note:** Clicking suggestions in the assistant chat bubble triggers callback handlers that programmatically update the page state (e.g. pivoting straight to the Action Tracker or the Work Order Hub).

---

## 5. Deep-Linking / Anchor Navigation

Anchor navigation handles keyboard accessibility and deep contextual updates.

* **Pattern A: Skip to Main Content (Skip Link)**
  * **Tech / Library Used:** HTML anchor link target (`#main-content`) styled dynamically via MUI overrides.
  * **File Locations:**
    * **[src/navigation/MainLayout.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/navigation/MainLayout.tsx)** (Lines 132–134)
    * **[src/theme.ts](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/theme.ts)** (Lines 103–121)
  * **Behavior / UX Note:** For keyboard accessibility, allows screen readers and keyboard tab navigation to jump straight past the header bar controls into the main page content layout port.

* **Pattern B: Contextual Hierarchy deep-linking**
  * **Tech / Library Used:** Hierarchical Node IDs with local react state.
  * **File Locations:**
    * **[src/navigation/HeaderHierarchyPicker.tsx](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/navigation/HeaderHierarchyPicker.tsx)**
    * **[src/navigation/headerHierarchy.ts](file:///c:/Users/danilo.assuncao/Documents/Codex/2026-04-18-this-is-https-radixeng-dev-azure/bd-ai-poc/src/navigation/headerHierarchy.ts)**
  * **Behavior / UX Note:** Allows deep selection of sites, lines, and zones from a tree view that filters all widget datasets globally across the workspace.
