# Implementation Guide
### Step-by-Step Setup for Your React Native/Expo Banking App

---

## 📦 STEP 1: Install Required Packages

```bash
# Navigate to your project directory
cd your-banking-app

# Install required dependencies
npx expo install expo-linear-gradient
npx expo install @expo/vector-icons
npx expo install react-native-safe-area-context
```

---

## 📁 STEP 2: Create Folder Structure

Create this exact folder structure in your project:

```
src/
├── theme/
│   ├── colors.js
│   ├── spacing.js
│   ├── typography.js
│   ├── shadows.js
│   ├── radius.js
│   ├── ThemeContext.js
│   ├── index.js
│   └── components/
│       ├── buttons.js
│       ├── cards.js
│       └── inputs.js
├── components/
│   ├── Button/
│   │   ├── PrimaryButton.js
│   │   ├── SecondaryButton.js
│   │   └── IconButton.js
│   └── Card/
│       ├── Card.js
│       ├── BalanceCard.js
│       └── TransactionCard.js
└── screens/
    ├── HomeScreen.js
    ├── TransactionsScreen.js
    └── ProfileScreen.js
```

---

## 📄 STEP 3: Copy Theme Files

Copy these files into your `src/theme/` directory:

1. **colors.js** - Color palette (light/dark modes)
2. **spacing.js** - Spacing system
3. **typography.js** - Typography scale
4. **shadows.js** - Shadow system
5. **radius.js** - Border radius values
6. **ThemeContext.js** - Theme provider
7. **index.js** - Main export file

Copy these into `src/theme/components/`:

1. **buttons.js** - Button styles
2. **cards.js** - Card styles
3. **inputs.js** - Input styles

---

## 🔧 STEP 4: Setup Theme Provider

Update your `App.js`:

```javascript
// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme/ThemeContext';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <MainNavigator />
    </ThemeProvider>
  );
}
```

---

## 🎨 STEP 5: Create Your First Component

Create a sample button component:

```javascript
// src/components/Button/PrimaryButton.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { BUTTON_STYLES, BUTTON_TEXT_STYLES } from '../../theme/components/buttons';
import { Feather } from '@expo/vector-icons';

const PrimaryButton = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  icon,
  fullWidth = false 
}) => {
  const { colors, shadows } = useTheme();

  return (
    <TouchableOpacity
      style={[
        BUTTON_STYLES.primary,
        { backgroundColor: colors.primary[500] },
        shadows.md,
        fullWidth && BUTTON_STYLES.fullWidth,
        disabled && BUTTON_STYLES.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.inverse} />
      ) : (
        <>
          {icon && (
            <Feather name={icon} size={20} color={colors.text.inverse} />
          )}
          <Text style={[BUTTON_TEXT_STYLES.primary, { color: colors.text.inverse }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
```

---

## 📱 STEP 6: Create Your First Screen

Create a sample home screen:

```javascript
// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SPACING, LAYOUT } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import PrimaryButton from '../components/Button/PrimaryButton';
import BalanceCard from '../components/Card/BalanceCard';

const HomeScreen = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: LAYOUT.screenHorizontal,
          paddingTop: LAYOUT.screenTop,
          paddingBottom: LAYOUT.screenBottom,
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: SPACING.xl }}>
          <Text style={{
            ...TYPOGRAPHY.h1,
            color: colors.text.primary,
          }}>
            Welcome Back
          </Text>
          <Text style={{
            ...TYPOGRAPHY.bodyLarge,
            color: colors.text.secondary,
            marginTop: SPACING.xs,
          }}>
            Here's your financial overview
          </Text>
        </View>

        {/* Balance Card */}
        <BalanceCard
          label="Total Balance"
          balance={12400.00}
          trend={24.5}
        />

        {/* Action Button */}
        <View style={{ marginTop: SPACING.xl }}>
          <PrimaryButton
            title="Send Money"
            icon="send"
            onPress={() => console.log('Send Money')}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
```

---

## 🧪 STEP 7: Test Theme Switching

Add a theme toggle button to test dark mode:

```javascript
// Add this to any screen
import { useTheme } from '../theme/ThemeContext';
import { TouchableOpacity, Text } from 'react-native';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Text>Switch to {isDarkMode ? 'Light' : 'Dark'} Mode</Text>
    </TouchableOpacity>
  );
};
```

---

## ✅ STEP 8: Verification Checklist

Ensure everything is working:

- [ ] App runs without errors
- [ ] Colors load from theme (not hardcoded)
- [ ] Theme switching works (light/dark)
- [ ] Spacing is consistent
- [ ] Typography scales properly
- [ ] Shadows render correctly
- [ ] Buttons respond to press
- [ ] Cards display with proper styling

---

## 🎯 STEP 9: Using with AI

When generating new screens with AI, use this prompt template:

```
Create a [SCREEN NAME] for a React Native banking app.

Use the PREMIUM_DESIGN_SYSTEM.md for ALL styling.

REQUIRED IMPORTS:
import { useTheme } from '../theme/ThemeContext';
import { SPACING, LAYOUT } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { RADIUS } from '../theme/radius';

STRUCTURE:
- SafeAreaView with colors.background.primary
- ScrollView with LAYOUT.screenHorizontal padding
- Sections with SPACING.xl gap

COMPONENTS:
[List your specific components and their styles]

COLORS from theme ONLY:
- Background: colors.background.primary
- Cards: colors.background.card + shadows.md
- Primary: colors.primary[500]
- Text: colors.text.primary/secondary

NO HARDCODED VALUES. Use design system tokens only.
```

---

## 🔄 STEP 10: Create More Components

Based on your needs, create more reusable components:

### Example: Card Component

```javascript
// src/components/Card/Card.js
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { CARD_STYLES } from '../../theme/components/cards';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';

const Card = ({ title, subtitle, children }) => {
  const { colors, shadows } = useTheme();

  return (
    <View
      style={[
        CARD_STYLES.default,
        { backgroundColor: colors.background.card },
        shadows.md,
      ]}
    >
      {title && (
        <Text style={{
          ...TYPOGRAPHY.h4,
          color: colors.text.primary,
          marginBottom: SPACING.xs,
        }}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={{
          ...TYPOGRAPHY.bodyRegular,
          color: colors.text.secondary,
          marginBottom: SPACING.base,
        }}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
};

export default Card;
```

---

## 🚀 ADVANCED: Navigation Setup

If using React Navigation:

```bash
npm install @react-navigation/native
npm install @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```

Create themed navigator:

```javascript
// src/navigation/MainNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const { colors, isDarkMode } = useTheme();

  return (
    <NavigationContainer theme={{
      dark: isDarkMode,
      colors: {
        primary: colors.primary[500],
        background: colors.background.primary,
        card: colors.background.card,
        text: colors.text.primary,
        border: colors.border.light,
        notification: colors.error,
      },
    }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Transactions') iconName = 'list';
            else if (route.name === 'Profile') iconName = 'user';
            
            return <Feather name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary[500],
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarStyle: {
            backgroundColor: colors.background.card,
            borderTopColor: colors.border.light,
          },
          headerStyle: {
            backgroundColor: colors.background.card,
          },
          headerTintColor: colors.text.primary,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
```

---

## 💡 BEST PRACTICES

### 1. Always Use Theme Hook
```javascript
// ✅ Correct
const { colors, shadows } = useTheme();
backgroundColor: colors.primary[500]

// ❌ Wrong
backgroundColor: '#2196F3'
```

### 2. Use Spacing Constants
```javascript
// ✅ Correct
import { SPACING } from '../theme/spacing';
marginBottom: SPACING.xl

// ❌ Wrong
marginBottom: 24
```

### 3. Use Typography Scale
```javascript
// ✅ Correct
import { TYPOGRAPHY } from '../theme/typography';
style={{ ...TYPOGRAPHY.h1, color: colors.text.primary }}

// ❌ Wrong
style={{ fontSize: 32, fontWeight: 'bold' }}
```

### 4. Use Component Styles
```javascript
// ✅ Correct
import { BUTTON_STYLES } from '../theme/components/buttons';
style={[BUTTON_STYLES.primary, { backgroundColor: colors.primary[500] }]}

// ❌ Wrong
style={{ padding: 16, borderRadius: 12, ... }}
```

---

## 🐛 TROUBLESHOOTING

### Issue: Theme not updating
**Solution:** Ensure `ThemeProvider` wraps your entire app in `App.js`

### Issue: Colors look wrong
**Solution:** Check you're using `useTheme()` hook and accessing `colors.X`

### Issue: Gradients not working
**Solution:** 
```javascript
import { LinearGradient } from 'expo-linear-gradient';
const { gradients } = useTheme();
<LinearGradient colors={gradients.primary.colors} {...gradients.primary} />
```

### Issue: Shadows not visible
**Solution:** 
```javascript
// Use shadows from theme
const { shadows } = useTheme();
style={[styles.card, shadows.md]}
```

---

## 📚 ADDITIONAL RESOURCES

### Design System Files
- `PREMIUM_DESIGN_SYSTEM.md` - Complete design system documentation
- `AI_PROMPTING_GUIDE.md` - Guide for consistent AI generation
- `colors.js` - Color palette
- `spacing.js` - Spacing system
- `typography.js` - Typography scale

### Component Examples
- `ExampleButton.js` - Button component examples
- `ExampleCard.js` - Card component examples

---

## 🎉 YOU'RE READY!

You now have:

✅ Complete design system setup
✅ Theme provider for light/dark mode
✅ Reusable component library
✅ Consistent spacing, colors, typography
✅ AI-ready prompting system
✅ Professional, premium design

Start building your screens and maintain consistency across your entire app!

---

## 📞 NEXT STEPS

1. Create your remaining screens
2. Build additional components as needed
3. Use AI prompting guide for consistency
4. Test both light and dark modes
5. Refine and customize for your brand

Happy coding! 🚀
