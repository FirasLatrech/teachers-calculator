import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronRight,
  Moon,
  Sun,
  Vibrate as Vibration,
  Volume2,
  VolumeX,
  Languages,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, isDarkMode } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [minPoint, setMinPoint] = useState('0');
  const [maxPoint, setMaxPoint] = useState('20');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('calculatorSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setSoundEnabled(parsedSettings.soundEnabled ?? true);
        setVibrationEnabled(parsedSettings.vibrationEnabled ?? true);
        setMinPoint(parsedSettings.minPoint ?? '0');
        setMaxPoint(parsedSettings.maxPoint ?? '5');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        soundEnabled,
        vibrationEnabled,
        minPoint,
        maxPoint,
      };
      await AsyncStorage.setItem(
        'calculatorSettings',
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  useEffect(() => {
    saveSettings();
  }, [soundEnabled, vibrationEnabled, minPoint, maxPoint]);

  const clearAllData = async () => {
    Alert.alert(
      t('alerts.clearData.title'),
      t('alerts.clearData.message'),
      [
        {
          text: t('alerts.clearData.cancel'),
          style: 'cancel',
        },
        {
          text: t('alerts.clearData.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('calculatorHistory');
              await AsyncStorage.removeItem('calculatorTotal');
              await AsyncStorage.removeItem('calculatorSessions');
              Alert.alert(t('alerts.success'), t('alerts.clearData.success'));
            } catch (error) {
              console.error('Failed to clear data:', error);
              Alert.alert(t('alerts.error'), t('alerts.clearData.error'));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    header: {
      backgroundColor: '#ffffff',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
      color: '#35bbe3',
      fontSize: 20,
      fontFamily: 'Poppins-Bold',
    },
    section: {
      marginVertical: 16,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      color: '#35bbe3',
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      marginBottom: 12,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    settingLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingIcon: {
      marginRight: 12,
    },
    settingLabel: {
      color: '#333333',
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
    },
    input: {
      width: 80,
      height: 40,
      borderWidth: 1,
      borderColor: '#f0f0f0',
      borderRadius: 8,
      padding: 8,
      color: '#333333',
      textAlign: 'center',
    },
    languageButton: {
      backgroundColor: '#35bbe3',
      padding: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    languageButtonText: {
      color: '#ffffff',
      fontFamily: 'Poppins-Medium',
    },
    languageRow: {
      flexDirection: 'row',
      marginTop: 8,
    },
    dangerButton: {
      backgroundColor: '#ff6b6b',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    dangerButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
    },
    footer: {
      padding: 20,
      alignItems: 'center',
    },
    versionText: {
      color: '#a0a0a0',
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      marginBottom: 4,
    },
    footerText: {
      color: '#35bbe3',
      fontFamily: 'Poppins-Regular',
      fontSize: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Languages size={20} color="#35bbe3" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>{t('settings.language')}</Text>
            </View>
          </View>
          <View style={styles.languageRow}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.language === 'fr' && { opacity: 0.7 },
              ]}
              onPress={() => changeLanguage('fr')}
            >
              <Text style={styles.languageButtonText}>{t('languages.fr')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.language === 'en' && { opacity: 0.7 },
              ]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={styles.languageButtonText}>{t('languages.en')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.language === 'ar' && { opacity: 0.7 },
              ]}
              onPress={() => changeLanguage('ar')}
            >
              <Text style={styles.languageButtonText}>{t('languages.ar')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.feedback')}</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              {soundEnabled ? (
                <Volume2 size={20} color="#35bbe3" style={styles.settingIcon} />
              ) : (
                <VolumeX size={20} color="#35bbe3" style={styles.settingIcon} />
              )}
              <Text style={styles.settingLabel}>{t('settings.sound')}</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#767577', true: '#35bbe3' }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Vibration size={20} color="#35bbe3" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>{t('settings.vibration')}</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: '#767577', true: '#35bbe3' }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.data')}</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <Text style={styles.dangerButtonText}>
              {t('settings.clearData')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>TakiAcademy Calculator v1.0.0</Text>
          <Text style={styles.footerText}>{t('settings.madeWith')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
