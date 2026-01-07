
export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface ObservationResult {
  overview: string;
  events: {
    teacherBehavior: string;
    studentBehavior: string;
    activeLearning: string;
    questioning: string;
    relationships: string;
    engagement: string;
    technology: string;
    assessment: string;
    conclusion: string;
  };
  tableSummary: Array<{
    item: string;
    observation: string;
    result: 'ดีมาก' | 'ดี' | 'ควรพัฒนา';
  }>;
  strengths: string[];
  recommendations: string[];
  sources?: GroundingSource[];
}
