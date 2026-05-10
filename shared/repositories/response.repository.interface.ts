import { SurveyResponse, SubmitResponseDto } from '../types';

export interface IResponseRepository {
  save(surveyId: string, dto: SubmitResponseDto): Promise<SurveyResponse>;
  findBySurveyId(surveyId: string): Promise<SurveyResponse[]>;
  findByUserEmail(email: string): Promise<SurveyResponse[]>;
}
