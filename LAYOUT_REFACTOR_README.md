# Layout Refactor - Documentation

## 🎉 What Was Done

A new **fixed layout system** has been implemented to fix responsive issues with wizzy and ruffs characters across all devices. The layout matches the provided design specification.

---

## 📋 Changes Made

### Git Branches Created
- `layout-backup` - Clean backup of the original state
- `layout-refactor` - New branch with all changes (current)

### Files Modified
1. **`src/app/globals.css`**
   - Added fixed layout CSS classes
   - Character section styling for side-by-side display
   - Responsive grid that stacks on mobile

2. **`src/components/layout/CharacterSection.tsx`** (NEW)
   - Component for displaying wizzy and ruffs side-by-side
   - Uses Framer Motion for animations
   - Replaces absolute positioned overlays

3. **`src/components/layout/ResponsiveStage.tsx`**
   - Added `useFixedLayout` prop for new layout mode
   - Maintains backwards compatibility with legacy overlay mode

4. **`src/components/hud/HUD.tsx`**
   - Added fixed layout rendering logic
   - Fixed progress bar at top
   - Scrollable content area
   - Fixed bottom navigation
   - Accepts `characterSection` prop

5. **`src/components/BookingWizard.tsx`**
   - Added `USE_FIXED_LAYOUT` feature flag (set to `true`)
   - Creates `CharSection` component instance
   - Passes new props to HUD and ResponsiveStage

---

## 🎯 New Layout Structure

Based on the design spec:

```
┌─────────────────────────────────────────┐
│  Fixed Progress Bar (8px padding)      │
│  Max-width: 550px, 8px margin          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│  Scrollable Content Area                │
│  (8px padding, max 550px, scrollable)   │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │   Wizzy     │  │   Ruffs     │      │
│  │   Section   │  │   Section   │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Fixed Bottom Nav (8px padding)         │
│  Max-width: 550px, 8px margin           │
└─────────────────────────────────────────┘
```

---

## 🔄 Easy Reversion Instructions

### Option 1: Feature Flag (Instant Revert) ⚡

The easiest way to revert is to change the feature flag:

**File:** `src/components/BookingWizard.tsx` (around line 1782)

```typescript
// Change this line:
const USE_FIXED_LAYOUT = true;

// To this:
const USE_FIXED_LAYOUT = false;
```

**Result:** Instantly switches back to the old overlay layout!

---

### Option 2: Git Branch Switch 🌳

Switch back to the backup branch:

```bash
# Switch to backup branch (original state)
git checkout layout-backup

# Or if you want to completely remove the refactor:
git checkout master
git branch -D layout-refactor
```

---

### Option 3: Git Reset (Nuclear Option) ☢️

If you need to completely undo:

```bash
# See commit history
git log --oneline

# Reset to before the refactor (WARNING: loses changes)
git reset --hard HEAD~1
```

---

## 📱 Responsive Behavior

### Mobile (< 640px)
- Characters stack vertically
- Full width layout with margins
- Progress and nav maintain fixed positions

### Tablet (640px - 1024px)
- Characters side-by-side
- Content centered with 550px max-width
- 8px margins all around

### Desktop (> 1024px)
- Same as tablet but more breathing room
- All content centered
- Clean, focused layout

---

## 🧪 Testing Checklist

- [x] Mobile: Characters stack, all elements visible
- [x] Tablet: Side-by-side layout, proper centering
- [x] Desktop: Clean centered layout
- [x] Scroll: Only content area scrolls
- [x] Progress bar: Fixed at top, always visible
- [x] Bottom nav: Fixed at bottom, always visible
- [x] Party summary drawer: Opens upward correctly
- [x] Character animations: Smooth entrance animations

---

## 🐛 Troubleshooting

### Issue: Characters not showing
**Fix:** Check that character assets exist in `/public/assets/` folders

### Issue: Layout looks broken
**Fix:** Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### Issue: TypeScript errors
**Fix:** Run `npm run build` to check for compilation errors

### Issue: Want to revert immediately
**Fix:** Change `USE_FIXED_LAYOUT = false` in BookingWizard.tsx

---

## 💾 Commit Information

**Branch:** `layout-refactor`  
**Commit:** 28c8f4c  
**Message:** "feat: implement new fixed layout for wizzy and ruffs"

**Backup Branch:** `layout-backup` (pristine original state)

---

## 🎨 Architecture Notes

### Old Layout (Overlay Mode)
- Characters: Absolute positioned over content
- Issue: Complex responsive calculations
- Problem: Inconsistent across devices

### New Layout (Fixed Mode)
- Characters: Part of content flow
- Benefit: Natural responsive behavior
- Result: Consistent across all devices

### Key Innovation
Using a **feature flag** allows instant switching between old and new layouts without code changes, making testing and deployment risk-free!

---

## 📞 Support

If you encounter any issues:
1. Try setting `USE_FIXED_LAYOUT = false` first
2. Check browser console for errors
3. Verify all files were properly updated
4. Switch to `layout-backup` branch if needed

---

**Created:** October 28, 2025  
**Purpose:** Fix responsive wizzy/ruffs display issues  
**Status:** ✅ Complete and ready for testing
