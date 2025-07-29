import { checkAndPost, analyzeContent } from './index';

// Example function to analyze content without posting
async function analyzeOnly(text: string): Promise<void> {
  console.log(`Analyzing: "${text}"`);
  
  const analysis = await analyzeContent(text);
  
  console.log('\nAnalysis Result:');
  console.log(`- Problematic: ${analysis.result.isProblematic ? 'Yes' : 'No'}`);
  console.log(`- Score: ${analysis.result.score.toFixed(2)}`);
  console.log(`- Can Post: ${analysis.canPost ? 'Yes' : 'No'}`);
  console.log(`- Feedback: ${analysis.feedback}`);
  
  console.log('\n-----------------------------------\n');
}

// Example function to check and post content
async function checkAndPostExample(text: string, forcePost: boolean = false): Promise<void> {
  console.log(`Checking and posting: "${text}"`);
  console.log(`Force post: ${forcePost ? 'Yes' : 'No'}`);
  
  const result = await checkAndPost(text, { forcePost });
  
  console.log('\nResult:');
  console.log(`- Posted: ${result.posted ? 'Yes' : 'No'}`);
  console.log(`- Problematic: ${result.problematic ? 'Yes' : 'No'}`);
  
  if (result.posted) {
    console.log(`- Tweet ID: ${result.tweetId}`);
  }
  
  if (result.error) {
    console.log(`- Error: ${result.error}`);
  }
  
  console.log(`- Feedback: ${result.feedback}`);
  
  console.log('\n-----------------------------------\n');
}

// Run examples
async function runExamples(): Promise<void> {
  // Example 1: Safe content
  await analyzeOnly('Hello world! This is a friendly test message.');
  
  // Example 2: Problematic content
  await analyzeOnly('This is terrible! I hate everything about this stupid example.');
  
  // Example 3: Check and post safe content
  // Note: This will only work if you have valid Twitter API credentials
  // await checkAndPostExample('Testing the social-post library. This is a safe message.');
  
  // Example 4: Check and post problematic content (will be rejected)
  // await checkAndPostExample('This is a terrible example with bad words!');
  
  // Example 5: Force post problematic content
  // await checkAndPostExample('This is a terrible example with bad words!', true);
}

// Run the examples if this file is executed directly
if (require.main === module) {
  console.log('Running Social Post Examples');
  console.log('===========================\n');
  
  runExamples().catch(error => {
    console.error('Error running examples:', error);
  });
}