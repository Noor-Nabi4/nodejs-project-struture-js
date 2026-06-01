import nodeMailer from "nodemailer";
import ejs from "ejs";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/index.js";
import logger from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "../templates/email");

export interface SendEmailOptions {
  email: string;
  subject: string;
  templatePath?: string;
  templateData?: Record<string, unknown>;
  html?: string;
  text?: string;
  message?: string;
}

/**
 * Send email. Supports:
 * - options.templatePath + options.templateData (EJS template)
 * - options.html or options.text (raw body)
 * - options.message (used as text if no template)
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { email, subject } = options;
  if (!config.smtp?.host || !email) {
    logger.warn("Email not sent: missing SMTP config or recipient");
    return;
  }

  const transporter = nodeMailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user
      ? { user: config.smtp.user, pass: config.smtp.pass }
      : undefined,
  });

  let html = options.html;
  if (!html && options.templatePath) {
    const template = await readFile(options.templatePath, "utf-8");
    html = ejs.render(template, options.templateData || {});
  }
  if (!html && options.message) {
    html = `<p>${escapeHtml(options.message)}</p>`;
  }

  const mailOptions = {
    from: config.smtp.mail || config.smtp.user,
    to: email,
    subject,
    html: html || options.text,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
  logger.debug("Email sent", subject);
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m] ?? m);
}

export function getPasswordResetTemplatePath(): string {
  return path.join(templatesDir, "passwordReset.ejs");
}
