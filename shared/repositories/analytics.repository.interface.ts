import { QuestionAnalytics } from '../types';

export interface IAnalyticsRepository {
  findBySurveyId(surveyId: string): Promise<QuestionAnalytics[]>;
  upsert(analytics: QuestionAnalytics): Promise<void>;
}
