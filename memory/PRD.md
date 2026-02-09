# Sales Reply Coach - PRD

## Original Problem Statement
Clone GitHub repo `adebayonosirudeen5-hue/sales-reply-coach2` and fix:
1. Signup "Unable to transform response from server" error
2. YouTube transcription not working ("nothing to learn" error)
3. Instagram transcription restrictions

## Architecture & Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + tRPC + superjson
- **Database**: PostgreSQL (Supabase via pooler connection)
- **Auth**: Supabase Authentication + Custom email verification
- **Email**: Resend API (domain: ordersstan.store)
- **AI**: OpenAI API (GPT) for reply suggestions
- **Video Transcription**: yt-dlp + YouTube Captions API + OpenAI Whisper + ffmpeg

## Issues Fixed (Feb 9, 2026)

### 1. Signup Error Fixed
- Changed email "from" address to use verified domain: `noreply@ordersstan.store`
- Removed `devCode` from response that was causing tRPC type mismatch
- Email verification codes now logged in console for development

### 2. YouTube Transcription Fixed
- **Root cause**: ffmpeg was not installed
- **Solution**: Installed ffmpeg for audio conversion
- YouTube transcription now works via:
  - Method 1: YouTube auto-generated captions (no ffmpeg needed)
  - Method 2: Whisper transcription via audio download (requires ffmpeg)
- Improved error handling and logging

### 3. Instagram Limitation (Known)
- Instagram blocks automated access to videos
- Users should manually copy video caption text and paste as text knowledge item

## Database (Supabase PostgreSQL)
- **Project**: xfxehkotbvhhtzbajzmk
- **Connection**: Pooler at aws-1-eu-west-1.pooler.supabase.com
- **Schema**: Converted from MySQL to PostgreSQL syntax

## Test Results (Final)
- Backend: 100% pass rate
- YouTube transcript: ✅ Working (2066+ characters extracted)
- User signup: ✅ Working
- Database: ✅ Connected via pooler
- ffmpeg: ✅ Installed (v5.1.8)
- yt-dlp: ✅ Installed (v2026.02.04)

## Environment Requirements for Manus Deployment
To deploy on Manus, ensure the following are installed:
1. yt-dlp (for video downloading)
2. ffmpeg (for audio conversion)
3. Node.js 20+
4. PostgreSQL database with tables created

## Files Modified
- `/app/server/_core/email.ts` - Changed from address to verified domain
- `/app/server/routers.ts` - Fixed signup response, improved error handling
- `/app/server/videoTranscription.ts` - Improved caption extraction
- `/app/server/db.ts` - PostgreSQL syntax (onConflictDoUpdate)
- `/app/drizzle/schema.ts` - PostgreSQL types
- `/app/.env` - Supabase pooler connection
- `/app/.env.local` - Frontend Supabase keys

## Next Steps for Manus Deployment
1. Ensure yt-dlp and ffmpeg are installed on Manus
2. Run database migrations (SQL provided in /app/setup_database.sql)
3. Set environment variables for production
