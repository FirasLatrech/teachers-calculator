import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useButtonConfig } from '@/hooks/useButtonConfig';
import { RotateCcw, Plus, Trash2, Save, X } from 'lucide-react-native';
import { formatNumber } from '@/utils/formatters';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GridValuesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { pointConfig, updatePointValue, resetPointValues } = useButtonConfig();
  const router = useRouter();

  // State for editing
  const [editingRow, setEditingRow] = useState(-1);
  const [editingCol, setEditingCol] = useState(-1);
  const [editValue, setEditValue] = useState('');
  const [editing, setEditing] = useState(false);

  // Open edit screen for a value
  const handleEditValue = (rowIndex: number, colIndex: number) => {
    const currentValue = pointConfig.values[rowIndex][colIndex];
    setEditingRow(rowIndex);
    setEditingCol(colIndex);
    setEditValue(currentValue !== null ? currentValue.toString() : '');
    setEditing(true);
  };

  // Cancel editing and go back
  const cancelEdit = () => {
    setEditing(false);
    setEditingRow(-1);
    setEditingCol(-1);
  };

  // Save the edited value
  const saveEditedValue = () => {
    if (editingRow === -1 || editingCol === -1) return;

    if (editValue.trim() === '') {
      // If input is empty, delete the value
      updatePointValue(editingRow, editingCol, null);
    } else {
      const numValue = parseFloat(editValue);
      if (isNaN(numValue)) {
        Alert.alert(
          t('calculator.invalidNumber.title') || 'Invalid Number',
          t('calculator.invalidNumber.message') ||
            'Please enter a valid number.',
          [{ text: 'OK' }]
        );
        return;
      }

      updatePointValue(editingRow, editingCol, numValue);
    }

    setEditing(false);
    setEditingRow(-1);
    setEditingCol(-1);
  };

  // Delete a value (set to null)
  const handleDeleteValue = () => {
    if (editingRow === -1 || editingCol === -1) return;

    updatePointValue(editingRow, editingCol, null);
    setEditing(false);
    setEditingRow(-1);
    setEditingCol(-1);
  };

  // Reset all values to default
  const handleResetValues = () => {
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
  };

  // Calculate cell size based on screen width
  const calculateCellSize = () => {
    const maxCols = Math.max(...pointConfig.values.map((row) => row.length));
    return Math.min((SCREEN_WIDTH - 80) / maxCols, 70);
  };

  const cellSize = calculateCellSize();

  const styles = StyleSheet.create({
    // Main container
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    // Header
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Poppins-Medium',
      color: colors.text,
      marginBottom: 12,
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
    // Grid styles
    gridContainer: {
      marginVertical: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 12,
    },
    gridRow: {
      flexDirection: 'row',
      marginBottom: 8,
      justifyContent: 'center',
    },
    gridCell: {
      width: cellSize,
      height: cellSize,
      margin: 4,
      borderRadius: 8,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyCellContainer: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    cellText: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: '#ffffff',
    },
    // Reset button
    resetButton: {
      backgroundColor: colors.danger,
      paddingVertical: 14,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    resetButtonText: {
      color: '#fff',
      fontFamily: 'Poppins-Medium',
      fontSize: 16,
      marginLeft: 8,
    },
    // Edit screen
    editScreen: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    editHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 40,
      paddingTop: 20,
    },
    editTitle: {
      fontSize: 18,
      fontFamily: 'Poppins-Bold',
      color: colors.primary,
    },
    closeButton: {
      padding: 8,
    },
    editForm: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    cellPosition: {
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 24,
      alignSelf: 'center',
    },
    cellPositionText: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: colors.text,
    },
    input: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 24,
      color: colors.text,
      fontSize: 16,
      backgroundColor: colors.card,
      textAlign: 'center',
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 16,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 6,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    buttonCancel: {
      backgroundColor: colors.border,
    },
    buttonSave: {
      backgroundColor: colors.primary,
    },
    buttonDelete: {
      backgroundColor: colors.danger,
      marginHorizontal: 0,
    },
    buttonText: {
      color: '#fff',
      fontFamily: 'Poppins-Medium',
      fontSize: 16,
      marginLeft: 6,
    },
  });

  // Render a grid cell
  const renderCell = (
    value: number | null,
    rowIndex: number,
    colIndex: number
  ) => {
    if (value === null) {
      return (
        <TouchableOpacity
          key={`cell-${rowIndex}-${colIndex}`}
          style={[styles.gridCell, styles.emptyCellContainer]}
          onPress={() => handleEditValue(rowIndex, colIndex)}
        >
          <Plus color={colors.primary} size={20} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={`cell-${rowIndex}-${colIndex}`}
        style={styles.gridCell}
        onPress={() => handleEditValue(rowIndex, colIndex)}
      >
        <Text style={styles.cellText}>{formatNumber(value)}</Text>
      </TouchableOpacity>
    );
  };

  // Render the main grid screen
  const renderMainScreen = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('settings.editPointValues') || 'Edit Button Values'}
        </Text>
        <Text style={styles.description}>
          {t('settings.tapToEditValues') ||
            'Tap on any value to edit or delete it. Empty cells can be filled with new values.'}
        </Text>
      </View>

      <View style={styles.gridContainer}>
        {pointConfig.values.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.gridRow}>
            {row.map((value, colIndex) =>
              renderCell(value, rowIndex, colIndex)
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={handleResetValues}>
        <RotateCcw size={20} color="#fff" />
        <Text style={styles.resetButtonText}>
          {t('settings.resetPointValues') || 'Reset to Default Values'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Render the edit screen (separate screen instead of overlay)
  const renderEditScreen = () => (
    <SafeAreaView style={styles.editScreen}>
      <View style={styles.editHeader}>
        <Text style={styles.editTitle}>
          {t('calculator.editValue') || 'Edit Value'}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={cancelEdit}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.editForm}>
        <View style={styles.cellPosition}>
          <Text style={styles.cellPositionText}>
            {`${t('calculator.position') || 'Position'}: ${editingRow + 1},${
              editingCol + 1
            }`}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          value={editValue}
          onChangeText={setEditValue}
          keyboardType="numeric"
          placeholder={t('calculator.enterValue') || 'Enter value'}
          placeholderTextColor={colors.border}
          autoFocus={true}
        />

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={cancelEdit}
          >
            <X size={18} color="#fff" />
            <Text style={styles.buttonText}>
              {t('calculator.cancel') || 'Cancel'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSave]}
            onPress={saveEditedValue}
          >
            <Save size={18} color="#fff" />
            <Text style={styles.buttonText}>
              {t('calculator.save') || 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonDelete]}
          onPress={handleDeleteValue}
        >
          <Trash2 size={18} color="#fff" />
          <Text style={styles.buttonText}>
            {t('calculator.delete') || 'Delete'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Return either the main screen or the edit screen
  return editing ? renderEditScreen() : renderMainScreen();
}
