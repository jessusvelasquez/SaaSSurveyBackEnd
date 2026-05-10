import { IAnalyticsRepository } from '../../../../shared/repositories/analytics.repository.interface';
import { QuestionAnalytics, QuestionType, SurveyResponse } from '../../../../shared/types';

// S (Service) — lógica de agregación: calcula métricas por pregunta a partir de respuestas
export class AnalyticsService {
  constructor(private readonly repository: IAnalyticsRepository) { }

  async processResponse(response: SurveyResponse, surveyQuestions: Array<{ id: string; text: string; type: QuestionType }>): Promise<QuestionAnalytics[]> {
    const updated: QuestionAnalytics[] = [];

    const existingAnalytics = await this.repository.findBySurveyId(response.surveyId);

    //Data actual de las preguntas
    const localMap = new Map<string, QuestionAnalytics>(
      existingAnalytics.map(a => [a.questionId, a])
    );

    //Recorremos todas las respuestas
    for (const answer of response.answers) {
      //Buscamos la pregunta
      const question = surveyQuestions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      //Obtenemos la data actual de la pregunta
      const current = localMap.get(answer.questionId) ?? {
        surveyId: response.surveyId,
        questionId: answer.questionId,
        questionText: question.text,
        questionType: question.type,
        totalResponses: 0,
        aggregatedData: {},
        updatedAt: '',
      };

      // Agrega la respuesta al conteo
      const updatedData = { ...current.aggregatedData };
      const values = Array.isArray(answer.value) ? answer.value : [answer.value as string];
      for (const val of values) {
        updatedData[val] = (updatedData[val] ?? 0) + 1;
      }

      const analytics: QuestionAnalytics = {
        ...current,
        totalResponses: current.totalResponses + 1,
        aggregatedData: updatedData,
        updatedAt: new Date().toISOString(),
      };

      // Actualiza el mapa local para la siguiente iteración
      localMap.set(answer.questionId, analytics);

      await this.repository.upsert(analytics);
      updated.push(analytics);
    }

    return updated;
  }

  getAnalyticsBySurvey(surveyId: string): Promise<QuestionAnalytics[]> {
    return this.repository.findBySurveyId(surveyId);
  }
}
