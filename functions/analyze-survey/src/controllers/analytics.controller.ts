import axios from 'axios';
import { DynamoDBStreamEvent } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsView } from '../views/analytics.view';
import { QuestionAnalytics, QuestionType, SurveyResponse } from '../../../../shared/types';
import { getDynamoDBClient } from '../../../../shared/db/dynamodb.client';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { SURVEYS_TABLE } from '../models/analytics.model';

// C (Controller) — procesa registros del Stream, coordina Service → View → AppSync
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) { }

  async processStreamRecords(event: DynamoDBStreamEvent): Promise<void> {
    for (const record of event.Records) {
      // Solo procesar INSERT o MODIFY de respuestas
      if (record.eventName !== 'INSERT' || !record.dynamodb?.NewImage) continue;

      const response = unmarshall(
        record.dynamodb.NewImage as Record<string, AttributeValue>
      ) as SurveyResponse;

      // Obtiene las preguntas del survey para enriquecer la analítica
      const client = getDynamoDBClient();
      const surveyRes = await client.send(
        new GetCommand({ TableName: SURVEYS_TABLE, Key: { surveyId: response.surveyId } })
      );

      if (!surveyRes.Item) {
        console.error(`[analyze-survey] ERROR: No se encontró el survey ${response.surveyId}. Verifica que SURVEYS_TABLE (${SURVEYS_TABLE}) sea correcta.`);
        continue;
      }

      const questions = (surveyRes.Item?.questions ?? []) as Array<{ id: string; text: string; type: QuestionType }>;
      console.log(`[analyze-survey] Survey encontrado con ${questions.length} preguntas`);

      // Procesa y agrega
      const updatedAnalytics = await this.service.processResponse(response, questions);
      console.log(`[analyze-survey] Analítica calculada para ${updatedAnalytics.length} preguntas`);

      // Notifica a AppSync via HTTP mutation.
      await this.pushToAppSync(updatedAnalytics);
    }
  }

  private async pushToAppSync(analyticsItems: QuestionAnalytics[]): Promise<void> {
    const appSyncUrl = process.env.APPSYNC_API_URL;
    const apiKey = process.env.APPSYNC_API_KEY;
    if (!appSyncUrl || !apiKey) {
      console.warn('[analyze-survey] AppSync URL o API Key no configurados');
      return;
    }

    for (const analytics of analyticsItems) {
      const mutation = AnalyticsView.toAppSyncMutation(analytics);
      try {
        const res = await axios.post(appSyncUrl, mutation, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
        });

        const result = res.data;

        if (result.errors) {
          console.error('[analyze-survey] AppSync GraphQL errors:', JSON.stringify(result.errors));
        } else {
          console.log(`[analyze-survey] Push success for question ${analytics.questionId}`);
        }
      } catch (err: any) {
        console.error('[analyze-survey] axios error:', err.response?.data || err.message);
      }
    }
  }
}
