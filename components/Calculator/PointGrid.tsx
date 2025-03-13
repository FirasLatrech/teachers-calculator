import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useButtonConfig } from '@/hooks/useButtonConfig';
import { useFeedback } from '@/hooks/useSound';
import { formatNumber } from '../../utils/formatters';

interface PointGridProps {
  addValue: (value: number) => void;
  subtractValue: (value: number) => void;
  onEditPointValue: (rowIndex: number, colIndex: number) => void;
}

const PointGrid: React.FC<PointGridProps> = ({
  addValue,
  subtractValue,
  onEditPointValue,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { pointConfig, isEditingPoints } = useButtonConfig();
  const { playFeedback } = useFeedback();
  const gridContainerRef = useRef<View>(null);

  const styles = StyleSheet.create({
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
    emptyCell: {
      backgroundColor: colors.card,
    },
    emptyCellText: {
      color: colors.text,
      fontSize: 20,
      fontFamily: 'Poppins-Medium',
    },
    editPointValue: {
      backgroundColor: isEditingPoints
        ? 'rgba(53, 187, 227, 0.2)'
        : colors.card,
    },
  });

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
          onPress={() => {
            if (isEditingPoints) {
              onEditPointValue(rowIndex, colIndex);
              playFeedback('input');
            }
          }}
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
        onPress={() => {
          if (isEditingPoints) {
            onEditPointValue(rowIndex, colIndex);
            playFeedback('input');
          } else {
            addValue(value);
            playFeedback('input');
          }
        }}
        onLongPress={() => {
          if (!isEditingPoints) {
            subtractValue(value);
            playFeedback('warning');
          }
        }}
      >
        <Text style={styles.gridCellText}>{formatNumber(value)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View ref={gridContainerRef} style={styles.gridContainer}>
      {pointConfig.values.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.gridRow}>
          {row.map((value, colIndex) =>
            renderGridCell(value, rowIndex, colIndex)
          )}
        </View>
      ))}
    </View>
  );
};

export default PointGrid;
