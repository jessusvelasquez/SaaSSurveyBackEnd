import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ISurveyRepository } from '../../../../shared/repositories/survey.repository.interface';
import { CreateQuestionDto, CreateSurveyDto, UpdateQuestionDto, UpdateSurveyDto } from '../../../../shared/types';
import * as surveyService from '../services/survey.service';
import * as surveyView from '../views/survey.view';

// C (Controller) — parsea el evento HTTP, extrae parámetros y delega al service
// Sin lógica de negocio ni conocimiento de DynamoDB

export const list = async (
  repo: ISurveyRepository
): Promise<APIGatewayProxyResult> => {
  try {
    const surveys = await surveyService.getAllSurveys(repo);
    return surveyView.list(surveys);
  } catch (e) {
    return surveyView.error(e);
  }
};

export const get = async (
  repo: ISurveyRepository,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const surveyId = event.pathParameters?.surveyId;
    if (!surveyId) return surveyView.validationError([{ field: 'surveyId', message: 'Required' }]);

    const survey = await surveyService.getSurveyById(repo, surveyId);
    return survey ? surveyView.detail(survey) : surveyView.notFound();
  } catch (e) {
    return surveyView.error(e);
  }
};

export const create = async (
  repo: ISurveyRepository,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body ?? '{}') as CreateSurveyDto;
    const result = await surveyService.createSurvey(repo, body);

    if ('errors' in result) return surveyView.validationError(result.errors);
    return surveyView.created(result.survey);
  } catch (e) {
    return surveyView.error(e);
  }
};

export const update = async (
  repo: ISurveyRepository,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const surveyId = event.pathParameters?.surveyId;
    if (!surveyId) return surveyView.validationError([{ field: 'surveyId', message: 'Required' }]);

    const body = JSON.parse(event.body ?? '{}') as UpdateSurveyDto;
    const survey = await surveyService.updateSurvey(repo, surveyId, body);
    return survey ? surveyView.updated(survey) : surveyView.notFound();
  } catch (e) {
    return surveyView.error(e);
  }
};

export const remove = async (
  repo: ISurveyRepository,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const surveyId = event.pathParameters?.surveyId;
    if (!surveyId) return surveyView.validationError([{ field: 'surveyId', message: 'Required' }]);

    await surveyService.deleteSurvey(repo, surveyId);
    return surveyView.deleted();
  } catch (e) {
    return surveyView.error(e);
  }
};

export const addQuestion = async (
  repo: ISurveyRepository,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const surveyId = event.pathParameters?.surveyId;
    if (!surveyId) return surveyView.validationError([{ field: 'surveyId', message: 'Required' }]);

    const body = JSON.parse(event.body ?? '{}') as CreateQuestionDto;
    const result = await surveyService.addQuestion(repo, surveyId, body);

    if ('errors' in result) return surveyView.validationError(result.errors);
    return surveyView.questionCreated(result.question);
  } catch (e) {
    return surveyView.error(e);
  }
};

export const updateQuestion = async (
  repo: ISurveyRepository,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const surveyId = event.pathParameters?.surveyId;
    const questionId = event.pathParameters?.questionId;

    if (!surveyId || !questionId)
      return surveyView.validationError([{ field: 'params', message: 'surveyId and questionId are required' }]);

    const body = JSON.parse(event.body ?? '{}') as UpdateQuestionDto;
    const result = await surveyService.updateQuestion(repo, surveyId, questionId, body);

    if (!result) return surveyView.notFound('Question');
    if ('errors' in result) return surveyView.validationError(result.errors);

    return surveyView.questionUpdated(result.question);
  } catch (e) {
    return surveyView.error(e);
  }
};

export const removeQuestion = async (
  repo: ISurveyRepository,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const surveyId = event.pathParameters?.surveyId;
    const questionId = event.pathParameters?.questionId;
    if (!surveyId || !questionId)
      return surveyView.validationError([{ field: 'params', message: 'surveyId and questionId are required' }]);

    await surveyService.deleteQuestion(repo, surveyId, questionId);
    return surveyView.questionDeleted();
  } catch (e) {
    return surveyView.error(e);
  }
};

export const getResults = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const surveyId = event.pathParameters?.surveyId;
    if (!surveyId) return surveyView.validationError([{ field: 'surveyId', message: 'Required' }]);

    const results = await surveyService.getSurveyResults(surveyId);
    return surveyView.results(results);
  } catch (e) {
    return surveyView.error(e);
  }
};
