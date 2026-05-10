import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { getDynamoDBClient } from '../../../../shared/db/dynamodb.client';
import { ISurveyRepository } from '../../../../shared/repositories/survey.repository.interface';
import {
  CreateQuestionDto,
  CreateSurveyDto,
  Question,
  Survey,
  UpdateQuestionDto,
  UpdateSurveyDto,
} from '../../../../shared/types';
import { SURVEYS_TABLE } from './survey.model';

// M (Model) — implementación DynamoDB

const getClient = (): DynamoDBDocumentClient => getDynamoDBClient();

// ─── Survey Operations ────────────────────────────────────────────────────────

export const findAll = async (userId: string): Promise<Survey[]> => {
  const client = getClient();
  const items: Survey[] = [];
  let lastKey: Record<string, any> | undefined;

  do {
    const res = await client.send(
      new ScanCommand({
        TableName: SURVEYS_TABLE,
        ExclusiveStartKey: lastKey,
        FilterExpression: 'ownerId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
    );
    items.push(...((res.Items ?? []) as Survey[]));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  return items;
};

export const findById = async (surveyId: string, userId: string): Promise<Survey | null> => {
  const client = getClient();
  const res = await client.send(
    new GetCommand({ TableName: SURVEYS_TABLE, Key: { surveyId } })
  );
  const survey = res.Item as Survey;
  if (!survey || survey.ownerId !== userId) return null;
  return survey;
};

export const create = async (userId: string, dto: CreateSurveyDto): Promise<Survey> => {
  const client = getClient();
  const now = new Date().toISOString();
  const survey: Survey = {
    surveyId: uuidv4(),
    ownerId: userId,
    title: dto.title,
    description: dto.description ?? '',
    questions: [],
    isPublished: false,
    createdAt: now,
    updatedAt: now,
  };
  await client.send(new PutCommand({ TableName: SURVEYS_TABLE, Item: survey }));
  return survey;
};

export const update = async (
  surveyId: string,
  userId: string,
  dto: UpdateSurveyDto
): Promise<Survey | null> => {
  const client = getClient();
  const existing = await findById(surveyId, userId);
  if (!existing) return null;

  const updated: Survey = { ...existing, ...dto, updatedAt: new Date().toISOString() };

  await client.send(
    new PutCommand({
      TableName: SURVEYS_TABLE,
      Item: updated,
      ConditionExpression: 'attribute_exists(surveyId) AND ownerId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
  );

  return updated;
};

export const deleteSurvey = async (surveyId: string, userId: string): Promise<void> => {
  const client = getClient();
  // Validamos propiedad antes de borrar
  const existing = await findById(surveyId, userId);
  if (!existing) return;

  await client.send(new DeleteCommand({ TableName: SURVEYS_TABLE, Key: { surveyId } }));
};

// ─── Question Operations ──────────────────────────────────────────────────────

export const addQuestion = async (
  surveyId: string,
  userId: string,
  dto: CreateQuestionDto
): Promise<Question> => {
  const client = getClient();
  const existing = await findById(surveyId, userId);
  if (!existing) throw new Error(`Survey ${surveyId} not found or access denied`);

  const question: Question = {
    id: uuidv4(),
    surveyId,
    text: dto.text,
    type: dto.type,
    order: dto.order ?? existing.questions.length,
    options: dto.options ?? [],
  };

  const questions = [...existing.questions, question];

  await client.send(
    new PutCommand({
      TableName: SURVEYS_TABLE,
      Item: { ...existing, questions, updatedAt: new Date().toISOString() },
      ConditionExpression: 'attribute_exists(surveyId) AND ownerId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    })
  );

  return question;
};

export const updateQuestion = async (
  surveyId: string,
  questionId: string,
  userId: string,
  dto: UpdateQuestionDto
): Promise<Question | null> => {
  const client = getClient();
  const existing = await findById(surveyId, userId);
  if (!existing) return null;

  const idx = existing.questions.findIndex((q) => q.id === questionId);
  if (idx === -1) return null;

  const updated: Question = { ...existing.questions[idx], ...dto };
  const questions = [...existing.questions];
  questions[idx] = updated;

  await client.send(
    new PutCommand({
      TableName: SURVEYS_TABLE,
      Item: { ...existing, questions, updatedAt: new Date().toISOString() },
      ConditionExpression: 'attribute_exists(surveyId) AND ownerId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    })
  );

  return updated;
};

export const deleteQuestion = async (
  surveyId: string,
  questionId: string,
  userId: string
): Promise<void> => {
  const client = getClient();
  const existing = await findById(surveyId, userId);
  if (!existing) return;

  const questions = existing.questions.filter((q) => q.id !== questionId);

  await client.send(
    new PutCommand({
      TableName: SURVEYS_TABLE,
      Item: { ...existing, questions, updatedAt: new Date().toISOString() },
      ConditionExpression: 'attribute_exists(surveyId) AND ownerId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    })
  );
};

export const findPublic = async (): Promise<Survey[]> => {
  const client = getClient();
  const items: Survey[] = [];
  let lastKey: Record<string, any> | undefined;

  do {
    const res = await client.send(
      new ScanCommand({
        TableName: SURVEYS_TABLE,
        ExclusiveStartKey: lastKey,
        FilterExpression: 'isPublished = :pub',
        ExpressionAttributeValues: {
          ':pub': true,
        },
      })
    );
    items.push(...((res.Items ?? []) as Survey[]));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  return items;
};

export const findAnyById = async (surveyId: string): Promise<Survey | null> => {
  const client = getClient();
  const res = await client.send(
    new GetCommand({ TableName: SURVEYS_TABLE, Key: { surveyId } })
  );
  return (res.Item as Survey) ?? null;
};

// Implementación de ISurveyRepository usando las funciones
export const dynamoSurveyRepository: ISurveyRepository = {
  findAll,
  findPublic,
  findById,
  findAnyById,
  create,
  update,
  delete: deleteSurvey,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};
