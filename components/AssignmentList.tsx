import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Assignment, AssignmentGrade } from './Assignment';
import { useTheme } from '@/hooks/useTheme';

interface AssignmentListProps {
  classId: string;
  studentId?: string;
  studentName?: string;
  isTeacher?: boolean;
  selectedAssignment: Assignment | null;
  onSelectAssignment: (assignment: Assignment | null) => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  classId,
  studentId,
  studentName,
  isTeacher = false,
  selectedAssignment,
  onSelectAssignment,
}) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<AssignmentGrade[]>([]);
  const [checkboxAnimations] = useState<{ [key: string]: Animated.Value }>({});

  // Load assignments when class changes and handle initial selection
  useEffect(() => {
    const loadAndSelectAssignment = async () => {
      try {
        const assignmentsStr = await AsyncStorage.getItem('assignments');
        if (assignmentsStr) {
          const allAssignments: Assignment[] = JSON.parse(assignmentsStr);
          const classAssignments = allAssignments.filter(
            (a) => a.classId === classId
          );
          setAssignments(classAssignments);

          // Only select an assignment if none is currently selected or the selected one doesn't belong to this class
          if (
            classAssignments.length > 0 &&
            (!selectedAssignment ||
              !classAssignments.some((a) => a.id === selectedAssignment.id))
          ) {
            onSelectAssignment(classAssignments[0]);
          } else if (classAssignments.length === 0) {
            // If no assignments in new class, clear selection
            onSelectAssignment(null);
          }
        } else {
          setAssignments([]);
          onSelectAssignment(null);
        }
      } catch (error) {
        console.error('Error loading assignments:', error);
        setAssignments([]);
        onSelectAssignment(null);
      }
    };

    loadAndSelectAssignment();
    if (studentId) {
      loadGrades();
    }
  }, [classId, selectedAssignment]); // Add selectedAssignment to dependency array

  // Initialize animation values for assignments
  useEffect(() => {
    assignments.forEach((assignment) => {
      if (!checkboxAnimations[assignment.id]) {
        checkboxAnimations[assignment.id] = new Animated.Value(
          selectedAssignment?.id === assignment.id ? 1 : 0
        );
      }
    });
  }, [assignments]);

  const loadGrades = async () => {
    try {
      const gradesStr = await AsyncStorage.getItem('assignmentGrades');
      if (gradesStr) {
        const allGrades: AssignmentGrade[] = JSON.parse(gradesStr);
        const studentGrades = allGrades.filter(
          (g) => g.studentId === studentId
        );
        setGrades(studentGrades);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const handleAssignmentSelect = (assignment: Assignment) => {
    const isSelected = selectedAssignment?.id === assignment.id;

    // Animate checkbox
    Animated.spring(checkboxAnimations[assignment.id], {
      toValue: isSelected ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();

    onSelectAssignment(isSelected ? null : assignment);
  };

  const getGradeForAssignment = (assignmentId: string) => {
    return grades.find((g) => g.assignmentId === assignmentId);
  };

  const renderAssignmentItem = ({ item }: { item: Assignment }) => {
    const grade = getGradeForAssignment(item.id);
    const isSelected = selectedAssignment?.id === item.id;

    const checkboxScale =
      checkboxAnimations[item.id]?.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.2, 1],
      }) || new Animated.Value(1);

    return (
      <TouchableOpacity
        style={[
          styles.assignmentItem,
          {
            backgroundColor: isDarkMode ? colors.card : '#fff',
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleAssignmentSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.assignmentHeader}>
          <View style={styles.checkboxContainer}>
            <Animated.View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  borderColor: isSelected ? colors.primary : colors.border,
                  transform: [{ scale: checkboxScale }],
                },
              ]}
            >
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </Animated.View>
            <View style={styles.titleContainer}>
              <Text style={[styles.assignmentTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.maxScore, { color: colors.text }]}>
                {t('MaximumScore') + ': ' + item.maxScore}
              </Text>
            </View>
          </View>
        </View>
        {grade && (
          <View
            style={[
              styles.gradeContainer,
              { backgroundColor: isDarkMode ? colors.background : '#f8f8f8' },
            ]}
          >
            <Text style={[styles.grade, { color: colors.text }]}>
              {t('Score: {{score}}/{{maxScore}}', {
                score: grade.score,
                maxScore: item.maxScore,
              })}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? colors.background : '#f5f5f5' },
      ]}
    >
      <FlatList
        data={assignments}
        renderItem={renderAssignmentItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {t('No assignments found')}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  assignmentItem: {
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  maxScore: {
    fontSize: 14,
    opacity: 0.8,
    fontFamily: 'Poppins-Regular',
  },
  gradeContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  grade: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});
