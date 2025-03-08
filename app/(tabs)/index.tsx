import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
  Image,
  AppState,
  TextInput,
  Modal,
} from 'react-native';
import {
  Minus,
  Plus,
  RotateCcw,
  Delete,
  Settings,
  MoveVertical,
  X,
  Edit,
  Grid,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../utils/formatters';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useButtonConfig } from '@/hooks/useButtonConfig';

export default function CalculatorScreen() {
  const { t } = useTranslation();
  const { isDarkMode, colors, theme } = useTheme();
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
    updatePointValue,
    resetPointValues,
    isEditingPoints,
    setEditingPoints,
  } = useButtonConfig();

  const params = useLocalSearchParams();
  const [total, setTotal] = useState(0);
  const [operationsCount, setOperationsCount] = useState(0);
  const [history, setHistory] = useState<
    { value: number; timestamp: number }[]
  >([]);
  const [lastOperation, setLastOperation] = useState<{
    value: number;
    timestamp: number;
  } | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const appState = useRef(AppState.currentState);

  // Student name state
  const [studentName, setStudentName] = useState('');
  const [showStudentNameModal, setShowStudentNameModal] = useState(false);

  // Values for editing point values
  const [editingRow, setEditingRow] = useState(-1);
  const [editingCol, setEditingCol] = useState(-1);
  const [editValue, setEditValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Create refs for tutorial targets
  const targetRefs = {
    'grid-container': useRef<View>(null),
    'reset-button': useRef<View>(null),
    'undo-button': useRef<View>(null),
    'add-button': useRef<View>(null),
    'register-button': useRef<View>(null),
  };

  // Use point values from our context
  const pointValues = pointConfig.values;

  // Replace the router focus listener with AppState listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        // Remove reference to loadButtonConfig since we're using context now
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    loadHistory();
    checkTutorialState();
  }, [params.showTutorial]);

  const checkTutorialState = async () => {
    try {
      // If we have a showTutorial parameter, show the tutorial regardless of stored state
      if (params.showTutorial) {
        setShowTutorial(true);
        return;
      }

      // Otherwise check if it's the first launch
      const tutorialShown = await AsyncStorage.getItem('tutorialShown');
      if (!tutorialShown) {
        setShowTutorial(true);
      }
    } catch (error) {
      console.error('Failed to check tutorial state:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('calculatorHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedTotal = await AsyncStorage.getItem('calculatorTotal');
      if (savedTotal) {
        setTotal(parseFloat(savedTotal));
      }

      const savedOperationsCount = await AsyncStorage.getItem(
        'calculatorOperationsCount'
      );
      if (savedOperationsCount) {
        setOperationsCount(parseInt(savedOperationsCount));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveHistory = async () => {
    try {
      await AsyncStorage.setItem('calculatorHistory', JSON.stringify(history));
      await AsyncStorage.setItem('calculatorTotal', total.toString());
      await AsyncStorage.setItem(
        'calculatorOperationsCount',
        operationsCount.toString()
      );
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  useEffect(() => {
    saveHistory();
  }, [history, total]);

  const addValue = (value: number | null) => {
    if (value === null) return; // Skip null values

    const newTotal = parseFloat((total + value).toFixed(2));
    setOperationsCount((prevCount) => prevCount + 1);
    setTotal(newTotal);
    const operation = { value, timestamp: Date.now() };
    setHistory([...history, operation]);
    setLastOperation(operation);
  };

  const subtractValue = (value: number | null) => {
    if (value === null) return; // Skip null values

    const newTotal = parseFloat((total - value).toFixed(2));
    setOperationsCount((prevCount) => prevCount + 1);
    setTotal(newTotal);
    const operation = { value: -value, timestamp: Date.now() };
    setHistory([...history, operation]);
    setLastOperation(operation);
  };

  const saveSession = async () => {
    if (history.length === 0) {
      Alert.alert(
        t('calculator.alerts.noData.title'),
        t('calculator.alerts.noData.message')
      );
      return;
    }

    // Show student name input modal
    setShowStudentNameModal(true);
  };

  // New function to save session with student name
  const finalizeSessionSave = async () => {
    // if (!studentName.trim()) {
    //   Alert.alert(
    //     t('calculator.alerts.noName.title') || 'No Name',
    //     t('calculator.alerts.noName.message') || 'Please enter a student name'
    //   );
    //   return;
    // }

    try {
      // Get existing sessions
      const savedSessionsStr = await AsyncStorage.getItem('calculatorSessions');
      let savedSessions = savedSessionsStr ? JSON.parse(savedSessionsStr) : [];

      // Create new session with student name
      const newSession = {
        date: new Date().toISOString(),
        items: [...history],
        total: total,
        studentName: studentName.trim(),
      };

      // Add new session to the beginning of the array
      savedSessions = [newSession, ...savedSessions];

      // Save updated sessions
      await AsyncStorage.setItem(
        'calculatorSessions',
        JSON.stringify(savedSessions)
      );

      // Clear current session
      clearTotal();
      setStudentName('');
      setShowStudentNameModal(false);

      Alert.alert(
        t('calculator.alerts.saveSuccess.title'),
        t('calculator.alerts.saveSuccess.firstLine') +
          '\n' +
          t('calculator.alerts.saveSuccess.secondLine') +
          total +
          '\n' +
          t('calculator.alerts.saveSuccess.thirdLine') +
          history.length +
          '\n' +
          `${
            t('calculator.alerts.saveSuccess.studentName') || 'Student'
          }: ${studentName}`
      );
    } catch (error) {
      console.error('Failed to save session:', error);
      Alert.alert(
        t('calculator.alerts.saveError.title'),
        t('calculator.alerts.saveError.message')
      );
    }
  };

  const clearTotal = () => {
    setTotal(0);
    setHistory([]);
    setLastOperation(null);
    setOperationsCount(0);
  };

  const undoLastOperation = () => {
    if (history.length > 0) {
      setOperationsCount((prevCount) => prevCount - 1);
      const newHistory = [...history];
      const lastItem = newHistory.pop();
      setHistory(newHistory);

      if (lastItem) {
        const newTotal = parseFloat((total - lastItem.value).toFixed(2));
        setTotal(newTotal);
        setLastOperation(
          newHistory.length > 0 ? newHistory[newHistory.length - 1] : null
        );
      }
    }
  };

  const renderOperationHistory = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.historyScrollContent}
      >
        {history
          .map((op, index) => (
            <Text
              key={index}
              style={[
                styles.historyText,
                op.value < 0 && styles.negativeHistoryText,
              ]}
            >
              {op.value >= 0 ? '+' : ''}
              {formatNumber(op.value)}
            </Text>
          ))
          .reverse()
          .slice(0, 8)}
      </ScrollView>
    );
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  // New function to open the edit modal for a specific point value
  const openEditPointValue = (rowIndex: number, colIndex: number) => {
    if (!isEditingPoints) return;

    const currentValue = pointValues[rowIndex][colIndex];

    setEditingRow(rowIndex);
    setEditingCol(colIndex);
    setEditValue(currentValue !== null ? currentValue.toString() : '');
    setShowEditModal(true);
  };

  // New function to save edited point value
  const saveEditedPointValue = () => {
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
    setShowEditModal(false);
    setEditingRow(-1);
    setEditingCol(-1);
  };

  // New function to delete a point value
  const deletePointValue = () => {
    if (editingRow === -1 || editingCol === -1) return;

    // Set the value to null to represent a deleted cell
    updatePointValue(editingRow, editingCol, null);
    setShowEditModal(false);
    setEditingRow(-1);
    setEditingCol(-1);
  };

  // Updated cell rendering to handle null values
  const renderGridCell = (
    value: number | null,
    rowIndex: number,
    colIndex: number
  ) => {
    // If value is null, render an empty cell
    if (value === null) {
      return (
        <TouchableOpacity
          key={`cell-${rowIndex}-${colIndex}`}
          style={[
            styles.gridCell,
            styles.emptyCell,
            isEditingPoints && styles.editPointValue,
          ]}
          onPress={() =>
            isEditingPoints ? openEditPointValue(rowIndex, colIndex) : null
          }
        >
          <Text style={styles.emptyCellText}>+</Text>
        </TouchableOpacity>
      );
    }

    // Otherwise render a normal cell
    return (
      <TouchableOpacity
        key={`cell-${rowIndex}-${colIndex}`}
        style={[styles.gridCell, isEditingPoints && styles.editPointValue]}
        onPress={() =>
          isEditingPoints
            ? openEditPointValue(rowIndex, colIndex)
            : addValue(value)
        }
        onLongPress={() => {
          if (!isEditingPoints) {
            subtractValue(value);
          }
        }}
      >
        <Text style={styles.gridCellText}>{formatNumber(value)}</Text>
      </TouchableOpacity>
    );
  };

  // Modified function for rendering action buttons to handle customizations better
  const renderActionButtons = () => {
    if (isConfigMode) {
      return renderButtonConfigUI();
    }

    // Sort buttons by order
    const sortedButtons = [...buttonConfig].sort((a, b) => a.order - b.order);

    // Filter only enabled buttons
    const enabledButtons = sortedButtons.filter((button) => button.enabled);

    // Calculate button flex based on number of enabled buttons
    const buttonFlex =
      enabledButtons.length > 0 ? 1 / enabledButtons.length : 1;

    // If no buttons are enabled, show a placeholder message
    if (enabledButtons.length === 0) {
      return (
        <View style={[styles.actionRow, styles.emptyActionRow]}>
          <Text style={styles.emptyActionText}>
            {t('calculator.noButtonsEnabled') ||
              'No buttons enabled. Configure in Settings.'}
          </Text>
        </View>
      );
    }

    return enabledButtons.map((button) => {
      let buttonContent;

      switch (button.id) {
        case 'reset':
          buttonContent = (
            <TouchableOpacity
              ref={targetRefs['reset-button']}
              style={[styles.actionButton, { flex: buttonFlex }]}
              onPress={clearTotal}
              key={button.id}
            >
              <RotateCcw size={24} color="#35bbe3" />
            </TouchableOpacity>
          );
          break;
        case 'undo':
          buttonContent = (
            <TouchableOpacity
              ref={targetRefs['undo-button']}
              style={[styles.actionButton, { flex: buttonFlex }]}
              onPress={undoLastOperation}
              key={button.id}
            >
              <Delete size={24} color="#35bbe3" />
            </TouchableOpacity>
          );
          break;
        case 'subtract':
          buttonContent = (
            <TouchableOpacity
              style={[styles.actionButton, { flex: buttonFlex }]}
              onPress={() => {
                if (lastOperation) {
                  subtractValue(Math.abs(lastOperation.value));
                }
              }}
              key={button.id}
            >
              <Minus size={24} color="#35bbe3" />
            </TouchableOpacity>
          );
          break;
        case 'add':
          buttonContent = (
            <TouchableOpacity
              ref={targetRefs['add-button']}
              style={[styles.actionButton, { flex: buttonFlex }]}
              onPress={() => {
                if (lastOperation) {
                  addValue(Math.abs(lastOperation.value));
                }
              }}
              key={button.id}
            >
              <Plus size={24} color="#35bbe3" />
            </TouchableOpacity>
          );
          break;
      }

      return buttonContent;
    });
  };

  // New function to render button configuration UI directly in calculator
  const renderButtonConfigUI = () => {
    const sortedButtons = [...buttonConfig].sort((a, b) => a.order - b.order);

    return (
      <View style={styles.configContainer}>
        <View style={styles.configHeader}>
          <Text style={styles.configTitle}>
            {t('calculator.buttonConfiguration')}
          </Text>
          <TouchableOpacity
            style={styles.closeConfigButton}
            onPress={() => setConfigMode(false)}
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {sortedButtons.map((button, index) => (
          <View style={styles.configItem} key={button.id}>
            <View style={styles.configItemLeft}>
              <Text style={styles.configButtonLabel}>
                {t(`calculator.buttons.${button.id}`) || button.name}
              </Text>
              <TouchableOpacity
                style={[
                  styles.configSwitch,
                  button.enabled
                    ? styles.configSwitchOn
                    : styles.configSwitchOff,
                ]}
                onPress={() => toggleButton(button.id)}
              >
                <View
                  style={[
                    styles.configSwitchThumb,
                    button.enabled
                      ? styles.configSwitchThumbOn
                      : styles.configSwitchThumbOff,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.configItemRight}>
              <TouchableOpacity
                style={[
                  styles.configArrowButton,
                  index === 0 && styles.disabledButton,
                ]}
                onPress={() => moveButtonUp(index)}
                disabled={index === 0}
              >
                <Text style={styles.configArrowText}>↑</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.configArrowButton,
                  index === buttonConfig.length - 1 && styles.disabledButton,
                ]}
                onPress={() => moveButtonDown(index)}
                disabled={index === buttonConfig.length - 1}
              >
                <Text style={styles.configArrowText}>↓</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.resetConfigButton}
          onPress={() => {
            Alert.alert(
              t('settings.resetButtons.title') || 'Reset Buttons',
              t('settings.resetButtons.message') ||
                'Are you sure you want to reset button configuration to defaults?',
              [
                {
                  text: t('settings.resetButtons.cancel') || 'Cancel',
                  style: 'cancel',
                },
                {
                  text: t('settings.resetButtons.confirm') || 'Reset',
                  style: 'destructive',
                  onPress: () => resetToDefaults(),
                },
              ],
              { cancelable: true }
            );
          }}
        >
          <RotateCcw size={18} color="#ffffff" />
          <Text style={styles.resetConfigButtonText}>
            {t('settings.resetToDefaults') || 'Reset to Defaults'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // New function to render point value editing UI
  const renderPointValueEditingUI = () => {
    return (
      <View style={styles.configContainer}>
        <View style={styles.configHeader}>
          <Text style={styles.configTitle}>
            {t('calculator.editPointValues') || 'Edit Point Values'}
          </Text>
          <TouchableOpacity
            style={styles.closeConfigButton}
            onPress={() => setEditingPoints(false)}
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.configInstructions}>
          {t('calculator.tapPointToEdit') ||
            'Tap on any point value to edit it'}
        </Text>

        <TouchableOpacity
          style={styles.resetConfigButton}
          onPress={() => {
            Alert.alert(
              t('settings.resetPoints.title') || 'Reset Points',
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
          <RotateCcw size={18} color="#ffffff" />
          <Text style={styles.resetConfigButtonText}>
            {t('settings.resetPointValues') || 'Reset to Default Values'}
          </Text>
        </TouchableOpacity>
      </View>
    );
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
    logoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 60,
    },
    logo: {
      height: 60,
      justifyContent: 'center',
    },
    logoImage: {
      width: 60,
      height: 60,
      resizeMode: 'contain',
    },
    registerButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    disabledButton: {
      backgroundColor: '#cccccc',
      opacity: 0.6,
    },
    registerText: {
      color: '#ffffff',
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
    },
    operationsCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8,
    },
    operationsCountText: {
      color: colors.primary,
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
    },
    displayContainer: {
      backgroundColor: colors.card,
      padding: 20,
    },
    historyDisplay: {
      marginBottom: 10,
    },
    historyScrollContent: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 4,
    },
    historyText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
    },
    negativeHistoryText: {
      color: colors.danger,
    },
    displayText: {
      color: colors.primary,
      fontSize: 40,
      fontFamily: 'Poppins-Bold',
      textAlign: 'right',
    },
    actionRow: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      height: 60,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gridContainer: {
      flex: 1,
      backgroundColor: colors.card,
    },
    gridRow: {
      flex: 1,
      flexDirection: 'row',
    },
    gridCell: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: isDarkMode ? '#3a3a3a' : '#d3d3d3',
      backgroundColor: colors.card,
    },
    gridCellText: {
      color: colors.text,
      fontSize: 20,
      fontFamily: 'Poppins-Medium',
    },
    emptyActionRow: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyActionText: {
      color: colors.text,
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      textAlign: 'center',
    },
    configButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      zIndex: 100,
    },
    configContainer: {
      flex: 1,
      padding: 15,
      backgroundColor: colors.card,
    },
    configHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    configTitle: {
      color: colors.primary,
      fontSize: 18,
      fontFamily: 'Poppins-Medium',
    },
    closeConfigButton: {
      padding: 5,
    },
    configItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    configItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    configButtonLabel: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      marginRight: 10,
    },
    configSwitch: {
      width: 50,
      height: 24,
      borderRadius: 12,
      padding: 2,
    },
    configSwitchOn: {
      backgroundColor: colors.primary,
    },
    configSwitchOff: {
      backgroundColor: '#ccc',
    },
    configSwitchThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#fff',
    },
    configSwitchThumbOn: {
      marginLeft: 26,
    },
    configSwitchThumbOff: {
      marginLeft: 0,
    },
    configItemRight: {
      flexDirection: 'row',
    },
    configArrowButton: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    configArrowText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    resetConfigButton: {
      backgroundColor: colors.danger,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 20,
    },
    resetConfigButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      marginLeft: 8,
    },
    editPointValue: {
      backgroundColor: isEditingPoints
        ? 'rgba(53, 187, 227, 0.2)'
        : colors.card,
    },
    configInstructions: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      marginBottom: 20,
      textAlign: 'center',
    },
    editModal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    editModalContent: {
      width: '80%',
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    editModalTitle: {
      fontSize: 18,
      fontFamily: 'Poppins-Medium',
      color: colors.primary,
      marginBottom: 20,
    },
    editInput: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      marginBottom: 20,
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      color: colors.text,
    },
    editButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    editButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 5,
    },
    editCancelButton: {
      backgroundColor: colors.border,
    },
    editSaveButton: {
      backgroundColor: colors.primary,
    },
    editButtonText: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: '#ffffff',
    },
    pointConfigButton: {
      position: 'absolute',
      top: 10,
      left: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      zIndex: 100,
    },
    emptyCell: {
      backgroundColor: colors.card,
    },
    emptyCellText: {
      color: colors.text,
      fontSize: 20,
      fontFamily: 'Poppins-Medium',
    },
    deleteButton: {
      backgroundColor: colors.danger,
    },
  });

  return (
    <SafeAreaView style={styles.container} key={`calculator-${theme}`}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            <Image
              source={require('../../assets/images/splash.png')}
              alt="logo"
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.operationsCountContainer}>
              <Text style={styles.operationsCountText}>
                {t('calculator.clicks')}: {operationsCount}
              </Text>
            </View>
            <TouchableOpacity
              ref={targetRefs['register-button']}
              style={[
                styles.registerButton,
                history.length === 0 && styles.disabledButton,
              ]}
              onPress={saveSession}
              disabled={history.length === 0}
            >
              <Text style={styles.registerText}>
                {t('calculator.register')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.displayContainer}>
        <View style={styles.historyDisplay}>{renderOperationHistory()}</View>
        <Text style={styles.displayText}>{formatNumber(total)}</Text>
      </View>

      <View style={styles.actionRow}>{renderActionButtons()}</View>

      <View ref={targetRefs['grid-container']} style={styles.gridContainer}>
        {pointValues.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.gridRow}>
            {row.map((value, colIndex) =>
              renderGridCell(value, rowIndex, colIndex)
            )}
          </View>
        ))}
      </View>

      {/* Student Name Modal */}
      <Modal
        visible={showStudentNameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStudentNameModal(false)}
      >
        <View style={styles.editModal}>
          <View style={styles.editModalContent}>
            <Text style={styles.editModalTitle}>
              {t('calculator.enterStudentName') || 'Enter Student Name'}
            </Text>
            <TextInput
              style={styles.editInput}
              value={studentName}
              onChangeText={setStudentName}
              placeholder={t('calculator.studentName') || 'Student Name'}
              autoFocus={true}
            />
            <View style={styles.editButtonRow}>
              <TouchableOpacity
                style={[styles.editButton, styles.editCancelButton]}
                onPress={() => setShowStudentNameModal(false)}
              >
                <Text style={styles.editButtonText}>
                  {t('calculator.cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.editSaveButton]}
                onPress={finalizeSessionSave}
              >
                <Text style={styles.editButtonText}>
                  {t('calculator.save') || 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Value Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.editModal}>
          <View style={styles.editModalContent}>
            <Text style={styles.editModalTitle}>
              {t('calculator.editValue') || 'Edit Point Value'}
            </Text>
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              autoFocus={true}
            />
            <View style={styles.editButtonRow}>
              <TouchableOpacity
                style={[styles.editButton, styles.editCancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.editButtonText}>
                  {t('calculator.cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.editSaveButton]}
                onPress={saveEditedPointValue}
              >
                <Text style={styles.editButtonText}>
                  {t('calculator.save') || 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Delete button */}
            <TouchableOpacity
              style={[
                styles.editButton,
                styles.deleteButton,
                { marginTop: 10 },
              ]}
              onPress={deletePointValue}
            >
              <Text style={styles.editButtonText}>
                {t('calculator.delete') || 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
