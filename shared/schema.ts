import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const participants = sqliteTable("participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  optIn: integer("opt_in", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const results = sqliteTable("results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  participantId: integer("participant_id").notNull(),
  primaryProfile: text("primary_profile").notNull(),
  secondaryProfile: text("secondary_profile"),
  scores: text("scores").notNull(), // JSON string of { profileName: number }
  emailSent: integer("email_sent", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  createdAt: true,
});

export const insertResultSchema = createInsertSchema(results).omit({
  id: true,
  createdAt: true,
});

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof results.$inferSelect;
