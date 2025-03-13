import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { X, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useButtonConfig } from '@/hooks/useButtonConfig';
import { useTranslation } from 'react-i18next';

interface PointValueEditorProps {
  onClose: () => void;
}

const PointValueEditor: React.FC<PointValueEditorProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { resetPointValues } = useButtonConfig();

  const styles = StyleSheet.create({
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
    configInstructions: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      marginBottom: 20,
      textAlign: 'center',
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
  });

  const handleResetPointValues = () => {
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
  };

  return (
    <View style={styles.configContainer}>
      <View style={styles.configHeader}>
        <Text style={styles.configTitle}>
          {t('calculator.editPointValues') || 'Edit Point Values'}
        </Text>
        <TouchableOpacity style={styles.closeConfigButton} onPress={onClose}>
          <X size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.configInstructions}>
        {t('calculator.tapPointToEdit') || 'Tap on any point value to edit it'}
      </Text>

      <TouchableOpacity
        style={styles.resetConfigButton}
        onPress={handleResetPointValues}
      >
        <RotateCcw size={18} color="#ffffff" />
        <Text style={styles.resetConfigButtonText}>
          {t('settings.resetPointValues') || 'Reset to Default Values'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PointValueEditor;
