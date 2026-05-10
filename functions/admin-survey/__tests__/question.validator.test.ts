import { describe, it, expect } from '@jest/globals';
import { QuestionValidator } from '../../../shared/validators/question.validator';

describe('QuestionValidator', () => {
  describe('validateCreate', () => {
    it('should return error if text is empty', () => {
      const errors = QuestionValidator.validateCreate({ text: '', type: 'text' });
      expect(errors).toContainEqual({ field: 'text', message: 'Question text is required' });
    });

    it('should return error if choice question has no options', () => {
      const errors = QuestionValidator.validateCreate({ 
        text: 'Fav color?', 
        type: 'single_choice', 
        options: [] 
      });
      expect(errors).toContainEqual({ field: 'options', message: 'Choice questions require at least 2 options' });
    });

    it('should return no errors for valid text question', () => {
      const errors = QuestionValidator.validateCreate({ text: 'How are you?', type: 'text' });
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateAnswer', () => {
    it('should validate multiple_choice must be array', () => {
      const errors = QuestionValidator.validateAnswer(
        { questionId: 'q1', value: 'not-an-array' }, 
        'multiple_choice'
      );
      expect(errors).toContainEqual({ field: 'value', message: 'Multiple choice answer must be an array' });
    });

    it('should validate single_choice must be string', () => {
      const errors = QuestionValidator.validateAnswer(
        { questionId: 'q1', value: ['array'] }, 
        'single_choice'
      );
      expect(errors).toContainEqual({ field: 'value', message: 'Answer must be a string' });
    });
  });
});
