import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

interface PointValueEditModalProps {
  visible: boolean;
  onClose: () => void;
  editValue: string;
  onChangeEditValue: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
}

const PointValueEditModal: React.FC<PointValueEditModalProps> = ({
  visible,
  onClose,
  editValue,
  onChangeEditValue,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
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
    deleteButton: {
      backgroundColor: colors.danger,
      marginTop: 10,
      width: '100%',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.editModal}>
        <View style={styles.editModalContent}>
          <Text style={styles.editModalTitle}>
            {t('calculator.editValue') || 'Edit Point Value'}
          </Text>
          <TextInput
            style={styles.editInput}
            value={editValue}
            onChangeText={onChangeEditValue}
            keyboardType="numeric"
            autoFocus={true}
          />
          <View style={styles.editButtonRow}>
            <TouchableOpacity
              style={[styles.editButton, styles.editCancelButton]}
              onPress={onClose}
            >
              <Text style={styles.editButtonText}>
                {t('calculator.cancel') || 'Cancel'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.editSaveButton]}
              onPress={onSave}
            >
              <Text style={styles.editButtonText}>
                {t('calculator.save') || 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={[styles.editButton, styles.deleteButton]}
            onPress={onDelete}
          >
            <Text style={styles.editButtonText}>
              {t('calculator.delete') || 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PointValueEditModal;
