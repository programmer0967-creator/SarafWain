// Time Range Toggle component
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { TimeRange } from '../../services/chartDataService';

interface TimeRangeToggleProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

export function TimeRangeToggle({ selectedRange, onRangeChange }: TimeRangeToggleProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const ranges: TimeRange[] = ['week', 'month', 'year'];

  const getRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case 'week':
        return t('weekly');
      case 'month':
        return t('monthly');
      case 'year':
        return t('yearly');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      {ranges.map(range => {
        const isSelected = selectedRange === range;
        return (
          <Pressable
            key={range}
            onPress={() => onRangeChange(range)}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: isSelected ? '#ffffff' : theme.colors.text,
                  fontWeight: isSelected ? '600' : '500',
                },
              ]}
            >
              {getRangeLabel(range)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
  },
});
