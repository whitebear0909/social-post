import axios from 'axios';
import { checkContent, explainContentIssues } from './contentModeration';
import { ContentModerationResult } from '../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock config
jest.mock('../config', () => ({
  __esModule: true,
  default: {
    contentModeration: {
      apiKey: 'test-api-key',
    },
  },
}));

describe('Content Moderation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkContent', () => {
    it('should return non-problematic result for empty content', async () => {
      const result = await checkContent('');
      
      expect(result.isProblematic).toBe(false);
      expect(result.score).toBe(0);
      expect(result.message).toContain('Empty content');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should return problematic result when toxicity exceeds threshold', async () => {
      // Mock Perspective API response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          attributeScores: {
            TOXICITY: {
              summaryScore: { value: 0.9 },
            },
            SEVERE_TOXICITY: {
              summaryScore: { value: 0.2 },
            },
            IDENTITY_ATTACK: {
              summaryScore: { value: 0.1 },
            },
            INSULT: {
              summaryScore: { value: 0.3 },
            },
            PROFANITY: {
              summaryScore: { value: 0.4 },
            },
            THREAT: {
              summaryScore: { value: 0.1 },
            },
          },
        },
      });

      const result = await checkContent('This is a test message');
      
      expect(result.isProblematic).toBe(true);
      expect(result.score).toBe(0.9);
      expect(result.message).toContain('toxicity');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should return non-problematic result when all scores are below thresholds', async () => {
      // Mock Perspective API response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          attributeScores: {
            TOXICITY: {
              summaryScore: { value: 0.1 },
            },
            SEVERE_TOXICITY: {
              summaryScore: { value: 0.1 },
            },
            IDENTITY_ATTACK: {
              summaryScore: { value: 0.1 },
            },
            INSULT: {
              summaryScore: { value: 0.1 },
            },
            PROFANITY: {
              summaryScore: { value: 0.1 },
            },
            THREAT: {
              summaryScore: { value: 0.1 },
            },
          },
        },
      });

      const result = await checkContent('This is a friendly message');
      
      expect(result.isProblematic).toBe(false);
      expect(result.score).toBe(0.1);
      expect(result.message).toContain('safe');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      const result = await checkContent('Test message');
      
      expect(result.isProblematic).toBe(true); // Fail safe
      expect(result.score).toBe(1);
      expect(result.message).toContain('Error checking content');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('explainContentIssues', () => {
    it('should return no issues message for non-problematic content', () => {
      const result: ContentModerationResult = {
        isProblematic: false,
        categories: [],
        score: 0,
      };

      const explanation = explainContentIssues(result);
      expect(explanation).toContain('No issues detected');
    });

    it('should explain problematic categories', () => {
      const result: ContentModerationResult = {
        isProblematic: true,
        categories: [
          { name: 'TOXICITY', score: 0.8, threshold: 0.7, exceeded: true },
          { name: 'INSULT', score: 0.9, threshold: 0.7, exceeded: true },
          { name: 'PROFANITY', score: 0.5, threshold: 0.8, exceeded: false },
        ],
        score: 0.9,
      };

      const explanation = explainContentIssues(result);
      expect(explanation).toContain('toxic or rude language');
      expect(explanation).toContain('insulting or negative comments');
      expect(explanation).not.toContain('profanity');
    });
  });
});