// Content moderation result types
export interface ContentModerationResult {
  isProblematic: boolean;
  categories: ContentCategory[];
  score: number;
  message?: string;
}

export interface ContentCategory {
  name: string;
  score: number;
  threshold: number;
  exceeded: boolean;
}

// Twitter post types
export interface TwitterPost {
  text: string;
  mediaIds?: string[];
}

export interface TwitterPostResult {
  success: boolean;
  id?: string;
  error?: string;
}

// Configuration types
export interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
}

export interface ContentModerationConfig {
  apiKey: string;
}

export interface AppConfig {
  twitter: TwitterConfig;
  contentModeration: ContentModerationConfig;
}