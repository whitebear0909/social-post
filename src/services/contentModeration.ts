import axios from 'axios';
import { ContentModerationResult, ContentCategory } from '../types';
import config from '../config';

// Categories to check with their thresholds
const CATEGORIES = {
  TOXICITY: 0.7,
  SEVERE_TOXICITY: 0.5,
  IDENTITY_ATTACK: 0.5,
  INSULT: 0.7,
  PROFANITY: 0.8,
  THREAT: 0.5,
};

/**
 * Checks content for problematic language using Google's Perspective API
 * @param text The text content to check
 * @returns A ContentModerationResult object
 */
export async function checkContent(text: string): Promise<ContentModerationResult> {
  try {
    // Skip empty content
    if (!text.trim()) {
      return {
        isProblematic: false,
        categories: [],
        score: 0,
        message: 'Empty content',
      };
    }

    // Prepare the request to Perspective API
    const response = await axios.post(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${config.contentModeration.apiKey}`,
      {
        comment: { text },
        languages: ['en'],
        requestedAttributes: Object.keys(CATEGORIES).reduce(
          (attrs, category) => ({
            ...attrs,
            [category]: {},
          }),
          {}
        ),
      }
    );

    // Process the response
    const categories: ContentCategory[] = [];
    let highestScore = 0;

    Object.entries(CATEGORIES).forEach(([categoryName, threshold]) => {
      const score = response.data.attributeScores[categoryName]?.summaryScore?.value || 0;
      
      // Track the highest score
      if (score > highestScore) {
        highestScore = score;
      }

      // Add category to results
      categories.push({
        name: categoryName,
        score,
        threshold,
        exceeded: score >= threshold,
      });
    });

    // Determine if content is problematic
    const problematicCategories = categories.filter((category) => category.exceeded);
    const isProblematic = problematicCategories.length > 0;

    // Create result message
    let message = isProblematic
      ? `Content flagged for: ${problematicCategories
          .map((c) => c.name.toLowerCase().replace('_', ' '))
          .join(', ')}`
      : 'Content appears safe';

    return {
      isProblematic,
      categories,
      score: highestScore,
      message,
    };
  } catch (error) {
    console.error('Error checking content:', error);
    
    // Return a safe default in case of API failure
    return {
      isProblematic: true, // Fail safe - assume problematic if we can't check
      categories: [],
      score: 1,
      message: 'Error checking content. To be safe, content is flagged as potentially problematic.',
    };
  }
}

/**
 * Provides a human-readable explanation of why content was flagged
 * @param result The content moderation result
 * @returns A string explaining the issues with the content
 */
export function explainContentIssues(result: ContentModerationResult): string {
  if (!result.isProblematic) {
    return 'No issues detected with this content.';
  }

  const problematicCategories = result.categories.filter((c) => c.exceeded);
  
  if (problematicCategories.length === 0) {
    return 'Content was flagged but specific issues could not be determined.';
  }

  const categoryExplanations: Record<string, string> = {
    TOXICITY: 'toxic or rude language',
    SEVERE_TOXICITY: 'very hateful, aggressive, or disrespectful language',
    IDENTITY_ATTACK: 'negative or hateful comments targeting identity',
    INSULT: 'insulting or negative comments',
    PROFANITY: 'swear words, curse words, or other obscene language',
    THREAT: 'threatening language or content that suggests violence',
  };

  const issues = problematicCategories.map((category) => {
    const explanation = categoryExplanations[category.name] || category.name.toLowerCase().replace('_', ' ');
    return `${explanation} (score: ${category.score.toFixed(2)})`;
  });

  return `This content may contain: ${issues.join(', ')}. Consider revising before posting.`;
}