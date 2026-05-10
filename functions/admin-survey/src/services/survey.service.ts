import { ISurveyRepository } from '../../../../shared/repositories/survey.repository.interface';
import {
  CreateQuestionDto,
  CreateSurveyDto,
  Question,
  Survey,
  UpdateQuestionDto,
  UpdateSurveyDto,
  ValidationError,
} from '../../../../shared/types';
import { QuestionValidator } from '../../../../shared/validators/question.validator';

// S (Service) — lógica de negocio pura, sin conocimiento de HTTP ni DynamoDB

type ValidationResult<T> = { errors: ValidationError[] } | T;

// ─── Survey Operations ────────────────────────────────────────────────────────

export const getAllSurveys = (repo: ISurveyRepository, userId: string): Promise<Survey[]> => {
  return repo.findAll(userId);
};

export const getPublicSurveys = (repo: ISurveyRepository): Promise<Survey[]> => {
  return repo.findPublic();
};

export const getSurveyById = (
  repo: ISurveyRepository,
  surveyId: string,
  userId: string
): Promise<Survey | null> => {
  return repo.findById(surveyId, userId);
};

export const getSurveyForPublic = async (
  repo: ISurveyRepository,
  surveyId: string
): Promise<Survey | null> => {
  const survey = await repo.findAnyById(surveyId);
  if (survey && survey.isPublished) return survey;
  return null;
};

export const createSurvey = async (
  repo: ISurveyRepository,
  userId: string,
  dto: CreateSurveyDto
): Promise<ValidationResult<{ survey: Survey }>> => {
  const errors = validateCreateSurvey(dto);
  if (errors.length > 0) return { errors };

  const survey = await repo.create(userId, dto);
  return { survey };
};

export const updateSurvey = async (
  repo: ISurveyRepository,
  surveyId: string,
  userId: string,
  dto: UpdateSurveyDto
): Promise<Survey | null> => {
  return repo.update(surveyId, userId, dto);
};

export const deleteSurvey = (
  repo: ISurveyRepository,
  surveyId: string,
  userId: string
): Promise<void> => {
  return repo.delete(surveyId, userId);
};

// ─── Question Operations ──────────────────────────────────────────────────────

export const addQuestion = async (
  repo: ISurveyRepository,
  surveyId: string,
  userId: string,
  dto: CreateQuestionDto
): Promise<ValidationResult<{ question: Question }>> => {
  const errors = QuestionValidator.validateCreate(dto);
  if (errors.length > 0) return { errors };

  // Regla de negocio: no se pueden agregar preguntas a encuestas publicadas
  const survey = await repo.findById(surveyId, userId);
  if (!survey) throw new Error(`Survey ${surveyId} not found`);

  if (survey.isPublished) {
    return {
      errors: [{ field: 'surveyId', message: 'Cannot add questions to published surveys' }],
    };
  }

  const question = await repo.addQuestion(surveyId, userId, dto);
  return { question };
};

export const updateQuestion = async (
  repo: ISurveyRepository,
  surveyId: string,
  questionId: string,
  userId: string,
  dto: UpdateQuestionDto
): Promise<ValidationResult<{ question: Question }> | null> => {
  const errors = QuestionValidator.validateUpdate(dto);
  if (errors.length > 0) return { errors };

  const survey = await repo.findById(surveyId, userId);
  if (!survey) return null;

  if (survey.isPublished) {
    return {
      errors: [{ field: 'surveyId', message: 'Cannot modify questions in published surveys' }],
    };
  }

  const question = await repo.updateQuestion(surveyId, questionId, userId, dto);
  if (!question) return null;

  return { question };
};

export const deleteQuestion = async (
  repo: ISurveyRepository,
  surveyId: string,
  questionId: string,
  userId: string
): Promise<void> => {
  // Regla de negocio: no se pueden eliminar preguntas de encuestas publicadas
  const survey = await repo.findById(surveyId, userId);
  if (!survey) throw new Error(`Survey ${surveyId} not found`);

  if (survey.isPublished) {
    throw new Error('Cannot delete questions from published surveys');
  }

  return repo.deleteQuestion(surveyId, questionId, userId);
};

// ─── Validaciones de negocio ──────────────────────────────────────────────────

const validateCreateSurvey = (dto: CreateSurveyDto): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!dto.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (dto.title && dto.title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be 200 characters or less' });
  }

  if (dto.description && dto.description.length > 1000) {
    errors.push({ field: 'description', message: 'Description must be 1000 characters or less' });
  }

  return errors;
};

export const getSurveyResults = async (surveyId: string) => {
  const { findResultsBySurveyId } = await import('../models/analytics.model');
  return findResultsBySurveyId(surveyId);
};
