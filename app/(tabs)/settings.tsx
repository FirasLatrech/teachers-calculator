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
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Share as RNShare,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronRight,
  Moon,
  Sun,
  Vibrate as Vibration,
  Volume2,
  VolumeX,
  Languages,
  HelpCircle,
  Smartphone,
  Settings as SettingsIcon,
  MoveVertical,
  RotateCcw,
  Grid,
  Edit3,
  ChevronUp,
  ChevronDown,
  Check,
  Book,
  Share,
  Trash,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useButtonConfig, ButtonConfig } from '@/hooks/useButtonConfig';
import { formatNumber } from '@/utils/formatters';
import Animated from 'react-native-reanimated';

// Extended colors for our enhanced UI
const extendedColors = {
  muted: '#a0a0a0',
  cardActive: '#f0f8ff',
};

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, isDarkMode, colors } = useTheme();
  const router = useRouter();
  const {
    buttonConfig,
    toggleButton,
    moveButtonUp,
    moveButtonDown,
    resetToDefaults,
    isConfigMode,
    setConfigMode,
    pointConfig,
    changeGridSize,
    updatePointValue,
    resetPointValues,
  } = useButtonConfig();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [minPoint, setMinPoint] = useState('0');
  const [maxPoint, setMaxPoint] = useState('20');
  const [reorderMode, setReorderMode] = useState(false);

  // For point value editing
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editingRow, setEditingRow] = useState(-1);
  const [editingCol, setEditingCol] = useState(-1);
  const [editValue, setEditValue] = useState('');

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

        // Button config is now handled by the context
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
        // No need to include buttonConfig here as it's handled by the context
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

  const restartTutorial = async () => {
    try {
      await AsyncStorage.removeItem('tutorialShown');

      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push({
        pathname: '/(tabs)',
        params: { showTutorial: Date.now().toString() },
      });
    } catch (error) {
      console.error('Failed to restart tutorial:', error);
    }
  };

  // Toggle reorder mode for buttons
  const toggleReorderMode = () => {
    setReorderMode(!reorderMode);
  };

  // Function to select grid size
  const selectGridSize = (size: number) => {
    changeGridSize(size);
    Alert.alert(
      t('settings.gridSizeChanged.title') || 'Grid Size Changed',
      t('settings.gridSizeChanged.message', { size }) ||
        `Grid size changed to ${size} buttons`,
      [{ text: 'OK' }]
    );
  };

  // Function to open edit modal for a specific value
  const openEditValueModal = (rowIndex: number, colIndex: number) => {
    const currentValue = pointConfig.values[rowIndex][colIndex];
    setEditingRow(rowIndex);
    setEditingCol(colIndex);
    setEditValue(currentValue !== null ? currentValue.toString() : '');
    setIsEditingValue(true);
  };

  // Function to save edited value
  const saveEditedValue = () => {
    if (editingRow === -1 || editingCol === -1) return;

    const numValue = parseFloat(editValue);
    if (isNaN(numValue)) {
      Alert.alert(
        t('calculator.invalidNumber.title') || 'Invalid Number',
        t('calculator.invalidNumber.message') || 'Please enter a valid number.',
        [{ text: 'OK' }]
      );
      return;
    }

    updatePointValue(editingRow, editingCol, numValue);
    setIsEditingValue(false);
    setEditingRow(-1);
    setEditingCol(-1);
  };

  // Function to delete a point value
  const deletePointValue = () => {
    if (editingRow === -1 || editingCol === -1) return;

    updatePointValue(editingRow, editingCol, null);
    setIsEditingValue(false);
    setEditingRow(-1);
    setEditingCol(-1);
  };

  // Add share app function
  const shareApp = async () => {
    try {
      await RNShare.share({
        message: t('settings.shareAppMessage'),
        title: t('settings.shareApp'),
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.headerBackground,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.primary,
      fontSize: 20,
      fontFamily: 'Poppins-Bold',
    },
    section: {
      marginVertical: 16,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      color: colors.primary,
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
      borderBottomColor: colors.border,
    },
    settingLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingIcon: {
      marginRight: 12,
    },
    settingLabel: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
    },
    input: {
      width: 80,
      height: 40,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 8,
      color: colors.text,
      backgroundColor: colors.inputBackground,
      textAlign: 'center',
    },
    languageButton: {
      backgroundColor: colors.primary,
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
    themeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      marginRight: 8,
      borderWidth: 1,
    },
    themeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    themeButtonInactive: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
    },
    themeButtonText: {
      marginLeft: 6,
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
    },
    themeButtonTextActive: {
      color: '#ffffff',
    },
    themeButtonTextInactive: {
      color: colors.text,
    },
    themeRow: {
      flexDirection: 'row',
      marginTop: 8,
    },
    dangerButton: {
      backgroundColor: colors.danger,
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
      color: colors.primary,
      fontFamily: 'Poppins-Regular',
      fontSize: 12,
    },
    buttonConfigItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginVertical: 6,
      backgroundColor: colors.card,
      shadowColor: isDarkMode ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    buttonConfigItemReorder: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f8ff',
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    buttonConfigDetails: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    buttonNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
    },
    buttonIconContainer: {
      marginRight: 10,
    },
    buttonConfigName: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
    },
    buttonOrderControls: {
      flexDirection: 'row',
      marginLeft: 16,
    },
    orderButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginHorizontal: 4,
      backgroundColor: '#a0a0a0',
    },
    enabledOrderButton: {
      backgroundColor: colors.primary,
    },
    disabledButton: {
      opacity: 0.4,
      backgroundColor: '#a0a0a0',
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginVertical: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: isDarkMode ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    actionButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      marginLeft: 12,
    },
    gridSizeContainer: {
      marginTop: 16,
    },
    gridSizeTitle: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      marginBottom: 12,
      textAlign: 'center',
    },
    gridSizeButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 8,
    },
    gridSizeButton: {
      width: 60,
      height: 60,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    gridSizeButtonActive: {
      backgroundColor: colors.primary,
    },
    gridSizeButtonText: {
      color: colors.text,
      fontSize: 18,
      fontFamily: 'Poppins-Bold',
    },
    gridSizeButtonTextActive: {
      color: '#ffffff',
    },
    pointsContainer: {
      marginTop: 16,
      marginBottom: 24,
    },
    pointsTitle: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      marginBottom: 16,
      textAlign: 'center',
    },
    modal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
    },
    modalTitle: {
      color: colors.primary,
      fontSize: 20,
      fontFamily: 'Poppins-Bold',
      marginBottom: 20,
    },
    closeButton: {
      backgroundColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 20,
    },
    closeButtonText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
    },
    gridContainer: {
      width: '100%',
    },
    gridRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 12,
    },
    pointCell: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 8,
      borderColor: colors.primary,
    },
    emptyPointCell: {
      backgroundColor: colors.background,
      borderStyle: 'dashed',
    },
    pointCellText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
    },
    editValueModal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 20,
    },
    editValueContent: {
      width: '90%',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    editValueTitle: {
      fontSize: 20,
      fontFamily: 'Poppins-Bold',
      color: colors.primary,
      marginBottom: 20,
      textAlign: 'center',
    },
    editValueInput: {
      width: '100%',
      height: 60,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      padding: 15,
      marginBottom: 24,
      fontSize: 18,
      fontFamily: 'Poppins-Medium',
      color: colors.text,
      textAlign: 'center',
    },
    editButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 16,
    },
    editButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    editCancelButton: {
      backgroundColor: '#a0a0a0',
    },
    editSaveButton: {
      backgroundColor: colors.primary,
    },
    deleteButton: {
      backgroundColor: colors.danger,
      marginTop: 6,
      width: '100%',
      paddingVertical: 14,
      borderRadius: 12,
    },
    editButtonText: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: '#ffffff',
    },
    buttonConfigDescription: {
      marginBottom: 12,
    },
    configDescription: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      opacity: 0.8,
    },
    buttonListContainer: {
      marginBottom: 12,
    },
    activeActionButton: {
      backgroundColor: '#4CAF50', // Green color for the active state
    },
    dangerActionButton: {
      backgroundColor: colors.danger,
    },
    inlineGridContainer: {
      width: '100%',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 12,
      shadowColor: isDarkMode ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 3,
      elevation: 3,
      alignItems: 'center',
    },
    gridInstructions: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      textAlign: 'center',
      marginVertical: 10,
      opacity: 0.8,
      paddingHorizontal: 16,
    },
    inlinePointCell: {
      width: 65,
      height: 48,
      margin: 4,
      borderWidth: 1.5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 2,
    },
  });

  // Button configuration section render
  const renderButtonConfigItem = ({
    item,
    index,
  }: {
    item: ButtonConfig;
    index: number;
  }) => (
    <Animated.View
      style={[
        styles.buttonConfigItem,
        reorderMode && styles.buttonConfigItemReorder,
      ]}
    >
      <View style={styles.buttonConfigDetails}>
        <View style={styles.buttonNameContainer}>
          <Text style={styles.buttonConfigName}>
            {t(`calculator.buttons.${item.id}`) || item.name}
          </Text>
        </View>
        {!reorderMode && (
          <Switch
            value={item.enabled}
            onValueChange={() => toggleButton(item.id)}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
          />
        )}
      </View>

      {reorderMode && (
        <View style={styles.buttonOrderControls}>
          <TouchableOpacity
            style={[
              styles.orderButton,
              index === 0 ? styles.disabledButton : styles.enabledOrderButton,
            ]}
            onPress={() => moveButtonUp(index)}
            disabled={index === 0}
            activeOpacity={0.7}
          >
            <ChevronUp size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.orderButton,
              index === buttonConfig.length - 1
                ? styles.disabledButton
                : styles.enabledOrderButton,
            ]}
            onPress={() => moveButtonDown(index)}
            disabled={index === buttonConfig.length - 1}
            activeOpacity={0.7}
          >
            <ChevronDown size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  // Render grid cell for point value configuration
  const renderPointCell = (
    value: number | null,
    rowIndex: number,
    colIndex: number
  ) => (
    <TouchableOpacity
      key={`cell-${rowIndex}-${colIndex}`}
      style={[
        styles.pointCell,
        value === null && styles.emptyPointCell,
        styles.inlinePointCell,
      ]}
      onPress={() => openEditValueModal(rowIndex, colIndex)}
      activeOpacity={0.7}
    >
      <Text style={styles.pointCellText}>
        {value !== null ? formatNumber(value) : '+'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} key={`settings-${theme}`}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              {isDarkMode ? (
                <Moon
                  size={20}
                  color={colors.primary}
                  style={styles.settingIcon}
                />
              ) : (
                <Sun
                  size={20}
                  color={colors.primary}
                  style={styles.settingIcon}
                />
              )}
              <Text style={styles.settingLabel}>{t('settings.darkMode')}</Text>
            </View>
          </View>

          <View style={styles.themeRow}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === 'light'
                  ? styles.themeButtonActive
                  : styles.themeButtonInactive,
              ]}
              onPress={() => {
                setTheme('light');
              }}
            >
              <Sun
                size={16}
                color={theme === 'light' ? '#ffffff' : colors.primary}
              />
              <Text
                style={[
                  styles.themeButtonText,
                  theme === 'light'
                    ? styles.themeButtonTextActive
                    : styles.themeButtonTextInactive,
                ]}
              >
                {t('settings.lightMode')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === 'dark'
                  ? styles.themeButtonActive
                  : styles.themeButtonInactive,
              ]}
              onPress={() => {
                setTheme('dark');
              }}
            >
              <Moon
                size={16}
                color={theme === 'dark' ? '#ffffff' : colors.primary}
              />
              <Text
                style={[
                  styles.themeButtonText,
                  theme === 'dark'
                    ? styles.themeButtonTextActive
                    : styles.themeButtonTextInactive,
                ]}
              >
                {t('settings.darkMode')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === 'system'
                  ? styles.themeButtonActive
                  : styles.themeButtonInactive,
              ]}
              onPress={() => {
                setTheme('system');
              }}
            >
              <Smartphone
                size={16}
                color={theme === 'system' ? '#ffffff' : colors.primary}
              />
              <Text
                style={[
                  styles.themeButtonText,
                  theme === 'system'
                    ? styles.themeButtonTextActive
                    : styles.themeButtonTextInactive,
                ]}
              >
                {t('settings.systemTheme')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
          <Text style={styles.sectionTitle}>
            {t('settings.calculator') || 'Calculator'}
          </Text>

          {/* Grid Size Selection */}
          <View style={styles.gridSizeContainer}>
            <Text style={styles.gridSizeTitle}>
              {t('settings.gridSize') || 'Number of buttons available'}
            </Text>
            <View style={styles.gridSizeButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.gridSizeButton,
                  pointConfig.gridSize === 6 && styles.gridSizeButtonActive,
                ]}
                onPress={() => selectGridSize(6)}
              >
                <Text
                  style={[
                    styles.gridSizeButtonText,
                    pointConfig.gridSize === 6 &&
                      styles.gridSizeButtonTextActive,
                  ]}
                >
                  6
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.gridSizeButton,
                  pointConfig.gridSize === 9 && styles.gridSizeButtonActive,
                ]}
                onPress={() => selectGridSize(9)}
              >
                <Text
                  style={[
                    styles.gridSizeButtonText,
                    pointConfig.gridSize === 9 &&
                      styles.gridSizeButtonTextActive,
                  ]}
                >
                  9
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.gridSizeButton,
                  pointConfig.gridSize === 12 && styles.gridSizeButtonActive,
                ]}
                onPress={() => selectGridSize(12)}
              >
                <Text
                  style={[
                    styles.gridSizeButtonText,
                    pointConfig.gridSize === 12 &&
                      styles.gridSizeButtonTextActive,
                  ]}
                >
                  12
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.gridSizeButton,
                  pointConfig.gridSize === 16 && styles.gridSizeButtonActive,
                ]}
                onPress={() => selectGridSize(16)}
              >
                <Text
                  style={[
                    styles.gridSizeButtonText,
                    pointConfig.gridSize === 16 &&
                      styles.gridSizeButtonTextActive,
                  ]}
                >
                  16
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Point Values Editing */}
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsTitle}>
              {t('settings.pointValues') || 'Button Values Configuration'}
            </Text>

            {/* Display grid directly in settings instead of in a modal */}
            <View style={styles.inlineGridContainer}>
              {pointConfig.values.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.gridRow}>
                  {row.map((value, colIndex) =>
                    renderPointCell(value, rowIndex, colIndex)
                  )}
                </View>
              ))}
            </View>

            <Text style={styles.gridInstructions}>
              {t('settings.tapToEditValues') ||
                'Tap on any value to edit or delete it. Empty cells can be filled with new values.'}
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.danger }]}
              onPress={() => {
                Alert.alert(
                  t('settings.resetPoints.title') || 'Reset Values',
                  t('settings.resetPoints.message') ||
                    'Are you sure you want to reset all point values to defaults?',
                  [
                    {
                      text: t('settings.resetPoints.cancel') || 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: t('settings.resetPoints.confirm') || 'Reset',
                      style: 'destructive',
                      onPress: resetPointValues,
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <RotateCcw size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>
                {t('settings.resetPointValues') || 'Reset to Default Values'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons Configuration */}
          <Text style={styles.sectionTitle}>
            {t('settings.buttonConfiguration') || 'Button Configuration'}
          </Text>
          <View style={styles.buttonConfigDescription}>
            <Text style={styles.configDescription}>
              {t('settings.buttonConfigDescription') ||
                'Enable or disable buttons and change their order to customize your calculator.'}
            </Text>
          </View>

          <View style={styles.buttonListContainer}>
            <FlatList
              data={buttonConfig}
              renderItem={renderButtonConfigItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              reorderMode && styles.activeActionButton,
            ]}
            onPress={toggleReorderMode}
            activeOpacity={0.7}
          >
            {reorderMode ? (
              <Check size={20} color="#ffffff" />
            ) : (
              <MoveVertical size={20} color="#ffffff" />
            )}
            <Text style={styles.actionButtonText}>
              {reorderMode
                ? t('settings.doneReordering') || 'Done Reordering'
                : t('settings.reorderButtons') || 'Reorder Buttons'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerActionButton]}
            onPress={() => {
              Alert.alert(
                t('settings.resetConfig.title') || 'Reset Configuration',
                t('settings.resetConfig.message') ||
                  'Are you sure you want to reset all button settings to defaults?',
                [
                  {
                    text: t('settings.resetConfig.cancel') || 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: t('settings.resetConfig.confirm') || 'Reset',
                    style: 'destructive',
                    onPress: resetToDefaults,
                  },
                ],
                { cancelable: true }
              );
            }}
            activeOpacity={0.7}
          >
            <RotateCcw size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>
              {t('settings.resetToDefaults') || 'Reset to Defaults'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Data Section before footer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.data')}</Text>

          {/* Share App option */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={shareApp}
            activeOpacity={0.7}
          >
            <View style={styles.settingLabelContainer}>
              <Share
                size={20}
                color={colors.primary}
                style={styles.settingIcon}
              />
              <Text style={styles.settingLabel}>{t('settings.shareApp')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Taki Academy Calculator v1.0.0</Text>
          <Text style={styles.versionText}>{t('settings.madeWith')}</Text>
        </View>
      </ScrollView>

      {/* Modal for editing a specific value */}
      <Modal
        visible={isEditingValue}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditingValue(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setIsEditingValue(false)}>
          <View style={styles.editValueModal}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.editValueContent}>
                <Text style={styles.editValueTitle}>
                  {t('calculator.editValue') || 'Edit Point Value'}
                </Text>
                <TextInput
                  style={styles.editValueInput}
                  value={editValue}
                  onChangeText={setEditValue}
                  keyboardType="numeric"
                  autoFocus={true}
                  placeholder="Enter value"
                  placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />
                <View style={styles.editButtonRow}>
                  <TouchableOpacity
                    style={[styles.editButton, styles.editCancelButton]}
                    onPress={() => setIsEditingValue(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editButtonText}>
                      {t('calculator.cancel') || 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editButton, styles.editSaveButton]}
                    onPress={saveEditedValue}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editButtonText}>
                      {t('calculator.save') || 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
