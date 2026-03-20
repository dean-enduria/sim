# Canvas UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replicate the canvas UI redesign from the reference SIM project into the production SIM, covering CSS variables, sidebar, nodes, right panel, logs relocation, and button styling.

**Architecture:** Copy exact styles from reference project at `/home/dean/Desktop/New Folder/sim/apps/sim/` into current project at `/home/dean/sim/apps/sim/`. CSS variable additions first, then component updates. The reference project is the source of truth — replicate, don't improvise.

**Tech Stack:** Next.js, Tailwind CSS, SIM CSS custom properties, React

**Spec:** `/home/dean/sim/docs/plans/2026-03-20-canvas-ui-redesign-design.md`

---

### Task 1: Add CSS variables to globals.css

**Files:**
- Modify: `apps/sim/app/_styles/globals.css`
- Reference: `/home/dean/Desktop/New Folder/sim/apps/sim/app/_styles/globals.css`

This is the foundation — all other tasks depend on these variables existing.

- [ ] **Step 1: Update terminal height default**

In `apps/sim/app/_styles/globals.css`, find the light theme `:root` block. Change:
```css
--terminal-height: 206px; /* TERMINAL_HEIGHT.DEFAULT */
```
To:
```css
--terminal-height: 0px; /* Terminal moved to panel tab */
```

- [ ] **Step 2: Add canvas redesign variables to light theme**

After the terminal status badge variables section in the light theme `:root` block (after `--terminal-status-badge-*` vars), add:

```css
/* Canvas redesign — glow & glassmorphism */
--glow-primary: #6366f1;
--glow-primary-rgb: 99, 102, 241;
--glow-spread: 12px;
--glow-opacity: 0.25;
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(0, 0, 0, 0.08);
--glass-blur: 12px;
--canvas-bg: var(--bg);
--canvas-dot-color: rgba(0, 0, 0, 0.05);
--canvas-dot-size: 1px;
--edge-color: var(--workflow-edge);
--edge-active-color: var(--glow-primary);
--edge-active-width: 2.5px;
--node-bg: var(--surface-2);
--node-border: var(--border-1);
--node-radius: 20px;
--node-header-radius: 16px;
--node-selected-ring: var(--glow-primary);
--node-selected-shadow: 0 0 var(--glow-spread)
  rgba(var(--glow-primary-rgb), var(--glow-opacity));
--node-hover-shadow: 0 0 8px rgba(var(--glow-primary-rgb), 0.1);
```

- [ ] **Step 3: Update dark theme surface/border colors**

In the `.dark` section, replace the surface and border color block with:
```css
--bg: #0d0d0f;
--surface-1: #111114;
--surface-2: #161619;
--surface-3: #1a1a1e;
--surface-4: #1e1e23;
--border: #1f1f24;
--surface-5: #252529;
--border-1: #2a2a30;
--surface-6: #454545;
--surface-7: #454545;

--workflow-edge: #3a3a44;
```

- [ ] **Step 4: Add canvas redesign variables to dark theme**

After the dark theme terminal status badge variables, add:

```css
/* Canvas redesign — glow & glassmorphism */
--glow-primary: #8357ff;
--glow-primary-rgb: 131, 87, 255;
--glow-spread: 16px;
--glow-opacity: 0.4;
--glass-bg: rgba(17, 17, 20, 0.75);
--glass-border: rgba(255, 255, 255, 0.06);
--glass-blur: 20px;
--canvas-bg: var(--bg);
--canvas-dot-color: rgba(138, 138, 168, 0.07);
--canvas-dot-size: 1px;
--edge-color: var(--workflow-edge);
--edge-active-color: var(--glow-primary);
--edge-active-width: 2.5px;
--node-bg: rgba(22, 22, 25, 0.85);
--node-border: rgba(255, 255, 255, 0.06);
--node-radius: 16px;
--node-header-radius: 12px;
--node-selected-ring: var(--glow-primary);
--node-selected-shadow: 0 0 20px rgba(var(--glow-primary-rgb), 0.45), 0 0 60px
  rgba(var(--glow-primary-rgb), 0.15);
--node-hover-shadow: 0 0 12px rgba(var(--glow-primary-rgb), 0.2), 0 0 40px
  rgba(var(--glow-primary-rgb), 0.06);
```

- [ ] **Step 5: Commit**

```bash
cd /home/dean/sim
git add apps/sim/app/_styles/globals.css
git commit -m "feat: add canvas redesign CSS variables (glow, glass, node styling)"
```

---

### Task 2: Update sidebar styling

**Files:**
- Modify: `apps/sim/app/workspace/[workspaceId]/w/components/sidebar/sidebar.tsx`
- Reference: `/home/dean/Desktop/New Folder/sim/apps/sim/app/workspace/[workspaceId]/w/components/sidebar/sidebar.tsx`

Copy the exact sidebar styling from the reference. The key changes are the inner border div, search bar, and footer navigation.

- [ ] **Step 1: Update sidebar inner border div**

Find the `<div className='flex h-full flex-col border-r border-[var(--border-soft)]` line inside the `<aside>` and change to:
```tsx
<div className='flex h-full flex-col border-[var(--glass-border)] border-r pt-[12px]'>
```

- [ ] **Step 2: Update search bar**

Find the search bar div (the one with `onClick={() => setIsSearchModalOpen(true)}`). Replace its entire className and content to match reference:

```tsx
<div
  className='mx-[8px] mt-[8px] flex flex-shrink-0 cursor-pointer items-center justify-between rounded-[10px] border border-[var(--border)] px-[10px] py-[6px] transition-colors duration-150 hover:border-[var(--border-1)] hover:bg-[var(--surface-4)]'
  onClick={() => setIsSearchModalOpen(true)}
>
  <div className='flex items-center gap-[6px]'>
    <Search className='h-[13px] w-[13px] text-[var(--text-subtle)]' />
    <p className='font-medium text-[var(--text-muted)] text-[12px]'>Search</p>
  </div>
  <p className='font-medium text-[var(--text-subtle)] text-[11px]'>⌘K</p>
</div>
```

- [ ] **Step 3: Update footer navigation**

Find the footer navigation section (the div with `footerNavigationItems.map`). Replace with the reference's Flows tab + More dropdown pattern. Read the exact JSX from the reference file lines 647-720 and copy it in.

**Important:** This is the most complex sidebar change. The reference restructures the footer from a vertical list to a "Flows" primary tab button + "More" popover dropdown. You'll need to import `Popover`, `PopoverTrigger`, `PopoverContent` from the emcn UI components and `Ellipsis` from lucide-react if not already imported.

- [ ] **Step 4: Verify SIM builds**

```bash
cd /home/dean/sim/apps/sim && bun run build 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
cd /home/dean/sim
git add apps/sim/app/workspace/\[workspaceId\]/w/components/sidebar/sidebar.tsx
git commit -m "feat: update sidebar styling — search bar, footer nav, glass border"
```

---

### Task 3: Restyle workflow nodes

**Files:**
- Modify: `apps/sim/app/workspace/[workspaceId]/w/[workflowId]/components/workflow-block/workflow-block.tsx`
- Reference: `/home/dean/Desktop/New Folder/sim/apps/sim/app/workspace/[workspaceId]/w/[workflowId]/components/workflow-block/workflow-block.tsx`

This is the highest-impact visual change. Copy node styling exactly from the reference.

- [ ] **Step 1: Update the main block card outer div**

Find the `workflow-drag-handle` div className. Replace:
```tsx
'workflow-drag-handle relative z-[20] w-[250px] cursor-grab select-none rounded-[8px] border border-[var(--border-1)] bg-[var(--surface-2)] [&:active]:cursor-grabbing'
```
With:
```tsx
'workflow-drag-handle relative z-[20] w-[250px] cursor-grab select-none rounded-[var(--node-radius)] border border-[var(--node-border)] bg-[var(--node-bg)] backdrop-blur-sm transition-all duration-300 group-hover:[box-shadow:var(--node-hover-shadow)] [&:active]:cursor-grabbing'
```

- [ ] **Step 2: Redesign the header section**

Replace the entire header div (the one with icon, name, status badges) with the reference's gradient header. The reference header includes:

1. Outer div with gradient background and rounded top corners:
```tsx
<div
  className='relative overflow-hidden rounded-t-[var(--node-radius)] p-[10px]'
  style={{
    background: isEnabled
      ? `linear-gradient(135deg, ${config.bgColor}18 0%, transparent 60%)`
      : undefined,
  }}
>
```

2. Subtle top-edge highlight:
```tsx
<div className='pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent' />
```

3. Circular icon (28px, rounded-full, with glow shadow):
```tsx
<div
  className='flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full'
  style={{
    background: isEnabled ? config.bgColor : 'gray',
    boxShadow: isEnabled
      ? `0 0 14px ${config.bgColor}50, inset 0 1px 0 rgba(255,255,255,0.2)`
      : 'none',
  }}
>
  <config.icon className='h-[14px] w-[14px] text-white' />
</div>
```

4. Block name at 13px:
```tsx
<span className={cn('min-w-0 flex-1 truncate text-[13px] font-medium', ...)} title={name}>
```

Read the reference file's full header section (lines ~1285-1350) and copy it exactly, preserving the status badge logic.

- [ ] **Step 3: Update content section padding**

Find the content wrapper div. Change:
```tsx
<div className='flex flex-col gap-[8px] p-[8px]'>
```
To:
```tsx
<div className='flex flex-col gap-[6px] px-[10px] py-[8px]'>
```

- [ ] **Step 4: Verify SIM builds**

```bash
cd /home/dean/sim/apps/sim && bun run build 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
cd /home/dean/sim
git add apps/sim/app/workspace/\[workspaceId\]/w/\[workflowId\]/components/workflow-block/workflow-block.tsx
git commit -m "feat: restyle workflow nodes — gradient headers, glow icons, CSS var theming"
```

---

### Task 4: Redesign right panel and move logs to panel tab

**Files:**
- Modify: `apps/sim/app/workspace/[workspaceId]/w/[workflowId]/components/panel/panel.tsx`
- Reference: `/home/dean/Desktop/New Folder/sim/apps/sim/app/workspace/[workspaceId]/w/[workflowId]/components/panel/panel.tsx`

This is the most complex task. The panel gets glassmorphism, redesigned icon tabs, and a new Logs tab containing the Terminal component.

- [ ] **Step 1: Add Terminal import**

Add at the top of the imports:
```tsx
import { Terminal } from '@/app/workspace/[workspaceId]/w/[workflowId]/components/terminal/terminal'
```

Also ensure these lucide-react icons are imported: `Sparkles`, `SlidersHorizontal`, `ScrollText`, `Blocks` (or whatever icon names the reference uses for tabs).

- [ ] **Step 2: Update panel container**

Replace the `<aside>` and its inner `<div>` with the reference's glassmorphism styling:

```tsx
<aside
  ref={panelRef}
  className='panel-container fixed inset-y-0 right-0 z-10 overflow-hidden bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-l border-[var(--glass-border)] shadow-[inset_1px_0_0_0_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04)]'
  aria-label='Workflow panel'
>
  <div className='flex h-full flex-col'>
```

- [ ] **Step 3: Replace tab system with icon tabs**

Replace the entire tab header and tab content system with the reference's implementation. The reference uses icon buttons for Copilot, Blocks, Editor, Logs tabs with:
- Icon buttons in a flex row
- Active state with `bg-[var(--surface-5)]` background
- Glow underline indicator on active tab
- Utility actions (Chat, Deploy, Run) on the right side of the tab bar

Read the reference panel.tsx lines 416-560 for the exact tab bar JSX and copy it.

- [ ] **Step 4: Add Logs tab content**

After the Editor tab content section, add the Logs tab content:

```tsx
<div
  className={
    _hasHydrated && activeTab === 'logs'
      ? 'h-full [&_.terminal-container]:!static [&_.terminal-container]:!inset-auto [&_.terminal-container]:h-full [&_.terminal-container]:w-full [&_.terminal-container]:border-t-0'
      : _hasHydrated
        ? 'hidden'
        : 'h-full'
  }
  data-tab-content='logs'
>
  <Terminal />
</div>
```

- [ ] **Step 5: Update tab state to include 'logs'**

If the panel has a tab state (e.g., `activeTab` state or store), ensure `'logs'` is a valid tab value. Check the panel store or local state and add `'logs'` to the union type.

- [ ] **Step 6: Verify SIM builds**

```bash
cd /home/dean/sim/apps/sim && bun run build 2>&1 | tail -10
```

- [ ] **Step 7: Commit**

```bash
cd /home/dean/sim
git add apps/sim/app/workspace/\[workspaceId\]/w/\[workflowId\]/components/panel/panel.tsx
git commit -m "feat: redesign right panel — glass morphism, icon tabs, logs tab with terminal"
```

---

### Task 5: Update action bar button styling

**Files:**
- Modify: `apps/sim/app/workspace/[workspaceId]/w/[workflowId]/components/action-bar/action-bar.tsx`
- Reference: `/home/dean/Desktop/New Folder/sim/apps/sim/app/workspace/[workspaceId]/w/[workflowId]/components/action-bar/action-bar.tsx`

Simple styling update.

- [ ] **Step 1: Update ACTION_BUTTON_STYLES constant**

Find `ACTION_BUTTON_STYLES` and change `border-[var(--border-soft)]` to `border-[var(--border)]`:

```tsx
const ACTION_BUTTON_STYLES = [
  'h-[23px] w-[23px] rounded-[8px] p-0',
  'border border-[var(--border)] bg-[var(--surface-5)]',
  'text-[var(--text-secondary)]',
  'hover:border-transparent hover:bg-[var(--brand-secondary)] hover:!text-[var(--text-inverse)]',
  'dark:border-transparent dark:bg-[var(--surface-7)] dark:hover:bg-[var(--brand-secondary)]',
].join(' ')
```

- [ ] **Step 2: Commit**

```bash
cd /home/dean/sim
git add apps/sim/app/workspace/\[workspaceId\]/w/\[workflowId\]/components/action-bar/action-bar.tsx
git commit -m "feat: update action bar border styling"
```

---

### Task 6: Build and visual verification

- [ ] **Step 1: Build SIM**

```bash
cd /home/dean/sim/apps/sim && bun run build 2>&1 | tail -10
```

Fix any build errors.

- [ ] **Step 2: Start SIM and verify visually**

```bash
cd /home/dean/sim/apps/sim
fuser -k 3000/tcp 2>/dev/null
nohup bun run start > /tmp/sim-prod.log 2>&1 &
```

Open `http://localhost:9002/sim/workspace` and verify:
- Nodes have gradient headers, circular glowing icons, hover shadows
- Right panel has glass effect, icon tabs, Logs tab shows terminal
- Sidebar has updated search bar and footer nav
- Dark theme uses deeper purple-tinted colors

- [ ] **Step 3: Final commit if any visual fixes needed**
