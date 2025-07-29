import { checkContent, explainContentIssues } from '../services/contentModeration';
import { ContentModerationResult } from '../types';

/**
 * Analyzes content and provides detailed feedback
 * @param text The content to analyze
 * @returns Analysis result with detailed feedback
 */
export async function analyzeContent(text: string): Promise<{
  result: ContentModerationResult;
  feedback: string;
  canPost: boolean;
}> {
  // Check the content
  const result = await checkContent(text);
  
  // Generate detailed feedback
  const feedback = result.isProblematic 
    ? explainContentIssues(result)
    : 'Content appears safe to post.';
  
  // Determine if content can be posted
  const canPost = !result.isProblematic;
  
  return {
    result,
    feedback,
    canPost,
  };
}

/**
 * Suggests improvements for problematic content
 * @param text The original content
 * @param result The moderation result
 * @returns Suggestions for improving the content
 */
export function suggestImprovements(text: string, result: ContentModerationResult): string[] {
  if (!result.isProblematic) {
    return ['No improvements needed. Content appears safe to post.'];
  }
  
  const suggestions: string[] = [];
  const problematicCategories = result.categories.filter(c => c.exceeded);
  
  // Add general suggestion
  suggestions.push('Consider revising your content to address the following issues:');
  
  // Add category-specific suggestions
  problematicCategories.forEach(category => {
    switch(category.name) {
      case 'TOXICITY':
      case 'SEVERE_TOXICITY':
        suggestions.push('• Use more neutral or positive language');
        suggestions.push('• Express your point without aggressive or hostile tone');
        break;
      case 'IDENTITY_ATTACK':
        suggestions.push('• Avoid references to identity characteristics (race, gender, religion, etc.)');
        suggestions.push('• Focus on ideas rather than personal attributes');
        break;
      case 'INSULT':
        suggestions.push('• Rephrase critical points constructively');
        suggestions.push('• Focus on actions or ideas rather than personal attacks');
        break;
      case 'PROFANITY':
        suggestions.push('• Replace profanity with more appropriate language');
        suggestions.push('• Consider if your point can be made without strong language');
        break;
      case 'THREAT':
        suggestions.push('• Remove any language that could be perceived as threatening');
        suggestions.push('• Express disagreement or frustration without implying harm');
        break;
      default:
        suggestions.push(`• Review content for ${category.name.toLowerCase().replace('_', ' ')}`);
    }
  });
  
  return suggestions;
}