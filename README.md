# Social Post

A TypeScript library for detecting and flagging problematic content before posting to Twitter.

## Features

- Content moderation using Google's Perspective API
- Integration with Twitter API for posting
- Detailed feedback on problematic content
- Suggestions for improving flagged content
- TypeScript support with full type definitions

## Installation

```bash
npm install social-post
```

## Configuration

Create a `.env` file in your project root with the following variables:

```
# Twitter API Credentials
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret

# Content Moderation API (using Perspective API)
PERSPECTIVE_API_KEY=your_perspective_api_key
```

## Usage

### Basic Usage

```typescript
import { checkAndPost } from 'social-post';

async function postTweet() {
  const result = await checkAndPost('Hello, world!');
  
  if (result.posted) {
    console.log(`Tweet posted with ID: ${result.tweetId}`);
  } else {
    console.log(`Tweet not posted: ${result.feedback}`);
  }
}
```

### Analyzing Content Without Posting

```typescript
import { analyzeContent } from 'social-post';

async function checkContent() {
  const analysis = await analyzeContent('This is a test message');
  
  console.log(`Problematic: ${analysis.result.isProblematic}`);
  console.log(`Feedback: ${analysis.feedback}`);
  console.log(`Can Post: ${analysis.canPost}`);
}
```

### Forcing a Post Despite Issues

```typescript
import { checkAndPost } from 'social-post';

async function forcePost() {
  const result = await checkAndPost(
    'This might be problematic content', 
    { forcePost: true }
  );
  
  console.log(`Posted: ${result.posted}`);
  console.log(`Tweet ID: ${result.tweetId}`);
  console.log(`Feedback: ${result.feedback}`);
}
```

### Posting with Media

```typescript
import { uploadMedia, checkAndPost } from 'social-post';

async function postWithMedia() {
  // Upload an image
  const mediaId = await uploadMedia('/path/to/image.jpg');
  
  if (mediaId) {
    // Post with the uploaded image
    const result = await checkAndPost(
      'Check out this image!', 
      { mediaIds: [mediaId] }
    );
    
    console.log(`Posted: ${result.posted}`);
  }
}
```

## Content Categories

The library checks for the following problematic content categories:

- **TOXICITY**: Rude, disrespectful, or unreasonable comments
- **SEVERE_TOXICITY**: Very hateful, aggressive, or disrespectful comments
- **IDENTITY_ATTACK**: Negative or hateful comments targeting identity
- **INSULT**: Insulting or negative comments
- **PROFANITY**: Swear words, curse words, or other obscene language
- **THREAT**: Threatening language or content suggesting violence

## Development

### Setup

```bash
git clone https://github.com/whitebear0909/social-post.git
cd social-post
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Run Example

```bash
npx ts-node src/example.ts
```

## License

ISC