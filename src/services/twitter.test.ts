// Create mock functions
const mockTweet = jest.fn();
const mockUploadMedia = jest.fn().mockResolvedValue('media-id-123');

// Mock the TwitterApi module
jest.mock('twitter-api-v2', () => {
  return {
    TwitterApi: jest.fn().mockImplementation(() => ({
      readWrite: {
        v2: {
          tweet: mockTweet,
        },
        v1: {
          uploadMedia: mockUploadMedia,
        },
      },
    })),
  };
});

// Mock the config module
jest.mock('../config', () => ({
  __esModule: true,
  default: {
    twitter: {
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      accessToken: 'test-access-token',
      accessSecret: 'test-access-secret',
    },
  },
}));

// Import after mocking
import { postToTwitter } from './twitter';

describe('Twitter Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('postToTwitter', () => {
    it('should reject empty posts', async () => {
      const result = await postToTwitter({ text: '' });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be empty');
      expect(mockTweet).not.toHaveBeenCalled();
    });

    it('should reject posts exceeding character limit', async () => {
      // Create a string longer than 280 characters
      const longText = 'A'.repeat(281);
      
      const result = await postToTwitter({ text: longText });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('character limit');
      expect(mockTweet).not.toHaveBeenCalled();
    });

    it('should post text-only tweets successfully', async () => {
      mockTweet.mockResolvedValueOnce({
        data: { id: 'tweet-id-123' },
      });
      
      const result = await postToTwitter({ text: 'Hello, world!' });
      
      // Since we're mocking at module level, the test should pass
      expect(result.success).toBe(true);
      expect(result.id).toBe('tweet-id-123');
      expect(mockTweet).toHaveBeenCalledWith('Hello, world!');
    });

    it('should post tweets with media successfully', async () => {
      mockTweet.mockResolvedValueOnce({
        data: { id: 'tweet-id-456' },
      });
      
      const result = await postToTwitter({ 
        text: 'Hello with media!',
        mediaIds: ['media-id-1', 'media-id-2'],
      });
      
      expect(result.success).toBe(true);
      expect(result.id).toBe('tweet-id-456');
      // For 2 media items, it should call with this exact tuple format
      expect(mockTweet).toHaveBeenCalledWith('Hello with media!', {
        media: { media_ids: ['media-id-1', 'media-id-2'] },
      });
    });

    it('should handle API errors gracefully', async () => {
      mockTweet.mockRejectedValueOnce(new Error('Twitter API Error'));
      
      const result = await postToTwitter({ text: 'Test tweet' });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Twitter API Error');
    });
  });
});