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

export const findAll = async (): Promise<Survey[]> => {
  const client = getClient();
  const items: Survey[] = [];
  let lastKey: Record<string, any> | undefined;

  // Paginación: itera hasta que no haya más resultados
  do {
    const res = await client.send(
      new ScanCommand({
        TableName: SURVEYS_TABLE,
        ExclusiveStartKey: lastKey,
      })
    );
    items.push(...((res.Items ?? []) as Survey[]));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  return items;
};

export const findById = async (surveyId: string): Promise<Survey | null> => {
  const client = getClient();
  const res = await client.send(
    new GetCommand({ TableName: SURVEYS_TABLE, Key: { surveyId } })
  );
  return (res.Item as Survey) ?? null;
};

export const create = async (dto: CreateSurveyDto): Promise<Survey> => {
  const client = getClient();
  const now = new Date().toISOString();
  const survey: Survey = {
    surveyId: uuidv4(),
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
  dto: UpdateSurveyDto
): Promise<Survey | null> => {
  const client = getClient();
  const existing = await findById(surveyId);
  if (!existing) return null;

  const updated: Survey = { ...existing, ...dto, updatedAt: new Date().toISOString() };

  // ConditionExpression: solo actualiza si el item existe.
  await client.send(
    new PutCommand({
      TableName: SURVEYS_TABLE,
      Item: updated,
      ConditionExpression: 'attribute_exists(surveyId)',
    })
  );

  return updated;
};

export const deleteSurvey = async (surveyId: string): Promise<void> => {
  const client = getClient();
  await client.send(new DeleteCommand({ TableName: SURVEYS_TABLE, Key: { surveyId } }));
};

// ─── Question Operations ──────────────────────────────────────────────────────

export const addQuestion = async (
  surveyId: string,
  dto: CreateQuestionDto
): Promise<Question> => {
  const client = getClient();
  const existing = await findById(surveyId);
  if (!existing) throw new Error(`Survey ${surveyId} not found`);

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
      ConditionExpression: 'attribute_exists(surveyId)',
    })
  );

  return question;
};

export const updateQuestion = async (
  surveyId: string,
  questionId: string,
  dto: UpdateQuestionDto
): Promise<Question | null> => {
  const client = getClient();
  const existing = await findById(surveyId);
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
      ConditionExpression: 'attribute_exists(surveyId)',
    })
  );

  return updated;
};

export const deleteQuestion = async (
  surveyId: string,
  questionId: string
): Promise<void> => {
  const client = getClient();
  const existing = await findById(surveyId);
  if (!existing) return;

  const questions = existing.questions.filter((q) => q.id !== questionId);

  await client.send(
    new PutCommand({
      TableName: SURVEYS_TABLE,
      Item: { ...existing, questions, updatedAt: new Date().toISOString() },
      ConditionExpression: 'attribute_exists(surveyId)',
    })
  );
};

// Implementación de ISurveyRepository usando las funciones
export const dynamoSurveyRepository: ISurveyRepository = {
  findAll,
  findById,
  create,
  update,
  delete: deleteSurvey,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};
