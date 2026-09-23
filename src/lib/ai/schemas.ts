// REHAB-AI AI Schemas & Validation Models
// Validates structured input and output for the Vercel AI SDK and API routes

import { z } from 'zod';

/**
 * Validated input schema for generating a session summary from exercise telemetry
 */
export const SessionSummaryInputSchema = z.object({
  exercise: z.string().min(1),
  repetitions: z.number().int().nonnegative(),
  successfulRepetitions: z.number().int().nonnegative(),
  incompleteRepetitions: z.number().int().nonnegative().optional().default(0),
  averageAngle: z.number(),
  targetRange: z.tuple([z.number(), z.number()]),
  duration: z.number().nonnegative(), // in seconds
  trackingQuality: z.enum(['high', 'medium', 'low', 'uncalibrated']).optional().default('high'),
  painReported: z.number().min(0).max(10).optional().default(0),
});

export type SessionSummaryInput = z.infer<typeof SessionSummaryInputSchema>;

/**
 * Validated output schema for AI-generated patient-friendly session summaries
 */
export const SessionSummaryOutputSchema = z.object({
  summaryText: z.string().min(1),
  encouragement: z.string().min(1),
  formHighlights: z.array(z.string()),
  focusAreaForNextSession: z.string().min(1),
  isClinicallySafe: z.literal(true), // Explicit affirmation that output contains no medical claims
});

export type SessionSummaryOutput = z.infer<typeof SessionSummaryOutputSchema>;

/**
 * Schema for multi-language translation requests
 */
export const TranslationInputSchema = z.object({
  text: z.string().min(1),
  targetLanguage: z.enum(['en', 'hi', 'or']),
});

export type TranslationInput = z.infer<typeof TranslationInputSchema>;

export const TranslationOutputSchema = z.object({
  translatedText: z.string().min(1),
  targetLanguage: z.enum(['en', 'hi', 'or']),
});

export type TranslationOutput = z.infer<typeof TranslationOutputSchema>;
