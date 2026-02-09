import { getYouTubeTranscript } from './server/videoTranscription';

async function test() {
  console.log('Testing YouTube transcript extraction...');
  
  // Test with a real YouTube video
  const result = await getYouTubeTranscript('https://www.youtube.com/watch?v=MtN1YnoL46Q');
  
  console.log('Success!');
  console.log('Title:', result.title);
  console.log('Method:', result.method);
  console.log('Transcript length:', result.transcript.length, 'characters');
  console.log('Sample:', result.transcript.substring(0, 300), '...');
}

test().catch(console.error);
