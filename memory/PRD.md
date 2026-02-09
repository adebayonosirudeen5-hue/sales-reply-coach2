# Sales Reply Coach - PRD

## Original Problem Statement
Clone the GitHub repository `adebayonosirudeen5-hue/sales-reply-coach2` and set it up to run locally for editing.

## Architecture & Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + tRPC
- **Database**: PostgreSQL (Supabase) with Drizzle ORM
- **Auth**: Supabase Authentication
- **Email**: Resend API for verification emails
- **AI**: OpenAI API for generating sales reply suggestions
- **Video Transcription**: yt-dlp + OpenAI Whisper

## Core Features
1. **User Authentication** - Email/password signup with verification codes
2. **Conversation Coach** - Paste text or upload screenshots, get AI-powered reply suggestions
3. **Knowledge Base** - Upload video URLs (YouTube) and PDFs to train the AI
4. **AI Brain** - RAG system with categorized knowledge chunks
5. **Workspaces** - Organize by niche/topic
6. **Prospect Management** - Track conversations with prospects
7. **Analytics Dashboard**

## User Personas
- Sales beginners learning conversation skills
- Network marketers needing confident replies
- Small business owners managing customer conversations

## What's Been Implemented (Feb 9, 2026)
- [x] Repository cloned with all 173 files
- [x] Dependencies installed (pnpm)
- [x] Environment variables configured:
  - SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY
  - OPENAI_API_KEY
  - RESEND_API_KEY
  - DATABASE_URL
- [x] Fixed OAuth URL issue for local development
- [x] App running on localhost:3000

## Environment Files
- `/app/.env` - Server-side variables
- `/app/.env.local` - Client-side VITE_ variables

## Database Schema (12 tables)
- users, workspaces, prospects
- conversations, conversation_messages
- chat_messages, suggestions, ai_suggestions
- knowledge_base_items, knowledge_chunks
- ai_brain_stats, verificationCodes

## Known Issues
- Analytics env vars warnings (VITE_ANALYTICS_*) - non-blocking
- Manus OAuth button shows but isn't configured - falls back to local auth

## Next Tasks (P0/P1)
- [ ] Test full signup/login flow
- [ ] Test knowledge base upload
- [ ] Test conversation coaching feature
- [ ] Configure production deployment

## Backlog (P2)
- Remove Manus OAuth references
- Add proper error handling for missing analytics
- Performance optimization
