# AI Prompting Guide for Consistent Design
### How to Get AI to Use Your Design System Consistently

---

## 🎯 THE PROBLEM

When generating screens with AI, you often get:
- ❌ Different colors on each screen
- ❌ Inconsistent spacing and padding
- ❌ Various card styles and shadows
- ❌ Mixed typography
- ❌ Random component designs

## ✅ THE SOLUTION

Use **specific, structured prompts** that reference your design system tokens.

---

## 📋 PROMPT TEMPLATE

Use this template for **every screen you generate**:

```
Create a React Native screen for [SCREEN PURPOSE].

CRITICAL: Use the PREMIUM_DESIGN_SYSTEM.md for ALL styling.

DESIGN SYSTEM RULES:
1. COLORS:
   - Background: colors.background.primary
   - Cards: colors.background.card with shadows.md
   - Primary button: colors.primary[500]
   - Text: colors.text.primary (headings), colors.text.secondary (body)
   
2. SPACING:
   - Screen padding: SPACING.base (16px) horizontal, SPACING.huge (48px) top
   - Between sections: SPACING.xl (24px)
   - Card padding: SPACING.base or SPACING.xl
   - Between elements: SPACING.md (12px)
   
3. TYPOGRAPHY:
   - Screen title: TYPOGRAPHY.h1
   - Section headers: TYPOGRAPHY.h4
   - Body text: TYPOGRAPHY.bodyLarge
   - Captions: TYPOGRAPHY.bodySmall
   - Financial numbers: TYPOGRAPHY.financialLarge
   
4. COMPONENTS:
   - Buttons: BUTTON_STYLES.primary with RADIUS.md (12px)
   - Cards: CARD_STYLES.default with RADIUS.xl (20px), shadows.md
   - Inputs: INPUT_STYLES.input with RADIUS.md
   - Use theme colors via useTheme() hook
   
5. LAYOUT:
   - SafeAreaView for container
   - ScrollView for content
   - Section spacing: SPACING.xl
   - Full-width buttons at bottom

REQUIRED IMPORTS:
- import { useTheme } from '../theme/ThemeContext';
- import { SPACING } from '../theme/spacing';
- import { TYPOGRAPHY } from '../theme/typography';
- import { RADIUS } from '../theme/radius';
- Component styles from theme/components/

NO hardcoded colors, spacing, or sizes. Only use design system tokens.

[Your specific screen requirements here]
```

---

## 🎨 SPECIFIC EXAMPLES

### Example 1: Home Screen

```
Create a React Native Home Screen for a banking app.

Use PREMIUM_DESIGN_SYSTEM.md for ALL styling.

LAYOUT:
- SafeAreaView with colors.background.primary
- ScrollView with SPACING.base horizontal padding
- Top padding: SPACING.huge (48px)

COMPONENTS NEEDED:
1. Header (60px height):
   - Avatar (40x40, RADIUS.full)
   - Greeting text (TYPOGRAPHY.h5, colors.text.primary)
   - Icon button (48x48)

2. Balance Card (180px min height):
   - Use BalanceCard component style
   - CARD_STYLES.balance with gradient background
   - Label: TYPOGRAPHY.bodySmall
   - Amount: TYPOGRAPHY.financialLarge
   - Trend indicator with icon

3. Quick Actions (2x2 grid):
   - Gap: SPACING.base
   - Each action: CARD_STYLES.compact, 100px height
   - Icon: 32x32, colors.primary[500]
   - Label: TYPOGRAPHY.label

4. Recent Transactions List:
   - Section header: TYPOGRAPHY.h4
   - Use TransactionCard component
   - Gap between cards: SPACING.md

COLORS:
- Background: colors.background.primary
- Cards: colors.background.card + shadows.md
- Text: colors.text.primary/secondary/tertiary

SPACING:
- Screen edges: SPACING.base (16px)
- Between sections: SPACING.xl (24px)
- Card padding: SPACING.xl (24px)

Import useTheme() and all necessary design tokens.
NO hardcoded values.
```

### Example 2: Transaction List Screen

```
Create a Transaction List Screen.

Use PREMIUM_DESIGN_SYSTEM.md for ALL styling.

STRUCTURE:
1. Header:
   - Title: "Transactions" (TYPOGRAPHY.h1, colors.text.primary)
   - Filter button (BUTTON_STYLES.iconRound)
   - Height: 60px

2. Search Bar:
   - INPUT_STYLES.search
   - RADIUS.full
   - Background: colors.background.input
   - Icon: search (Feather)

3. Date Tabs:
   - Use TAB_STYLES.tabBar
   - Options: "All", "Today", "This Week", "This Month"
   - Active: colors.primary[500]

4. Transaction List:
   - FlatList with SPACING.md gap
   - Each item: TransactionCard component
   - Icon container: 40x40, RADIUS.md
   - Title: TYPOGRAPHY.bodyLarge, fontWeight: 500
   - Subtitle: TYPOGRAPHY.bodySmall, colors.text.secondary
   - Amount: TYPOGRAPHY.financialSmall
   - Green for credit (+), Red for debit (-)

IMPORTS REQUIRED:
import { useTheme } from '../theme/ThemeContext';
import { SPACING, LAYOUT } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { INPUT_STYLES } from '../theme/components/inputs';
import { CARD_STYLES } from '../theme/components/cards';

NO hardcoded values. Use theme tokens only.
```

---

## 🔑 KEY PHRASES TO INCLUDE

Always include these phrases in your prompts:

1. **"Use PREMIUM_DESIGN_SYSTEM.md for ALL styling"**
2. **"Import useTheme() hook for colors and shadows"**
3. **"NO hardcoded colors, spacing, or sizes"**
4. **"Use design system tokens only"**
5. **"Import all necessary theme files"**

---

## 📊 SPACING QUICK REFERENCE

Include this in prompts when relevant:

```
SPACING VALUES:
- xs: 4px
- sm: 8px
- md: 12px (gap between elements)
- base: 16px (screen padding, card padding)
- lg: 20px
- xl: 24px (section spacing)
- xxl: 32px
- huge: 48px (screen top padding)
```

---

## 🎨 COLOR QUICK REFERENCE

```
COMMON COLORS:
- Background: colors.background.primary (#FFFFFF light, #0A0E1A dark)
- Cards: colors.background.card (#FFFFFF light, #1F2937 dark)
- Primary action: colors.primary[500] (#2196F3 light, #42A5F5 dark)
- Text primary: colors.text.primary (#111827 light, #F5F7FA dark)
- Text secondary: colors.text.secondary (#6B7280 light, #C5CEE0 dark)
- Success: colors.success (#10B981 light, #34D399 dark)
- Error: colors.error (#EF4444 light, #F87171 dark)
```

---

## 🏗️ COMPONENT REFERENCE

```
BUTTONS:
- Primary: BUTTON_STYLES.primary + colors.primary[500] + shadows.md
- Secondary: BUTTON_STYLES.secondary + borderColor
- Icon: BUTTON_STYLES.iconRound + 48x48

CARDS:
- Standard: CARD_STYLES.default + colors.background.card + shadows.md
- Balance: CARD_STYLES.balance + LinearGradient + RADIUS.xl
- Transaction: CARD_STYLES.transaction + shadows.sm

INPUTS:
- Text: INPUT_STYLES.input + colors.background.input + RADIUS.md
- Search: INPUT_STYLES.search + RADIUS.full

RADIUS:
- Buttons: RADIUS.md (12px)
- Cards: RADIUS.xl (20px)
- Inputs: RADIUS.md (12px)
- Pills: RADIUS.full
```

---

## 🚫 COMMON MISTAKES TO AVOID

**DON'T:**
```javascript
// ❌ Hardcoded color
backgroundColor: '#2196F3'

// ❌ Hardcoded spacing
marginBottom: 24

// ❌ Inline styles
fontSize: 16, fontWeight: 'bold'

// ❌ Random values
borderRadius: 15
```

**DO:**
```javascript
// ✅ Use theme colors
backgroundColor: colors.primary[500]

// ✅ Use spacing constants
marginBottom: SPACING.xl

// ✅ Use typography scale
...TYPOGRAPHY.h4

// ✅ Use radius constants
borderRadius: RADIUS.md
```

---

## 📝 PROMPT CHECKLIST

Before generating a screen, ensure your prompt includes:

- [ ] Reference to PREMIUM_DESIGN_SYSTEM.md
- [ ] Specific color tokens (colors.X)
- [ ] Spacing values (SPACING.X)
- [ ] Typography styles (TYPOGRAPHY.X)
- [ ] Component styles (X_STYLES.Y)
- [ ] Border radius (RADIUS.X)
- [ ] Shadow levels (shadows.X)
- [ ] Required imports list
- [ ] "NO hardcoded values" instruction
- [ ] Theme hook usage (useTheme())

---

## 🎯 ADVANCED: Multi-Screen Consistency

When generating multiple related screens:

```
Create [SCREEN 1], [SCREEN 2], and [SCREEN 3] for a banking app.

CRITICAL CONSISTENCY RULES:
1. ALL screens use identical:
   - Header structure (60px height, TYPOGRAPHY.h1 title)
   - Screen padding (SPACING.base horizontal, SPACING.huge top)
   - Section spacing (SPACING.xl between sections)
   - Card style (CARD_STYLES.default, RADIUS.xl, shadows.md)

2. Navigation:
   - Bottom tab bar: 64px height
   - Icons: 24x24
   - Active: colors.primary[500]
   - Inactive: colors.text.tertiary

3. Colors from theme only:
   - Background: colors.background.primary
   - Cards: colors.background.card
   - Primary: colors.primary[500]

Generate each screen separately but maintain exact style consistency.
Use PREMIUM_DESIGN_SYSTEM.md for ALL screens.
```

---

## 💡 PRO TIPS

### 1. Be Extremely Specific
Instead of: "Create a nice looking button"
Use: "Create a button using BUTTON_STYLES.primary, colors.primary[500], shadows.md, RADIUS.md, TYPOGRAPHY.button"

### 2. Reference Exact Component Styles
Instead of: "Make a card for the balance"
Use: "Create a card using CARD_STYLES.balance with LinearGradient (gradients.primary.colors), TYPOGRAPHY.financialLarge for amount"

### 3. Specify Exact Measurements
Instead of: "Add some spacing"
Use: "Add SPACING.xl (24px) margin bottom between sections, SPACING.md (12px) gap between elements"

### 4. Always Include Imports
```
REQUIRED IMPORTS:
import { useTheme } from '../theme/ThemeContext';
import { SPACING } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { BUTTON_STYLES } from '../theme/components/buttons';
```

### 5. Request Theme Hook Usage
"Use const { colors, shadows } = useTheme() and reference all colors as colors.X"

---

## 🔄 TESTING YOUR PROMPT

Before using a prompt with AI:

1. **Does it reference the design system?** ✓
2. **Does it use token names, not values?** ✓
3. **Does it specify imports?** ✓
4. **Does it forbid hardcoded values?** ✓
5. **Is it specific about components?** ✓

If all ✓, your prompt is good!

---

## 📖 EXAMPLE: COMPLETE PROMPT

```
Create a React Native Profile Settings Screen.

Use PREMIUM_DESIGN_SYSTEM.md for ALL styling.

IMPORTS REQUIRED:
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SPACING } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { RADIUS } from '../theme/radius';
import { CARD_STYLES } from '../theme/components/cards';
import { Feather } from '@expo/vector-icons';

LAYOUT STRUCTURE:
1. SafeAreaView: backgroundColor = colors.background.primary
2. ScrollView: paddingHorizontal = SPACING.base, paddingTop = SPACING.huge
3. Sections with SPACING.xl gap

COMPONENTS:

Header Section (no card):
- Avatar: 80x80, RADIUS.full, backgroundColor: colors.background.secondary
- Name: TYPOGRAPHY.h2, colors.text.primary, marginTop: SPACING.md
- Email: TYPOGRAPHY.bodyRegular, colors.text.secondary

Settings Card (CARD_STYLES.default):
- Background: colors.background.card
- Shadow: shadows.md
- Border radius: RADIUS.xl
- Padding: SPACING.base

Each Setting Item:
- Height: 64px
- Padding: SPACING.base
- Border bottom: 1px, colors.border.light (except last item)
- Icon: 24x24, colors.primary[500]
- Label: TYPOGRAPHY.bodyLarge, colors.text.primary
- Arrow: Feather 'chevron-right', colors.text.tertiary

Settings List:
1. Edit Profile
2. Security
3. Notifications
4. Privacy
5. Help & Support

Logout Button:
- BUTTON_STYLES.secondary
- borderColor: colors.error
- Text color: colors.error
- RADIUS.md
- marginTop: SPACING.xl

COLORS ONLY from theme:
- useTheme() hook
- colors.background.primary/secondary/card
- colors.text.primary/secondary/tertiary
- colors.primary[500]
- colors.border.light

SPACING ONLY from constants:
- SPACING.base, md, xl, huge
- NO hardcoded pixels

TYPOGRAPHY ONLY from scale:
- TYPOGRAPHY.h2, bodyLarge, bodyRegular
- NO inline font sizes

Generate complete, working code following these exact specifications.
```

---

## 🎉 RESULTS

Following this guide will give you:

✅ **Consistent colors** across all screens
✅ **Uniform spacing** and padding
✅ **Matching typography** hierarchy
✅ **Identical component** styles
✅ **Professional, cohesive** design
✅ **Easy theme switching** (light/dark)
✅ **Maintainable** codebase

---

## 🆘 TROUBLESHOOTING

**Problem:** AI still uses hardcoded values
**Solution:** Add "CRITICAL: NO hardcoded colors, spacing, or typography. ONLY use design system tokens." at the top of your prompt.

**Problem:** Inconsistent shadows
**Solution:** Specify exact shadow level: "Use shadows.md for all cards" in your prompt.

**Problem:** Different card styles
**Solution:** Be specific: "All cards use CARD_STYLES.default with RADIUS.xl and shadows.md"

**Problem:** Mixed typography
**Solution:** List exact typography for each element: "Title: TYPOGRAPHY.h1, Body: TYPOGRAPHY.bodyLarge"

---

## 🚀 QUICK START

Copy this base prompt and customize:

```
Create a [SCREEN NAME] screen using React Native.

CRITICAL: Use PREMIUM_DESIGN_SYSTEM.md for ALL styling.

DESIGN TOKENS ONLY:
- Colors: colors.* (via useTheme())
- Spacing: SPACING.*
- Typography: TYPOGRAPHY.*
- Radius: RADIUS.*
- Shadows: shadows.*
- Components: *_STYLES.*

NO HARDCODED VALUES.

[Your specific requirements]

Import useTheme and all necessary theme files.
```

---

Remember: **Specificity = Consistency**

The more specific you are with design tokens in your prompts, the more consistent your generated screens will be!
