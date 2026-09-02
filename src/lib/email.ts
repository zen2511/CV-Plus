import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function envoyerEmailAcceptation(candidat: {
  email: string;
  prenom: string;
  nom: string;
}) {
  if (!resend) {
    throw new Error(
      "RESEND_API_KEY manquante — configure ta clé dans .env pour activer l'envoi d'email."
    );
  }

  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? "contact@cvplus.com",
    to: candidat.email,
    subject: "Votre candidature a été retenue",
    html: `
      <p>Bonjour ${candidat.prenom},</p>
      <p>Nous avons le plaisir de vous informer que votre candidature a été retenue.</p>
      <p>Nous reviendrons vers vous prochainement avec les prochaines étapes.</p>
      <p>Cordialement,<br/>L'équipe CV+</p>
    `,
  });
}
