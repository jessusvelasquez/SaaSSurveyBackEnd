import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import * as surveyService from '../src/services/survey.service';
import { ISurveyRepository } from '../../../shared/repositories/survey.repository.interface';
import { CreateQuestionDto } from '../../../shared/types';

describe('SurveyService', () => {
  let mockRepo: jest.Mocked<ISurveyRepository>;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      findPublic: jest.fn(),
      findById: jest.fn(),
      findAnyById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addQuestion: jest.fn(),
      updateQuestion: jest.fn(),
      deleteQuestion: jest.fn(),
    } as any;
  });

  describe('addQuestion', () => {
    it('should return error if survey is already published', async () => {
      const surveyId = '123';
      const userId = 'user-1';
      const dto: CreateQuestionDto = { text: 'New Question', type: 'text', order: 0 };
      
      mockRepo.findById.mockResolvedValue({
        surveyId,
        ownerId: userId,
        title: 'Published Survey',
        description: '',
        isPublished: true,
        questions: [],
        createdAt: '',
        updatedAt: ''
      });

      const result = await surveyService.addQuestion(mockRepo, surveyId, userId, dto);

      expect(result).toHaveProperty('errors');
      expect(mockRepo.addQuestion).not.toHaveBeenCalled();
    });

    it('should call repository if survey is not published', async () => {
      const surveyId = '123';
      const userId = 'user-1';
      const dto: CreateQuestionDto = { text: 'New Question', type: 'text', order: 0 };
      const mockQuestion: any = { ...dto, id: 'q1', surveyId, order: 0, options: [] };

      mockRepo.findById.mockResolvedValue({
        surveyId,
        ownerId: userId,
        title: 'Draft Survey',
        description: '',
        isPublished: false,
        questions: [],
        createdAt: '',
        updatedAt: ''
      });
      mockRepo.addQuestion.mockResolvedValue(mockQuestion);

      const result = await surveyService.addQuestion(mockRepo, surveyId, userId, dto);

      expect(result).toEqual({ question: mockQuestion });
      expect(mockRepo.addQuestion).toHaveBeenCalledWith(surveyId, userId, dto);
    });
  });

  describe('List Operations', () => {
    it('should call findAll for admin in getAllSurveys', async () => {
      const userId = 'admin@test.com';
      await surveyService.getAllSurveys(mockRepo, userId);
      expect(mockRepo.findAll).toHaveBeenCalledWith(userId);
    });

    it('should call findPublic in getPublicSurveys', async () => {
      await surveyService.getPublicSurveys(mockRepo);
      expect(mockRepo.findPublic).toHaveBeenCalled();
    });
  });

  describe('createSurvey', () => {
    it('should call repository.create with ownerId', async () => {
      const userId = 'user-123';
      const dto = { title: 'New Survey' };
      await surveyService.createSurvey(mockRepo, userId, dto);
      expect(mockRepo.create).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('updateQuestion', () => {
    it('should return error if trying to update question of a published survey', async () => {
      const surveyId = 's1';
      const qId = 'q1';
      const userId = 'u1';
      mockRepo.findById.mockResolvedValue({ isPublished: true } as any);

      const result = await surveyService.updateQuestion(mockRepo, surveyId, qId, userId, { text: 'Updated' });
      
      expect(result).toHaveProperty('errors');
      expect(mockRepo.updateQuestion).not.toHaveBeenCalled();
    });
  });

  describe('Delete Operations', () => {
    it('should call repository delete in deleteSurvey', async () => {
      const sId = 's1';
      const uId = 'u1';
      await surveyService.deleteSurvey(mockRepo, sId, uId);
      expect(mockRepo.delete).toHaveBeenCalledWith(sId, uId);
    });

    it('should throw error if trying to delete question of a published survey', async () => {
      mockRepo.findById.mockResolvedValue({ isPublished: true } as any);
      await expect(
        surveyService.deleteQuestion(mockRepo, 's1', 'q1', 'u1')
      ).rejects.toThrow('Cannot delete questions from published surveys');
    });
  });
});
