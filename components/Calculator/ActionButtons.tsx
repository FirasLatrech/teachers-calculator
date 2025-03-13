import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Minus, Plus, RotateCcw, Delete } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useButtonConfig } from '@/hooks/useButtonConfig';
import { useFeedback } from '@/hooks/useSound';
import { Operation } from './types';

interface ActionButtonsProps {
  clearTotal: () => void;
  undoLastOperation: () => void;
  addValue: (value: number) => void;
  subtractValue: (value: number) => void;
  lastOperation: Operation | null;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  clearTotal,
  undoLastOperation,
  addValue,
  subtractValue,
  lastOperation,
}) => {
  const { colors } = useTheme();
  const {
    buttonConfig,
    isConfigMode,
    setConfigMode,
    toggleButton,
    moveButtonUp,
    moveButtonDown,
    resetToDefaults,
  } = useButtonConfig();
  const { playFeedback } = useFeedback();

  const targetRefs = {
    'reset-button': useRef<View>(null),
    'undo-button': useRef<View>(null),
    'add-button': useRef<View>(null),
  };

  const styles = StyleSheet.create({
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
    disabledButton: {
      backgroundColor: '#cccccc',
      opacity: 0.6,
    },
  });

  const renderButtonConfigUI = () => {
    const sortedButtons = [...buttonConfig].sort((a, b) => a.order - b.order);

    return (
      <View style={styles.configContainer}>
        <View style={styles.configHeader}>
          <Text style={styles.configTitle}>Button Configuration</Text>
          <TouchableOpacity
            style={styles.closeConfigButton}
            onPress={() => setConfigMode(false)}
          >
            <Text>X</Text>
          </TouchableOpacity>
        </View>

        {sortedButtons.map((button, index) => (
          <View style={styles.configItem} key={button.id}>
            <View style={styles.configItemLeft}>
              <Text style={styles.configButtonLabel}>{button.name}</Text>
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
          onPress={resetToDefaults}
        >
          <RotateCcw size={18} color="#ffffff" />
          <Text style={styles.resetConfigButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
            No buttons enabled. Configure in Settings.
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
              onPress={() => {
                handleClearTotal();
              }}
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
              onPress={() => {
                handleUndo();
              }}
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
                handleSubtractLast();
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
                handleAddLast();
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

  const handleClearTotal = () => {
    clearTotal();
    playFeedback('warning');
  };

  const handleUndo = () => {
    undoLastOperation();
    playFeedback('input');
  };

  const handleAddLast = () => {
    if (lastOperation) {
      const value = Math.abs(lastOperation.value);
      addValue(value);
      playFeedback('input');
    }
  };

  const handleSubtractLast = () => {
    if (lastOperation) {
      const value = Math.abs(lastOperation.value);
      subtractValue(value);
      playFeedback('warning');
    }
  };

  return <View style={styles.actionRow}>{renderActionButtons()}</View>;
};

export default ActionButtons;
