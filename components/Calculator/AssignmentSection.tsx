import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Assignment } from '../Assignment';
import { AssignmentList } from '../AssignmentList';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Assignment as AssignmentType } from './types';

interface AssignmentSectionProps {
  classId: string | undefined;
  studentId?: string;
  studentName?: string;
  isTeacher?: boolean;
  selectedAssignment: AssignmentType | null;
  onSelectAssignment: (assignment: AssignmentType | null) => void;
}

export const AssignmentSection: React.FC<AssignmentSectionProps> = ({
  classId,
  studentId,
  studentName,
  isTeacher = false,
  selectedAssignment,
  onSelectAssignment,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : '#f5f5f5',
    },
    content: {
      flex: 1,
    },
    addButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      margin: 16,
      alignItems: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      fontFamily: 'Poppins-Bold',
    },
    selectedAssignment: {
      backgroundColor: isDarkMode ? colors.card : '#fff',
      padding: 16,
      margin: 16,
      borderRadius: 8,
      shadowColor: isDarkMode ? '#000' : '#666',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    selectedTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      fontFamily: 'Poppins-Bold',
    },
    selectedMaxScore: {
      fontSize: 16,
      color: colors.text,
      opacity: 0.7,
      fontFamily: 'Poppins-Regular',
    },
  });

  if (!classId) {
    return null;
  }

  return (
    <View style={styles.container}>
      {selectedAssignment && !showAddAssignment && (
        <View style={styles.selectedAssignment}>
          <Text style={styles.selectedTitle}>
            {t('assignments.selected')}: {selectedAssignment.title}
          </Text>
          <Text style={styles.selectedMaxScore}>
            {t('assignments.maxScore')}: {selectedAssignment.maxScore}
          </Text>
        </View>
      )}
      {isTeacher && !showAddAssignment && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddAssignment(true)}
        >
          <Text style={styles.addButtonText}>{t('assignments.add')}</Text>
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        {isTeacher && showAddAssignment ? (
          <Assignment
            classId={classId}
            onAssignmentAdded={() => {
              setShowAddAssignment(false);
            }}
          />
        ) : (
          <AssignmentList
            classId={classId}
            studentId={studentId}
            studentName={studentName}
            isTeacher={isTeacher}
            selectedAssignment={selectedAssignment}
            onSelectAssignment={onSelectAssignment}
          />
        )}
      </View>
    </View>
  );
};
