# SIM Canvas UI Redesign — Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Reference:** `/home/dean/Desktop/New Folder/sim/apps/sim/`

## Overview

Replicate the canvas UI redesign from the reference SIM project into the current production SIM at `/home/dean/sim/`. The redesign introduces glassmorphism effects, refined node styling with CSS variables, moved logs to the right panel, and updated typography/spacing.

## Changes by Component

### 1. CSS Variables (globals.css)

Add canvas/glow/glassmorphism CSS variable blocks to both light and dark themes. Update dark theme surface colors to darker, slightly purple-tinted palette.

**Light theme additions:** `--glow-primary`, `--glow-primary-rgb`, `--glow-spread`, `--glow-opacity`, `--glass-bg`, `--glass-border`, `--glass-blur`, `--canvas-bg`, `--canvas-dot-color`, `--canvas-dot-size`, `--edge-color`, `--edge-active-color`, `--edge-active-width`, `--node-bg`, `--node-border`, `--node-radius`, `--node-header-radius`, `--node-selected-ring`, `--node-selected-shadow`, `--node-hover-shadow`

**Dark theme:** Same variables with different values (deeper purples, higher glow opacity, semi-transparent node backgrounds). Also update surface/border colors to darker palette.

### 2. Left Sidebar (sidebar.tsx)

- Remove glass background effect (was added then reverted in reference)
- Change `bg-card` to `bg-[var(--surface-1)]`
- Update border from `--border-soft` to `--border`
- Search bar: `rounded-lg` → `rounded-[10px]`, adjusted padding
- Footer nav: compact icon buttons `h-[28px] w-[28px] rounded-[8px]`

### 3. Canvas Background

No changes needed — identical in both projects.

### 4. Workflow Nodes (workflow-block.tsx)

Major restyle using new CSS variables:
- Container: use `--node-bg`, `--node-border`, `--node-radius` instead of hardcoded values
- Add `backdrop-blur-sm` to node container
- Header: add gradient overlay `linear-gradient(135deg, ${bgColor}18 0%, transparent 60%)`
- Add top edge highlight line (subtle white gradient)
- Icon: `h-[24px] w-[24px] rounded-[6px]` → `h-[28px] w-[28px] rounded-full` with glow shadow
- Block name: `text-[16px]` → `text-[13px]`
- Content: adjust gap and padding
- Add hover shadow: `group-hover:[box-shadow:var(--node-hover-shadow)]`

### 5. Right Panel (panel.tsx)

- Container: add glassmorphism (`bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]`, inset shadows)
- Tabs redesign: add icons (Sparkles, Blocks, SlidersHorizontal, ScrollText)
- Tab labels: Agent → Copilot, Tools → Blocks, keep Editor, add Logs
- Tab styling: button-based with active background state and glow underline
- Add 4th "Logs" tab that renders the Terminal component

### 6. Logs Location (terminal → panel tab)

Move the terminal/console from the floating bottom panel into the right sidebar as a "Logs" tab. Import Terminal component into panel.tsx and render it in the Logs tab content area with CSS overrides to make it fill the tab.

### 7. Action Bar (action-bar.tsx)

- Update `ACTION_BUTTON_STYLES` border from `--border-soft` to `--border`
- Block name font: `text-[16px]` → `text-[13px]`

## Approach

Copy styles directly from the reference project files. This is a 1:1 replication, not a redesign. Where the reference uses CSS variables that don't exist yet, add them to globals.css first.

## Files to Modify

1. `apps/sim/app/_styles/globals.css` — CSS variable additions
2. `apps/sim/app/workspace/[workspaceId]/w/components/sidebar/sidebar.tsx` — sidebar styling
3. `apps/sim/app/workspace/[workspaceId]/w/[workflowId]/components/workflow-block/workflow-block.tsx` — node styling
4. `apps/sim/app/workspace/[workspaceId]/w/[workflowId]/components/panel/panel.tsx` — right panel + logs tab
5. `apps/sim/app/workspace/[workspaceId]/w/[workflowId]/components/action-bar/action-bar.tsx` — button styling
