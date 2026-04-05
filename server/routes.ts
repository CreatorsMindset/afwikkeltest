import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertParticipantSchema, insertResultSchema } from "@shared/schema";
import { initMailTransporter, sendResultEmail } from "./email";

// Initialiseer SMTP-transporter bij serverstart
initMailTransporter();

export async function registerRoutes(server: Server, app: Express) {
  // ------- Participants -------

  app.post("/api/participants", (req, res) => {
    const parsed = insertParticipantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Ongeldige invoer", details: parsed.error.flatten() });
    }

    try {
      const participant = storage.createParticipant(parsed.data);
      console.log(
        `[Participant] Nieuw: ${participant.firstName} ${participant.lastName} (${participant.email}) — id=${participant.id}`
      );
      res.json({ id: participant.id });
    } catch (err) {
      console.error("[Participant] Fout bij opslaan:", err);
      res.status(500).json({ error: "Kon deelnemer niet opslaan" });
    }
  });

  app.get("/api/participants/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Ongeldig ID" });
    const participant = storage.getParticipant(id);
    if (!participant) {
      return res.status(404).json({ error: "Deelnemer niet gevonden" });
    }
    res.json(participant);
  });

  // ------- Results -------

  app.post("/api/results", (req, res) => {
    const parsed = insertResultSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Ongeldige invoer", details: parsed.error.flatten() });
    }

    try {
      const result = storage.createResult(parsed.data);
      console.log(
        `[Result] Nieuw: participantId=${result.participantId}, profiel=${result.primaryProfile} — id=${result.id}`
      );

      // Bouw de resultaat-URL voor in de e-mail
      // BASE_URL kan gezet worden op Combell (bv. https://afwikkeltest.leiderworden.be)
      // Fallback: afgeleid van het inkomende request
      const baseUrl = process.env.BASE_URL
        || `${req.protocol}://${req.get("host") || "localhost:3000"}`;
      const resultPageUrl = `${baseUrl}/#/resultaat/${result.id}`;

      // Verstuur resultaatsmail asynchroon — blokkeert de response NIET
      sendResultEmail(result.participantId, result.id, resultPageUrl).catch(
        (err) => {
          console.error("[Routes] Onverwachte mailfout (non-blocking):", err);
        }
      );

      res.json({ id: result.id });
    } catch (err) {
      console.error("[Result] Fout bij opslaan:", err);
      res.status(500).json({ error: "Kon resultaat niet opslaan" });
    }
  });

  app.get("/api/results/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Ongeldig ID" });
    const result = storage.getResultWithParticipant(id);
    if (!result) {
      return res.status(404).json({ error: "Resultaat niet gevonden" });
    }
    res.json(result);
  });

  // ------- Admin -------

  app.get("/api/admin/participants", (_req, res) => {
    const all = storage.getAllParticipants();
    res.json(all);
  });

  app.get("/api/admin/results", (_req, res) => {
    const all = storage.getAllResults();
    res.json(all);
  });
}
