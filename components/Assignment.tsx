import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

export interface Assignment {
  id: string;
  title: string;
  maxScore: number;
  classId: string;
}

export interface AssignmentGrade {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number;
  submissionDate: string;
}

interface AssignmentProps {
  classId: string;
  onAssignmentAdded?: () => void;
}

export const Assignment: React.FC<AssignmentProps> = ({
  classId,
  onAssignmentAdded,
}) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const [title, setTitle] = useState('');
  const [maxScore, setMaxScore] = useState('20');

  const saveAssignment = async () => {
    try {
      if (!title.trim()) {
        Alert.alert(t('errors.required'), t('assignments.titleRequired'));
        return;
      }

      const maxScoreNum = parseInt(maxScore);
      if (isNaN(maxScoreNum) || maxScoreNum <= 0) {
        Alert.alert(t('errors.invalid'), t('assignments.invalidMaxScore'));
        return;
      }

      const newAssignment: Assignment = {
        id: Date.now().toString(),
        title: title.trim(),
        maxScore: maxScoreNum,
        classId,
      };

      const existingAssignments = await AsyncStorage.getItem('assignments');
      const assignments: Assignment[] = existingAssignments
        ? JSON.parse(existingAssignments)
        : [];

      assignments.push(newAssignment);
      await AsyncStorage.setItem('assignments', JSON.stringify(assignments));

      setTitle('');
      setMaxScore('20');

      if (onAssignmentAdded) {
        onAssignmentAdded();
      }

      Alert.alert(t('success'), t('assignments.addSuccess'));
    } catch (error) {
      console.error('Error saving assignment:', error);
      Alert.alert(t('errors.error'), t('assignments.saveFailed'));
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: isDarkMode ? colors.card : '#fff',
      borderRadius: 12,
      margin: 8,
      shadowColor: isDarkMode ? '#000' : '#666',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: colors.text,
      fontFamily: 'Poppins-Bold',
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? colors.border : '#ddd',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
      backgroundColor: isDarkMode ? colors.background : '#fff',
      color: colors.text,
      fontFamily: 'Poppins-Regular',
    },
    button: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      fontFamily: 'Poppins-Bold',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('assignments.newAssignment')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('assignments.titlePlaceholder')}
        placeholderTextColor={isDarkMode ? colors.border : '#999'}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder={t('assignments.maxScorePlaceholder')}
        placeholderTextColor={isDarkMode ? colors.border : '#999'}
        value={maxScore}
        onChangeText={setMaxScore}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={saveAssignment}>
        <Text style={styles.buttonText}>{t('assignments.add')}</Text>
      </TouchableOpacity>
    </View>
  );
};
