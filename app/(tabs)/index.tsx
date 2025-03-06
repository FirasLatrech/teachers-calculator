import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Minus, Plus, RotateCcw, X } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

export default function CalculatorScreen() {
  const { t } = useTranslation();
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<
    { value: number; timestamp: number }[]
  >([]);
  const [lastOperation, setLastOperation] = useState<{
    value: number;
    timestamp: number;
  } | null>(null);

  const pointValues = [
    [0.25, 0.5, 0.75, 1.0],
    [1.25, 1.5, 1.75, 2.0],
    [2.25, 2.5, 2.75, 3.0],
    [3.25, 3.5, 3.75, 4.0],
    [4.25, 4.5, 4.75, 5.0],
  ];

  useEffect(() => {
    loadHistory();
  }, []);

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
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveHistory = async () => {
    try {
      await AsyncStorage.setItem('calculatorHistory', JSON.stringify(history));
      await AsyncStorage.setItem('calculatorTotal', total.toString());
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  useEffect(() => {
    saveHistory();
  }, [history, total]);

  const addValue = (value: number) => {
    const newTotal = parseFloat((total + value).toFixed(2));

    setTotal(newTotal);
    const operation = { value, timestamp: Date.now() };
    setHistory([...history, operation]);
    setLastOperation(operation);
  };
  const saveSession = async () => {
    if (history.length === 0) {
      Alert.alert(
        'Aucune Donnée',
        "Il n'y a pas de données de notation à enregistrer."
      );
      return;
    }

    try {
      // Get existing sessions
      const savedSessionsStr = await AsyncStorage.getItem('calculatorSessions');
      let savedSessions = savedSessionsStr ? JSON.parse(savedSessionsStr) : [];

      // Create new session
      const newSession = {
        date: new Date().toISOString(),
        items: [...history],
        total: total,
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

      Alert.alert(
        'Succès',
        `Session enregistrée avec succès !\nTotal des points : ${total.toFixed(
          2
        )}\nNombre d\'opérations : ${history.length}`
      );
    } catch (error) {
      console.error("Échec de l'enregistrement de la session:", error);
      Alert.alert(
        'Erreur',
        "Échec de l'enregistrement de la session de notation. Veuillez réessayer."
      );
    } finally {
      //   setIsSaving(false);
    }
  };
  const subtractValue = (value: number) => {
    const newTotal = parseFloat((total - value).toFixed(2));

    setTotal(newTotal);
    const operation = { value: -value, timestamp: Date.now() };
    setHistory([...history, operation]);
    setLastOperation(operation);
  };

  const clearTotal = () => {
    setTotal(0);
    setHistory([]);
    setLastOperation(null);
  };

  const undoLastOperation = () => {
    if (history.length > 0) {
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
              {op.value.toFixed(2)}
            </Text>
          ))
          .reverse()
          .slice(0, 8)}
      </ScrollView>
    );
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
    logoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      color: '#35bbe3',
      fontSize: 20,
      fontFamily: 'Poppins-Bold',
    },
    registerButton: {
      backgroundColor: '#35bbe3',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    registerText: {
      color: '#ffffff',
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
    },
    displayContainer: {
      backgroundColor: '#f8f9fa',
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
      color: '#35bbe3',
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
    },
    negativeHistoryText: {
      color: '#ff6b6b',
    },
    displayText: {
      color: '#35bbe3',
      fontSize: 40,
      fontFamily: 'Poppins-Bold',
      textAlign: 'right',
    },
    actionRow: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      height: 60,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    actionButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gridContainer: {
      flex: 1,
      backgroundColor: '#f8f9fa',
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
      borderColor: '#d3d3d3',
      backgroundColor: '#f8f9fa',
    },
    gridCellText: {
      color: '#333333',
      fontSize: 20,
      fontFamily: 'Poppins-Medium',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={'light'} />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            <Image
              source={require('../../assets/images/logo.svg')}
              //   style={styles.logo}
              resizeMode="contain"
            />
          </Text>
          <TouchableOpacity style={styles.registerButton} onPress={saveSession}>
            <Text style={styles.registerText}>{t('calculator.register')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.displayContainer}>
        <View style={styles.historyDisplay}>{renderOperationHistory()}</View>
        <Text style={styles.displayText}>{total.toFixed(2)}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={clearTotal}>
          <RotateCcw size={24} color="#35bbe3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={undoLastOperation}
        >
          <X size={24} color="#35bbe3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            lastOperation && subtractValue(Math.abs(lastOperation.value))
          }
        >
          <Minus size={24} color="#35bbe3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            lastOperation && addValue(Math.abs(lastOperation.value))
          }
        >
          <Plus size={24} color="#35bbe3" />
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {pointValues.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.gridRow}>
            {row.map((value, colIndex) => (
              <TouchableOpacity
                key={`cell-${rowIndex}-${colIndex}`}
                style={styles.gridCell}
                onPress={() => addValue(value)}
                onLongPress={() => subtractValue(value)}
              >
                <Text style={styles.gridCellText}>{value.toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
