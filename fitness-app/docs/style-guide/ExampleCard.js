// components/ExampleCard.js
// Example: How to create Card components using the design system

import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { CARD_STYLES, CARD_IMAGE_STYLES } from '../theme/components/cards';
import { TYPOGRAPHY } from '../theme/typography';
import { SPACING } from '../theme/spacing';
import { Feather } from '@expo/vector-icons';

/**
 * Standard Card Component
 */
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
        <Text style={[
          { ...TYPOGRAPHY.h4, color: colors.text.primary, marginBottom: SPACING.xs }
        ]}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={[
          { ...TYPOGRAPHY.bodyRegular, color: colors.text.secondary, marginBottom: SPACING.base }
        ]}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
};

/**
 * Balance Card Component (with gradient background)
 */
const BalanceCard = ({ balance, label, trend, currency = '$' }) => {
  const { colors, gradients } = useTheme();

  return (
    <LinearGradient
      colors={gradients.primary.colors}
      start={gradients.primary.start}
      end={gradients.primary.end}
      style={CARD_STYLES.balance}
    >
      <Text style={[
        { ...TYPOGRAPHY.bodySmall, color: 'rgba(255, 255, 255, 0.8)', marginBottom: SPACING.xs }
      ]}>
        {label}
      </Text>
      <Text style={[
        { ...TYPOGRAPHY.financialLarge, color: '#FFFFFF' }
      ]}>
        {currency}{balance.toLocaleString()}
      </Text>
      {trend && (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: SPACING.xs, 
          marginTop: SPACING.md 
        }}>
          <Feather 
            name={trend > 0 ? 'trending-up' : 'trending-down'} 
            size={16} 
            color="rgba(255, 255, 255, 0.9)" 
          />
          <Text style={[
            { ...TYPOGRAPHY.bodyRegular, color: 'rgba(255, 255, 255, 0.9)' }
          ]}>
            {trend > 0 ? '+' : ''}{trend}%
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

/**
 * Transaction Card Component
 */
const TransactionCard = ({ icon, title, subtitle, amount, date, type = 'credit' }) => {
  const { colors, shadows } = useTheme();

  const amountColor = type === 'credit' ? colors.success : colors.error;

  return (
    <View
      style={[
        CARD_STYLES.transaction,
        { backgroundColor: colors.background.card },
        shadows.sm,
      ]}
    >
      <View style={[
        CARD_IMAGE_STYLES.icon,
        { backgroundColor: colors.background.secondary }
      ]}>
        <Feather name={icon} size={20} color={colors.primary[500]} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[
          { ...TYPOGRAPHY.bodyLarge, color: colors.text.primary, fontWeight: '500' }
        ]}>
          {title}
        </Text>
        <Text style={[
          { ...TYPOGRAPHY.bodySmall, color: colors.text.secondary, marginTop: 2 }
        ]}>
          {subtitle || date}
        </Text>
      </View>

      <Text style={[
        { ...TYPOGRAPHY.financialSmall, color: amountColor }
      ]}>
        {type === 'credit' ? '+' : '-'}${amount.toLocaleString()}
      </Text>
    </View>
  );
};

/**
 * Stat Card Component (for metrics/KPIs)
 */
const StatCard = ({ label, value, change, icon }) => {
  const { colors, shadows } = useTheme();

  const changeColor = change >= 0 ? colors.success : colors.error;

  return (
    <View
      style={[
        CARD_STYLES.stat,
        { backgroundColor: colors.background.card },
        shadows.md,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={[
            { ...TYPOGRAPHY.label, color: colors.text.secondary, marginBottom: SPACING.xs }
          ]}>
            {label}
          </Text>
          <Text style={[
            { ...TYPOGRAPHY.financialMedium, color: colors.text.primary }
          ]}>
            {value}
          </Text>
        </View>
        
        {icon && (
          <View style={[
            { 
              width: 40, 
              height: 40, 
              borderRadius: 8, 
              backgroundColor: colors.primary[500] + '20',
              justifyContent: 'center',
              alignItems: 'center'
            }
          ]}>
            <Feather name={icon} size={20} color={colors.primary[500]} />
          </View>
        )}
      </View>

      {change !== undefined && (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: 4, 
          marginTop: SPACING.sm 
        }}>
          <Feather 
            name={change >= 0 ? 'arrow-up-right' : 'arrow-down-right'} 
            size={14} 
            color={changeColor} 
          />
          <Text style={[
            { ...TYPOGRAPHY.bodySmall, color: changeColor }
          ]}>
            {Math.abs(change)}%
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Feature Card with Image
 */
const FeatureCard = ({ image, title, description, onPress }) => {
  const { colors, shadows } = useTheme();

  return (
    <View
      style={[
        CARD_STYLES.feature,
        { backgroundColor: colors.background.card },
        shadows.lg,
      ]}
    >
      {image && (
        <Image 
          source={image} 
          style={CARD_IMAGE_STYLES.cover}
          resizeMode="cover"
        />
      )}
      <View style={{ padding: SPACING.base }}>
        <Text style={[
          { ...TYPOGRAPHY.h3, color: colors.text.primary, marginBottom: SPACING.xs }
        ]}>
          {title}
        </Text>
        <Text style={[
          { ...TYPOGRAPHY.bodyRegular, color: colors.text.secondary }
        ]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

export { Card, BalanceCard, TransactionCard, StatCard, FeatureCard };

// USAGE EXAMPLE:
/*
import { BalanceCard, TransactionCard, StatCard } from './components/ExampleCard';

const MyScreen = () => {
  return (
    <ScrollView>
      <BalanceCard
        label="Total Balance"
        balance={12400.00}
        trend={24.5}
      />

      <TransactionCard
        icon="shopping-bag"
        title="Amazon"
        subtitle="Shopping"
        amount={142.50}
        type="debit"
        date="Today, 2:30 PM"
      />

      <StatCard
        label="Total Revenue"
        value="$124,592"
        change={12.5}
        icon="trending-up"
      />
    </ScrollView>
  );
};
*/
