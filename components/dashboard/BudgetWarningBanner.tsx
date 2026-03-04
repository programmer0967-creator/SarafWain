// Budget Warning Banner component
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { FinancialAnalysis } from '../../types';

interface BudgetWarningBannerProps {
  analysis: FinancialAnalysis;
  onDismiss: () => void;
}

export function BudgetWarningBanner({ analysis, onDismiss }: BudgetWarningBannerProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const { burnRate, spendingVelocity, financialHealth } = analysis;

  // Determine warning level
  const warningLevel = burnRate >= 90 ? 90 : burnRate >= 75 ? 75 : null;

  useEffect(() => {
    if (isVisible && warningLevel) {
      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, warningLevel]);

  const handleDismiss = () => {
    // Slide out animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onDismiss();
    });
  };

  if (!isVisible || !warningLevel) {
    return null;
  }

  const getBannerColor = () => {
    if (warningLevel === 90) return theme.colors.danger;
    if (warningLevel === 75) return theme.colors.warning || '#f59e0b';
    return theme.colors.warning || '#f59e0b';
  };

  const getBannerIcon = () => {
    if (warningLevel === 90) return 'error';
    return 'warning';
  };

  const getBannerTitle = () => {
    if (warningLevel === 90) return t('budgetWarning90');
    return t('budgetWarning75');
  };

  const getSpendingVelocityText = () => {
    if (spendingVelocity > 150) return t('spendingVeryFast');
    if (spendingVelocity > 100) return t('spendingFast');
    if (spendingVelocity < 75) return t('spendingSlow');
    return t('spendingNormal');
  };

  const bannerColor = getBannerColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: `${bannerColor}15`,
          borderColor: bannerColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${bannerColor}25` }]}>
          <MaterialIcons name={getBannerIcon() as any} size={24} color={bannerColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: bannerColor }]}>
            {getBannerTitle()}
          </Text>
          <Text style={[styles.message, { color: theme.colors.text }]}>
            {t('budgetWarningMsg', { percentage: Math.round(burnRate) })}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <MaterialIcons name="show-chart" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {t('spendingVelocity')}:
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {getSpendingVelocityText()}
              </Text>
            </View>
            <View style={styles.stat}>
              <MaterialIcons name="trending-up" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {Math.round(spendingVelocity)}%
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleDismiss}
          style={({ pressed }) => [
            styles.closeButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: `${bannerColor}20` }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: bannerColor,
              width: `${Math.min(burnRate, 100)}%`,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  progressBar: {
    height: 4,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
