import { CreateQuestionDto, UpdateQuestionDto, Answer, ValidationError } from '../types';

// Única fuente de verdad para validación de preguntas y respuestas (DRY + SRP)
export class QuestionValidator {
  static validateCreate(dto: CreateQuestionDto): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!dto.text?.trim())
      errors.push({ field: 'text', message: 'Question text is required' });

    if (!dto.type)
      errors.push({ field: 'type', message: 'Question type is required' });
    else if (!['single_choice', 'multiple_choice', 'text'].includes(dto.type))
      errors.push({ field: 'type', message: 'Invalid question type. Use: single_choice | multiple_choice | text' });

    if (dto.type !== 'text' && (!dto.options || dto.options.length < 2))
      errors.push({ field: 'options', message: 'Choice questions require at least 2 options' });

    return errors;
  }

  static validateUpdate(dto: UpdateQuestionDto): ValidationError[] {
    const errors: ValidationError[] = [];

    if (dto.type && !['single_choice', 'multiple_choice', 'text'].includes(dto.type))
      errors.push({ field: 'type', message: 'Invalid question type' });

    if (dto.type && dto.type !== 'text' && dto.options && dto.options.length < 2)
      errors.push({ field: 'options', message: 'Choice questions require at least 2 options' });

    return errors;
  }

  static validateAnswer(answer: Answer, questionType: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!answer.questionId)
      errors.push({ field: 'questionId', message: 'Question ID is required' });

    if (answer.value === undefined || answer.value === null || answer.value === '')
      errors.push({ field: 'value', message: 'Answer value is required' });

    if (questionType === 'multiple_choice' && !Array.isArray(answer.value))
      errors.push({ field: 'value', message: 'Multiple choice answer must be an array' });

    if (['single_choice', 'text'].includes(questionType) && typeof answer.value !== 'string')
      errors.push({ field: 'value', message: 'Answer must be a string' });

    return errors;
  }
}
