import { getYouTubeTranscript } from './server/videoTranscription';

async function test() {
  console.log('Testing FULL YouTube transcription with Whisper...\n');
  
  // Test with a short video that has spoken content
  const result = await getYouTubeTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  
  console.log('=== RESULT ===');
  console.log('Title:', result.title);
  console.log('Method:', result.method);
  console.log('Transcript length:', result.transcript.length, 'characters');
  console.log('\n=== TRANSCRIPT PREVIEW ===');
  console.log(result.transcript.substring(0, 1000), '...');
}

test().catch(console.error);
