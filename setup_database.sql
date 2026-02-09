-- Run this SQL in Supabase Dashboard > SQL Editor

-- Create enums
DO $$ BEGIN CREATE TYPE role AS ENUM ('user', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE reply_mode AS ENUM ('friend', 'expert'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE conversation_stage AS ENUM ('first_contact', 'warm_rapport', 'pain_discovery', 'objection_resistance', 'trust_reinforcement', 'referral_to_expert', 'expert_close'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE outcome AS ENUM ('active', 'won', 'lost', 'ghosted'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE thread_type AS ENUM ('friend', 'expert'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE direction AS ENUM ('inbound', 'outbound'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE analysis_context AS ENUM ('first_contact', 'warm_rapport', 'pain_discovery', 'objection_resistance', 'trust_reinforcement', 'referral_to_expert', 'expert_close', 'general'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE suggestion_type AS ENUM ('primary', 'alternative', 'soft', 'custom'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE feedback AS ENUM ('helpful', 'not_helpful'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE knowledge_type AS ENUM ('url', 'pdf'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE brain_type AS ENUM ('friend', 'expert', 'both'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE status AS ENUM ('pending', 'processing', 'ready', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE legacy_outcome AS ENUM ('pending', 'won', 'lost'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE legacy_analysis_context AS ENUM ('objection', 'tone_shift', 'referral', 'first_message', 'follow_up', 'general'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE legacy_suggestion_type AS ENUM ('primary', 'alternative', 'expert_referral'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE was_used AS ENUM ('yes', 'no', 'modified'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE legacy_feedback AS ENUM ('helpful', 'not_helpful', 'neutral'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE knowledge_category AS ENUM ('opening_lines', 'rapport_building', 'pain_discovery', 'objection_handling', 'trust_building', 'closing_techniques', 'psychology_insight', 'language_pattern', 'emotional_trigger', 'general_wisdom', 'audience_insight', 'conversation_pattern', 'strategic_question', 'need_identification'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "openId" VARCHAR(64) NOT NULL UNIQUE,
    name TEXT,
    email VARCHAR(320),
    "loginMethod" VARCHAR(64),
    role role DEFAULT 'user' NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "verificationCodes" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL,
    code VARCHAR(6) NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    name VARCHAR(256) NOT NULL,
    "nicheDescription" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "storeUrl" TEXT,
    "otherUrl" TEXT,
    "profileAnalysis" TEXT,
    "productsDetected" TEXT,
    "defaultReplyMode" reply_mode DEFAULT 'friend',
    "isActive" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS prospects (
    id SERIAL PRIMARY KEY,
    "workspaceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    name VARCHAR(256) NOT NULL,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "storeUrl" TEXT,
    "otherUrl" TEXT,
    "profileAnalysis" TEXT,
    "detectedInterests" TEXT,
    "suggestedFirstMessage" TEXT,
    "conversationStage" conversation_stage DEFAULT 'first_contact',
    "replyMode" reply_mode DEFAULT 'friend',
    outcome outcome DEFAULT 'active',
    "outcomeNotes" TEXT,
    "lastMessageAt" TIMESTAMP,
    "unreadCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    "prospectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "threadType" thread_type DEFAULT 'friend' NOT NULL,
    direction direction NOT NULL,
    content TEXT NOT NULL,
    "screenshotUrl" TEXT,
    "analysisContext" analysis_context,
    "detectedTone" VARCHAR(64),
    reasoning TEXT,
    "isAiSuggestion" BOOLEAN DEFAULT false,
    "suggestionType" suggestion_type,
    "wasSent" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_suggestions (
    id SERIAL PRIMARY KEY,
    "messageId" INTEGER NOT NULL,
    "prospectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "suggestionText" TEXT NOT NULL,
    "suggestionType" suggestion_type DEFAULT 'primary' NOT NULL,
    "whyThisWorks" TEXT,
    "pushyWarning" TEXT,
    "wasUsed" BOOLEAN DEFAULT false,
    feedback feedback,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_base_items (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "workspaceId" INTEGER,
    type knowledge_type NOT NULL,
    title VARCHAR(512) NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    platform VARCHAR(64),
    "fullContent" TEXT,
    "comprehensiveSummary" TEXT,
    "salesPsychology" TEXT,
    "rapportTechniques" TEXT,
    "conversationStarters" TEXT,
    "objectionFrameworks" TEXT,
    "closingTechniques" TEXT,
    "languagePatterns" TEXT,
    "emotionalTriggers" TEXT,
    "trustStrategies" TEXT,
    "brainType" brain_type DEFAULT 'both',
    status status DEFAULT 'pending' NOT NULL,
    "processingProgress" INTEGER DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "sourceId" INTEGER NOT NULL,
    category knowledge_category NOT NULL,
    content TEXT NOT NULL,
    "triggerPhrases" TEXT,
    "usageExample" TEXT,
    "relevanceScore" INTEGER DEFAULT 50,
    "brainType" brain_type DEFAULT 'both',
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_brain_stats (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL UNIQUE,
    "totalSources" INTEGER DEFAULT 0,
    "totalChunks" INTEGER DEFAULT 0,
    "categoryBreakdown" JSON,
    "intelligenceLevel" INTEGER DEFAULT 1,
    "intelligenceTitle" VARCHAR(64) DEFAULT 'Beginner',
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    title VARCHAR(256),
    "buyerName" VARCHAR(256),
    "replyMode" reply_mode DEFAULT 'friend',
    outcome legacy_outcome DEFAULT 'pending',
    "outcomeNotes" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id SERIAL PRIMARY KEY,
    "conversationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "inputText" TEXT NOT NULL,
    "screenshotUrl" TEXT,
    "analysisContext" legacy_analysis_context DEFAULT 'general',
    "detectedTone" VARCHAR(64),
    reasoning TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS suggestions (
    id SERIAL PRIMARY KEY,
    "conversationId" INTEGER NOT NULL,
    "messageId" INTEGER,
    "userId" INTEGER NOT NULL,
    "suggestionText" TEXT NOT NULL,
    "suggestionType" legacy_suggestion_type DEFAULT 'primary' NOT NULL,
    tone VARCHAR(64),
    "wasUsed" was_used DEFAULT 'no',
    feedback legacy_feedback,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
