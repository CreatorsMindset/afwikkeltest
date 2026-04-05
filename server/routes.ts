import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertParticipantSchema, insertResultSchema } from "@shared/schema";

export async function registerRoutes(server: Server, app: Express) {
  // Create participant (registration)
  app.post("/api/participants", (req, res) => {
    const parsed = insertParticipantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Ongeldige invoer", details: parsed.error.flatten() });
    }

    try {
      const participant = storage.createParticipant(parsed.data);
      res.json({ id: participant.id });
    } catch (err) {
      res.status(500).json({ error: "Kon deelnemer niet opslaan" });
    }
  });

  // Get participant
  app.get("/api/participants/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const participant = storage.getParticipant(id);
    if (!participant) {
      return res.status(404).json({ error: "Deelnemer niet gevonden" });
    }
    res.json(participant);
  });

  // Submit result
  app.post("/api/results", (req, res) => {
    const parsed = insertResultSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Ongeldige invoer", details: parsed.error.flatten() });
    }

    try {
      const result = storage.createResult(parsed.data);

      // ---- SendGrid email path (prepared, activate when connected) ----
      // To enable:
      // 1. npm install @sendgrid/mail
      // 2. Set SENDGRID_API_KEY environment variable
      // 3. Uncomment the block below
      //
      // import sgMail from "@sendgrid/mail";
      // if (process.env.SENDGRID_API_KEY) {
      //   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      //   const participant = storage.getParticipant(parsed.data.participantId);
      //   if (participant) {
      //     const scores = JSON.parse(parsed.data.scores);
      //     sgMail.send({
      //       to: participant.email,
      //       from: "noreply@volopinbalans.be",
      //       subject: `${participant.firstName}, jouw Afwikkelprofiel staat klaar`,
      //       html: buildResultEmail(participant, result, scores),
      //     }).then(() => {
      //       storage.markEmailSent(result.id);
      //     }).catch(console.error);
      //   }
      // }
      // ---- End SendGrid block ----

      res.json({ id: result.id });
    } catch (err) {
      res.status(500).json({ error: "Kon resultaat niet opslaan" });
    }
  });

  // Get result with participant data
  app.get("/api/results/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const result = storage.getResultWithParticipant(id);
    if (!result) {
      return res.status(404).json({ error: "Resultaat niet gevonden" });
    }
    res.json(result);
  });

  // Admin: list all participants (simple endpoint, could be auth-gated later)
  app.get("/api/admin/participants", (_req, res) => {
    const all = storage.getAllParticipants();
    res.json(all);
  });

  // Admin: list all results
  app.get("/api/admin/results", (_req, res) => {
    const all = storage.getAllResults();
    res.json(all);
  });
}

// Prepared email template builder
// function buildResultEmail(participant: any, result: any, scores: any): string {
//   return `
//     <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
//       <h1 style="color: #2d8a6e; font-size: 24px;">${participant.firstName}, jouw Afwikkelprofiel</h1>
//       <p style="color: #555; font-size: 16px; line-height: 1.6;">
//         Je primaire profiel is <strong>${result.primaryProfile}</strong>.
//       </p>
//       <p style="color: #555; font-size: 14px;">
//         Bekijk je volledige resultaat online voor alle details, tips en je eerste afwikkelbeweging.
//       </p>
//       <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
//       <p style="color: #999; font-size: 12px;">
//         Dit is een automatisch bericht van De Afwikkeltest — een initiatief van Volop in Balans.
//       </p>
//     </div>
//   `;
// }
