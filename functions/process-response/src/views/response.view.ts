import { APIGatewayProxyResult } from 'aws-lambda';
import { SurveyResponse } from '../../../../shared/types';
import * as baseView from '../../../../shared/views/base.view';

// V (View) — serializa respuestas HTTP para el proceso de ingesta de respuestas
export class ResponseView {
  static submitted(response: SurveyResponse): APIGatewayProxyResult {
    return baseView.created({
      message: 'Response submitted successfully',
      responseId: response.responseId,
    });
  }

  static surveyNotFound(): APIGatewayProxyResult {
    return baseView.notFound('Survey not found or not published');
  }

  static validationError(errors: unknown): APIGatewayProxyResult {
    return baseView.badRequest('Validation failed', errors);
  }

  static ok(data: unknown): APIGatewayProxyResult {
    return baseView.ok(data);
  }

  static error(error: unknown): APIGatewayProxyResult {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return baseView.serverError(msg);
  }
}
