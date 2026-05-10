import { Survey, Question, CreateSurveyDto, UpdateSurveyDto, CreateQuestionDto, UpdateQuestionDto } from '../types';

// ISP: lecturas y escrituras definidas en una interfaz por entidad
export interface ISurveyRepository {
  findAll(userId: string): Promise<Survey[]>;
  findPublic(): Promise<Survey[]>;
  findById(surveyId: string, userId: string): Promise<Survey | null>;
  findAnyById(surveyId: string): Promise<Survey | null>;
  create(userId: string, dto: CreateSurveyDto): Promise<Survey>;
  update(surveyId: string, userId: string, dto: UpdateSurveyDto): Promise<Survey | null>;
  delete(surveyId: string, userId: string): Promise<void>;
  addQuestion(surveyId: string, userId: string, dto: CreateQuestionDto): Promise<Question>;
  updateQuestion(surveyId: string, questionId: string, userId: string, dto: UpdateQuestionDto): Promise<Question | null>;
  deleteQuestion(surveyId: string, questionId: string, userId: string): Promise<void>;
}
