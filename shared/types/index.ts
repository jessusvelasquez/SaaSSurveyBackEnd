// ─── Question ─────────────────────────────────────────────────────────────────
export type QuestionType = 'single_choice' | 'multiple_choice' | 'text';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  surveyId: string;
  text: string;
  type: QuestionType;
  order: number;
  options: QuestionOption[];
}

// ─── Survey ───────────────────────────────────────────────────────────────────
export interface Survey {
  surveyId: string;
  ownerId: string;
  title: string;
  description: string;
  questions: Question[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateSurveyDto {
  title: string;
  description?: string;
}

export interface UpdateSurveyDto {
  title?: string;
  description?: string;
  isPublished?: boolean;
}

export interface CreateQuestionDto {
  text: string;
  type: QuestionType;
  order?: number;
  options?: QuestionOption[];
}

export interface UpdateQuestionDto {
  text?: string;
  type?: QuestionType;
  order?: number;
  options?: QuestionOption[];
}

// ─── Response ─────────────────────────────────────────────────────────────────
export interface Answer {
  questionId: string;
  value: string | string[];
}

export interface SubmitResponseDto {
  answers: Answer[];
  userEmail: string;
}

export interface SurveyResponse {
  responseId: string;
  surveyId: string;
  userEmail: string;
  answers: Answer[];
  submittedAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface QuestionAnalytics {
  surveyId: string;
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  totalResponses: number;
  aggregatedData: Record<string, number>;
  updatedAt: string;
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
