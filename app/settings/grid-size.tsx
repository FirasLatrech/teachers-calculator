import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useButtonConfig } from '@/hooks/useButtonConfig';
import { Check } from 'lucide-react-native';

export default function GridSizeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { pointConfig, changeGridSize } = useButtonConfig();

  const gridSizeOptions = [
    { size: 6, rows: 2, cols: 3 },
    { size: 9, rows: 3, cols: 3 },
    { size: 12, rows: 3, cols: 4 },
    { size: 16, rows: 4, cols: 4 },
    { size: 20, rows: 5, cols: 4 },
  ];

  const handleSelectGridSize = (size: number) => {
    changeGridSize(size);
    Alert.alert(
      t('settings.gridSizeChanged.title') || 'Grid Size Changed',
      t('settings.gridSizeChanged.message', { size }) ||
        `Grid size changed to ${size} buttons`,
      [{ text: 'OK' }]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      marginBottom: 30,
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
      lineHeight: 20,
    },
    optionsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 40,
    },
    optionCard: {
      width: '100%',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      position: 'relative',
      overflow: 'hidden',
    },
    optionSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    selectionIndicator: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionTitle: {
      fontSize: 18,
      fontFamily: 'Poppins-Medium',
      color: colors.text,
      marginBottom: 16,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: 16,
      backgroundColor: colors.background,
      borderRadius: 10,
      marginBottom: 10,
    },
    gridCell: {
      backgroundColor: colors.primary,
      margin: 2,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gridCellText: {
      color: '#fff',
      fontSize: 8,
      fontFamily: 'Poppins-Medium',
    },
    optionInfo: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    optionDesc: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: colors.secondary,
    },
  });

  // Helper function to render grid cells
  const renderGridVisual = (rows: number, cols: number) => {
    const cellSize = Math.min(250 / Math.max(rows, cols), 40);
    const cells = [];
    const sampleValues = [0.5, 1.0, 2.0, 5.0];
    let sampleIndex = 0;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const value = sampleValues[sampleIndex % sampleValues.length];
        sampleIndex++;

        cells.push(
          <View
            key={`${i}-${j}`}
            style={[
              styles.gridCell,
              {
                width: cellSize,
                height: cellSize,
                opacity: 0.7 + Math.random() * 0.3, // slight variation in opacity
              },
            ]}
          >
            <Text style={styles.gridCellText}>{value}</Text>
          </View>
        );
      }
    }

    return (
      <View
        style={[
          styles.gridContainer,
          {
            width: cols * (cellSize + 4) + 32,
            maxWidth: '100%',
            minHeight: rows * (cellSize + 4) + 32,
          },
        ]}
      >
        {cells}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.optionsContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('settings.selectGridSize') || 'Select Grid Size'}
        </Text>
        <Text style={styles.description}>
          {t('settings.gridSizeDescription') ||
            'Choose how many buttons you want to display in the calculator. Each size has a different layout for optimal usability.'}
        </Text>
      </View>

      {gridSizeOptions.map((option) => {
        const isSelected = pointConfig.gridSize === option.size;

        return (
          <TouchableOpacity
            key={option.size}
            style={[styles.optionCard, isSelected && styles.optionSelected]}
            onPress={() => handleSelectGridSize(option.size)}
            activeOpacity={0.7}
          >
            {isSelected && (
              <View style={styles.selectionIndicator}>
                <Check size={18} color="#fff" />
              </View>
            )}

            <Text style={styles.optionTitle}>
              {`${option.size} ${t('settings.buttons') || 'Buttons'}`}
            </Text>

            {renderGridVisual(option.rows, option.cols)}

            <View style={styles.optionInfo}>
              <Text style={styles.optionDesc}>
                {`${option.rows} × ${option.cols} ${
                  t('settings.grid') || 'Grid'
                }`}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
