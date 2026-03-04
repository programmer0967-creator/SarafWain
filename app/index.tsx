// Initial route handler
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
  const router = useRouter();
  const { settings } = useSettings();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (settings.onboardingCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [settings.onboardingCompleted]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}
