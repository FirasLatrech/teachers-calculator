/**
 * Statistics utility functions for calculating advanced metrics
 */

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
  assignmentTitle?: string;
  maxScore?: number;
  percentageScore?: number;
  assignmentStats?: {
    averageTimePerOperation: number;
    totalTime: number;
    accuracy: number;
  };
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

interface ScoreDistribution {
  ranges: string[];
  frequencies: number[];
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
  averageTimePerOperation: number;
  studentPerformance: Record<string, {
    attempts: number;
    bestScore: number;
    averageScore: number;
    improvement: number;
    averageTime: number;
  }>;
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
  assignments?: Record<string, AssignmentStatistics>;
}

/**
 * Calculate standard deviation for an array of numbers
 */
export const calculateStandardDeviation = (values: number[], mean: number): number => {
  if (values.length <= 1) return 0;

  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
};

/**
 * Calculate median for an array of numbers
 */
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const midIndex = Math.floor(sortedValues.length / 2);

  return sortedValues.length % 2 === 0
    ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
    : sortedValues[midIndex];
};

/**
 * Calculate score distribution for an array of numbers
 */
export const calculateScoreDistribution = (scores: number[]): ScoreDistribution => {
  if (scores.length === 0) {
    return { ranges: [], frequencies: [] };
  }

  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min;
  const step = range / 5;

  const ranges: string[] = [];
  const frequencies: number[] = [0, 0, 0, 0, 0];

  for (let i = 0; i < 5; i++) {
    const rangeStart = min + i * step;
    const rangeEnd = i === 4 ? max : min + (i + 1) * step;
    ranges.push(`${rangeStart.toFixed(0)}-${rangeEnd.toFixed(0)}`);

    // Count scores in this range
    scores.forEach(score => {
      if (i === 4) {
        // Last range is inclusive of the max
        if (score >= rangeStart && score <= rangeEnd) {
          frequencies[i]++;
        }
      } else {
        if (score >= rangeStart && score < rangeEnd) {
          frequencies[i]++;
        }
      }
    });
  }

  return { ranges, frequencies };
};

/**
 * Calculate consistency score (0-100) based on coefficient of variation
 */
export const calculateConsistencyScore = (standardDeviation: number, mean: number): number => {
  if (mean === 0 || standardDeviation === 0) return 100;

  // Coefficient of variation (CV) = standard deviation / mean
  const cv = standardDeviation / mean;

  // Convert to a 0-100 score where lower CV = higher consistency
  // CV of 0 = 100% consistency, CV of 0.5 or higher = 0% consistency
  return Math.max(0, Math.min(100, 100 * (1 - cv * 2)));
};

/**
 * Calculate improvement rate (-100 to 100) using linear regression
 */
export const calculateImprovementRate = (scores: number[]): number => {
  if (scores.length < 2) return 0;

  const n = scores.length;
  const indices = Array.from({length: n}, (_, i) => i + 1);

  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = scores.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * scores[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // Normalize the slope to a -100 to 100 scale
  const maxScore = Math.max(...scores);
  const normalizedSlope = (slope / maxScore) * 100 * n;

  return Math.max(-100, Math.min(100, normalizedSlope));
};

/**
 * Determine progress trend based on recent scores
 */
export const determineProgressTrend = (scores: number[]): 'improving' | 'declining' | 'stable' | 'noTrend' => {
  if (scores.length < 3) return 'noTrend';

  // Get the most recent 3 scores
  const recentScores = scores.slice(-3);

  if (recentScores[2] > recentScores[0]) {
    return 'improving';
  } else if (recentScores[2] < recentScores[0]) {
    return 'declining';
  } else {
    return 'stable';
  }
};

/**
 * Calculate percentile rank within a group
 */
export const calculatePercentile = (value: number, allValues: number[]): number => {
  if (allValues.length <= 1) return 50; // Default to 50th percentile if only one value

  const lowerCount = allValues.filter(v => v < value).length;
  return (lowerCount / (allValues.length - 1)) * 100;
};

/**
 * Compare a value to a reference value and determine if it's above, below, or at the reference
 */
export const compareToReference = (value: number, reference: number): 'above' | 'below' | 'at' => {
  if (value > reference * 1.05) {
    return 'above';
  } else if (value < reference * 0.95) {
    return 'below';
  } else {
    return 'at';
  }
};

/**
 * Calculate recent performance (average of last N scores)
 */
export const calculateRecentPerformance = (scores: number[], n: number = 3): number => {
  if (scores.length === 0) return 0;

  const recentScores = scores.slice(-Math.min(n, scores.length));
  return recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
};

/**
 * Get color for score distribution bars
 */
export const getScoreBarColor = (index: number, total: number): string => {
  // Generate colors from red to green
  const hue = (index / (total - 1)) * 120; // 0 = red, 120 = green
  return `hsl(${hue}, 80%, 45%)`;
};

/**
 * Process sessions and calculate advanced statistics
 */
export const calculateAdvancedStatistics = (sessions: HistorySession[]): Record<string, ClassStatistics> => {
  const classSummary: Record<string, ClassStatistics> = {};

  // Initialize with "No Class" for sessions without class
  classSummary['no-class'] = {
    name: 'No Class',
    count: 0,
    totalScore: 0,
    maxScore: 0,
    minScore: Number.MAX_VALUE,
    standardDeviation: 0,
    medianScore: 0,
    scoreDistribution: { ranges: [], frequencies: [] },
    students: {},
    assignments: {}
  };

  // Process each session
  sessions.forEach(session => {
    const classId = session.classId || 'no-class';
    const studentName = session.studentName || 'No Student';
    const assignmentId = session.assignmentId;

    // Initialize class if not exists
    if (!classSummary[classId] && classId !== 'no-class') {
      classSummary[classId] = {
        name: session.className || classId,
        count: 0,
        totalScore: 0,
        maxScore: 0,
        minScore: Number.MAX_VALUE,
        standardDeviation: 0,
        medianScore: 0,
        scoreDistribution: { ranges: [], frequencies: [] },
        students: {},
        assignments: {}
      };
    }

    // Update class stats
    classSummary[classId].count += 1;
    classSummary[classId].totalScore += session.total;
    classSummary[classId].maxScore = Math.max(classSummary[classId].maxScore, session.total);
    classSummary[classId].minScore = Math.min(classSummary[classId].minScore, session.total);

    // Process assignment statistics if available
    if (assignmentId && session.assignmentTitle && session.maxScore) {
      if (!classSummary[classId].assignments) {
        classSummary[classId].assignments = {};
      }

      if (!classSummary[classId].assignments[assignmentId]) {
        classSummary[classId].assignments[assignmentId] = {
          id: assignmentId,
          title: session.assignmentTitle,
          maxScore: session.maxScore,
          averageScore: 0,
          averagePercentage: 0,
          highestScore: 0,
          lowestScore: Number.MAX_VALUE,
          totalAttempts: 0,
          averageAccuracy: 0,
          averageCompletionTime: 0,
          averageTimePerOperation: 0,
          studentPerformance: {}
        };
      }

      const assignmentStats = classSummary[classId].assignments[assignmentId];
      assignmentStats.totalAttempts++;
      assignmentStats.highestScore = Math.max(assignmentStats.highestScore, session.total);
      assignmentStats.lowestScore = Math.min(assignmentStats.lowestScore, session.total);

      // Update student performance for this assignment
      if (!assignmentStats.studentPerformance[studentName]) {
        assignmentStats.studentPerformance[studentName] = {
          attempts: 0,
          bestScore: 0,
          averageScore: 0,
          improvement: 0,
          averageTime: 0
        };
      }

      const studentPerf = assignmentStats.studentPerformance[studentName];
      studentPerf.attempts++;
      studentPerf.bestScore = Math.max(studentPerf.bestScore, session.total);
      studentPerf.averageScore = ((studentPerf.averageScore * (studentPerf.attempts - 1)) + session.total) / studentPerf.attempts;

      if (session.assignmentStats) {
        studentPerf.averageTime = ((studentPerf.averageTime * (studentPerf.attempts - 1)) + session.assignmentStats.totalTime) / studentPerf.attempts;
        assignmentStats.averageCompletionTime = ((assignmentStats.averageCompletionTime * (assignmentStats.totalAttempts - 1)) + session.assignmentStats.totalTime) / assignmentStats.totalAttempts;
        assignmentStats.averageTimePerOperation = ((assignmentStats.averageTimePerOperation * (assignmentStats.totalAttempts - 1)) + session.assignmentStats.averageTimePerOperation) / assignmentStats.totalAttempts;
        assignmentStats.averageAccuracy = ((assignmentStats.averageAccuracy * (assignmentStats.totalAttempts - 1)) + session.assignmentStats.accuracy) / assignmentStats.totalAttempts;
      }

      // Calculate improvement (comparing to first attempt)
      if (studentPerf.attempts > 1) {
        studentPerf.improvement = ((session.total - studentPerf.averageScore) / studentPerf.averageScore) * 100;
      }

      // Update overall assignment averages
      assignmentStats.averageScore = ((assignmentStats.averageScore * (assignmentStats.totalAttempts - 1)) + session.total) / assignmentStats.totalAttempts;
      assignmentStats.averagePercentage = (assignmentStats.averageScore / assignmentStats.maxScore) * 100;
    }

    // Initialize student if not exists
    if (!classSummary[classId].students[studentName]) {
      classSummary[classId].students[studentName] = {
        name: studentName,
        count: 0,
        totalScore: 0,
        maxScore: 0,
        minScore: Number.MAX_VALUE,
        scores: [],
        standardDeviation: 0,
        medianScore: 0,
        progressTrend: 'noTrend',
        consistencyScore: 0,
        improvementRate: 0,
        percentile: 0,
        comparisonToClass: 'at',
        recentPerformance: 0,
      };
    }

    // Update student stats
    classSummary[classId].students[studentName].count += 1;
    classSummary[classId].students[studentName].totalScore += session.total;
    classSummary[classId].students[studentName].maxScore = Math.max(
      classSummary[classId].students[studentName].maxScore,
      session.total
    );
    classSummary[classId].students[studentName].minScore = Math.min(
      classSummary[classId].students[studentName].minScore,
      session.total
    );
    classSummary[classId].students[studentName].scores.push(session.total);
  });

  // Calculate additional statistics for each class and student
  Object.keys(classSummary).forEach(classId => {
    const classData = classSummary[classId];

    // Clean up any classes with minScore still at MAX_VALUE (no sessions)
    if (classData.minScore === Number.MAX_VALUE) {
      classData.minScore = 0;
    }

    // Calculate class-level advanced statistics
    if (classData.count > 0) {
      // Get all scores from all students in this class
      const allScores: number[] = [];
      Object.values(classData.students).forEach(student => {
        allScores.push(...student.scores);
      });

      // Calculate mean
      const mean = classData.totalScore / classData.count;

      // Calculate standard deviation
      classData.standardDeviation = calculateStandardDeviation(allScores, mean);

      // Calculate median
      classData.medianScore = calculateMedian(allScores);

      // Calculate score distribution
      classData.scoreDistribution = calculateScoreDistribution(allScores);
    }

    // Calculate student-level advanced statistics
    Object.keys(classData.students).forEach(studentName => {
      const studentData = classData.students[studentName];

      // Clean up students with minScore at MAX_VALUE
      if (studentData.minScore === Number.MAX_VALUE) {
        studentData.minScore = 0;
      }

      if (studentData.count > 0) {
        const mean = studentData.totalScore / studentData.count;

        // Calculate standard deviation
        studentData.standardDeviation = calculateStandardDeviation(studentData.scores, mean);

        // Calculate median
        studentData.medianScore = calculateMedian(studentData.scores);

        // Determine progress trend
        studentData.progressTrend = determineProgressTrend(studentData.scores);

        // Calculate consistency score
        studentData.consistencyScore = calculateConsistencyScore(studentData.standardDeviation, mean);

        // Calculate improvement rate
        studentData.improvementRate = calculateImprovementRate(studentData.scores);

        // Calculate recent performance
        studentData.recentPerformance = calculateRecentPerformance(studentData.scores);

        // Calculate percentile and comparison to class (if class has more than one student)
        if (classData.count > 1) {
          // Get all student averages in this class
          const allStudentAvgs = Object.values(classData.students)
            .filter(s => s.count > 0)
            .map(s => s.totalScore / s.count);

          // Calculate percentile
          studentData.percentile = calculatePercentile(mean, allStudentAvgs);

          // Determine comparison to class average
          const classAvg = classData.totalScore / classData.count;
          studentData.comparisonToClass = compareToReference(mean, classAvg);
        }
      }
    });
  });

  return classSummary;
};

export default {
  calculateAdvancedStatistics,
  calculateStandardDeviation,
  calculateMedian,
  calculateScoreDistribution,
  calculateConsistencyScore,
  calculateImprovementRate,
  determineProgressTrend,
  calculatePercentile,
  compareToReference,
  calculateRecentPerformance,
  getScoreBarColor,
};
