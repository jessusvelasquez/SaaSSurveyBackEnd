import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { getDynamoDBClient } from '../../../../shared/db/dynamodb.client';
import { IResponseRepository } from '../../../../shared/repositories/response.repository.interface';
import { SubmitResponseDto, SurveyResponse } from '../../../../shared/types';
import { SURVEYS_RESPONSE_TABLE } from './response.model';

// M (Model) — implementación DynamoDB del repositorio de respuestas
export class DynamoResponseRepository implements IResponseRepository {
  private readonly client: DynamoDBDocumentClient;

  constructor() {
    this.client = getDynamoDBClient();
  }

  async save(surveyId: string, dto: SubmitResponseDto): Promise<SurveyResponse> {
    const response: SurveyResponse = {
      responseId: uuidv4(),
      surveyId,
      userEmail: dto.userEmail,
      answers: dto.answers,
      submittedAt: new Date().toISOString(),
    };

    await this.client.send(
      new PutCommand({ TableName: SURVEYS_RESPONSE_TABLE, Item: response })
    );
    return response;
  }

  async findBySurveyId(surveyId: string): Promise<SurveyResponse[]> {
    const res = await this.client.send(
      new QueryCommand({
        TableName: SURVEYS_RESPONSE_TABLE,
        IndexName: 'surveyId-index',
        KeyConditionExpression: 'surveyId = :sid',
        ExpressionAttributeValues: { ':sid': surveyId },
      })
    );
    return (res.Items ?? []) as SurveyResponse[];
  }

  async findByUserEmail(email: string): Promise<SurveyResponse[]> {
    const res = await this.client.send(
      new QueryCommand({
        TableName: SURVEYS_RESPONSE_TABLE,
        IndexName: 'UserEmailIndex',
        KeyConditionExpression: 'userEmail = :email',
        ExpressionAttributeValues: { ':email': email },
      })
    );
    return (res.Items ?? []) as SurveyResponse[];
  }
}
