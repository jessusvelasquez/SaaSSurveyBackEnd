import { APIGatewayProxyResult } from 'aws-lambda';
import { Question, Survey } from '../../../../shared/types';
import * as baseView from '../../../../shared/views/base.view';

// V (View) — única responsabilidad: serializar respuestas HTTP para encuestas

export const list = (surveys: Survey[]): APIGatewayProxyResult => {
  return baseView.ok({ surveys, count: surveys.length });
};

export const detail = (survey: Survey): APIGatewayProxyResult => {
  return baseView.ok(survey);
};

export const created = (survey: Survey): APIGatewayProxyResult => {
  return baseView.created(survey);
};

export const updated = (survey: Survey): APIGatewayProxyResult => {
  return baseView.ok(survey);
};

export const deleted = (): APIGatewayProxyResult => {
  return baseView.noContent();
};

export const questionCreated = (question: Question): APIGatewayProxyResult => {
  return baseView.created(question);
};

export const questionUpdated = (question: Question): APIGatewayProxyResult => {
  return baseView.ok(question);
};

export const questionDeleted = (): APIGatewayProxyResult => {
  return baseView.noContent();
};

export const notFound = (resource = 'Survey'): APIGatewayProxyResult => {
  return baseView.notFound(`${resource} not found`);
};

export const validationError = (errors: unknown): APIGatewayProxyResult => {
  return baseView.badRequest('Validation failed', errors);
};

export const error = (error: unknown): APIGatewayProxyResult => {
  const msg = error instanceof Error ? error.message : 'Unknown error';
  return baseView.serverError(msg);
};

export const results = (results: any[]): APIGatewayProxyResult => {
  return baseView.ok({ results });
};
