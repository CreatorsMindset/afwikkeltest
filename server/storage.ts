import { participants, results, type Participant, type Result, type InsertParticipant, type InsertResult } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";

const sqlite = new Database("afwikkeltest.db");
const db = drizzle(sqlite);

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    opt_in INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER NOT NULL,
    primary_profile TEXT NOT NULL,
    secondary_profile TEXT,
    scores TEXT NOT NULL,
    email_sent INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )
`);

export interface IStorage {
  createParticipant(data: InsertParticipant): Participant;
  getParticipant(id: number): Participant | undefined;
  createResult(data: InsertResult): Result;
  getResult(id: number): Result | undefined;
  getResultWithParticipant(id: number): (Result & { participant: { firstName: string; lastName: string } }) | undefined;
  getAllParticipants(): Participant[];
  getAllResults(): Result[];
  markEmailSent(resultId: number): void;
}

export const storage: IStorage = {
  createParticipant(data: InsertParticipant): Participant {
    return db.insert(participants).values({
      ...data,
      createdAt: new Date().toISOString(),
    }).returning().get();
  },

  getParticipant(id: number): Participant | undefined {
    return db.select().from(participants).where(eq(participants.id, id)).get();
  },

  createResult(data: InsertResult): Result {
    return db.insert(results).values({
      ...data,
      createdAt: new Date().toISOString(),
    }).returning().get();
  },

  getResult(id: number): Result | undefined {
    return db.select().from(results).where(eq(results.id, id)).get();
  },

  getResultWithParticipant(id: number) {
    const result = db.select().from(results).where(eq(results.id, id)).get();
    if (!result) return undefined;

    const participant = db.select().from(participants).where(eq(participants.id, result.participantId)).get();
    if (!participant) return undefined;

    return {
      ...result,
      participant: {
        firstName: participant.firstName,
        lastName: participant.lastName,
      },
    };
  },

  getAllParticipants(): Participant[] {
    return db.select().from(participants).all();
  },

  getAllResults(): Result[] {
    return db.select().from(results).all();
  },

  markEmailSent(resultId: number): void {
    db.update(results).set({ emailSent: true }).where(eq(results.id, resultId)).run();
  },
};
