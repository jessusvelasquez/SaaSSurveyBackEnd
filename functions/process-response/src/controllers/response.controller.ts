import { APIGatewayProxyEvent } from 'aws-lambda';
import { QuestionValidator } from '../../../../shared/validators/question.validator';
import { SubmitResponseDto } from '../../../../shared/types';
import { ResponseService } from '../services/response.service';
import { ResponseView } from '../views/response.view';

// C (Controller) — parsea evento, valida respuestas con QuestionValidator y orquesta
export class ResponseController {
  constructor(private readonly service: ResponseService) { }

  async submit(event: APIGatewayProxyEvent) {
    try {
      const surveyId = event.pathParameters?.surveyId ?? event.pathParameters?.id;
      if (!surveyId)
        return ResponseView.validationError([{ field: 'surveyId', message: 'Required in path' }]);

      const body = JSON.parse(event.body ?? '{}') as SubmitResponseDto;

      if (!Array.isArray(body.answers) || body.answers.length === 0)
        return ResponseView.validationError([{ field: 'answers', message: 'At least one answer is required' }]);

      // Valida cada respuesta con el QuestionValidator compartido (DRY)
      const allErrors = body.answers.flatMap((answer) =>
        QuestionValidator.validateAnswer(answer, typeof answer.value === 'string' ? 'text' : 'multiple_choice')
      );
      if (allErrors.length) return ResponseView.validationError(allErrors);

      const response = await this.service.submitResponse(surveyId, body);
      return ResponseView.submitted(response);
    } catch (e) {
      return ResponseView.error(e);
    }
  }

  async getByUser(event: APIGatewayProxyEvent) {
    try {
      const email = event.pathParameters?.email;
      if (!email) return ResponseView.validationError([{ field: 'email', message: 'Required' }]);

      const responses = await this.service.getUserResponses(decodeURIComponent(email));
      return ResponseView.ok({ responses });
    } catch (e) {
      return ResponseView.error(e);
    }
  }
}
