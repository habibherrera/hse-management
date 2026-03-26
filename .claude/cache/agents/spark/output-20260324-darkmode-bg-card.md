# Quick Fix: Dark Mode bg-white -> bg-card Replacements
Generated: 2026-03-24

## Changes Made

### 1. `src/app/(main)/reports/page.tsx`
- Lines 21 & 34: Replaced `bg-white` with `bg-card` on both card divs

### 2. `src/app/(main)/admin/users/page.tsx`
- Line 40: Replaced `bg-white` with `bg-card` on the table wrapper div

### 3. `src/components/events/event-filters.tsx`
- Line 55: Replaced `bg-white` with `bg-card` on the search input

### 4. `src/components/events/event-form.tsx`
- Line 82 (inputClass): Replaced `bg-white` with `bg-card`, added `dark:border-slate-700`
- Line 97: Replaced `bg-white` with `bg-card` on sectionEvent card div
- Line 129 (textarea): Replaced `bg-white` with `bg-card`, added `dark:border-slate-700`
- Line 150: Replaced `bg-white` with `bg-card` on sectionLocation card div
- Line 205: Replaced `bg-white` with `bg-card` on sectionResponsibility card div

### 5. `src/components/events/report-exporter.tsx`
- Line 18 (inputClass): Replaced `bg-white` with `bg-card`, added `dark:border-slate-700`

### 6. `src/components/events/user-create-dialog.tsx`
- Line 17 (inputClass): Replaced `bg-white` with `bg-card`, added `dark:border-slate-700`

### 7. `src/app/(auth)/login/page.tsx`
- Line 143 (password input): Added `dark:border-slate-700`, `dark:bg-slate-800/50`, `text-foreground`, `dark:focus:bg-slate-800`

## Verification
- Pattern followed: bg-card (CSS variable, respects dark mode) replaces hardcoded bg-white
- dark:border-slate-700 added wherever border-slate-200 was present on inputs/textareas
- No syntax changes beyond class string replacements

## Files Modified
1. `src/app/(main)/reports/page.tsx`
2. `src/app/(main)/admin/users/page.tsx`
3. `src/components/events/event-filters.tsx`
4. `src/components/events/event-form.tsx`
5. `src/components/events/report-exporter.tsx`
6. `src/components/events/user-create-dialog.tsx`
7. `src/app/(auth)/login/page.tsx`
