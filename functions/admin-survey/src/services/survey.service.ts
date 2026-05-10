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

export const getAllSurveys = (repo: ISurveyRepository): Promise<Survey[]> => {
  return repo.findAll();
};

export const getSurveyById = (
  repo: ISurveyRepository,
  surveyId: string
): Promise<Survey | null> => {
  return repo.findById(surveyId);
};

export const createSurvey = async (
  repo: ISurveyRepository,
  dto: CreateSurveyDto
): Promise<ValidationResult<{ survey: Survey }>> => {
  const errors = validateCreateSurvey(dto);
  if (errors.length > 0) return { errors };

  const survey = await repo.create(dto);
  return { survey };
};

export const updateSurvey = async (
  repo: ISurveyRepository,
  surveyId: string,
  dto: UpdateSurveyDto
): Promise<Survey | null> => {
  return repo.update(surveyId, dto);
};

export const deleteSurvey = (
  repo: ISurveyRepository,
  surveyId: string
): Promise<void> => {
  return repo.delete(surveyId);
};

// ─── Question Operations ──────────────────────────────────────────────────────

export const addQuestion = async (
  repo: ISurveyRepository,
  surveyId: string,
  dto: CreateQuestionDto
): Promise<ValidationResult<{ question: Question }>> => {
  const errors = QuestionValidator.validateCreate(dto);
  if (errors.length > 0) return { errors };

  // Regla de negocio: no se pueden agregar preguntas a encuestas publicadas
  const survey = await repo.findById(surveyId);
  if (!survey) throw new Error(`Survey ${surveyId} not found`);

  if (survey.isPublished) {
    return {
      errors: [{ field: 'surveyId', message: 'Cannot add questions to published surveys' }],
    };
  }

  const question = await repo.addQuestion(surveyId, dto);
  return { question };
};

export const updateQuestion = async (
  repo: ISurveyRepository,
  surveyId: string,
  questionId: string,
  dto: UpdateQuestionDto
): Promise<ValidationResult<{ question: Question }> | null> => {
  const errors = QuestionValidator.validateUpdate(dto);
  if (errors.length > 0) return { errors };

  const survey = await repo.findById(surveyId);
  if (!survey) return null;

  if (survey.isPublished) {
    return {
      errors: [{ field: 'surveyId', message: 'Cannot modify questions in published surveys' }],
    };
  }

  const question = await repo.updateQuestion(surveyId, questionId, dto);
  if (!question) return null;

  return { question };
};

export const deleteQuestion = async (
  repo: ISurveyRepository,
  surveyId: string,
  questionId: string
): Promise<void> => {
  // Regla de negocio: no se pueden eliminar preguntas de encuestas publicadas
  const survey = await repo.findById(surveyId);
  if (!survey) throw new Error(`Survey ${surveyId} not found`);

  if (survey.isPublished) {
    throw new Error('Cannot delete questions from published surveys');
  }

  return repo.deleteQuestion(surveyId, questionId);
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
