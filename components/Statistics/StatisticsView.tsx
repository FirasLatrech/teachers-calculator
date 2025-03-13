import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  I18nManager,
} from 'react-native';
import {
  BarChart2,
  TrendingUp,
  User,
  GraduationCap,
} from 'lucide-react-native';
import { getScoreBarColor } from '../../utils/statistics';

interface ScoreDistribution {
  ranges: string[];
  frequencies: number[];
}

interface StudentStatistics {
  name: string;
  count: number;
  totalScore: number;
  maxScore: number;
  minScore: number;
  scores: number[];
  standardDeviation: number;
  medianScore: number;
  progressTrend: 'improving' | 'declining' | 'stable' | 'noTrend';
  consistencyScore: number;
  improvementRate: number;
  percentile: number;
  comparisonToClass: 'above' | 'below' | 'at';
  recentPerformance: number;
}

interface ClassStatistics {
  name: string;
  count: number;
  totalScore: number;
  maxScore: number;
  minScore: number;
  standardDeviation: number;
  medianScore: number;
  scoreDistribution: ScoreDistribution;
  students: Record<string, StudentStatistics>;
  assignments: Record<string, AssignmentStatistics>;
}

interface AssignmentStatistics {
  id: string;
  title: string;
  maxScore: number;
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  totalAttempts: number;
  averageAccuracy: number;
  averageCompletionTime: number;
  studentPerformance: Record<string, StudentPerformance>;
}

interface StudentPerformance {
  attempts: number;
  bestScore: number;
  averageScore: number;
  improvement: number;
  averageTime: number;
}

interface Colors {
  text: string;
  primary: string;
  background: string;
  card: string;
  border: string;
  success: string;
  danger: string;
}

interface StatisticsViewProps {
  data: Record<string, ClassStatistics>;
  onClose: () => void;
  t: (key: string) => string;
  colors: Colors;
  isRTL: boolean;
}

const StatisticsView: React.FC<StatisticsViewProps> = ({
  data,
  onClose,
  t,
  colors,
  isRTL,
}) => {
  // Helper function to get style for consistency score
  const getConsistencyScoreStyle = (score: number) => {
    if (score >= 90) return styles.veryConsistentText;
    if (score >= 70) return styles.consistentText;
    if (score >= 40) return styles.inconsistentText;
    return styles.veryInconsistentText;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    scrollView: {
      flex: 1,
      width: '100%',
    },
    content: {
      padding: 16,
      paddingBottom: 100,
    },
    classSection: {
      marginBottom: 20,
      width: '100%',
    },
    classHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    classTitle: {
      color: colors.primary,
      fontSize: 16,
      fontFamily: 'Poppins-Bold',
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    classSummary: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    subtitle: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginBottom: 8,
    },
    detailItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      marginBottom: 4,
    },
    label: {
      color: colors.text,
      fontSize: 13,
      fontFamily: 'Poppins-Regular',
      opacity: 0.8,
    },
    value: {
      color: colors.text,
      fontSize: 13,
      fontFamily: 'Poppins-Medium',
    },
    studentSection: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    studentHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    studentName: {
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    studentSummary: {
      marginTop: 4,
    },
    studentSubtitle: {
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
    assignmentsContainer: {
      marginTop: 16,
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    assignmentCard: {
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    assignmentTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    assignmentStats: {
      marginTop: 8,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    statLabel: {
      color: colors.text,
      opacity: 0.8,
      flex: 1,
    },
    statValue: {
      color: colors.text,
      fontWeight: '500',
    },
    studentPerformance: {
      marginTop: 16,
    },
    subSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    studentPerformanceCard: {
      marginTop: 8,
      padding: 8,
      backgroundColor: colors.card,
      borderRadius: 6,
    },
    performanceStats: {
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
    },
  });

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const renderAssignmentStatistics = (
    assignments: Record<string, AssignmentStatistics>,
    classId: string
  ) => {
    if (!assignments || Object.keys(assignments).length === 0) {
      return null;
    }

    return (
      <View style={styles.assignmentsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('history.assignmentStatistics') || 'Assignment Statistics'}
        </Text>
        {Object.values(assignments).map((assignment) => (
          <View key={assignment.id} style={styles.assignmentCard}>
            <Text style={[styles.assignmentTitle, { color: colors.text }]}>
              {assignment.title}
            </Text>

            <View style={styles.assignmentStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {t('history.maxPossibleScore') || 'Max Possible Score'}:
                </Text>
                <Text style={styles.statValue}>{assignment.maxScore}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {t('history.averageScore') || 'Average Score'}:
                </Text>
                <Text style={styles.statValue}>
                  {assignment.averageScore.toFixed(1)} (
                  {assignment.averagePercentage.toFixed(1)}%)
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {t('history.highestScore') || 'Highest Score'}:
                </Text>
                <Text style={styles.statValue}>{assignment.highestScore}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {t('history.lowestScore') || 'Lowest Score'}:
                </Text>
                <Text style={styles.statValue}>{assignment.lowestScore}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {t('history.totalAttempts') || 'Total Attempts'}:
                </Text>
                <Text style={styles.statValue}>{assignment.totalAttempts}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {t('history.averageAccuracy') || 'Average Accuracy'}:
                </Text>
                <Text style={styles.statValue}>
                  {assignment.averageAccuracy.toFixed(1)}%
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {t('history.averageTime') || 'Average Time'}:
                </Text>
                <Text style={styles.statValue}>
                  {formatTime(assignment.averageCompletionTime)}
                </Text>
              </View>
            </View>

            <View style={styles.studentPerformance}>
              <Text style={[styles.subSectionTitle, { color: colors.text }]}>
                {t('history.studentPerformance') || 'Student Performance'}
              </Text>
              {Object.entries(assignment.studentPerformance).map(
                ([student, perf]) => (
                  <View key={student} style={styles.studentPerformanceCard}>
                    <Text style={[styles.studentName, { color: colors.text }]}>
                      {student}
                    </Text>
                    <View style={styles.performanceStats}>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>
                          {t('history.attempts') || 'Attempts'}:
                        </Text>
                        <Text style={styles.statValue}>{perf.attempts}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>
                          {t('history.bestScore') || 'Best Score'}:
                        </Text>
                        <Text style={styles.statValue}>{perf.bestScore}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>
                          {t('history.averageScore') || 'Average Score'}:
                        </Text>
                        <Text style={styles.statValue}>
                          {perf.averageScore.toFixed(1)}
                        </Text>
                      </View>
                      {perf.improvement !== 0 && (
                        <View style={styles.statRow}>
                          <Text style={styles.statLabel}>
                            {t('history.improvement') || 'Improvement'}:
                          </Text>
                          <Text
                            style={[
                              styles.statValue,
                              {
                                color:
                                  perf.improvement > 0
                                    ? colors.success
                                    : colors.danger,
                              },
                            ]}
                          >
                            {perf.improvement > 0 ? '+' : ''}
                            {perf.improvement.toFixed(1)}%
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
        scrollsToTop={true}
        fadingEdgeLength={50}
        indicatorStyle="black"
      >
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={{ width: '100%' }}>
            {Object.keys(data).map((classId) => {
              const classData = data[classId];
              if (classData.count === 0) return null;

              const classAverage =
                classData.count > 0
                  ? (classData.totalScore / classData.count).toFixed(2)
                  : '0';

              return (
                <View key={classId} style={styles.classSection}>
                  <View style={styles.classHeader}>
                    <GraduationCap size={18} color={colors.primary} />
                    <Text style={styles.classTitle}>{classData.name}</Text>
                  </View>

                  <View style={styles.classSummary}>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>
                        {t('history.sessions') || 'Sessions'}:
                      </Text>
                      <Text style={styles.value}>{classData.count}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.label}>
                        {t('history.average') || 'Average'}:
                      </Text>
                      <Text style={styles.value}>{classAverage}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.label}>
                        {t('history.highest') || 'Highest'}:
                      </Text>
                      <Text style={styles.value}>{classData.maxScore}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.label}>
                        {t('history.lowest') || 'Lowest'}:
                      </Text>
                      <Text style={styles.value}>{classData.minScore}</Text>
                    </View>

                    {classData.count > 1 && (
                      <>
                        <View style={styles.detailItem}>
                          <Text style={styles.label}>
                            {t('history.standardDeviation') ||
                              'Standard Deviation'}
                            :
                          </Text>
                          <Text style={styles.value}>
                            {classData.standardDeviation.toFixed(2)}
                          </Text>
                        </View>

                        <View style={styles.detailItem}>
                          <Text style={styles.label}>
                            {t('history.medianScore') || 'Median Score'}:
                          </Text>
                          <Text style={styles.value}>
                            {classData.medianScore.toFixed(1)}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>

                  {classData.count >= 3 && (
                    <>
                      <Text style={styles.subtitle}>
                        {t('history.performanceMetrics') ||
                          'Performance Metrics'}
                      </Text>
                      <View style={styles.performanceMetricsContainer}>
                        <View style={styles.performanceMetricItem}>
                          <View style={styles.performanceMetricIconContainer}>
                            <BarChart2 size={16} color={colors.primary} />
                          </View>
                          <View style={styles.performanceMetricContent}>
                            <Text style={styles.performanceMetricTitle}>
                              {t('history.average') || 'Average'}:{' '}
                              {classAverage}
                            </Text>
                            <View style={styles.performanceBarContainer}>
                              <View
                                style={[
                                  styles.performanceBar,
                                  {
                                    width: `${Math.min(
                                      100,
                                      (parseFloat(classAverage) /
                                        classData.maxScore) *
                                        100
                                    )}%`,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </View>

                        <View style={styles.performanceMetricItem}>
                          <View style={styles.performanceMetricIconContainer}>
                            <TrendingUp size={16} color={colors.primary} />
                          </View>
                          <View style={styles.performanceMetricContent}>
                            <Text style={styles.performanceMetricTitle}>
                              {t('history.medianScore') || 'Median Score'}:{' '}
                              {classData.medianScore.toFixed(1)}
                            </Text>
                            <View style={styles.performanceBarContainer}>
                              <View
                                style={[
                                  styles.performanceBar,
                                  {
                                    width: `${Math.min(
                                      100,
                                      (classData.medianScore /
                                        classData.maxScore) *
                                        100
                                    )}%`,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    </>
                  )}

                  {classData.count >= 3 &&
                    classData.scoreDistribution.ranges.length > 0 && (
                      <>
                        <Text style={styles.subtitle}>
                          {t('history.frequencyDistribution') ||
                            'Score Distribution'}
                        </Text>
                        <View style={styles.scoreDistributionContainer}>
                          {classData.scoreDistribution.ranges.map(
                            (range, index) => (
                              <View
                                key={index}
                                style={styles.scoreDistributionItem}
                              >
                                <Text style={styles.scoreRangeText}>
                                  {range}
                                </Text>
                                <View style={styles.scoreBarContainer}>
                                  <View
                                    style={[
                                      styles.scoreBar,
                                      {
                                        width: `${Math.min(
                                          100,
                                          (classData.scoreDistribution
                                            .frequencies[index] /
                                            classData.count) *
                                            100
                                        )}%`,
                                        backgroundColor: getScoreBarColor(
                                          index,
                                          5
                                        ),
                                      },
                                    ]}
                                  />
                                </View>
                                <Text style={styles.scoreFrequencyText}>
                                  {
                                    classData.scoreDistribution.frequencies[
                                      index
                                    ]
                                  }
                                </Text>
                              </View>
                            )
                          )}
                        </View>
                      </>
                    )}

                  <Text style={styles.subtitle}>
                    {t('history.studentBreakdown') || 'Student Breakdown'}
                  </Text>

                  {Object.keys(classData.students).map((studentName) => {
                    const studentData = classData.students[studentName];
                    if (studentData.count === 0) return null;

                    const studentAverage =
                      studentData.count > 0
                        ? (studentData.totalScore / studentData.count).toFixed(
                            2
                          )
                        : '0';

                    return (
                      <View key={studentName} style={styles.studentSection}>
                        <View style={styles.studentHeader}>
                          <User size={16} color={colors.primary} />
                          <Text style={styles.studentName}>
                            {studentData.name}
                          </Text>
                        </View>

                        <View style={styles.studentSummary}>
                          <View style={styles.detailItem}>
                            <Text style={styles.label}>
                              {t('history.sessions') || 'Sessions'}:
                            </Text>
                            <Text style={styles.value}>
                              {studentData.count}
                            </Text>
                          </View>

                          <View style={styles.detailItem}>
                            <Text style={styles.label}>
                              {t('history.average') || 'Average'}:
                            </Text>
                            <Text style={styles.value}>{studentAverage}</Text>
                          </View>

                          <View style={styles.detailItem}>
                            <Text style={styles.label}>
                              {t('history.highest') || 'Highest'}:
                            </Text>
                            <Text style={styles.value}>
                              {studentData.maxScore}
                            </Text>
                          </View>

                          <View style={styles.detailItem}>
                            <Text style={styles.label}>
                              {t('history.lowest') || 'Lowest'}:
                            </Text>
                            <Text style={styles.value}>
                              {studentData.minScore}
                            </Text>
                          </View>

                          {studentData.count > 1 && (
                            <>
                              <View style={styles.detailItem}>
                                <Text style={styles.label}>
                                  {t('history.standardDeviation') ||
                                    'Standard Deviation'}
                                  :
                                </Text>
                                <Text style={styles.value}>
                                  {studentData.standardDeviation.toFixed(2)}
                                </Text>
                              </View>

                              <View style={styles.detailItem}>
                                <Text style={styles.label}>
                                  {t('history.medianScore') || 'Median Score'}:
                                </Text>
                                <Text style={styles.value}>
                                  {studentData.medianScore.toFixed(1)}
                                </Text>
                              </View>

                              <View style={styles.detailItem}>
                                <Text style={styles.label}>
                                  {t('history.consistencyScore') ||
                                    'Consistency Score'}
                                  :
                                </Text>
                                <Text
                                  style={[
                                    styles.value,
                                    getConsistencyScoreStyle(
                                      studentData.consistencyScore
                                    ),
                                  ]}
                                >
                                  {studentData.consistencyScore.toFixed(0)}%
                                </Text>
                              </View>

                              <View style={styles.detailItem}>
                                <Text style={styles.label}>
                                  {t('history.improvementRate') ||
                                    'Improvement Rate'}
                                  :
                                </Text>
                                <Text
                                  style={[
                                    styles.value,
                                    studentData.improvementRate > 0
                                      ? styles.trendImproving
                                      : studentData.improvementRate < 0
                                      ? styles.trendDeclining
                                      : styles.trendStable,
                                  ]}
                                >
                                  {studentData.improvementRate > 0 ? '+' : ''}
                                  {studentData.improvementRate.toFixed(0)}%
                                </Text>
                              </View>
                            </>
                          )}

                          {studentData.count >= 3 && (
                            <View style={styles.detailItem}>
                              <Text style={styles.label}>
                                {t('history.progressTrend') || 'Progress Trend'}
                                :
                              </Text>
                              <Text
                                style={[
                                  styles.value,
                                  studentData.progressTrend === 'improving' &&
                                    styles.trendImproving,
                                  studentData.progressTrend === 'declining' &&
                                    styles.trendDeclining,
                                  studentData.progressTrend === 'stable' &&
                                    styles.trendStable,
                                ]}
                              >
                                {t(`history.${studentData.progressTrend}`) ||
                                  (studentData.progressTrend === 'improving'
                                    ? 'Improving'
                                    : studentData.progressTrend === 'declining'
                                    ? 'Declining'
                                    : studentData.progressTrend === 'stable'
                                    ? 'Stable'
                                    : 'Not enough data')}
                              </Text>
                            </View>
                          )}

                          {classData.count > 1 && studentData.count > 0 && (
                            <>
                              <View style={styles.detailItem}>
                                <Text style={styles.label}>
                                  {t('history.comparisonToClass') ||
                                    'Comparison to Class'}
                                  :
                                </Text>
                                <Text
                                  style={[
                                    styles.value,
                                    studentData.comparisonToClass === 'above'
                                      ? styles.trendImproving
                                      : studentData.comparisonToClass ===
                                        'below'
                                      ? styles.trendDeclining
                                      : styles.trendStable,
                                  ]}
                                >
                                  {studentData.comparisonToClass === 'above'
                                    ? t('history.aboveAverage') ||
                                      'Above Average'
                                    : studentData.comparisonToClass === 'below'
                                    ? t('history.belowAverage') ||
                                      'Below Average'
                                    : t('history.atAverage') || 'At Average'}
                                </Text>
                              </View>

                              <View style={styles.detailItem}>
                                <Text style={styles.label}>
                                  {t('history.percentile') || 'Percentile'}:
                                </Text>
                                <Text style={styles.value}>
                                  {studentData.percentile.toFixed(0)}%
                                </Text>
                              </View>
                            </>
                          )}
                        </View>

                        {studentData.count >= 2 && (
                          <>
                            <Text style={styles.studentSubtitle}>
                              {t('history.performanceMetrics') ||
                                'Performance Metrics'}
                            </Text>
                            <View style={styles.performanceMetricsContainer}>
                              <View style={styles.performanceMetricItem}>
                                <View
                                  style={styles.performanceMetricIconContainer}
                                >
                                  <BarChart2 size={16} color={colors.primary} />
                                </View>
                                <View style={styles.performanceMetricContent}>
                                  <Text style={styles.performanceMetricTitle}>
                                    {t('history.average') || 'Average'}:{' '}
                                    {studentAverage}
                                  </Text>
                                  <View style={styles.performanceBarContainer}>
                                    <View
                                      style={[
                                        styles.performanceBar,
                                        {
                                          width: `${Math.min(
                                            100,
                                            (parseFloat(studentAverage) /
                                              studentData.maxScore) *
                                              100
                                          )}%`,
                                        },
                                      ]}
                                    />
                                  </View>
                                </View>
                              </View>

                              {studentData.count >= 3 && (
                                <View style={styles.performanceMetricItem}>
                                  <View
                                    style={[
                                      styles.performanceMetricIconContainer,
                                      studentData.progressTrend ===
                                        'improving' && styles.trendImprovingBg,
                                      studentData.progressTrend ===
                                        'declining' && styles.trendDecliningBg,
                                      studentData.progressTrend === 'stable' &&
                                        styles.trendStableBg,
                                    ]}
                                  >
                                    <TrendingUp
                                      size={16}
                                      color={colors.background}
                                    />
                                  </View>
                                  <View style={styles.performanceMetricContent}>
                                    <Text style={styles.performanceMetricTitle}>
                                      {t('history.progressTrend') ||
                                        'Progress Trend'}
                                      :{' '}
                                      {t(
                                        `history.${studentData.progressTrend}`
                                      ) ||
                                        (studentData.progressTrend ===
                                        'improving'
                                          ? 'Improving'
                                          : studentData.progressTrend ===
                                            'declining'
                                          ? 'Declining'
                                          : studentData.progressTrend ===
                                            'stable'
                                          ? 'Stable'
                                          : 'Not enough data')}
                                    </Text>
                                    <View
                                      style={styles.performanceBarContainer}
                                    >
                                      <View
                                        style={[
                                          styles.performanceBar,
                                          studentData.progressTrend ===
                                            'improving' &&
                                            styles.trendImprovingBar,
                                          studentData.progressTrend ===
                                            'declining' &&
                                            styles.trendDecliningBar,
                                          studentData.progressTrend ===
                                            'stable' && styles.trendStableBar,
                                          { width: '100%' },
                                        ]}
                                      />
                                    </View>
                                  </View>
                                </View>
                              )}
                            </View>
                          </>
                        )}
                      </View>
                    );
                  })}

                  {renderAssignmentStatistics(
                    classData.assignments || {},
                    classId
                  )}
                </View>
              );
            })}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </View>
  );
};

export default StatisticsView;
