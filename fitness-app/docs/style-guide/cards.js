// theme/components/cards.js
// Card Component Styles

import { SPACING, RADIUS } from './spacing';

export const CARD_STYLES = {
  // Standard Card
  default: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    overflow: 'hidden',
  },

  // Elevated Card (more shadow)
  elevated: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    overflow: 'hidden',
  },

  // Flat Card (no shadow, with border)
  flat: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Compact Card (less padding)
  compact: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    overflow: 'hidden',
  },

  // Glass Card (semi-transparent - requires custom background)
  glass: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Feature Card (hero/highlight card)
  feature: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    overflow: 'hidden',
    minHeight: 200,
  },

  // Balance Card (financial display)
  balance: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    overflow: 'hidden',
    minHeight: 180,
  },

  // Transaction Card (list item style)
  transaction: {
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    overflow: 'hidden',
  },

  // Stat Card (metric display)
  stat: {
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    overflow: 'hidden',
    minHeight: 100,
  },

  // Horizontal Card
  horizontal: {
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    overflow: 'hidden',
  },
};

// Card Section Styles
export const CARD_SECTION_STYLES = {
  header: {
    marginBottom: SPACING.md,
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
  },
};

// Card Image Styles
export const CARD_IMAGE_STYLES = {
  cover: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

// Example Usage:
/*
import { useTheme } from '../theme/ThemeContext';
import { CARD_STYLES } from '../theme/components/cards';

const MyCard = ({ children }) => {
  const { colors, shadows } = useTheme();
  
  return (
    <View
      style={[
        CARD_STYLES.default,
        { backgroundColor: colors.background.card },
        shadows.md,
      ]}
    >
      {children}
    </View>
  );
};
*/
