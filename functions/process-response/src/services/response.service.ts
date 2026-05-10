import { IResponseRepository } from '../../../../shared/repositories/response.repository.interface';
import { SubmitResponseDto, SurveyResponse } from '../../../../shared/types';

// S (Service) — lógica de negocio: recibir y persistir respuestas
export class ResponseService {
  constructor(private readonly repository: IResponseRepository) {}

  submitResponse(surveyId: string, dto: SubmitResponseDto): Promise<SurveyResponse> {
    return this.repository.save(surveyId, dto);
  }

  getUserResponses(email: string): Promise<SurveyResponse[]> {
    return this.repository.findByUserEmail(email);
  }
}
