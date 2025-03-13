import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  ScrollView,
  Switch,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Trash2,
  RefreshCw,
  Share2,
  Download,
  Check,
  X,
  CheckSquare,
  Square,
  Settings,
  ChevronDown,
  GroupIcon,
  CalendarIcon,
  Users,
  Calendar,
  User,
  TrendingUp,
  BarChart2,
  GraduationCap,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  formatNumber,
  formatTime,
  formatFullDate,
} from '../../utils/formatters';
import { useTheme } from '@/hooks/useTheme';
import * as MailComposer from 'expo-mail-composer';
import { calculateAdvancedStatistics } from '../../utils/statistics';
import StatisticsView from '../../components/Statistics/StatisticsView';

interface HistoryItem {
  value: number;
  timestamp: number;
}

interface HistorySession {
  date: string;
  items: HistoryItem[];
  total: number;
  studentName?: string;
  classId?: string;
  className?: string;
  assignmentId?: string;
}

interface GroupedSessions {
  [key: string]: HistorySession[];
}

interface Assignment {
  id: string;
  title: string;
  classId: string;
}

interface Colors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  border: string;
  card: string;
  danger: string;
  success: string; // Add the missing success color
  tabBar: string;
  headerBackground: string;
  inputBackground: string;
}

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDarkMode, theme } = useTheme();
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<GroupedSessions>({});
  const [isGrouped, setIsGrouped] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sharingSession, setSharingSession] = useState<number | null>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<boolean[]>([]);
  const [exportingCSV, setExportingCSV] = useState(false);
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsDropdownRef = useRef(new Animated.Value(0)).current;
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const [sortByStudentNumber, setSortByStudentNumber] = useState(false);
  const [sortByMaxResult, setSortByMaxResult] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const classFilterDropdownRef = useRef<View>(null);
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window'),
  });
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState<
    string | null
  >(null);
  const [showAssignmentFilterDropdown, setShowAssignmentFilterDropdown] =
    useState(false);
  const [classAssignments, setClassAssignments] = useState<Assignment[]>([]);
  const assignmentFilterDropdownRef = useRef<View>(null);

  // Check if the current language is RTL
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;

  // Class filtering state
  interface Class {
    id: string;
    name: string;
  }
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string | null>(
    null
  );
  const [showClassFilterDropdown, setShowClassFilterDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
      loadClasses();
    });

    return unsubscribe;
  }, [navigation]);

  // Reload history when sorting options change
  useEffect(() => {
    if (sessions.length > 0) {
      loadHistory();
    }
  }, [isNewestFirst, sortByStudentNumber, sortByMaxResult]);

  useEffect(() => {
    if (sessions.length > 0) {
      groupSessionsByStudent();
    }
  }, [sessions, isNewestFirst, sortByStudentNumber, sortByMaxResult]);

  useEffect(() => {
    if (sessions.length > 0) {
      groupSessionsByStudent();
    }
  }, [selectedClassFilter]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    loadClassAssignments(selectedClassFilter);
  }, [selectedClassFilter]);

  const isSmallScreen = dimensions.window.width < 380;

  const loadHistory = async () => {
    try {
      setIsRefreshing(true);
      const savedSessions = await AsyncStorage.getItem('calculatorSessions');
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);

        // Apply sorting based on selected options
        let sortedSessions = [...parsedSessions];

        if (sortByStudentNumber) {
          // Sort by student number (extract numeric value from student name)
          sortedSessions.sort((a, b) => {
            // Extract numeric part from student names
            const studentA = a.studentName || '';
            const studentB = b.studentName || '';

            // Extract numbers from student names
            const numA = extractStudentNumber(studentA);
            const numB = extractStudentNumber(studentB);

            // If both have numeric values, sort by number
            if (numA !== null && numB !== null) {
              return numA - numB;
            }

            // If only one has a numeric value, prioritize the one with a number
            if (numA !== null) return -1;
            if (numB !== null) return 1;

            // If neither has a numeric value, sort alphabetically
            return studentA.localeCompare(studentB);
          });
        } else if (sortByMaxResult) {
          // Sort by total result (descending)
          sortedSessions.sort((a, b) => b.total - a.total);
        } else {
          // Default sort by date
          sortedSessions.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return isNewestFirst ? dateB - dateA : dateA - dateB;
          });
        }

        setSessions(sortedSessions);
      }
    } catch (error) {
      console.error(t('history.errors.loadFailed'), error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper function to extract student number from student name
  const extractStudentNumber = (studentName: string): number | null => {
    // Match any sequence of digits in the string
    const match = studentName.match(/\d+/);
    if (match) {
      // Convert the matched string to a number
      return parseInt(match[0], 10);
    }
    return null;
  };

  const loadClasses = async () => {
    try {
      const savedClasses = await AsyncStorage.getItem('calculatorClasses');
      if (savedClasses) {
        const parsedClasses = JSON.parse(savedClasses);
        setClasses(parsedClasses);
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const clearAllHistory = async () => {
    try {
      await AsyncStorage.removeItem('calculatorSessions');
      setSessions([]);
      setGroupedSessions({}); // Clear grouped sessions as well
      Alert.alert(t('common.success'), t('history.alerts.cleared'));
    } catch (error) {
      console.error(t('history.errors.clearFailed'), error);
      Alert.alert(t('common.error'), t('history.alerts.clearError'));
    }
  };

  const confirmClearHistory = () => {
    Alert.alert(
      t('history.alerts.clearTitle'),
      t('history.alerts.clearConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.clear'),
          style: 'destructive',
          onPress: clearAllHistory,
        },
      ],
      { cancelable: true }
    );
  };

  const animateButton = () => {
    // First shrink the button
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      // Then restore its size
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    });
  };

  const shareSession = async (session: HistorySession, index: number) => {
    try {
      setSharingSession(index);
      animateButton();

      // Format date and time properly
      const formattedDate = formatFullDate(session.date, i18n.language);

      // Create content to share
      let shareContent = `${t('history.share.title')}\n\n`;
      shareContent += `${t('history.share.date')}: ${formattedDate}\n`;

      // Add student name if available
      if (session.studentName) {
        shareContent += `${t('history.share.student')}: ${
          session.studentName
        }\n`;
      }

      shareContent += `${t('history.share.total')}: ${formatNumber(
        session.total
      )}\n`;
      shareContent += `${t('history.share.operations')}: ${
        session.items.length
      }\n\n`;

      // Add operations details
      shareContent += `${t('history.share.details')}:\n`;
      session.items.forEach((item, i) => {
        shareContent += `${i + 1}. ${item.value >= 0 ? '+' : ''}${formatNumber(
          item.value
        )}\n`;
      });

      // Share content
      const result = await Share.share({
        message: shareContent,
      });

      if (result.action === Share.sharedAction) {
        // Haptic feedback for successful share
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error sharing session:', error);
      Alert.alert(t('common.error'), t('history.share.error'));
    } finally {
      setSharingSession(null);
    }
  };

  const openExportModal = () => {
    // Initialize selection array
    const initialSelection = new Array(sessions.length).fill(false);

    // If a class filter is active, pre-select all sessions from that class
    if (selectedClassFilter) {
      sessions.forEach((session, index) => {
        if (session.classId === selectedClassFilter) {
          initialSelection[index] = true;
        }
      });
    }

    setSelectedSessions(initialSelection);
    setExportModalVisible(true);

    // Animate modal appearance
    modalScaleAnim.setValue(0.9);
    modalOpacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeExportModal = () => {
    // Animate modal disappearance
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setExportModalVisible(false);
    });
  };

  const toggleSessionSelection = (index: number) => {
    const newSelection = [...selectedSessions];
    newSelection[index] = !newSelection[index];
    setSelectedSessions(newSelection);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleAllSessions = (selectAll: boolean) => {
    const newSelection = [...selectedSessions];

    if (selectedClassFilter) {
      // If class filter is active, only select sessions from that class
      sessions.forEach((session, index) => {
        if (session.classId === selectedClassFilter) {
          newSelection[index] = selectAll;
        }
      });
    } else {
      // If no class filter, select all sessions
      sessions.forEach((_, index) => {
        newSelection[index] = selectAll;
      });
    }

    setSelectedSessions(newSelection);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getAnySessionsSelected = () => {
    return selectedSessions.some((selected) => selected);
  };

  const generateCSV = () => {
    // Get selected sessions
    let sessionsToExport = sessions.filter(
      (_, index) => selectedSessions[index]
    );

    // If no sessions are explicitly selected but a class filter is active,
    // include all sessions from that class
    if (sessionsToExport.length === 0 && selectedClassFilter) {
      sessionsToExport = sessions.filter(
        (session) => session.classId === selectedClassFilter
      );
    }
    // If sessions are selected and a class filter is active, ensure only sessions from that class are included
    else if (selectedClassFilter) {
      sessionsToExport = sessionsToExport.filter(
        (session) => session.classId === selectedClassFilter
      );
    }

    if (sessionsToExport.length === 0) {
      return '';
    }

    // Helper function to format numbers consistently for CSV
    const formatNumberForCSV = (num: number): string => {
      // Use fixed 2 decimal places and ensure dot as decimal separator
      return num.toFixed(2).replace(',', '.');
    };

    // Helper function to escape CSV field properly
    const escapeCSVField = (field: string): string => {
      // If the field contains quotes, double them
      const escaped = field.replace(/"/g, '""');
      // Wrap in quotes
      return `"${escaped}"`;
    };

    // Add UTF-8 BOM for better Excel compatibility
    let csv = '\uFEFF';

    // CSV header
    csv += `${escapeCSVField(t('history.csv.date'))},${escapeCSVField(
      t('history.csv.time')
    )},${escapeCSVField(t('history.csv.student'))},${escapeCSVField(
      t('history.csv.operations')
    )},${escapeCSVField(t('history.csv.total'))}\n`;

    // Add data rows
    sessionsToExport.forEach((session) => {
      const date = new Date(session.date);
      const dateStr = date.toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const timeStr = date.toLocaleTimeString(i18n.language, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const studentName = session.studentName || t('history.noStudentName');

      // Format the total with consistent decimal format
      const formattedTotal = formatNumberForCSV(session.total);

      csv += `${escapeCSVField(dateStr)},${escapeCSVField(
        timeStr
      )},${escapeCSVField(studentName)},${escapeCSVField(
        String(session.items.length)
      )},${escapeCSVField(formattedTotal)}\n`;

      // Add detailed operations
      if (session.items.length > 0) {
        csv += `${escapeCSVField(t('history.csv.operations') + ':')}\n`;
        session.items.forEach((item) => {
          // Format the number properly and escape it for CSV
          const prefix = item.value >= 0 ? '+' : '';
          const formattedValue =
            prefix + formatNumberForCSV(Math.abs(item.value));
          csv += `${escapeCSVField(formattedValue)}\n`;
        });
      }

      csv += '\n'; // Add empty line between sessions
    });

    return csv;
  };

  const exportToCSV = async () => {
    try {
      setExportingCSV(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const csvContent = generateCSV();
      if (!csvContent) {
        setExportingCSV(false);
        return;
      }

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = t('history.export.csvFilename', { date });

      // Generate the file path
      const path = FileSystem.documentDirectory + `${filename}.csv`;

      // Write the CSV content to a file
      await FileSystem.writeAsStringAsync(path, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Also create an Excel-compatible version using semicolons as delimiters
      // This is very common in regions where comma is used as decimal separator
      const semicolonCSV = csvContent.replace(/,/g, ';');
      const semicolonPath =
        FileSystem.documentDirectory + `${filename}_excel.csv`;

      await FileSystem.writeAsStringAsync(semicolonPath, semicolonCSV, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Ask user which format they want to share
      Alert.alert(
        t('history.export.selectFormat') || 'Select Format',
        t('history.export.formatQuestion') ||
          'Which format would you like to export?',
        [
          {
            text: t('history.export.standardCSV') || 'Standard CSV (,)',
            onPress: async () => {
              // Share the standard file
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(path, {
                  mimeType: 'text/csv',
                  dialogTitle: t('history.export.title'),
                });
              }
              setExportingCSV(false);
            },
          },
          {
            text: t('history.export.excelCSV') || 'Excel Compatible (;)',
            onPress: async () => {
              // Share the semicolon-delimited file
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(semicolonPath, {
                  mimeType: 'text/csv',
                  dialogTitle: t('history.export.title'),
                });
              }
              setExportingCSV(false);
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert(t('common.error'), t('history.export.error'));
      setExportingCSV(false);
    }
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.historyItem}>
      <Text
        style={[
          styles.historyItemValue,
          item.value >= 0 ? styles.positiveValue : styles.negativeValue,
        ]}
      >
        {item.value >= 0 ? '+' : ''}
        {formatNumber(item.value)}
      </Text>
      <Text style={styles.historyItemTime}>{formatTime(item.timestamp)}</Text>
    </View>
  );

  const deleteSession = async (sessionDate: string) => {
    try {
      // Get existing sessions
      const savedSessionsStr = await AsyncStorage.getItem('calculatorSessions');
      if (!savedSessionsStr) return;

      const savedSessions = JSON.parse(savedSessionsStr);

      // Filter out the session with the matching date
      const updatedSessions = savedSessions.filter(
        (session: HistorySession) => session.date !== sessionDate
      );

      // Save updated sessions back to storage
      await AsyncStorage.setItem(
        'calculatorSessions',
        JSON.stringify(updatedSessions)
      );

      // Update local state
      setSessions(updatedSessions);

      // Update grouped sessions
      if (updatedSessions.length > 0) {
        groupSessionsByStudent();
      } else {
        setGroupedSessions({}); // Clear grouped sessions if no sessions left
      }

      // Show success message
      Alert.alert(t('common.success'), t('history.alerts.sessionDeleted'));
    } catch (error) {
      console.error('Failed to delete session:', error);
      Alert.alert(t('common.error'), t('history.alerts.deleteError'));
    }
  };

  const deleteStudentSessions = async (studentName: string) => {
    try {
      const savedSessionsStr = await AsyncStorage.getItem('calculatorSessions');
      if (!savedSessionsStr) return;

      const savedSessions = JSON.parse(savedSessionsStr);

      // Filter out all sessions for the specified student
      // For empty student name, match sessions with no studentName or empty studentName
      const updatedSessions = savedSessions.filter(
        (session: HistorySession) => {
          if (studentName === t('history.noStudentName')) {
            // Keep sessions that have a valid studentName
            return session.studentName && session.studentName.trim() !== '';
          } else {
            // For named students, match exactly
            return session.studentName !== studentName;
          }
        }
      );

      // Save updated sessions back to storage
      await AsyncStorage.setItem(
        'calculatorSessions',
        JSON.stringify(updatedSessions)
      );

      // Update local state
      setSessions(updatedSessions);

      // Update grouped sessions
      if (updatedSessions.length > 0) {
        groupSessionsByStudent();
      } else {
        setGroupedSessions({}); // Clear grouped sessions if no sessions left
      }

      // Show success message with appropriate text
      const successMessage =
        studentName === t('history.noStudentName')
          ? t('history.alerts.unnamedSessionsDeleted')
          : t('history.alerts.studentSessionsDeleted');

      Alert.alert(t('common.success'), successMessage);
    } catch (error) {
      console.error('Failed to delete student sessions:', error);
      Alert.alert(t('common.error'), t('history.alerts.deleteError'));
    }
  };

  const confirmDeleteSession = (
    sessionDate: string,
    studentName?: string,
    deleteAll: boolean = false
  ) => {
    if (deleteAll) {
      const isUnnamedGroup = studentName === t('history.noStudentName');
      Alert.alert(
        isUnnamedGroup
          ? t('history.alerts.deleteUnnamedSessionsTitle')
          : t('history.alerts.deleteStudentSessionsTitle'),
        isUnnamedGroup
          ? t('history.alerts.deleteUnnamedSessionsConfirm')
          : t('history.alerts.deleteStudentSessionsConfirm', {
              student: studentName,
            }),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () =>
              deleteStudentSessions(studentName || t('history.noStudentName')),
          },
        ],
        { cancelable: true }
      );
    } else {
      const message = studentName
        ? t('history.alerts.deleteSessionWithStudentConfirm', {
            student: studentName,
          })
        : t('history.alerts.deleteSessionConfirm');

      Alert.alert(
        t('history.alerts.deleteSessionTitle'),
        message,
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => deleteSession(sessionDate),
          },
        ],
        { cancelable: true }
      );
    }
  };

  const renderSession = ({
    item,
    index,
  }: {
    item: HistorySession;
    index: number;
  }) => (
    <View style={styles.sessionContainer}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionHeaderLeft}>
          <Text style={styles.sessionDate}>
            {formatFullDate(item.date, i18n.language)}
          </Text>
          <Text
            style={[
              styles.studentName,
              !item.studentName && styles.unnamedStudent,
            ]}
          >
            {t('history.student')}: {item.studentName || t('history.noName')}
          </Text>
          <View style={styles.sessionStats}>
            <Text style={styles.sessionClicks}>
              {t('history.operations')}: {item.items.length}
            </Text>
            <Text style={styles.sessionTotal}>
              {t('history.total')}: {formatNumber(item.total)}
            </Text>
          </View>
        </View>
        <View style={styles.sessionHeaderActions}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.sessionActionButton,
                styles.shareButton,
                sharingSession === index && styles.shareButtonActive,
              ]}
              onPress={() => shareSession(item, index)}
              disabled={sharingSession !== null}
              activeOpacity={0.8}
            >
              {sharingSession === index ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Share2 size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[styles.sessionActionButton, styles.deleteButton]}
            onPress={() =>
              confirmDeleteSession(item.date, item.studentName, false)
            }
            activeOpacity={0.8}
          >
            <Trash2 size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={item.items}
        keyExtractor={(item, i) => `${item.timestamp}-${i}`}
        renderItem={renderHistoryItem}
      />
    </View>
  );

  const groupSessionsByStudent = () => {
    const grouped: GroupedSessions = {};
    const filteredSessions = getFilteredSessions();

    // First group sessions by student name
    filteredSessions.forEach((session) => {
      const studentName = session.studentName || t('history.noStudentName');
      if (!grouped[studentName]) {
        grouped[studentName] = [];
      }
      grouped[studentName].push(session);
    });

    // Sort sessions within each student group based on current sort options
    Object.keys(grouped).forEach((studentName) => {
      if (sortByMaxResult) {
        // Sort by total result (descending)
        grouped[studentName].sort((a, b) => b.total - a.total);
      } else {
        // Default sort by date
        grouped[studentName].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return isNewestFirst ? dateB - dateA : dateA - dateB;
        });
      }
    });

    // If sorting by student number, sort the student groups by student number
    if (sortByStudentNumber) {
      // Create a new ordered grouped object
      const orderedGrouped: GroupedSessions = {};

      // Sort student names by numeric value in the name
      const sortedStudentNames = Object.keys(grouped).sort((a, b) => {
        const numA = extractStudentNumber(a);
        const numB = extractStudentNumber(b);

        // If both have numeric values, sort by number
        if (numA !== null && numB !== null) {
          return numA - numB;
        }

        // If only one has a numeric value, prioritize the one with a number
        if (numA !== null) return -1;
        if (numB !== null) return 1;

        // If neither has a numeric value, sort alphabetically
        return a.localeCompare(b);
      });

      // Rebuild the grouped object in the sorted order
      sortedStudentNames.forEach((studentName) => {
        orderedGrouped[studentName] = grouped[studentName];
      });

      setGroupedSessions(orderedGrouped);
    } else {
      setGroupedSessions(grouped);
    }
  };

  const toggleGroupView = () => {
    setIsGrouped(!isGrouped);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderStudentGroup = ({
    item,
  }: {
    item: [string, HistorySession[]];
  }) => {
    const [studentName, studentSessions] = item;
    const isUnnamedGroup = studentName === t('history.noStudentName');

    // Find the highest total if sorting by max result
    const highestTotal =
      sortByMaxResult && studentSessions.length > 0
        ? Math.max(...studentSessions.map((s) => s.total))
        : null;

    return (
      <View style={styles.studentGroupContainer}>
        <View
          style={[
            styles.studentGroupHeader,
            isUnnamedGroup && styles.unnamedGroupHeader,
          ]}
        >
          <View style={styles.studentGroupTitleContainer}>
            <Text style={styles.studentGroupName}>
              {isUnnamedGroup ? t('history.noNameGroup') : studentName}
            </Text>
            {isUnnamedGroup && (
              <Text style={styles.unnamedGroupInfo}>
                {t('history.noNameGroupInfo')}
              </Text>
            )}
          </View>
          <View style={styles.studentGroupHeaderActions}>
            <View style={styles.studentGroupStats}>
              <Text style={styles.studentGroupCount}>
                {t('history.sessionCount', { count: studentSessions.length })}
              </Text>
              {highestTotal !== null && (
                <Text style={styles.studentGroupMaxTotal}>
                  {t('history.maxTotal') || 'Max Total'}:{' '}
                  {formatNumber(highestTotal)}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.sessionActionButton, styles.deleteButton]}
              onPress={() => confirmDeleteSession('', studentName, true)}
              activeOpacity={0.8}
            >
              <Trash2 size={18} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
        {studentSessions.map((session, index) => (
          <View key={`session-${session.date}-${index}`}>
            {renderSession({
              item: session,
              index: sessions.findIndex((s) => s.date === session.date),
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Share2 size={40} color={colors.primary + '40'} />
        </View>
        <Text style={styles.emptyText}>{t('history.noHistory')}</Text>
        <Text style={styles.emptySubtext}>
          {t('history.sessionsWillAppear')}
        </Text>
        <Text style={styles.emptyInstruction}>
          {t('history.pressRegisterButton')}
        </Text>
      </View>
    );
  };

  // Function to toggle the settings dropdown
  const toggleSettingsDropdown = () => {
    if (showSettingsDropdown) {
      // Animate out
      Animated.timing(settingsDropdownRef, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setShowSettingsDropdown(false);
      });
    } else {
      setShowSettingsDropdown(true);
      // Animate in
      Animated.timing(settingsDropdownRef, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  // Function to sort sessions
  const toggleSortOrder = () => {
    // Turn off other sorting options
    setSortByStudentNumber(false);
    setSortByMaxResult(false);
    setIsNewestFirst(!isNewestFirst);
    setShowSettingsDropdown(false);
    loadHistory(); // Reload with new sorting
  };

  // Function to toggle sort by student number
  const toggleSortByStudentNumber = () => {
    // Turn off other sorting options
    setIsNewestFirst(false);
    setSortByMaxResult(false);
    setSortByStudentNumber(!sortByStudentNumber);
    setShowSettingsDropdown(false);
    loadHistory(); // Reload with new sorting
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Function to toggle sort by max result
  const toggleSortByMaxResult = () => {
    // Turn off other sorting options
    setIsNewestFirst(false);
    setSortByStudentNumber(false);
    setSortByMaxResult(!sortByMaxResult);
    setShowSettingsDropdown(false);
    loadHistory(); // Reload with new sorting
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleClassFilterDropdown = () => {
    setShowClassFilterDropdown(!showClassFilterDropdown);
    setShowAssignmentFilterDropdown(false);
    setShowSettingsDropdown(false);
  };

  const toggleClassFilterDropdownWithoutPropagation = (event: any) => {
    event.stopPropagation();
    toggleClassFilterDropdown();
  };

  const selectClassFilter = (classId: string | null) => {
    setSelectedClassFilter(classId);
    setShowClassFilterDropdown(false);
    // Reset assignment filter when changing class
    setSelectedAssignmentFilter(null);
    // Load assignments for the selected class
    loadClassAssignments(classId);
  };

  const selectClassFilterWithoutPropagation = (
    event: any,
    classId: string | null
  ) => {
    event.stopPropagation();
    selectClassFilter(classId);
  };

  const getFilteredSessions = () => {
    let filtered = [...sessions];

    if (selectedClassFilter) {
      filtered = filtered.filter(
        (session) => session.classId === selectedClassFilter
      );
    }

    if (selectedAssignmentFilter) {
      filtered = filtered.filter(
        (session) => session.assignmentId === selectedAssignmentFilter
      );
    }

    if (sortByStudentNumber) {
      filtered.sort((a, b) => {
        const numA = extractStudentNumber(a.studentName || '');
        const numB = extractStudentNumber(b.studentName || '');
        if (numA !== null && numB !== null) return numA - numB;
        if (numA !== null) return -1;
        if (numB !== null) return 1;
        return (a.studentName || '').localeCompare(b.studentName || '');
      });
    } else if (sortByMaxResult) {
      filtered.sort((a, b) => b.total - a.total);
    } else {
      filtered.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return isNewestFirst ? dateB - dateA : dateA - dateB;
      });
    }

    return filtered;
  };

  // Calculate and show statistics for selected sessions
  const calculateAndShowStatistics = () => {
    // If no sessions are selected, use all sessions
    let selectedSessionsData = sessions.filter(
      (_, index) => selectedSessions[index]
    );

    // If no sessions are explicitly selected, use all sessions
    if (selectedSessionsData.length === 0) {
      selectedSessionsData = getFilteredSessions();

      // If still no sessions, show alert
      if (selectedSessionsData.length === 0) {
        Alert.alert(
          t('history.noSessionsAvailable') || 'No Sessions Available',
          t('history.noSessionsToAnalyze') ||
            'There are no sessions available to analyze.',
          [{ text: t('common.ok') || 'OK' }]
        );
        return;
      }
    }

    // Calculate advanced statistics
    const advancedStats = calculateAdvancedStatistics(selectedSessionsData);

    // Set statistics data and show modal
    setStatisticsData(advancedStats);
    setShowStatisticsModal(true);

    // Close settings dropdown
    toggleSettingsDropdown();

    // Animate modal
    modalScaleAnim.setValue(0.9);
    modalOpacityAnim.setValue(0);

    // Provide haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Settings dropdown component
  const renderSettingsDropdown = () => {
    if (!showSettingsDropdown) return null;

    const dropdownHeight = settingsDropdownRef.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 430], // Increased for additional options
    });

    const dropdownOpacity = settingsDropdownRef.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <TouchableWithoutFeedback onPress={toggleSettingsDropdown}>
        <View style={styles.dropdownOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.settingsDropdown,
                {
                  opacity: dropdownOpacity,
                  maxHeight: dropdownHeight,
                  right: 10,
                  top: 55, // Position below header
                },
              ]}
            >
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownHeaderText}>
                  {t('history.displayOptions')}
                </Text>
                <TouchableOpacity
                  style={styles.closeDropdownButton}
                  onPress={toggleSettingsDropdown}
                >
                  <X size={18} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.dropdownSectionTitle}>
                {t('history.sortOptions')}
              </Text>

              <View style={styles.dropdownOption}>
                <View style={styles.dropdownOptionLeft}>
                  <User
                    size={18}
                    color={colors.primary}
                    onPress={toggleSortByStudentNumber}
                  />
                  <Text
                    style={styles.dropdownOptionText}
                    onPress={toggleSortByStudentNumber}
                  >
                    {t('history.sortByStudentNumber')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    sortByStudentNumber
                      ? styles.toggleButtonActive
                      : styles.toggleButtonInactive,
                  ]}
                  onPress={toggleSortByStudentNumber}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      sortByStudentNumber
                        ? styles.toggleButtonTextActive
                        : styles.toggleButtonTextInactive,
                    ]}
                  >
                    {sortByStudentNumber
                      ? t('common.enabled')
                      : t('common.disabled')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dropdownOption}>
                <View style={styles.dropdownOptionLeft}>
                  <TrendingUp
                    size={18}
                    color={colors.primary}
                    onPress={toggleSortByMaxResult}
                  />
                  <Text
                    style={styles.dropdownOptionText}
                    onPress={toggleSortByMaxResult}
                  >
                    {t('history.sortByMaxResult')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    sortByMaxResult
                      ? styles.toggleButtonActive
                      : styles.toggleButtonInactive,
                  ]}
                  onPress={toggleSortByMaxResult}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      sortByMaxResult
                        ? styles.toggleButtonTextActive
                        : styles.toggleButtonTextInactive,
                    ]}
                  >
                    {sortByMaxResult
                      ? t('common.enabled')
                      : t('common.disabled')}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.dropdownSectionTitle}>
                {t('history.statistics') || 'Statistics'}
              </Text>

              <View style={styles.statisticsContainer}>
                <TouchableOpacity
                  style={styles.statisticsItem}
                  onPress={() => calculateAndShowStatistics()}
                  activeOpacity={0.7}
                >
                  <View style={styles.statisticsIconContainer}>
                    <BarChart2 size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.statisticsItemText}>
                    {t('history.viewDetailedStats') ||
                      'View Detailed Statistics'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const loadClassAssignments = async (classId: string | null) => {
    if (!classId) {
      setClassAssignments([]);
      setSelectedAssignmentFilter(null);
      return;
    }

    try {
      const assignmentsStr = await AsyncStorage.getItem('assignments');
      if (assignmentsStr) {
        const allAssignments: Assignment[] = JSON.parse(assignmentsStr);
        const filteredAssignments = allAssignments.filter(
          (a) => a.classId === classId
        );
        setClassAssignments(filteredAssignments);
      } else {
        setClassAssignments([]);
      }
      setSelectedAssignmentFilter(null);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setClassAssignments([]);
    }
  };

  const toggleAssignmentFilterDropdown = () => {
    if (!selectedClassFilter) return; // Disable if no class selected
    setShowAssignmentFilterDropdown(!showAssignmentFilterDropdown);
    setShowClassFilterDropdown(false);
    setShowSettingsDropdown(false);
  };

  const selectAssignmentFilter = (assignmentId: string | null) => {
    setSelectedAssignmentFilter(assignmentId);
    setShowAssignmentFilterDropdown(false);
  };

  const renderExportModal = () => {
    return (
      <Modal
        visible={exportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeExportModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: modalScaleAnim }],
                opacity: modalOpacityAnim,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('history.export.title')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeExportModal}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {t('history.export.selectSessions')}
            </Text>

            {selectedClassFilter && (
              <View style={styles.classFilterIndicator}>
                <Text style={styles.classFilterText}>
                  {t('history.export.filteredByClass')}:{' '}
                  {classes.find((c) => c.id === selectedClassFilter)?.name ||
                    ''}
                </Text>
              </View>
            )}

            <View style={styles.selectAllContainer}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={() => toggleAllSessions(true)}
              >
                <Text style={styles.selectButtonText}>
                  {t('history.export.selectAll')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deselectAllButton}
                onPress={() => toggleAllSessions(false)}
              >
                <Text style={styles.selectButtonText}>
                  {t('history.export.deselectAll')}
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={
                selectedClassFilter
                  ? sessions.filter(
                      (session) => session.classId === selectedClassFilter
                    )
                  : sessions
              }
              keyExtractor={(item) => item.date}
              renderItem={({ item, index: originalIndex }) => {
                // Find the index in the original sessions array
                const index = sessions.findIndex((s) => s.date === item.date);
                return (
                  <TouchableOpacity
                    style={styles.sessionSelectItem}
                    onPress={() => toggleSessionSelection(index)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sessionSelectInfo}>
                      <Text style={styles.sessionSelectDate}>
                        {formatFullDate(item.date, i18n.language)}
                      </Text>
                      {item.studentName && (
                        <Text style={styles.sessionSelectStudent}>
                          {t('history.student')}: {item.studentName}
                        </Text>
                      )}
                      <Text style={styles.sessionSelectDetails}>
                        {t('history.operations')}: {item.items.length} |{' '}
                        {t('history.total')}: {formatNumber(item.total)}
                      </Text>
                    </View>
                    <View style={styles.checkboxContainer}>
                      {selectedSessions[index] ? (
                        <CheckSquare size={24} color={colors.primary} />
                      ) : (
                        <Square size={24} color={colors.text} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              style={styles.sessionsList}
              contentContainerStyle={styles.sessionsListContent}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeExportModal}
              >
                <Text style={styles.cancelButtonText}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.exportButton,
                  !getAnySessionsSelected() && styles.exportButtonDisabled,
                ]}
                onPress={exportToCSV}
                disabled={!getAnySessionsSelected() || exportingCSV}
              >
                {exportingCSV ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Download size={18} color="#fff" />
                    <Text style={styles.exportButtonText}>
                      {t('history.export.exportAs')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const handleOutsideClick = (event: any) => {
    if (showClassFilterDropdown) {
      // Close the dropdown when clicking outside
      setShowClassFilterDropdown(false);
    }
  };

  // Prevent closing when clicking on the dropdown itself
  const handleDropdownClick = (event: any) => {
    // Stop event propagation to prevent the outside click handler from firing
    event.stopPropagation();
  };

  // Render statistics modal
  const renderStatisticsModal = () => {
    if (!showStatisticsModal || !statisticsData) return null;

    const closeStatisticsModal = () => {
      // Animate out
      Animated.parallel([
        Animated.timing(modalScaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowStatisticsModal(false);
      });

      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showStatisticsModal}
        onRequestClose={closeStatisticsModal}
      >
        <TouchableWithoutFeedback onPress={closeStatisticsModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View
                style={[
                  styles.statisticsModalContainer,
                  {
                    transform: [{ scale: modalScaleAnim }],
                    opacity: modalOpacityAnim,
                  },
                ]}
              >
                <View style={styles.statisticsModalHeader}>
                  <Text style={styles.statisticsModalTitle}>
                    {t('history.detailedStatistics') || 'Detailed Statistics'}
                  </Text>
                  <TouchableOpacity
                    onPress={closeStatisticsModal}
                    style={styles.closeButton}
                  >
                    <X size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.statisticsModalContent}>
                  <StatisticsView
                    data={statisticsData}
                    colors={colors}
                    t={t}
                    isRTL={isRTL}
                    onClose={closeStatisticsModal}
                  />
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      zIndex: 10, // Ensure header and dropdowns appear above the FlatList
    },
    header: {
      backgroundColor: colors.headerBackground,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      justifyContent: 'space-between',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      zIndex: 10,
    },
    headerContent: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      flexWrap: 'wrap',
    },
    headerContentSmall: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    title: {
      color: colors.primary,
      fontSize: 20,
      fontFamily: 'Poppins-Bold',
      marginRight: isRTL ? 0 : 8,
      marginLeft: isRTL ? 8 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
    titleSmall: {
      marginBottom: 8,
    },
    headerActions: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: isSmallScreen ? 4 : 0,
    },
    headerButton: {
      padding: 8,
      marginLeft: isRTL ? 0 : 6,
      marginRight: isRTL ? 6 : 0,
      marginBottom: isSmallScreen ? 4 : 0,
      backgroundColor: colors.background,
      borderRadius: 8,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    classFilterButton: {
      padding: 8,
      marginLeft: isRTL ? 0 : 6,
      marginRight: isRTL ? 6 : 0,
      marginBottom: isSmallScreen ? 4 : 0,
      backgroundColor: colors.background,
      borderRadius: 8,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      maxWidth: 120,
    },
    classFilterButtonText: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginRight: isRTL ? 0 : 4,
      marginLeft: isRTL ? 4 : 0,
      flexShrink: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
    classFilterDropdown: {
      position: 'absolute',
      color: colors.text,
      top: 40,
      right: isRTL ? 'auto' : 0,
      left: isRTL ? 0 : 'auto',
      backgroundColor: colors.card,
      borderRadius: 8,
      minWidth: 150,
      maxWidth: Dimensions.get('window').width * 0.7,
      maxHeight: Dimensions.get('window').height * 0.4,
      zIndex: 100,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    classFilterItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectedClassFilterItem: {
      backgroundColor: colors.primary + '10',
    },
    selectedClassFilterItemText: {
      color: colors.primary,
      fontFamily: 'Poppins-Medium',
    },
    classFilterItemText: {
      color: colors.text,
      fontSize: 14,
      textAlign: isRTL ? 'right' : 'left',
    },
    settingsButton: {
      padding: 8,
      marginLeft: 8,
      backgroundColor: colors.background,
      borderRadius: 8,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 100, // Add extra padding at the bottom for better scrolling
      flexGrow: 1, // Allow the content to grow
    },
    dropdownOverlay: {
      position: 'absolute',
      top: 40,
      right: 0,
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      zIndex: 100,
    },
    settingsDropdown: {
      position: 'absolute',
      backgroundColor: colors.card,
      borderRadius: 12,
      minWidth: 250,
      shadowColor: '#000',
      overflowY: 'scroll',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 100,
      overflow: 'hidden',
    },
    dropdownHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.primary + '10',
    },
    dropdownHeaderText: {
      color: colors.primary,
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
    },
    closeDropdownButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    dropdownOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dropdownOptionText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      marginLeft: 12,
    },
    dropdownDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
      marginHorizontal: 16,
    },
    unnamedStudent: {
      color: colors.secondary,
      fontStyle: 'italic',
    },
    unnamedGroupHeader: {
      backgroundColor: colors.text + '40',
    },
    studentGroupTitleContainer: {
      flex: 1,
    },
    unnamedGroupInfo: {
      color: '#ffffff',
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      opacity: 0.8,
      marginTop: 2,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    emptyText: {
      color: colors.text,
      fontSize: 18,
      fontFamily: 'Poppins-Medium',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtext: {
      color: colors.text,
      opacity: 0.7,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      marginBottom: 16,
      textAlign: 'center',
    },
    emptyInstruction: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      textAlign: 'center',
      maxWidth: '80%',
    },
    sessionContainer: {
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    sessionHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    sessionHeaderLeft: {
      flex: 1,
    },
    sessionDate: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: colors.text,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    studentName: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: colors.text,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    sessionStats: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    sessionClicks: {
      fontSize: 13,
      fontFamily: 'Poppins-Regular',
      color: colors.secondary,
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
    sessionTotal: {
      fontSize: 13,
      fontFamily: 'Poppins-Medium',
      color: colors.primary,
      textAlign: isRTL ? 'right' : 'left',
    },
    sessionHeaderActions: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
    },
    historyItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyItemValue: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    historyItemTime: {
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      color: colors.secondary,
      textAlign: isRTL ? 'right' : 'left',
    },
    positiveValue: {
      color: colors.primary,
    },
    negativeValue: {
      color: colors.danger,
    },
    emptyItemContainer: {
      padding: 20,
      alignItems: 'center',
    },
    emptyItemText: {
      color: colors.text,
      opacity: 0.7,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      textAlign: 'center',
    },
    shareButton: {
      backgroundColor: colors.primary,
    },
    shareButtonActive: {
      opacity: 0.7,
    },
    deleteButton: {
      backgroundColor: colors.danger,
    },
    deleteButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginLeft: isRTL ? 0 : 6,
      marginRight: isRTL ? 6 : 0,
    },
    studentGroupContainer: {
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      overflow: 'hidden',
    },
    studentGroupHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    studentGroupHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    studentGroupName: {
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
      textAlign: isRTL ? 'right' : 'left',
    },
    studentGroupStats: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginRight: 8,
    },
    studentGroupCount: {
      color: '#ffffff',
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      textAlign: isRTL ? 'right' : 'left',
      marginRight: isRTL ? 0 : 8,
      marginLeft: isRTL ? 8 : 0,
    },
    studentGroupMaxTotal: {
      color: '#ffffff',
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      textAlign: isRTL ? 'right' : 'left',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    viewToggleContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginRight: isRTL ? 0 : 8,
      marginLeft: isRTL ? 8 : 0,
    },
    viewToggleLabel: {
      color: colors.text,
      fontSize: 14,
      marginRight: isRTL ? 0 : 8,
      marginLeft: isRTL ? 8 : 0,
      fontFamily: 'Poppins-Regular',
      textAlign: isRTL ? 'right' : 'left',
    },
    sessionActionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      minWidth: 60,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    classFilterDropdownSmall: {
      right: 0,
      left: 0,
      maxWidth: '100%',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%',
      backgroundColor: colors.background,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontFamily: 'Poppins-Bold',
      textAlign: isRTL ? 'right' : 'left',
    },
    modalSubtitle: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      opacity: 0.8,
      padding: 16,
      paddingTop: 8,
      paddingBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    closeButton: {
      padding: 4,
    },
    selectAllContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectAllButton: {
      padding: 8,
    },
    deselectAllButton: {
      padding: 8,
    },
    selectButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      textAlign: isRTL ? 'right' : 'left',
    },
    sessionsList: {
      maxHeight: Dimensions.get('window').height * 0.4,
    },
    sessionsListContent: {
      padding: 8,
    },
    sessionSelectItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      marginVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sessionSelectInfo: {
      flex: 1,
      paddingRight: isRTL ? 0 : 10,
      paddingLeft: isRTL ? 10 : 0,
    },
    sessionSelectDate: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Poppins-Medium',
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    sessionSelectStudent: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    sessionSelectDetails: {
      color: colors.secondary,
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      textAlign: isRTL ? 'right' : 'left',
    },
    checkboxContainer: {
      padding: 4,
    },
    modalFooter: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cancelButton: {
      padding: 12,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      textAlign: isRTL ? 'right' : 'left',
    },
    exportButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 120,
    },
    exportButtonDisabled: {
      backgroundColor: colors.primary + '80',
    },
    exportButtonText: {
      color: colors.background,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
    dropdownSectionTitle: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
    },
    statisticsContainer: {},
    statisticsItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      paddingVertical: 10,
      backgroundColor: colors.card,
      //   borderRadius: 8,
      paddingHorizontal: 12,
      //   marginBottom: 8,
      //   elevation: 1,
      //   shadowColor: '#000',
      //   shadowOpacity: 0.1,
      //   shadowRadius: 1,
    },
    statisticsIconContainer: {
      borderRadius: 20,
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    },
    statisticsItemText: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      flex: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
    statisticsLabel: {
      color: colors.text,
      fontSize: 13,
      fontFamily: 'Poppins-Regular',
      opacity: 0.8,
    },
    statisticsValue: {
      color: colors.text,
      fontSize: 13,
      fontFamily: 'Poppins-Medium',
    },
    flatList: {
      flex: 1,
    },
    statisticsModalContainer: {
      width: '90%',
      height: Dimensions.get('window').height * 0.8,
      maxHeight: Dimensions.get('window').height * 0.8,
      backgroundColor: colors.background,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      display: 'flex',
      flexDirection: 'column',
    },
    statisticsModalHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 10,
    },
    statisticsModalTitle: {
      color: colors.primary,
      fontSize: 18,
      fontFamily: 'Poppins-Bold',
    },
    statisticsModalContent: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    statisticsClassSection: {
      marginBottom: 20,
    },
    statisticsClassHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    statisticsClassTitle: {
      color: colors.primary,
      fontSize: 16,
      fontFamily: 'Poppins-Bold',
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    statisticsClassSummary: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    statisticsSubtitle: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginBottom: 8,
    },
    statisticsDetailItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    statisticsStudentSection: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    statisticsStudentHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    statisticsStudentName: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    statisticsStudentSummary: {
      marginTop: 4,
    },
    statisticsStudentSubtitle: {
      color: colors.text,
      fontSize: 13,
      fontFamily: 'Poppins-Medium',
      marginTop: 8,
      marginBottom: 6,
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    trendImproving: {
      color: '#4CAF50', // Green
    },
    trendDeclining: {
      color: '#F44336', // Red
    },
    trendStable: {
      color: '#FF9800', // Orange/Amber
    },
    trendImprovingBg: {
      backgroundColor: '#4CAF50', // Green
    },
    trendDecliningBg: {
      backgroundColor: '#F44336', // Red
    },
    trendStableBg: {
      backgroundColor: '#FF9800', // Orange/Amber
    },
    trendImprovingBar: {
      backgroundColor: '#4CAF50', // Green
    },
    trendDecliningBar: {
      backgroundColor: '#F44336', // Red
    },
    trendStableBar: {
      backgroundColor: '#FF9800', // Orange/Amber
    },
    veryConsistentText: {
      color: '#4CAF50', // Green
      fontWeight: 'bold',
    },
    consistentText: {
      color: '#8BC34A', // Light Green
    },
    inconsistentText: {
      color: '#FF9800', // Orange/Amber
    },
    veryInconsistentText: {
      color: '#F44336', // Red
    },
    scoreDistributionContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    scoreDistributionItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    scoreRangeText: {
      color: colors.text,
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
      width: 60,
      textAlign: isRTL ? 'right' : 'left',
    },
    scoreBarContainer: {
      flex: 1,
      height: 12,
      backgroundColor: colors.border,
      borderRadius: 6,
      marginHorizontal: 8,
      overflow: 'hidden',
    },
    scoreBar: {
      height: '100%',
      borderRadius: 6,
    },
    scoreFrequencyText: {
      color: colors.text,
      fontSize: 12,
      fontFamily: 'Poppins-Medium',
      width: 20,
      textAlign: 'center',
    },
    performanceMetricsContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    performanceMetricItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    performanceMetricIconContainer: {
      backgroundColor:
        colors.card === colors.background ? colors.border : colors.background,
      borderRadius: 16,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : 10,
      marginLeft: isRTL ? 10 : 0,
    },
    performanceMetricContent: {
      flex: 1,
    },
    performanceMetricTitle: {
      color: colors.text,
      fontSize: 13,
      fontFamily: 'Poppins-Medium',
      marginBottom: 4,
    },
    performanceBarContainer: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    performanceBar: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    classFilterIndicator: {
      backgroundColor: colors.primary + '10',
      padding: 8,
      borderRadius: 4,
      marginBottom: 8,
    },
    classFilterText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
    },
    toggleButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      minWidth: 60,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
    },
    toggleButtonInactive: {
      backgroundColor: colors.background,
    },
    toggleButtonText: {
      fontSize: 12,
      fontFamily: 'Poppins-Medium',
    },
    toggleButtonTextActive: {
      color: '#ffffff',
    },
    toggleButtonTextInactive: {
      color: colors.primary,
    },
    disabledFilterButton: {
      opacity: 0.5,
      backgroundColor: colors.card,
    },
    disabledFilterButtonText: {
      color: colors.border,
    },
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <TouchableWithoutFeedback onPress={handleOutsideClick}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View
              style={[
                styles.headerContent,
                isSmallScreen && styles.headerContentSmall,
              ]}
            >
              <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
                {t('history.title')}
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.classFilterButton}
                  onPress={toggleClassFilterDropdownWithoutPropagation}
                >
                  <Text
                    style={styles.classFilterButtonText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {selectedClassFilter
                      ? classes.find((c) => c.id === selectedClassFilter)
                          ?.name || t('history.allClasses')
                      : t('history.allClasses')}
                  </Text>
                  <ChevronDown size={16} color={colors.text} />
                </TouchableOpacity>

                {showClassFilterDropdown && (
                  <TouchableWithoutFeedback onPress={handleDropdownClick}>
                    <View
                      ref={classFilterDropdownRef}
                      style={[
                        styles.classFilterDropdown,
                        isSmallScreen && styles.classFilterDropdownSmall,
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.classFilterItem,
                          selectedClassFilter === null &&
                            styles.selectedClassFilterItem,
                        ]}
                        onPress={() => selectClassFilter(null)}
                      >
                        <Text
                          style={[
                            styles.classFilterItemText,
                            selectedClassFilter === null &&
                              styles.selectedClassFilterItemText,
                          ]}
                        >
                          {t('history.allClasses')}
                        </Text>
                      </TouchableOpacity>

                      {classes.map((cls) => (
                        <TouchableOpacity
                          key={cls.id}
                          style={[
                            styles.classFilterItem,
                            selectedClassFilter === cls.id &&
                              styles.selectedClassFilterItem,
                          ]}
                          onPress={() => selectClassFilter(cls.id)}
                        >
                          <Text
                            style={[
                              styles.classFilterItemText,
                              selectedClassFilter === cls.id &&
                                styles.selectedClassFilterItemText,
                            ]}
                          >
                            {cls.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableWithoutFeedback>
                )}

                <TouchableOpacity
                  style={[
                    styles.classFilterButton,
                    !selectedClassFilter && styles.disabledFilterButton,
                  ]}
                  onPress={toggleAssignmentFilterDropdown}
                  disabled={!selectedClassFilter}
                >
                  <Text
                    style={[
                      styles.classFilterButtonText,
                      !selectedClassFilter && styles.disabledFilterButtonText,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {selectedAssignmentFilter
                      ? classAssignments.find(
                          (a) => a.id === selectedAssignmentFilter
                        )?.title || t('history.allAssignments')
                      : t('history.allAssignments')}
                  </Text>
                  <ChevronDown
                    size={16}
                    color={!selectedClassFilter ? colors.border : colors.text}
                  />
                </TouchableOpacity>

                {showAssignmentFilterDropdown && (
                  <TouchableWithoutFeedback onPress={handleDropdownClick}>
                    <View
                      ref={assignmentFilterDropdownRef}
                      style={[
                        styles.classFilterDropdown,
                        isSmallScreen && styles.classFilterDropdownSmall,
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.classFilterItem,
                          selectedAssignmentFilter === null &&
                            styles.selectedClassFilterItem,
                        ]}
                        onPress={() => selectAssignmentFilter(null)}
                      >
                        <Text
                          style={[
                            styles.classFilterItemText,
                            selectedAssignmentFilter === null &&
                              styles.selectedClassFilterItemText,
                          ]}
                        >
                          {t('history.allAssignments')}
                        </Text>
                      </TouchableOpacity>

                      {classAssignments.map((assignment) => (
                        <TouchableOpacity
                          key={assignment.id}
                          style={[
                            styles.classFilterItem,
                            selectedAssignmentFilter === assignment.id &&
                              styles.selectedClassFilterItem,
                          ]}
                          onPress={() => selectAssignmentFilter(assignment.id)}
                        >
                          <Text
                            style={[
                              styles.classFilterItemText,
                              selectedAssignmentFilter === assignment.id &&
                                styles.selectedClassFilterItemText,
                            ]}
                          >
                            {assignment.title.length > 18
                              ? assignment.title.slice(0, 18) + '...'
                              : assignment.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableWithoutFeedback>
                )}

                {sessions.length > 0 && (
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={openExportModal}
                  >
                    <Download size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={toggleSettingsDropdown}
                >
                  <Settings size={20} color={colors.primary} />
                </TouchableOpacity>

                {sessions.length > 0 && (
                  <TouchableOpacity
                    style={[styles.headerButton]}
                    onPress={confirmClearHistory}
                  >
                    <Trash2 size={20} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {renderSettingsDropdown()}
        </View>
      </TouchableWithoutFeedback>

      {!isGrouped ? (
        <FlatList
          data={getFilteredSessions()}
          keyExtractor={(item) => item.date}
          renderItem={renderSession}
          refreshing={isRefreshing}
          onRefresh={loadHistory}
          contentContainerStyle={styles.listContainer}
          style={styles.flatList}
          ListEmptyComponent={renderEmptyState()}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEventThrottle={16}
        />
      ) : (
        <FlatList
          data={Object.entries(groupedSessions)}
          keyExtractor={([key]) => key}
          renderItem={renderStudentGroup}
          refreshing={isRefreshing}
          onRefresh={loadHistory}
          contentContainerStyle={styles.listContainer}
          style={styles.flatList}
          ListEmptyComponent={renderEmptyState()}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEventThrottle={16}
        />
      )}

      {renderExportModal()}
      {renderStatisticsModal()}
    </SafeAreaView>
  );
}
