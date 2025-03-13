export interface Class {
  id: string;
  name: string;
}

export interface Operation {
  value: number;
  timestamp: number;
}

export interface Session {
  date: string;
  items: Operation[];
  total: number;
  studentName: string;
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

export interface Assignment {
  id: string;
  title: string;
  maxScore: number;
  classId: string;
}
