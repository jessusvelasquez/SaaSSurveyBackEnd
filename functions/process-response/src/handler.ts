import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ResponseController } from './controllers/response.controller';
import { ResponseService } from './services/response.service';
import { DynamoResponseRepository } from './models/response.repository';
import * as baseView from '../../../shared/views/base.view';

// Composición MVC (DIP) — el handler ensambla las dependencias
const repository = new DynamoResponseRepository();
const service = new ResponseService(repository);
const controller = new ResponseController(service);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod.toUpperCase();
  const path = event.resource;

  console.log(`[process-response] ${method} ${path}`);

  // POST /surveys/{surveyId}/responses
  if (method === 'POST' && path === '/surveys/{surveyId}/responses')
    return controller.submit(event);

  // GET /surveys/responses/user/{email}
  if (method === 'GET' && path === '/surveys/responses/user/{email}')
    return controller.getByUser(event);

  return baseView.notFound('Route not found');
};
