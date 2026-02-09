import { integer, pgEnum, pgTable, text, timestamp, varchar, json, boolean, serial } from "drizzle-orm/pg-core";

// Define enums for PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const replyModeEnum = pgEnum("reply_mode", ["friend", "expert"]);
export const conversationStageEnum = pgEnum("conversation_stage", [
  "first_contact",
  "warm_rapport", 
  "pain_discovery",
  "objection_resistance",
  "trust_reinforcement",
  "referral_to_expert",
  "expert_close"
]);
export const outcomeEnum = pgEnum("outcome", ["active", "won", "lost", "ghosted"]);
export const threadTypeEnum = pgEnum("thread_type", ["friend", "expert"]);
export const directionEnum = pgEnum("direction", ["inbound", "outbound"]);
export const analysisContextEnum = pgEnum("analysis_context", [
  "first_contact",
  "warm_rapport",
  "pain_discovery", 
  "objection_resistance",
  "trust_reinforcement",
  "referral_to_expert",
  "expert_close",
  "general"
]);
export const suggestionTypeEnum = pgEnum("suggestion_type", ["primary", "alternative", "soft", "custom"]);
export const feedbackEnum = pgEnum("feedback", ["helpful", "not_helpful"]);
export const knowledgeTypeEnum = pgEnum("knowledge_type", ["url", "pdf"]);
export const brainTypeEnum = pgEnum("brain_type", ["friend", "expert", "both"]);
export const statusEnum = pgEnum("status", ["pending", "processing", "ready", "failed"]);
export const legacyReplyModeEnum = pgEnum("legacy_reply_mode", ["friend", "expert"]);
export const legacyOutcomeEnum = pgEnum("legacy_outcome", ["pending", "won", "lost"]);
export const legacyAnalysisContextEnum = pgEnum("legacy_analysis_context", ["objection", "tone_shift", "referral", "first_message", "follow_up", "general"]);
export const legacySuggestionTypeEnum = pgEnum("legacy_suggestion_type", ["primary", "alternative", "expert_referral"]);
export const wasUsedEnum = pgEnum("was_used", ["yes", "no", "modified"]);
export const legacyFeedbackEnum = pgEnum("legacy_feedback", ["helpful", "not_helpful", "neutral"]);
export const knowledgeCategoryEnum = pgEnum("knowledge_category", [
  "opening_lines",
  "rapport_building",
  "pain_discovery",
  "objection_handling",
  "trust_building",
  "closing_techniques",
  "psychology_insight",
  "language_pattern",
  "emotional_trigger",
  "general_wisdom",
  "audience_insight",
  "conversation_pattern",
  "strategic_question",
  "need_identification"
]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Workspaces - niche-based profiles for the user
 */
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  nicheDescription: text("nicheDescription"),
  instagramUrl: text("instagramUrl"),
  tiktokUrl: text("tiktokUrl"),
  storeUrl: text("storeUrl"),
  otherUrl: text("otherUrl"),
  profileAnalysis: text("profileAnalysis"),
  productsDetected: text("productsDetected"),
  defaultReplyMode: replyModeEnum("defaultReplyMode").default("friend"),
  isActive: boolean("isActive").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

/**
 * Prospects - buyer profiles saved within a workspace
 */
export const prospects = pgTable("prospects", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspaceId").notNull(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  instagramUrl: text("instagramUrl"),
  tiktokUrl: text("tiktokUrl"),
  storeUrl: text("storeUrl"),
  otherUrl: text("otherUrl"),
  profileAnalysis: text("profileAnalysis"),
  detectedInterests: text("detectedInterests"),
  suggestedFirstMessage: text("suggestedFirstMessage"),
  conversationStage: conversationStageEnum("conversationStage").default("first_contact"),
  replyMode: replyModeEnum("replyMode").default("friend"),
  outcome: outcomeEnum("outcome").default("active"),
  outcomeNotes: text("outcomeNotes"),
  lastMessageAt: timestamp("lastMessageAt"),
  unreadCount: integer("unreadCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Prospect = typeof prospects.$inferSelect;
export type InsertProspect = typeof prospects.$inferInsert;

/**
 * Chat messages - WhatsApp-style conversation messages
 */
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  prospectId: integer("prospectId").notNull(),
  userId: integer("userId").notNull(),
  threadType: threadTypeEnum("threadType").default("friend").notNull(),
  direction: directionEnum("direction").notNull(),
  content: text("content").notNull(),
  screenshotUrl: text("screenshotUrl"),
  analysisContext: analysisContextEnum("analysisContext"),
  detectedTone: varchar("detectedTone", { length: 64 }),
  reasoning: text("reasoning"),
  isAiSuggestion: boolean("isAiSuggestion").default(false),
  suggestionType: suggestionTypeEnum("suggestionType"),
  wasSent: boolean("wasSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * AI Suggestions - generated reply options for each inbound message
 */
export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  messageId: integer("messageId").notNull(),
  prospectId: integer("prospectId").notNull(),
  userId: integer("userId").notNull(),
  suggestionText: text("suggestionText").notNull(),
  suggestionType: suggestionTypeEnum("suggestionType").default("primary").notNull(),
  whyThisWorks: text("whyThisWorks"),
  pushyWarning: text("pushyWarning"),
  wasUsed: boolean("wasUsed").default(false),
  feedback: feedbackEnum("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = typeof aiSuggestions.$inferInsert;

/**
 * Knowledge base items - stores references to uploaded URLs and PDFs
 */
export const knowledgeBaseItems = pgTable("knowledge_base_items", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  workspaceId: integer("workspaceId"),
  type: knowledgeTypeEnum("type").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  sourceUrl: text("sourceUrl").notNull(),
  platform: varchar("platform", { length: 64 }),
  fullContent: text("fullContent"),
  comprehensiveSummary: text("comprehensiveSummary"),
  salesPsychology: text("salesPsychology"),
  rapportTechniques: text("rapportTechniques"),
  conversationStarters: text("conversationStarters"),
  objectionFrameworks: text("objectionFrameworks"),
  closingTechniques: text("closingTechniques"),
  languagePatterns: text("languagePatterns"),
  emotionalTriggers: text("emotionalTriggers"),
  trustStrategies: text("trustStrategies"),
  brainType: brainTypeEnum("brainType").default("both"),
  status: statusEnum("status").default("pending").notNull(),
  processingProgress: integer("processingProgress").default(0),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type KnowledgeBaseItem = typeof knowledgeBaseItems.$inferSelect;
export type InsertKnowledgeBaseItem = typeof knowledgeBaseItems.$inferInsert;

// Legacy tables kept for migration compatibility
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 256 }),
  buyerName: varchar("buyerName", { length: 256 }),
  replyMode: replyModeEnum("replyMode").default("friend"),
  outcome: legacyOutcomeEnum("outcome").default("pending"),
  outcomeNotes: text("outcomeNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const conversationMessages = pgTable("conversation_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull(),
  userId: integer("userId").notNull(),
  inputText: text("inputText").notNull(),
  screenshotUrl: text("screenshotUrl"),
  analysisContext: legacyAnalysisContextEnum("analysisContext").default("general"),
  detectedTone: varchar("detectedTone", { length: 64 }),
  reasoning: text("reasoning"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type InsertConversationMessage = typeof conversationMessages.$inferInsert;

export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull(),
  messageId: integer("messageId"),
  userId: integer("userId").notNull(),
  suggestionText: text("suggestionText").notNull(),
  suggestionType: legacySuggestionTypeEnum("suggestionType").default("primary").notNull(),
  tone: varchar("tone", { length: 64 }),
  wasUsed: wasUsedEnum("wasUsed").default("no"),
  feedback: legacyFeedbackEnum("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = typeof suggestions.$inferInsert;

/**
 * Knowledge chunks - individual pieces of knowledge extracted from sources
 */
export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  sourceId: integer("sourceId").notNull(),
  category: knowledgeCategoryEnum("category").notNull(),
  content: text("content").notNull(),
  triggerPhrases: text("triggerPhrases"),
  usageExample: text("usageExample"),
  relevanceScore: integer("relevanceScore").default(50),
  brainType: brainTypeEnum("brainType").default("both"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type InsertKnowledgeChunk = typeof knowledgeChunks.$inferInsert;

/**
 * AI Brain Stats - tracks the AI's learning progress
 */
export const aiBrainStats = pgTable("ai_brain_stats", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  totalSources: integer("totalSources").default(0),
  totalChunks: integer("totalChunks").default(0),
  categoryBreakdown: json("categoryBreakdown"),
  intelligenceLevel: integer("intelligenceLevel").default(1),
  intelligenceTitle: varchar("intelligenceTitle", { length: 64 }).default("Beginner"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AIBrainStats = typeof aiBrainStats.$inferSelect;
export type InsertAIBrainStats = typeof aiBrainStats.$inferInsert;

/**
 * Email verification codes for signup
 */
export const verificationCodes = pgTable("verificationCodes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = typeof verificationCodes.$inferInsert;
