import { Resend } from "resend";
import { config } from "./config";

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

export async function sendMagicLink(email: string, url: string) {
  const subject = "Your sign-in link for Zoom In On Recovery";
  const text =
    `Hi,\n\nClick the link below to sign in to Zoom In On Recovery. ` +
    `It expires in 1 hour and can only be used once.\n\n${url}\n\n` +
    `If you didn't request this, you can ignore this email.`;
  const html =
    `<p>Hi,</p><p>Click the button below to sign in to Zoom In On Recovery. ` +
    `It expires in 1 hour and can only be used once.</p>` +
    `<p><a href="${url}" style="display:inline-block;padding:10px 18px;` +
    `background:#336699;color:#fff;border-radius:6px;text-decoration:none">Sign in</a></p>` +
    `<p>Or paste this link into your browser:<br><a href="${url}">${url}</a></p>` +
    `<p style="color:#667">If you didn't request this, you can ignore this email.</p>`;

  if (!resend) {
    // Dev fallback: no provider configured, so print the link to the console.
    console.log(
      `\n=== MAGIC LINK (no RESEND_API_KEY set) ===\n  to: ${email}\n  ${url}\n==========================================\n`,
    );
    return;
  }

  const { error } = await resend.emails.send({
    from: config.fromEmail,
    to: email,
    subject,
    text,
    html,
  });
  if (error) throw new Error(`Failed to send email: ${error.message}`);
}
