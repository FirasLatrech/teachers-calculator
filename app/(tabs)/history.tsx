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

interface HistoryItem {
  value: number;
  timestamp: number;
}

interface HistorySession {
  date: string;
  items: HistoryItem[];
  total: number;
  studentName?: string;
}

interface GroupedSessions {
  [key: string]: HistorySession[];
}

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDarkMode, theme } = useTheme();
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<GroupedSessions>({});
  const [isGrouped, setIsGrouped] = useState(true);
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

  useEffect(() => {
    const handleFocus = () => {
      loadHistory();
    };

    const unsubscribe = navigation.addListener('focus', handleFocus);

    loadHistory();

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      groupSessionsByStudent();
    }
  }, [sessions]);

  const loadHistory = async () => {
    try {
      setIsRefreshing(true);
      const savedSessions = await AsyncStorage.getItem('calculatorSessions');
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);

        // Sort sessions by date based on user preference
        parsedSessions.sort((a: HistorySession, b: HistorySession) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          // If isNewestFirst is true, newest should be first (descending order)
          // If isNewestFirst is false, oldest should be first (ascending order)
          return isNewestFirst
            ? dateB - dateA // Newest first (descending)
            : dateA - dateB; // Oldest first (ascending)
        });

        setSessions(parsedSessions);
      }
    } catch (error) {
      console.error(t('history.errors.loadFailed'), error);
    } finally {
      setIsRefreshing(false);
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
    setSelectedSessions(new Array(sessions.length).fill(selectAll));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getAnySessionsSelected = () => {
    return selectedSessions.some((selected) => selected);
  };

  const generateCSV = () => {
    // Get selected sessions
    const sessionsToExport = sessions.filter(
      (_, index) => selectedSessions[index]
    );

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
      <View style={styles.historyItemContent}>
        <Text style={styles.historyTime}>{formatTime(item.timestamp)}</Text>
        <Text
          style={[
            styles.historyValue,
            item.value >= 0 ? styles.positiveValue : styles.negativeValue,
          ]}
        >
          {item.value >= 0 ? '+' : ''}
          {formatNumber(item.value)}
        </Text>
      </View>
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
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <>
                  <Share2 size={18} color={colors.background} />
                </>
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
            <Trash2 size={18} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={item.items}
        renderItem={renderHistoryItem}
        keyExtractor={(item, index) => `history-${item.timestamp}-${index}`}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyItemContainer}>
            <Text style={styles.emptyItemText}>
              {t('history.noOperations')}
            </Text>
          </View>
        }
      />
    </View>
  );

  const groupSessionsByStudent = () => {
    const grouped: GroupedSessions = {};

    sessions.forEach((session) => {
      const studentName = session.studentName || t('history.noStudentName');
      if (!grouped[studentName]) {
        grouped[studentName] = [];
      }
      grouped[studentName].push(session);
    });

    setGroupedSessions(grouped);
  };

  const toggleGroupView = () => {
    setIsGrouped(!isGrouped);
  };

  const renderStudentGroup = ({
    item,
  }: {
    item: [string, HistorySession[]];
  }) => {
    const [studentName, studentSessions] = item;
    const isUnnamedGroup = studentName === t('history.noStudentName');

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
            <Text style={styles.studentGroupCount}>
              {t('history.sessionCount', { count: studentSessions.length })}
            </Text>
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
    setIsNewestFirst(!isNewestFirst);

    // Sort the sessions based on the new sort order
    const sortedSessions = [...sessions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return isNewestFirst ? dateA - dateB : dateB - dateA;
    });

    setSessions(sortedSessions);
  };

  // Settings dropdown component
  const renderSettingsDropdown = () => {
    if (!showSettingsDropdown) return null;

    const dropdownHeight = settingsDropdownRef.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200], // Increased for additional option
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

              <View style={styles.dropdownOption}>
                <View style={styles.dropdownOptionLeft}>
                  <Users size={18} color={colors.primary} />
                  <Text style={styles.dropdownOptionText}>
                    {t('history.groupByStudent')}
                  </Text>
                </View>
                <Switch
                  value={isGrouped}
                  onValueChange={toggleGroupView}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor="#ffffff"
                />
              </View>

              <View style={styles.dropdownDivider} />

              <View style={styles.dropdownOption}>
                <View style={styles.dropdownOptionLeft}>
                  <Calendar size={18} color={colors.primary} />
                  <Text style={styles.dropdownOptionText}>
                    {t('history.newestFirst')}
                  </Text>
                </View>
                <Switch
                  value={isNewestFirst}
                  onValueChange={toggleSortOrder}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor="#ffffff"
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.headerBackground,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
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
    headerTitle: {
      color: colors.primary,
      fontSize: 20,
      fontFamily: 'Poppins-Bold',
    },
    headerButtons: {
      flexDirection: 'row',
    },
    headerButton: {
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
    clearButton: {
      backgroundColor: colors.background,
    },
    listContent: {
      padding: 16,
    },
    emptyListContent: {
      flexGrow: 1,
      justifyContent: 'center',
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
      backgroundColor: colors.background,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.2 : 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sessionHeader: {
      backgroundColor: colors.card,
      padding: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sessionHeaderLeft: {
      flex: 1,
    },
    sessionStats: {
      flexDirection: 'row',
      marginTop: 4,
      alignItems: 'center',
    },
    sessionDate: {
      color: colors.text,
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
    },
    sessionClicks: {
      color: colors.text,
      fontFamily: 'Poppins-Regular',
      fontSize: 12,
      opacity: 0.7,
      marginRight: 12,
    },
    sessionTotal: {
      color: colors.primary,
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
    },
    historyItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyItemContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    historyValue: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      textAlign: 'right',
    },
    positiveValue: {
      color: colors.primary,
    },
    negativeValue: {
      color: colors.danger,
    },
    historyTime: {
      color: colors.text,
      opacity: 0.7,
      fontSize: 13,
      fontFamily: 'Poppins-Regular',
      marginRight: 8,
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
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    shareButtonActive: {
      backgroundColor: isDarkMode
        ? colors.primary +
          '99' /* Adding transparency for a darker effect in dark mode */
        : colors.primary +
          'cc' /* Adding slight transparency for a darker effect in light mode */,
    },
    shareButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginLeft: 6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
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
      flexDirection: 'row',
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
    },
    modalSubtitle: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      opacity: 0.8,
      padding: 16,
      paddingTop: 8,
      paddingBottom: 8,
    },
    closeButton: {
      padding: 4,
    },
    selectAllContainer: {
      flexDirection: 'row',
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
    },
    sessionsList: {
      maxHeight: Dimensions.get('window').height * 0.4,
    },
    sessionsListContent: {
      padding: 8,
    },
    sessionSelectItem: {
      flexDirection: 'row',
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
      paddingRight: 10,
    },
    sessionSelectDate: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Poppins-Medium',
      marginBottom: 4,
    },
    sessionSelectStudent: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginBottom: 4,
    },
    sessionSelectDetails: {
      color: colors.text + '99',
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
    },
    checkboxContainer: {
      padding: 4,
    },
    modalFooter: {
      flexDirection: 'row',
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
    },
    exportButton: {
      flexDirection: 'row',
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
      marginLeft: 8,
    },
    studentName: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginBottom: 4,
    },
    studentGroupContainer: {
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      overflow: 'hidden',
    },
    studentGroupHeader: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    },
    studentGroupCount: {
      color: '#ffffff',
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
    },
    viewToggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
    },
    viewToggleLabel: {
      color: colors.text,
      fontSize: 14,
      marginRight: 8,
      fontFamily: 'Poppins-Regular',
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
    },
    sessionHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
    },
    sessionActionButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButton: {
      backgroundColor: colors.danger,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginLeft: 6,
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    dropdownOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99,
    },
    settingsDropdown: {
      position: 'absolute',
      backgroundColor: colors.card,
      borderRadius: 12,
      minWidth: 250,
      shadowColor: '#000',
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
      color: colors.text + '80',
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
  });

  const renderExportModal = () => {
    return (
      <Modal
        visible={exportModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeExportModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: modalOpacityAnim,
                transform: [{ scale: modalScaleAnim }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('history.export.title')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeExportModal}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {t('history.export.selectSessions')}
            </Text>

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

            <ScrollView
              style={styles.sessionsList}
              contentContainerStyle={styles.sessionsListContent}
            >
              {sessions.map((session, index) => (
                <TouchableOpacity
                  key={`selection-${index}`}
                  style={styles.sessionSelectItem}
                  onPress={() => toggleSessionSelection(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sessionSelectInfo}>
                    <Text style={styles.sessionSelectDate}>
                      {formatFullDate(session.date, i18n.language)}
                    </Text>
                    {session.studentName && (
                      <Text style={styles.sessionSelectStudent}>
                        {t('history.student')}: {session.studentName}
                      </Text>
                    )}
                    <Text style={styles.sessionSelectDetails}>
                      {t('history.total')}: {formatNumber(session.total)} •
                      {t('history.operations')}: {session.items.length}
                    </Text>
                  </View>
                  <View style={styles.checkboxContainer}>
                    {selectedSessions[index] ? (
                      <CheckSquare size={24} color={colors.primary} />
                    ) : (
                      <Square size={24} color={colors.text + '80'} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeExportModal}
              >
                <Text style={styles.cancelButtonText}>
                  {t('history.export.cancel')}
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
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <>
                    <Download size={16} color={colors.background} />
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

  return (
    <SafeAreaView
      style={styles.container}
      key={`history-${theme}`}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('history.title')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              style={[styles.headerButton, styles.clearButton]}
              onPress={confirmClearHistory}
            >
              <Trash2 size={20} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderSettingsDropdown()}

      {isGrouped ? (
        <FlatList
          data={Object.entries(groupedSessions)}
          renderItem={renderStudentGroup}
          keyExtractor={(item) => `student-group-${item[0]}`}
          refreshing={isRefreshing}
          onRefresh={loadHistory}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState()}
        />
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item, index) => `session-${item.date}-${index}`}
          refreshing={isRefreshing}
          onRefresh={loadHistory}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState()}
        />
      )}

      {renderExportModal()}
    </SafeAreaView>
  );
}
