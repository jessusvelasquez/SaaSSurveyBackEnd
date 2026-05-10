import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDBClient } from '../../../../shared/db/dynamodb.client';
import { IAnalyticsRepository } from '../../../../shared/repositories/analytics.repository.interface';
import { QuestionAnalytics } from '../../../../shared/types';
import { SURVEYS_ANALYTICS_TABLE } from './analytics.model';

// M (Model) — implementación DynamoDB del repositorio de analíticas
export class DynamoAnalyticsRepository implements IAnalyticsRepository {
  private readonly client: DynamoDBDocumentClient;

  constructor() {
    this.client = getDynamoDBClient();
  }

  async findBySurveyId(surveyId: string): Promise<QuestionAnalytics[]> {
    const res = await this.client.send(
      new QueryCommand({
        TableName: SURVEYS_ANALYTICS_TABLE,
        KeyConditionExpression: 'surveyId = :sid',
        ExpressionAttributeValues: { ':sid': surveyId },
      })
    );
    return (res.Items ?? []) as QuestionAnalytics[];
  }

  async upsert(analytics: QuestionAnalytics): Promise<void> {
    await this.client.send(
      new PutCommand({ TableName: SURVEYS_ANALYTICS_TABLE, Item: analytics })
    );
  }
}
