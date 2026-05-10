import { QuestionAnalytics } from '../../../../shared/types';

// V (View) — En esta Lambda no hay respuesta HTTP; formatea la mutación GraphQL para AppSync
export class AnalyticsView {
  static toAppSyncMutation(analytics: QuestionAnalytics): { query: string; variables: Record<string, unknown> } {
    return {
      query: `
        mutation UpdateSurveyResult($input: SurveyResultInput!) {
          updateSurveyResult(input: $input) {
            surveyId
            questionId
            questionText
            questionType
            totalResponses
            aggregatedData
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          surveyId: analytics.surveyId,
          questionId: analytics.questionId,
          questionText: analytics.questionText,
          questionType: analytics.questionType,
          totalResponses: analytics.totalResponses,
          aggregatedData: JSON.stringify(analytics.aggregatedData),
          updatedAt: analytics.updatedAt,
        },
      },
    };
  }
}
