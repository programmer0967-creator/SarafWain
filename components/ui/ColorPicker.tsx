// Color Picker component
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { categoryColors } from '../../constants/colors';

interface ColorPickerProps {
  selectedColor?: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {t('selectColor')}
      </Text>
      <View style={styles.grid}>
        {categoryColors.map(color => (
          <Pressable
            key={color}
            onPress={() => onSelect(color)}
            style={({ pressed }) => [
              styles.colorButton,
              {
                backgroundColor: color,
                opacity: pressed ? 0.7 : 1,
                borderWidth: selectedColor === color ? 3 : 0,
                borderColor: theme.colors.text,
              },
            ]}
          >
            {selectedColor === color && (
              <MaterialIcons name="check" size={24} color="#ffffff" />
            )}
          </Pressable>
        ))}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
