import { z } from "zod";

// ─── Pure TypeScript types ─── no Drizzle, no native modules ───

export interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  optIn: boolean;
  createdAt: string;
}

export interface Result {
  id: number;
  participantId: number;
  primaryProfile: string;
  secondaryProfile: string | null;
  scores: string; // JSON string of { profileName: number }
  emailSent: boolean;
  createdAt: string;
}

// ─── Insert schemas (Zod) ───

export const insertParticipantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  optIn: z.boolean().default(false),
});

export const insertResultSchema = z.object({
  participantId: z.number().int(),
  primaryProfile: z.string().min(1),
  secondaryProfile: z.string().nullable().optional(),
  scores: z.string().min(1),
  emailSent: z.boolean().default(false),
});

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type InsertResult = z.infer<typeof insertResultSchema>;
