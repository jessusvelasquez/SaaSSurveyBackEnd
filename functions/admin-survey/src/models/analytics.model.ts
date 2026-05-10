import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDBClient } from '../../../../shared/db/dynamodb.client';
import { QuestionAnalytics } from '../../../../shared/types';

// Tabla de analíticas
export const SURVEYS_ANALYTICS_TABLE = process.env.SURVEYS_ANALYTICS_TABLE ?? 'surveys-analytics';

// Lee los resultados agregados de una encuesta
export const findResultsBySurveyId = async (surveyId: string): Promise<QuestionAnalytics[]> => {
  const client = getDynamoDBClient();
  const res = await client.send(
    new QueryCommand({
      TableName: SURVEYS_ANALYTICS_TABLE,
      KeyConditionExpression: 'surveyId = :sid',
      ExpressionAttributeValues: { ':sid': surveyId },
    })
  );
  return (res.Items ?? []) as QuestionAnalytics[];
};
