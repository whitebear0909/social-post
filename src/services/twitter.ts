import { TwitterApi } from 'twitter-api-v2';
import { TwitterPost, TwitterPostResult } from '../types';
import config from '../config';

// Create a Twitter client instance
const twitterClient = new TwitterApi({
  appKey: config.twitter.apiKey,
  appSecret: config.twitter.apiSecret,
  accessToken: config.twitter.accessToken,
  accessSecret: config.twitter.accessSecret,
});

// Get the read-write client
const rwClient = twitterClient.readWrite;

/**
 * Posts content to Twitter
 * @param post The content to post
 * @returns Result of the posting operation
 */
export async function postToTwitter(post: TwitterPost): Promise<TwitterPostResult> {
  try {
    // Validate the post content
    if (!post.text || post.text.trim() === '') {
      return {
        success: false,
        error: 'Post text cannot be empty',
      };
    }

    // Check if the post exceeds Twitter's character limit
    if (post.text.length > 280) {
      return {
        success: false,
        error: `Post exceeds Twitter's 280 character limit (${post.text.length} characters)`,
      };
    }

    // Create the tweet
    try {
      let response;
      
      if (post.mediaIds && post.mediaIds.length > 0) {
        // Post with media - Twitter API v2 expects specific tuple format
        // Convert array to proper format for the API (up to 4 items)
        const mediaCount = Math.min(post.mediaIds.length, 4);
        
        // Use proper format based on Twitter API v2 requirements
        // The API expects a tuple with specific length (1-4 items)
        if (mediaCount === 1) {
          response = await rwClient.v2.tweet(post.text, {
            media: { media_ids: [post.mediaIds[0]] }
          });
        } else if (mediaCount === 2) {
          response = await rwClient.v2.tweet(post.text, {
            media: { media_ids: [post.mediaIds[0], post.mediaIds[1]] }
          });
        } else if (mediaCount === 3) {
          response = await rwClient.v2.tweet(post.text, {
            media: { media_ids: [post.mediaIds[0], post.mediaIds[1], post.mediaIds[2]] }
          });
        } else if (mediaCount === 4) {
          response = await rwClient.v2.tweet(post.text, {
            media: { media_ids: [post.mediaIds[0], post.mediaIds[1], post.mediaIds[2], post.mediaIds[3]] }
          });
        } else {
          // Fallback to text-only if media count is somehow 0
          response = await rwClient.v2.tweet(post.text);
        }
      } else {
        // Post text only
        response = await rwClient.v2.tweet(post.text);
      }

      return {
        success: true,
        id: response.data.id,
      };
    } catch (error) {
      // This catch block will handle any errors in the try block
      throw error;
    }
  } catch (error: any) {
    console.error('Error posting to Twitter:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred while posting to Twitter',
    };
  }
}

/**
 * Uploads media to Twitter for use in tweets
 * @param mediaPath Path to the media file
 * @returns Media ID if successful, null otherwise
 */
export async function uploadMedia(mediaPath: string): Promise<string | null> {
  try {
    const mediaId = await rwClient.v1.uploadMedia(mediaPath);
    return mediaId;
  } catch (error) {
    console.error('Error uploading media to Twitter:', error);
    return null;
  }
}