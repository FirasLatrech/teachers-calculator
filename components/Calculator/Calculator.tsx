import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  AppState,
  TouchableOpacity,
  Text,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useButtonConfig } from '@/hooks/useButtonConfig';
import { useFeedback } from '@/hooks/useSound';
import { useLocalSearchParams } from 'expo-router';
import { Operation, Class, Session, Assignment } from './types';
import { AssignmentSection } from './AssignmentSection';

// Import components
import Header from './Header';
import Display from './Display';
import ActionButtons from './ActionButtons';
import PointGrid from './PointGrid';
import PointValueEditor from './PointValueEditor';
import ClassModal from './ClassModal';
import StudentNameModal from './StudentNameModal';
import PointValueEditModal from './PointValueEditModal';

const Calculator: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode, colors, theme } = useTheme();
  const { isEditingPoints, setEditingPoints, pointConfig, updatePointValue } =
    useButtonConfig();
  const { playFeedback } = useFeedback();

  const params = useLocalSearchParams();
  const [total, setTotal] = useState(0);
  const [operationsCount, setOperationsCount] = useState(0);
  const [history, setHistory] = useState<Operation[]>([]);
  const [lastOperation, setLastOperation] = useState<Operation | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const appState = useRef(AppState.currentState);

  // Student name state
  const [studentName, setStudentName] = useState('');
  const [showStudentNameModal, setShowStudentNameModal] = useState(false);

  // Class management state
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);

  // Values for editing point values
  const [editingRow, setEditingRow] = useState(-1);
  const [editingCol, setEditingCol] = useState(-1);
  const [editValue, setEditValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Assignment state
  const [showAssignments, setShowAssignments] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  // Replace the router focus listener with AppState listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    loadHistory();
    loadClasses();
    checkTutorialState();
  }, []);

  const checkTutorialState = async () => {
    try {
      // If we have a showTutorial parameter, show the tutorial regardless of stored state
      if (params.showTutorial) {
        setShowTutorial(true);
        return;
      }

      // Otherwise check if it's the first launch
      const tutorialShown = await AsyncStorage.getItem('tutorialShown');
      if (!tutorialShown) {
        setShowTutorial(true);
      }
    } catch (error) {
      console.error('Failed to check tutorial state:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('calculatorHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedTotal = await AsyncStorage.getItem('calculatorTotal');
      if (savedTotal) {
        setTotal(parseFloat(savedTotal));
      }

      const savedOperationsCount = await AsyncStorage.getItem(
        'calculatorOperationsCount'
      );
      if (savedOperationsCount) {
        setOperationsCount(parseInt(savedOperationsCount));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const savedClasses = await AsyncStorage.getItem('calculatorClasses');
      console.log('Loaded classes from storage:', savedClasses);

      if (
        savedClasses &&
        savedClasses !== 'null' &&
        savedClasses !== 'undefined'
      ) {
        try {
          const parsedClasses = JSON.parse(savedClasses);
          console.log('Parsed classes:', parsedClasses);

          if (Array.isArray(parsedClasses)) {
            setClasses(parsedClasses);
          } else {
            console.warn(
              'Saved classes is not an array, initializing with empty array'
            );
            setClasses([]);
          }
        } catch (parseError) {
          console.error('Error parsing classes:', parseError);
          setClasses([]);
        }
      } else {
        console.log(
          'No classes found in storage, initializing with empty array'
        );
        setClasses([]);
      }

      const savedSelectedClass = await AsyncStorage.getItem('selectedClass');
      if (
        savedSelectedClass &&
        savedSelectedClass !== 'null' &&
        savedSelectedClass !== 'undefined'
      ) {
        try {
          const parsedSelectedClass = JSON.parse(savedSelectedClass);
          setSelectedClass(parsedSelectedClass);

          // Load assignments for the selected class
          const assignmentsStr = await AsyncStorage.getItem('assignments');
          if (assignmentsStr) {
            const allAssignments: Assignment[] = JSON.parse(assignmentsStr);
            const classAssignments = allAssignments.filter(
              (a) => a.classId === parsedSelectedClass.id
            );

            // Only select the first assignment if no assignment is currently selected
            if (classAssignments.length > 0 && !selectedAssignment) {
              setSelectedAssignment(classAssignments[0]);
            }
          }
        } catch (parseError) {
          console.error('Error parsing selected class:', parseError);
          setSelectedClass(null);
          setSelectedAssignment(null);
        }
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
      setClasses([]);
      setSelectedAssignment(null);
    }
  };

  const saveHistory = async () => {
    try {
      await AsyncStorage.setItem('calculatorHistory', JSON.stringify(history));
      await AsyncStorage.setItem('calculatorTotal', total.toString());
      await AsyncStorage.setItem(
        'calculatorOperationsCount',
        operationsCount.toString()
      );
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  const saveClasses = async () => {
    try {
      console.log('Saving classes:', classes);

      // Ensure classes is an array before saving
      if (!Array.isArray(classes)) {
        console.error('Classes is not an array:', classes);
        return;
      }

      // Stringify and save classes
      const classesJson = JSON.stringify(classes);
      await AsyncStorage.setItem('calculatorClasses', classesJson);

      // Save selected class if it exists
      if (selectedClass) {
        const selectedClassJson = JSON.stringify(selectedClass);
        await AsyncStorage.setItem('selectedClass', selectedClassJson);
      } else {
        await AsyncStorage.removeItem('selectedClass');
      }

      console.log('Classes saved successfully');

      // Verify the save was successful by reading it back
      const savedClasses = await AsyncStorage.getItem('calculatorClasses');
      console.log('Verified saved classes:', savedClasses);
    } catch (error) {
      console.error('Failed to save classes:', error);
    }
  };

  useEffect(() => {
    saveHistory();
  }, [history, total]);

  useEffect(() => {
    saveClasses();
  }, [classes, selectedClass]);

  const addValue = (value: number) => {
    if (value === null) return; // Skip null values

    const newTotal = parseFloat((total + value).toFixed(2));
    setOperationsCount((prevCount) => prevCount + 1);
    setTotal(newTotal);
    const operation = { value, timestamp: Date.now() };
    setHistory([...history, operation]);
    setLastOperation(operation);
    playFeedback('input');
  };

  const subtractValue = (value: number) => {
    if (value === null) return; // Skip null values

    const newTotal = parseFloat((total - value).toFixed(2));
    setOperationsCount((prevCount) => prevCount + 1);
    setTotal(newTotal);
    const operation = { value: -value, timestamp: Date.now() };
    setHistory([...history, operation]);
    setLastOperation(operation);
    playFeedback('warning');
  };

  const saveSession = async () => {
    if (history.length === 0) {
      Alert.alert(
        t('calculator.alerts.noData.title'),
        t('calculator.alerts.noData.message')
      );
      return;
    }

    if (!selectedClass) {
      Alert.alert(
        t('calculator.alerts.noClass.title'),
        t('calculator.alerts.noClass.message')
      );
      return;
    }

    if (!selectedAssignment) {
      // If no assignment is selected, show assignments view
      setShowAssignments(true);
      Alert.alert(
        t('calculator.alerts.noAssignment.title'),
        t('calculator.alerts.noAssignment.message')
      );
      return;
    }

    // Check if total exceeds max score
    if (total > selectedAssignment.maxScore) {
      Alert.alert(
        t('calculator.alerts.exceedsMaxScore.title'),
        t('calculator.alerts.exceedsMaxScore.message', {
          maxScore: selectedAssignment.maxScore,
        })
      );
      return;
    }

    // Show student name input modal
    setShowStudentNameModal(true);
  };

  const checkDuplicateStudentNumber = async (
    studentNumber: string
  ): Promise<boolean> => {
    try {
      // If no assignment is selected, no need to check for duplicates
      if (!selectedAssignment) return false;

      const savedSessionsStr = await AsyncStorage.getItem('calculatorSessions');
      if (!savedSessionsStr) return false;

      const savedSessions = JSON.parse(savedSessionsStr);
      return savedSessions.some(
        (session: Session) =>
          session.studentName.trim() === studentNumber.trim() &&
          session.assignmentId === selectedAssignment.id
      );
    } catch (error) {
      console.error('Error checking duplicate student number:', error);
      return false;
    }
  };

  const finalizeSessionSave = async () => {
    try {
      // Check for empty student name
      if (!studentName.trim()) {
        Alert.alert(
          t('calculator.alerts.noName.title'),
          t('calculator.alerts.noName.message')
        );
        return;
      }

      // Check for duplicate student number
      const isDuplicate = await checkDuplicateStudentNumber(studentName);
      if (isDuplicate) {
        Alert.alert(
          t('calculator.alerts.duplicateStudent.title'),
          t('calculator.alerts.duplicateStudent.message')
        );
        return;
      }

      // Get existing sessions
      const savedSessionsStr = await AsyncStorage.getItem('calculatorSessions');
      let savedSessions = savedSessionsStr ? JSON.parse(savedSessionsStr) : [];

      // Calculate assignment statistics
      const percentageScore =
        (total / (selectedAssignment?.maxScore || 1)) * 100;

      // Calculate time-based statistics
      const timestamps = history.map((op) => op.timestamp);
      const totalTime =
        timestamps.length > 1
          ? timestamps[timestamps.length - 1] - timestamps[0]
          : 0;
      const averageTimePerOperation = totalTime / Math.max(1, history.length);

      // Calculate accuracy as percentage of max score achieved
      const accuracy = Math.min(
        100,
        (total / (selectedAssignment?.maxScore || 1)) * 100
      );

      // Create new session with enhanced statistics
      const newSession = {
        date: new Date().toISOString(),
        items: [...history],
        total: total,
        studentName: studentName.trim(),
        classId: selectedClass?.id,
        className: selectedClass?.name,
        assignmentId: selectedAssignment?.id,
        assignmentTitle: selectedAssignment?.title,
        maxScore: selectedAssignment?.maxScore,
        percentageScore: parseFloat(percentageScore.toFixed(2)),
        assignmentStats: {
          averageTimePerOperation: parseFloat(
            (averageTimePerOperation / 1000).toFixed(2)
          ), // Convert to seconds
          totalTime: parseFloat((totalTime / 1000).toFixed(2)), // Convert to seconds
          accuracy: parseFloat(accuracy.toFixed(2)),
        },
      };

      // Add new session to the beginning of the array
      savedSessions = [newSession, ...savedSessions];

      // Save updated sessions
      await AsyncStorage.setItem(
        'calculatorSessions',
        JSON.stringify(savedSessions)
      );

      // Clear current session
      clearTotal();
      setStudentName('');
      setShowStudentNameModal(false);
      //   setSelectedAssignment(null);

      Alert.alert(
        t('calculator.alerts.saveSuccess.title'),
        t('calculator.alerts.saveSuccess.message', {
          total,
          count: history.length,
          student: studentName,
          class: selectedClass?.name,
          assignment: selectedAssignment?.title,
          percentage: percentageScore.toFixed(1),
          accuracy: accuracy.toFixed(1),
        })
      );
    } catch (error) {
      console.error('Failed to save session:', error);
      Alert.alert(
        t('calculator.alerts.saveError.title'),
        t('calculator.alerts.saveError.message')
      );
    }
  };

  const clearTotal = () => {
    setTotal(0);
    setHistory([]);
    setLastOperation(null);
    setOperationsCount(0);
  };

  const undoLastOperation = () => {
    if (history.length > 0) {
      setOperationsCount((prevCount) => prevCount - 1);
      const newHistory = [...history];
      const lastItem = newHistory.pop();
      setHistory(newHistory);

      if (lastItem) {
        const newTotal = parseFloat((total - lastItem.value).toFixed(2));
        setTotal(newTotal);
        setLastOperation(
          newHistory.length > 0 ? newHistory[newHistory.length - 1] : null
        );
      }
    }
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  // Function to open the edit modal for a specific point value
  const openEditPointValue = (rowIndex: number, colIndex: number) => {
    if (!isEditingPoints) return;

    const currentValue = pointConfig.values[rowIndex][colIndex];

    setEditingRow(rowIndex);
    setEditingCol(colIndex);
    setEditValue(currentValue !== null ? currentValue.toString() : '');
    setShowEditModal(true);
  };

  // Function to save edited point value
  const saveEditedPointValue = () => {
    if (editingRow === -1 || editingCol === -1) return;

    const numValue = parseFloat(editValue);
    if (isNaN(numValue)) {
      Alert.alert(
        t('calculator.invalidNumber.title') || 'Invalid Number',
        t('calculator.invalidNumber.message') || 'Please enter a valid number.',
        [{ text: 'OK' }]
      );
      return;
    }

    updatePointValue(editingRow, editingCol, numValue);
    setShowEditModal(false);
    setEditingRow(-1);
    setEditingCol(-1);
  };

  // Function to delete a point value
  const deletePointValue = () => {
    if (editingRow >= 0 && editingCol >= 0) {
      updatePointValue(editingRow, editingCol, null);
      setShowEditModal(false);
      setEditingRow(-1);
      setEditingCol(-1);
    }
  };

  // Class management functions
  const addClass = (name: string) => {
    const newClass: Class = {
      id: Date.now().toString(),
      name: name.trim(),
    };

    console.log('Adding new class:', newClass);
    console.log('Current classes:', classes);

    // Ensure classes is an array
    const currentClasses = Array.isArray(classes) ? classes : [];

    const updatedClasses = [...currentClasses, newClass];
    console.log('Updated classes:', updatedClasses);

    // Update state
    setClasses(updatedClasses);

    // If no class is selected, select the new one
    if (!selectedClass) {
      setSelectedClass(newClass);
    }
  };

  const updateClass = (classId: string, name: string) => {
    console.log('Updating class with ID:', classId);
    console.log('New name:', name.trim());

    // Ensure classes is an array
    const currentClasses = Array.isArray(classes) ? classes : [];

    const updatedClasses = currentClasses.map((cls) =>
      cls.id === classId ? { ...cls, name: name.trim() } : cls
    );

    console.log('Updated classes after edit:', updatedClasses);

    // Update state
    setClasses(updatedClasses);

    // Update selected class if it was the one edited
    if (selectedClass && selectedClass.id === classId) {
      const updatedSelectedClass = {
        ...selectedClass,
        name: name.trim(),
      };
      setSelectedClass(updatedSelectedClass);
    }
  };

  const deleteClass = (classId: string) => {
    Alert.alert(
      t('calculator.alerts.deleteClass.title') || 'Delete Class',
      t('calculator.alerts.deleteClass.message') ||
        'Are you sure you want to delete this class?',
      [
        {
          text: t('calculator.alerts.deleteClass.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('calculator.alerts.deleteClass.confirm') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('Deleting class with ID:', classId);

            // Ensure classes is an array
            const currentClasses = Array.isArray(classes) ? classes : [];

            const updatedClasses = currentClasses.filter(
              (cls) => cls.id !== classId
            );
            console.log('Updated classes after delete:', updatedClasses);

            // Update state
            setClasses(updatedClasses);

            // If the deleted class was selected, clear the selection
            if (selectedClass && selectedClass.id === classId) {
              setSelectedClass(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const selectClass = async (cls: Class) => {
    setSelectedClass(cls);
    setShowClassModal(false);

    // Load assignments for the new class
    try {
      const assignmentsStr = await AsyncStorage.getItem('assignments');
      if (assignmentsStr) {
        const allAssignments: Assignment[] = JSON.parse(assignmentsStr);
        const classAssignments = allAssignments.filter(
          (a) => a.classId === cls.id
        );

        // Only select the first assignment if no assignment is currently selected
        // or if the currently selected assignment doesn't belong to this class
        if (
          classAssignments.length > 0 &&
          (!selectedAssignment ||
            !classAssignments.some((a) => a.id === selectedAssignment.id))
        ) {
          setSelectedAssignment(classAssignments[0]);
        } else if (classAssignments.length === 0) {
          // If no assignments, clear the selection
          setSelectedAssignment(null);
        }
      } else {
        setSelectedAssignment(null);
      }
    } catch (error) {
      console.error('Error loading assignments for new class:', error);
      setSelectedAssignment(null);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    toggleButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    toggleButtonText: {
      color: '#ffffff',
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
    },
    teacherToggle: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    teacherToggleText: {
      color: colors.text,
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      marginRight: 8,
    },
    assignmentInfo: {
      padding: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    assignmentTitle: {
      fontFamily: 'Poppins-Medium',
      fontSize: 18,
      color: colors.text,
      marginBottom: 8,
    },
    maxScore: {
      fontFamily: 'Poppins-Regular',
      color: colors.text,
      fontSize: 14,
    },
  });

  return (
    <SafeAreaView style={styles.container} key={`calculator-${theme}`}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <Header
        operationsCount={operationsCount}
        selectedClass={selectedClass}
        historyLength={history.length}
        onSaveSession={saveSession}
        onOpenClassModal={() => setShowClassModal(true)}
      />

      {selectedClass && (
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowAssignments(!showAssignments)}
          >
            <Text style={styles.toggleButtonText}>
              {showAssignments
                ? t('calculator.showCalculator')
                : t('calculator.showAssignments')}
            </Text>
          </TouchableOpacity>
          <View style={styles.teacherToggle}>
            <Text style={styles.teacherToggleText}>
              {t('calculator.teacherMode')}
            </Text>
            <Switch
              value={isTeacher}
              onValueChange={setIsTeacher}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>
      )}

      {showAssignments && selectedClass ? (
        <AssignmentSection
          classId={selectedClass.id}
          studentId={studentName}
          studentName={studentName}
          isTeacher={isTeacher}
          selectedAssignment={selectedAssignment}
          onSelectAssignment={setSelectedAssignment}
        />
      ) : (
        <>
          {selectedClass &&
            selectedAssignment &&
            selectedAssignment.classId === selectedClass.id && (
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentTitle}>
                  {selectedAssignment.title}
                </Text>
                <Text style={styles.maxScore}>
                  {t('calculator.maxScore')}: {selectedAssignment.maxScore}
                </Text>
              </View>
            )}
          <Display
            total={total}
            history={history}
            maxScore={selectedAssignment?.maxScore}
          />

          <ActionButtons
            clearTotal={clearTotal}
            undoLastOperation={undoLastOperation}
            addValue={addValue}
            subtractValue={subtractValue}
            lastOperation={lastOperation}
          />

          {isEditingPoints ? (
            <PointValueEditor onClose={() => setEditingPoints(false)} />
          ) : (
            <PointGrid
              addValue={addValue}
              subtractValue={subtractValue}
              onEditPointValue={openEditPointValue}
            />
          )}
        </>
      )}

      <StudentNameModal
        visible={showStudentNameModal}
        onClose={() => setShowStudentNameModal(false)}
        studentName={studentName}
        onChangeStudentName={setStudentName}
        onSave={finalizeSessionSave}
      />

      <PointValueEditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        editValue={editValue}
        onChangeEditValue={setEditValue}
        onSave={saveEditedPointValue}
        onDelete={deletePointValue}
      />

      <ClassModal
        visible={showClassModal}
        onClose={() => setShowClassModal(false)}
        classes={classes}
        selectedClass={selectedClass}
        onSelectClass={selectClass}
        onAddClass={addClass}
        onUpdateClass={updateClass}
        onDeleteClass={deleteClass}
        onRefreshClasses={loadClasses}
      />
    </SafeAreaView>
  );
};

export default Calculator;
