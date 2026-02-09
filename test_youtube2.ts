import { getYouTubeTranscript, fetchUrlContent } from './server/videoTranscription';

async function test() {
  console.log('Testing YouTube transcript extraction...');
  
  // Test with a TED talk video (usually has captions)
  const videoUrl = 'https://www.youtube.com/watch?v=8jPQjjsBbIc';
  
  // Use the full fetch function that the app uses
  const content = await fetchUrlContent(videoUrl, 'youtube');
  
  console.log('Content length:', content.length, 'characters');
  console.log('Sample:', content.substring(0, 500), '...');
}

test().catch(console.error);
