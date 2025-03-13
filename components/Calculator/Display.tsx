import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '../../utils/formatters';
import { Operation } from './types';
import { useTranslation } from 'react-i18next';

interface DisplayProps {
  total: number;
  history: Operation[];
  maxScore?: number;
}

const Display: React.FC<DisplayProps> = ({ total, history, maxScore }) => {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
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
      color: maxScore && total > maxScore ? colors.danger : colors.primary,
      fontSize: 40,
      fontFamily: 'Poppins-Bold',
      textAlign: 'right',
    },
    maxScoreText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      textAlign: 'right',
      marginTop: 8,
      opacity: 0.7,
    },
  });

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

  return (
    <View style={styles.displayContainer}>
      <View style={styles.historyDisplay}>{renderOperationHistory()}</View>
      <Text style={styles.displayText}>{formatNumber(total)}</Text>
      {maxScore && (
        <Text style={styles.maxScoreText}>
          {t('calculator.maxScore')}: {formatNumber(maxScore)}
        </Text>
      )}
    </View>
  );
};

export default Display;
