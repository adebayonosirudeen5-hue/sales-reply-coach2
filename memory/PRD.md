# Sales Reply Coach - PRD

## Original Problem Statement
Clone GitHub repo `adebayonosirudeen5-hue/sales-reply-coach2` and make it runnable. Main focus: YouTube and Instagram transcript feature - when user pastes URL, extract transcript and make AI learn from it.

## Architecture & Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + tRPC
- **Database**: PostgreSQL (Supabase via pooler connection)
- **Auth**: Supabase Authentication + Custom email verification
- **Email**: Resend API
- **AI**: OpenAI API (GPT) for reply suggestions
- **Video Transcription**: yt-dlp + YouTube Captions API + OpenAI Whisper

## Core Features
1. **User Authentication** - Email signup with 6-digit verification code
2. **Knowledge Base** - Add YouTube/Instagram URLs and PDFs
3. **YouTube Transcription** - Automatic transcript extraction via captions or Whisper
4. **AI Brain Training** - Process content into categorized knowledge chunks
5. **Conversation Coach** - Paste text or screenshots, get AI reply suggestions
6. **Workspaces** - Organize by niche/topic
7. **Prospect Management** - Track conversations

## What's Been Implemented (Feb 9, 2026)
- [x] Repository cloned with all 173 files
- [x] Dependencies installed (pnpm)
- [x] Database schema converted from MySQL to PostgreSQL
- [x] Database tables created in Supabase
- [x] Environment variables configured (Supabase pooler connection)
- [x] Fixed MySQL->PostgreSQL query syntax (onDuplicateKeyUpdate -> onConflictDoUpdate)
- [x] Modified email verification to work in dev mode (returns code)
- [x] YouTube transcript extraction verified working
- [x] User signup/verification flow tested and working

## Environment Files
- `/app/.env` - Server-side variables (DATABASE_URL uses pooler)
- `/app/.env.local` - Client-side VITE_ variables

## Database (Supabase PostgreSQL)
- **Project**: xfxehkotbvhhtzbajzmk
- **Connection**: Pooler connection (aws-1-eu-west-1.pooler.supabase.com)
- **Tables**: users, verificationCodes, workspaces, prospects, chat_messages, ai_suggestions, knowledge_base_items, knowledge_chunks, ai_brain_stats, conversations, conversation_messages, suggestions

## Known Limitations
- Resend email in test mode (can only send to verified email)
- Instagram transcription limited (requires manual caption paste)
- Some YouTube videos without captions need Whisper (slower)

## Test Results
- Backend: 85.7% pass rate
- User signup/verification: ✅ Working
- YouTube transcript: ✅ Working
- Database connection: ✅ Working via pooler

## Next Tasks (P0/P1)
- [ ] Test full user flow in browser (signup -> dashboard -> add YouTube URL -> process)
- [ ] Verify domain in Resend for production emails
- [ ] Test AI reply generation with trained knowledge base

## Backlog (P2)
- Add more video platforms (TikTok)
- Improve Instagram content extraction
- Add user dashboard analytics
