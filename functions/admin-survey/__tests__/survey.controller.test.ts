import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import * as surveyController from '../src/controllers/survey.controller';
import { ISurveyRepository } from '../../../shared/repositories/survey.repository.interface';

describe('SurveyController', () => {
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

  describe('list', () => {
    it('should call getPublicSurveys and return 200 if no email in token', async () => {
      const mockEvent: any = {
        requestContext: { authorizer: { claims: {} } }
      };
      mockRepo.findPublic.mockResolvedValue([]);
      const result = await surveyController.list(mockRepo, mockEvent);
      expect(result.statusCode).toBe(200);
    });

    it('should call getAllSurveys and return 200 if email is present', async () => {
      const mockEvent: any = {
        requestContext: { authorizer: { claims: { email: 'admin@test.com' } } }
      };
      mockRepo.findAll.mockResolvedValue([]);
      const result = await surveyController.list(mockRepo, mockEvent);
      expect(result.statusCode).toBe(200);
      expect(mockRepo.findAll).toHaveBeenCalledWith('admin@test.com');
    });
  });

  describe('create', () => {
    it('should return 201 when survey is created successfully', async () => {
      const mockEvent: any = {
        requestContext: { authorizer: { claims: { email: 'admin@test.com' } } },
        body: JSON.stringify({ title: 'New Survey' })
      };
      mockRepo.create.mockResolvedValue({ surveyId: 's1' } as any);
      const result = await surveyController.create(mockRepo, mockEvent);
      expect(result.statusCode).toBe(201);
    });
  });

  describe('get', () => {
    it('should return 200 if survey is found by admin', async () => {
      const mockEvent: any = {
        requestContext: { authorizer: { claims: { email: 'admin@test.com' } } },
        pathParameters: { surveyId: 's1' }
      };
      mockRepo.findById.mockResolvedValue({ surveyId: 's1', ownerId: 'admin@test.com' } as any);
      const result = await surveyController.get(mockRepo, mockEvent);
      expect(result.statusCode).toBe(200);
    });

    it('should return 404 if survey is not found', async () => {
      const mockEvent: any = {
        requestContext: { authorizer: { claims: { email: 'admin@test.com' } } },
        pathParameters: { surveyId: 'none' }
      };
      mockRepo.findById.mockResolvedValue(null);
      const result = await surveyController.get(mockRepo, mockEvent);
      expect(result.statusCode).toBe(404);
    });
  });
});
