import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { storage } from "./storage";

// ============================================================
// SMTP-configuratie — Combell / mailprotect.be
// ============================================================
const SMTP_HOST = process.env.SMTP_HOST || "smtp-auth.mailprotect.be";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "afwikkeltest@leiderworden.be";
const SMTP_PASS = process.env.SMTP_PASS || "@fw!kk3lt3st";
const SMTP_FROM = process.env.SMTP_FROM || "De Afwikkeltest <afwikkeltest@leiderworden.be>";

let transporter: Transporter | null = null;

export function initMailTransporter(): void {
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        // mailprotect.be might use a certificate that doesn't match — allow it
        rejectUnauthorized: false,
      },
    });
    console.log(`[Mail] SMTP transporter aangemaakt (${SMTP_HOST}:${SMTP_PORT})`);
  } catch (err) {
    console.error("[Mail] Kon SMTP transporter niet aanmaken:", err);
    transporter = null;
  }
}

// Profielnamen mapping
const profileDisplayNames: Record<string, string> = {
  drager: "De Drager",
  pleaser: "De Pleaser",
  controleur: "De Controleur",
  twijfelaar: "De Twijfelaar",
  versneller: "De Versneller",
};

const profileTaglines: Record<string, string> = {
  drager: "Je draagt meer dan van jou is",
  pleaser: "Je vormt je naar wat de ander nodig heeft",
  controleur: "Je houdt alles strak — inclusief jezelf",
  twijfelaar: "Je wikt en weegt tot het moment voorbij is",
  versneller: "Je rent sneller dan je lichaam kan bijhouden",
};

const profileTips: Record<string, string[]> = {
  drager: [
    "Leg vandaag bewust één ding neer dat niet van jou is — niet door het uit te spreken, maar door het los te laten in je hoofd.",
    "Schrijf elke avond op: wat heb ik vandaag gedragen dat niet van mij was? Na zeven dagen zie je het patroon.",
  ],
  pleaser: [
    "Zeg vandaag één keer 'nee' zonder uitleg. Niet hard — maar helder. Merk op wat er gebeurt.",
    "Stel jezelf elke ochtend de vraag: wat wil ik vandaag écht? Doe minstens één ding puur voor jezelf.",
  ],
  controleur: [
    "Laat vandaag bewust één ding over aan iemand anders — zonder in te grijpen, zonder te checken.",
    "Kies elke dag één moment waarop je bewust niet plant. Loop zonder route. Eet zonder recept.",
  ],
  twijfelaar: [
    "Neem vandaag één beslissing binnen 30 seconden. Klein mag. Merk op dat de wereld niet instort.",
    "Voer een 'goed genoeg'-regel in: als een keuze voor 80% klopt, doe je het.",
  ],
  versneller: [
    "Blokkeer vandaag 15 minuten in je agenda en doe letterlijk niets. Geen telefoon, geen podcast, geen plan.",
    "Tel deze week hoeveel keer je 'druk' als antwoord geeft op de vraag hoe het gaat. Vervang het door een eerlijker woord.",
  ],
};

/**
 * Verstuurt de resultaatsmail. Blokkeert nooit de gebruikersflow.
 * Slaat emailSent=true op bij succes, logt fout bij mislukking.
 */
export async function sendResultEmail(
  participantId: number,
  resultId: number,
  resultPageUrl: string
): Promise<void> {
  if (!transporter) {
    console.warn("[Mail] Geen transporter — mail niet verstuurd.");
    return;
  }

  const participant = storage.getParticipant(participantId);
  if (!participant) {
    console.warn(`[Mail] Deelnemer ${participantId} niet gevonden.`);
    return;
  }

  const result = storage.getResult(resultId);
  if (!result) {
    console.warn(`[Mail] Resultaat ${resultId} niet gevonden.`);
    return;
  }

  const profileName = profileDisplayNames[result.primaryProfile] || result.primaryProfile;
  const tagline = profileTaglines[result.primaryProfile] || "";
  const tips = profileTips[result.primaryProfile] || [];

  const html = buildEmailHtml({
    firstName: participant.firstName,
    profileName,
    tagline,
    tips,
    resultPageUrl,
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: participant.email,
      subject: `${participant.firstName}, jouw Afwikkelprofiel staat klaar`,
      html,
    });
    storage.markEmailSent(resultId);
    console.log(`[Mail] ✓ Resultaatsmail verzonden naar ${participant.email}`);
  } catch (err) {
    console.error(`[Mail] ✗ Fout bij verzenden naar ${participant.email}:`, err);
    // Email failure is non-blocking — resultaat is al opgeslagen en getoond
  }
}

function buildEmailHtml(data: {
  firstName: string;
  profileName: string;
  tagline: string;
  tips: string[];
  resultPageUrl: string;
}): string {
  const tipItems = data.tips
    .map(
      (tip) => `
      <tr>
        <td style="padding: 0 0 12px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="top" style="padding-right: 12px; color: #2d8a6e; font-size: 18px; line-height: 1;">✦</td>
              <td style="font-size: 15px; line-height: 1.6; color: #444;">${tip}</td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Jouw Afwikkelprofiel</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7faf8; font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f7faf8;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width: 560px; width: 100%;">
          
          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 36px; height: 36px; vertical-align: middle; padding-right: 10px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid #2d8a6e; display: inline-block;"></div>
                  </td>
                  <td style="font-size: 18px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.3px; vertical-align: middle;">
                    De Afwikkeltest
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                
                <!-- Green accent bar -->
                <tr>
                  <td style="height: 4px; background: linear-gradient(90deg, #2d8a6e, #3aaa88);"></td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 36px;">
                    
                    <!-- Greeting -->
                    <p style="margin: 0 0 24px; font-size: 16px; color: #333; line-height: 1.6;">
                      Beste ${data.firstName},
                    </p>
                    <p style="margin: 0 0 28px; font-size: 16px; color: #333; line-height: 1.6;">
                      Bedankt voor het invullen van De Afwikkeltest. Hieronder vind je een samenvatting van je profiel.
                    </p>

                    <!-- Profile box -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background-color: #f0f9f5; border-radius: 12px; padding: 28px; border-left: 4px solid #2d8a6e;">
                          <p style="margin: 0 0 4px; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #2d8a6e; font-weight: 600;">
                            Jouw profiel
                          </p>
                          <p style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1a1a1a;">
                            ${data.profileName}
                          </p>
                          <p style="margin: 0; font-size: 15px; color: #555; font-style: italic;">
                            &ldquo;${data.tagline}&rdquo;
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Tips -->
                    <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #1a1a1a;">
                      Jouw eerste stappen naar afwikkelen:
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 28px;">
                      ${tipItems}
                    </table>

                    <!-- CTA button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 28px;">
                      <tr>
                        <td align="center">
                          <a href="${data.resultPageUrl}" target="_blank" style="display: inline-block; background-color: #2d8a6e; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; letter-spacing: 0.2px;">
                            Bekijk je volledig resultaat →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 8px; font-size: 14px; color: #777; line-height: 1.6;">
                      Op je resultaatpagina vind je je volledige profiel, inclusief je kracht, je valkuil, hoe je jezelf vastwikkelt en je eerste afwikkelbeweging.
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Book / workshop nudge -->
          <tr>
            <td style="padding: 28px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <tr>
                  <td style="padding: 24px 36px;">
                    <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #1a1a1a;">
                      Wil je dieper gaan?
                    </p>
                    <p style="margin: 0 0 16px; font-size: 14px; color: #555; line-height: 1.6;">
                      Het boek <strong style="color: #333;">Afwikkelen</strong> neemt je mee in alle vijf de profielen en geeft je concrete handvatten om los te komen uit patronen die je niet meer dienen. Ook workshops en persoonlijke trajecten zijn beschikbaar via Volop in Balans.
                    </p>
                    <a href="https://www.volopinbalans.be" target="_blank" style="font-size: 14px; color: #2d8a6e; font-weight: 600; text-decoration: none;">
                      Ontdek meer op volopinbalans.be →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0 0; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #aaa;">
                Dit is een automatisch bericht van De Afwikkeltest
              </p>
              <p style="margin: 0; font-size: 12px; color: #aaa;">
                Een initiatief van <a href="https://www.volopinbalans.be" target="_blank" style="color: #2d8a6e; text-decoration: none;">Volop in Balans</a>
                &nbsp;·&nbsp;
                <a href="https://www.leiderworden.be" target="_blank" style="color: #2d8a6e; text-decoration: none;">Leider Worden</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
