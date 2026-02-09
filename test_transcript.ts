import { getYouTubeTranscript } from './server/videoTranscription';

async function test() {
  console.log('Testing YouTube transcript...');
  const result = await getYouTubeTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  console.log('Result:', JSON.stringify(result, null, 2));
}

test().catch(console.error);
