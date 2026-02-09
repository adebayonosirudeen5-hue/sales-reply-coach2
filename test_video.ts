import { getYouTubeTranscript } from './server/videoTranscription';

async function test() {
  console.log('Testing YouTube video: KQ6c9vceu7A');
  const result = await getYouTubeTranscript('https://youtu.be/KQ6c9vceu7A');
  
  console.log('Title:', result.title);
  console.log('Method:', result.method);
  console.log('Transcript length:', result.transcript.length, 'chars');
  console.log('\nFirst 500 chars:', result.transcript.substring(0, 500));
}

test().catch(console.error);
