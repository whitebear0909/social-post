import { analyzeContent, suggestImprovements } from './utils/contentAnalyzer';
import { postToTwitter } from './services/twitter';
import { TwitterPost } from './types';

/**
 * Main function to check content and post to Twitter if safe
 * @param content The content to check and post
 * @param options Additional options (force posting even if problematic)
 * @returns Result of the operation
 */
export async function checkAndPost(
  content: string,
  options: { forcePost?: boolean; mediaIds?: string[] } = {}
): Promise<{
  posted: boolean;
  problematic: boolean;
  feedback: string;
  tweetId?: string;
  error?: string;
}> {
  try {
    // Analyze the content
    const analysis = await analyzeContent(content);
    
    // If content is problematic and not forcing post, return feedback
    if (analysis.result.isProblematic && !options.forcePost) {
      const suggestions = suggestImprovements(content, analysis.result);
      
      return {
        posted: false,
        problematic: true,
        feedback: `${analysis.feedback}\n\n${suggestions.join('\n')}`,
      };
    }
    
    // Prepare the post
    const post: TwitterPost = {
      text: content,
      mediaIds: options.mediaIds,
    };
    
    // Post to Twitter
    const postResult = await postToTwitter(post);
    
    if (!postResult.success) {
      return {
        posted: false,
        problematic: analysis.result.isProblematic,
        feedback: analysis.feedback,
        error: postResult.error,
      };
    }
    
    // Return successful result
    return {
      posted: true,
      problematic: analysis.result.isProblematic,
      feedback: analysis.result.isProblematic
        ? `Content was posted despite being flagged: ${analysis.feedback}`
        : 'Content was posted successfully.',
      tweetId: postResult.id,
    };
  } catch (error: any) {
    return {
      posted: false,
      problematic: false,
      feedback: 'An error occurred while processing your request.',
      error: error.message || 'Unknown error',
    };
  }
}

// Export other functions for use in applications
export { analyzeContent, suggestImprovements } from './utils/contentAnalyzer';
export { checkContent, explainContentIssues } from './services/contentModeration';
export { postToTwitter, uploadMedia } from './services/twitter';

// If this file is run directly, show usage example
if (require.main === module) {
  console.log('Social Post - Content Moderation for Twitter');
  console.log('-------------------------------------------');
  console.log('This module is intended to be used as a library.');
  console.log('Example usage:');
  console.log('```');
  console.log('import { checkAndPost } from \'social-post\';');
  console.log('');
  console.log('const result = await checkAndPost(\'Hello, world!\');');
  console.log('if (result.posted) {');
  console.log('  console.log(`Tweet posted with ID: ${result.tweetId}`);');
  console.log('} else {');
  console.log('  console.log(`Tweet not posted: ${result.feedback}`);');
  console.log('}');
  console.log('```');
}