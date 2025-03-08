import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Smartphone } from 'lucide-react-native';

export default function AppearanceScreen() {
  const { t } = useTranslation();
  const { theme, setTheme, colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Poppins-Medium',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: colors.text,
      textAlign: 'center',
      opacity: 0.8,
      marginBottom: 16,
    },
    themesContainer: {
      marginBottom: 24,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 12,
      marginBottom: 12,
    },
    themeOptionSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    themeIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: colors.text,
      marginBottom: 4,
    },
    themeDescription: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: colors.secondary,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('settings.selectTheme') || 'Select Theme'}
        </Text>
        <Text style={styles.description}>
          {t('settings.themeDescription') ||
            'Choose a theme for the app. You can switch between light and dark mode, or let the system decide.'}
        </Text>
      </View>

      <View style={styles.themesContainer}>
        <TouchableOpacity
          style={[
            styles.themeOption,
            theme === 'light' && styles.themeOptionSelected,
          ]}
          onPress={() => setTheme('light')}
        >
          <View style={styles.themeIcon}>
            <Sun size={28} color={colors.primary} />
          </View>
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>
              {t('settings.lightMode') || 'Light Mode'}
            </Text>
            <Text style={styles.themeDescription}>
              {t('settings.lightModeDesc') || 'Bright theme with light colors'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            theme === 'dark' && styles.themeOptionSelected,
          ]}
          onPress={() => setTheme('dark')}
        >
          <View style={styles.themeIcon}>
            <Moon size={28} color={colors.primary} />
          </View>
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>
              {t('settings.darkMode') || 'Dark Mode'}
            </Text>
            <Text style={styles.themeDescription}>
              {t('settings.darkModeDesc') || 'Dark theme with muted colors'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            theme === 'system' && styles.themeOptionSelected,
          ]}
          onPress={() => setTheme('system')}
        >
          <View style={styles.themeIcon}>
            <Smartphone size={28} color={colors.primary} />
          </View>
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>
              {t('settings.systemTheme') || 'System Theme'}
            </Text>
            <Text style={styles.themeDescription}>
              {t('settings.systemThemeDesc') ||
                'Uses your device theme setting'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
