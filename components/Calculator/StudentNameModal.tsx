import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

interface StudentNameModalProps {
  visible: boolean;
  onClose: () => void;
  studentName: string;
  onChangeStudentName: (name: string) => void;
  onSave: () => void;
  existingStudentNumbers?: string[]; // Add optional prop for validation
}

const StudentNameModal: React.FC<StudentNameModalProps> = ({
  visible,
  onClose,
  studentName,
  onChangeStudentName,
  onSave,
  existingStudentNumbers = [],
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [error, setError] = useState<string | null>(null);

  // Validate input to accept only numbers
  const handleChangeText = (text: string) => {
    // Remove any non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');

    // Clear error when user types
    if (error) setError(null);

    // Update the student number
    onChangeStudentName(numericValue);
  };

  // Validate student number before saving
  const handleSave = () => {
    // Check if the student number is empty
    if (!studentName.trim()) {
      setError(
        t('calculator.studentNumberRequired') || 'Student number is required'
      );
      return;
    }

    // Check if the student number exists (if validation is required)
    if (
      existingStudentNumbers.length > 0 &&
      !existingStudentNumbers.includes(studentName)
    ) {
      setError(
        t('calculator.studentNumberNotFound') || 'Student number not found'
      );
      return;
    }

    // Proceed with save if validation passes
    onSave();
  };

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
    errorText: {
      color: 'red',
      marginBottom: 10,
      fontFamily: 'Poppins-Regular',
      alignSelf: 'flex-start',
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
            {t('calculator.enterStudentName') ||
              'Enter Student Number for Exam'}
          </Text>
          <TextInput
            style={styles.editInput}
            value={studentName}
            onChangeText={handleChangeText}
            placeholder={t('calculator.studentName') || 'Exam Student Number'}
            autoFocus={true}
            keyboardType="numeric"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
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
              onPress={handleSave}
            >
              <Text style={styles.editButtonText}>
                {t('calculator.save') || 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StudentNameModal;
