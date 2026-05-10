import { Survey, Question, CreateSurveyDto, UpdateSurveyDto, CreateQuestionDto, UpdateQuestionDto } from '../types';

// ISP: lecturas y escrituras definidas en una interfaz por entidad
export interface ISurveyRepository {
  findAll(): Promise<Survey[]>;
  findById(surveyId: string): Promise<Survey | null>;
  create(dto: CreateSurveyDto): Promise<Survey>;
  update(surveyId: string, dto: UpdateSurveyDto): Promise<Survey | null>;
  delete(surveyId: string): Promise<void>;
  addQuestion(surveyId: string, dto: CreateQuestionDto): Promise<Question>;
  updateQuestion(surveyId: string, questionId: string, dto: UpdateQuestionDto): Promise<Question | null>;
  deleteQuestion(surveyId: string, questionId: string): Promise<void>;
}
