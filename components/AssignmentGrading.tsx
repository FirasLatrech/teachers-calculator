import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Assignment, AssignmentGrade } from './Assignment';

interface AssignmentGradingProps {
  assignment: Assignment;
  studentId: string;
  studentName: string;
  onGradeSubmitted?: () => void;
}

export const AssignmentGrading: React.FC<AssignmentGradingProps> = ({
  assignment,
  studentId,
  studentName,
  onGradeSubmitted,
}) => {
  const { t } = useTranslation();
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');
  const [existingGrade, setExistingGrade] = useState<AssignmentGrade | null>(
    null
  );

  useEffect(() => {
    loadExistingGrade();
  }, [assignment.id, studentId]);

  const loadExistingGrade = async () => {
    try {
      const gradesStr = await AsyncStorage.getItem('assignmentGrades');
      if (gradesStr) {
        const grades: AssignmentGrade[] = JSON.parse(gradesStr);
        const grade = grades.find(
          (g) => g.assignmentId === assignment.id && g.studentId === studentId
        );
        if (grade) {
          setExistingGrade(grade);
          setScore(grade.score.toString());
          setComments(grade.comments || '');
        }
      }
    } catch (error) {
      console.error('Error loading existing grade:', error);
    }
  };

  const submitGrade = async () => {
    try {
      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > assignment.maxScore) {
        Alert.alert(
          t('Error'),
          t('Please enter a valid score between 0 and {{maxScore}}', {
            maxScore: assignment.maxScore,
          })
        );
        return;
      }

      const newGrade: AssignmentGrade = {
        id: existingGrade?.id || Date.now().toString(),
        assignmentId: assignment.id,
        studentId,
        score: scoreNum,
        submissionDate: new Date().toISOString(),
        comments: comments.trim(),
      };

      const gradesStr = await AsyncStorage.getItem('assignmentGrades');
      const grades: AssignmentGrade[] = gradesStr ? JSON.parse(gradesStr) : [];

      const existingIndex = grades.findIndex(
        (g) => g.assignmentId === assignment.id && g.studentId === studentId
      );

      if (existingIndex >= 0) {
        grades[existingIndex] = newGrade;
      } else {
        grades.push(newGrade);
      }

      await AsyncStorage.setItem('assignmentGrades', JSON.stringify(grades));

      if (onGradeSubmitted) {
        onGradeSubmitted();
      }

      Alert.alert(t('Success'), t('Grade submitted successfully'));
    } catch (error) {
      console.error('Error submitting grade:', error);
      Alert.alert(t('Error'), t('Failed to submit grade'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('Grade Assignment: {{title}}', { title: assignment.title })}
      </Text>
      <Text style={styles.subtitle}>
        {t('Student: {{name}}', { name: studentName })}
      </Text>
      <Text style={styles.maxScore}>
        {t('Maximum Score: {{score}}', { score: assignment.maxScore })}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={t('Score')}
        value={score}
        onChangeText={setScore}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, styles.commentsInput]}
        placeholder={t('Comments (Optional)')}
        value={comments}
        onChangeText={setComments}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={submitGrade}>
        <Text style={styles.buttonText}>
          {existingGrade ? t('Update Grade') : t('Submit Grade')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  maxScore: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  commentsInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
