import fs from "fs";
import path from "path";
import type { Participant, Result, InsertParticipant, InsertResult } from "@shared/schema";

// ─── JSON file-based storage ───────────────────────────────────
// Replaces better-sqlite3 to avoid native module issues on
// managed Node hosting (Combell). Data persists across restarts.
// ────────────────────────────────────────────────────────────────

interface DbData {
  participants: Participant[];
  results: Result[];
  nextParticipantId: number;
  nextResultId: number;
}

// DB_PATH allows Combell shared folder persistence across deploys
// Default: ./data/afwikkeltest.json (project root)
const dataDir = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : path.resolve("data");
const dbFile = process.env.DB_PATH || path.join(dataDir, "afwikkeltest.json");

function ensureDir(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadDb(): DbData {
  ensureDir();
  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, "utf-8");
      return JSON.parse(raw) as DbData;
    } catch {
      console.warn("[Storage] Corrupt JSON — starting fresh.");
    }
  }
  return { participants: [], results: [], nextParticipantId: 1, nextResultId: 1 };
}

function saveDb(data: DbData): void {
  ensureDir();
  // Write to temp then rename for atomicity
  const tmp = dbFile + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, dbFile);
}

// In-memory cache — read from disk at startup, write-through on every mutation
let db: DbData = loadDb();
console.log(
  `[Storage] JSON store loaded — ${db.participants.length} deelnemers, ${db.results.length} resultaten (${dbFile})`
);

// ─── IStorage interface (unchanged from before) ────────────────

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
    const participant: Participant = {
      id: db.nextParticipantId++,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      optIn: data.optIn ?? false,
      createdAt: new Date().toISOString(),
    };
    db.participants.push(participant);
    saveDb(db);
    return participant;
  },

  getParticipant(id: number): Participant | undefined {
    return db.participants.find((p) => p.id === id);
  },

  createResult(data: InsertResult): Result {
    const result: Result = {
      id: db.nextResultId++,
      participantId: data.participantId,
      primaryProfile: data.primaryProfile,
      secondaryProfile: data.secondaryProfile ?? null,
      scores: data.scores,
      emailSent: data.emailSent ?? false,
      createdAt: new Date().toISOString(),
    };
    db.results.push(result);
    saveDb(db);
    return result;
  },

  getResult(id: number): Result | undefined {
    return db.results.find((r) => r.id === id);
  },

  getResultWithParticipant(id: number) {
    const result = db.results.find((r) => r.id === id);
    if (!result) return undefined;
    const participant = db.participants.find((p) => p.id === result.participantId);
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
    return [...db.participants];
  },

  getAllResults(): Result[] {
    return [...db.results];
  },

  markEmailSent(resultId: number): void {
    const result = db.results.find((r) => r.id === resultId);
    if (result) {
      result.emailSent = true;
      saveDb(db);
    }
  },
};
