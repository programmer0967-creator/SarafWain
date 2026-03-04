// Icon Picker component
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { categoryIcons } from '../../constants/icons';

interface IconPickerProps {
  selectedIcon?: string;
  onSelect: (icon: string) => void;
}

export function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {t('selectIcon')}
      </Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {categoryIcons.map(icon => (
          <Pressable
            key={icon}
            onPress={() => onSelect(icon)}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor:
                  selectedIcon === icon
                    ? theme.colors.primary
                    : theme.colors.surface,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <MaterialIcons
              name={icon as any}
              size={24}
              color={selectedIcon === icon ? '#ffffff' : theme.colors.text}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  scrollView: {
    maxHeight: 300,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
