// Root layout with providers
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlertProvider } from '@/template';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { TransactionProvider } from '../contexts/TransactionContext';
import { BudgetProvider } from '../contexts/BudgetContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <SettingsProvider>
          <LanguageProvider>
            <ThemeProvider>
              <TransactionProvider>
                <BudgetProvider>
                  <StatusBar style="auto" />
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen
                      name="add-transaction"
                      options={{
                        presentation: 'modal',
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen name="manage-categories" />
                    <Stack.Screen
                      name="edit-category"
                      options={{
                        presentation: 'modal',
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen name="budget" />
                    <Stack.Screen
                      name="edit-budget"
                      options={{
                        presentation: 'modal',
                        headerShown: false,
                      }}
                    />
                  </Stack>
                </BudgetProvider>
              </TransactionProvider>
            </ThemeProvider>
          </LanguageProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
