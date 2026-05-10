import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as surveyController from './controllers/survey.controller';
import { dynamoSurveyRepository } from './models/survey.repository';
import * as baseView from '../../../shared/views/base.view';

// Composición de dependencias — el repositorio se crea una vez a nivel de módulo
// (reutilizado en invocaciones calientes de Lambda)
const repository = dynamoSurveyRepository;

type RouteHandler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

const routes: Record<string, Record<string, RouteHandler>> = {
  '/surveys': {
    GET: () => surveyController.list(repository),
    POST: (event) => surveyController.create(repository, event),
  },
  '/surveys/{surveyId}': {
    GET: (event) => surveyController.get(repository, event),
    PUT: (event) => surveyController.update(repository, event),
    DELETE: (event) => surveyController.remove(repository, event),
  },
  '/surveys/{surveyId}/question': {
    POST: (event) => surveyController.addQuestion(repository, event),
  },
  '/surveys/{surveyId}/question/{questionId}': {
    PUT: (event) => surveyController.updateQuestion(repository, event),
    DELETE: (event) => surveyController.removeQuestion(repository, event),
  },
  '/surveys/{surveyId}/results': {
    GET: (event) => surveyController.getResults(event),
  },
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod.toUpperCase();
  const path = event.resource;

  const routeHandlers = routes[path];
  if (!routeHandlers) {
    return baseView.notFound('Route not found');
  }

  const handler = routeHandlers[method];
  if (!handler) {
    return baseView.notFound('Method not allowed');
  }

  return handler(event);
};
