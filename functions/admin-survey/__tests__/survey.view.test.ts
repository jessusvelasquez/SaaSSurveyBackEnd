import { describe, it, expect } from '@jest/globals';
import * as surveyView from '../src/views/survey.view';
import { Survey } from '../../../shared/types';

describe('SurveyView', () => {
  const mockSurvey: Survey = {
    surveyId: '123',
    ownerId: 'user-1',
    title: 'Test',
    description: 'Desc',
    isPublished: false,
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it('should format list response correctly', () => {
    const result = surveyView.list([mockSurvey]);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.surveys).toHaveLength(1);
    expect(body.count).toBe(1);
  });

  it('should format detail response correctly', () => {
    const result = surveyView.detail(mockSurvey);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockSurvey);
  });

  it('should format created response correctly', () => {
    const result = surveyView.created(mockSurvey);
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body).surveyId).toBe(mockSurvey.surveyId);
  });

  it('should format error response correctly', () => {
    const result = surveyView.error(new Error('Test Error'));
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('Test Error');
  });
});
