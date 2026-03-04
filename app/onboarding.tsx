// Onboarding screen
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { currencies } from '../constants/currencies';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { completeOnboarding } = useSettings();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [startingBalance, setStartingBalance] = useState('');

  const handleLanguageSelect = async (lang: 'en' | 'ar') => {
    await setLanguage(lang);
    setStep(1);
  };

  const handleContinue = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding({
      name: name.trim(),
      currency: selectedCurrency,
      startingBalance: parseFloat(startingBalance) || 0,
    });
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {step === 0 && (
          <View style={styles.step}>
            <MaterialIcons name="language" size={64} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('welcomeTitle')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('selectLanguage')}
            </Text>

            <View style={styles.languageButtons}>
              <Pressable
                onPress={() => handleLanguageSelect('en')}
                style={({ pressed }) => [
                  styles.languageButton,
                  { backgroundColor: theme.colors.surface, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.languageText, { color: theme.colors.text }]}>
                  English
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleLanguageSelect('ar')}
                style={({ pressed }) => [
                  styles.languageButton,
                  { backgroundColor: theme.colors.surface, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.languageText, { color: theme.colors.text }]}>
                  العربية
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.step}>
            <MaterialIcons name="person" size={64} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('enterName')}
            </Text>

            <Input
              label={t('name')}
              value={name}
              onChangeText={setName}
              placeholder={t('namePlaceholder')}
              style={styles.input}
            />

            <Button
              title={t('continue')}
              onPress={handleContinue}
              disabled={!name.trim()}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <MaterialIcons name="attach-money" size={64} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('selectCurrency')}
            </Text>

            <ScrollView style={styles.currencyList} showsVerticalScrollIndicator={false}>
              {currencies.map(currency => (
                <Pressable
                  key={currency.code}
                  onPress={() => setSelectedCurrency(currency.code)}
                  style={({ pressed }) => [
                    styles.currencyItem,
                    {
                      backgroundColor: selectedCurrency === currency.code
                        ? theme.colors.primary
                        : theme.colors.surface,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.currencyCode,
                      {
                        color: selectedCurrency === currency.code
                          ? '#ffffff'
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {currency.symbol} {currency.code}
                  </Text>
                  <Text
                    style={[
                      styles.currencyName,
                      {
                        color: selectedCurrency === currency.code
                          ? '#ffffff'
                          : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {language === 'ar' ? currency.nameAr : currency.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Button title={t('continue')} onPress={handleContinue} />
          </View>
        )}

        {step === 3 && (
          <View style={styles.step}>
            <MaterialIcons name="account-balance-wallet" size={64} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('startingBalance')}
            </Text>

            <Input
              label={t('startingBalance')}
              value={startingBalance}
              onChangeText={setStartingBalance}
              placeholder={t('startingBalancePlaceholder')}
              keyboardType="numeric"
              style={styles.input}
            />

            <Button title={t('letsStart')} onPress={handleComplete} />
            <Pressable onPress={handleComplete} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
                {t('skip')}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  step: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  languageButtons: {
    width: '100%',
    gap: 16,
  },
  languageButton: {
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    marginBottom: 24,
  },
  currencyList: {
    width: '100%',
    maxHeight: 300,
    marginBottom: 24,
  },
  currencyItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
