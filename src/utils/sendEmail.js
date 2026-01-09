import nodeMailer from "nodemailer";
import ejs from "ejs";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.templatePath - Path to EJS template file (optional)
 * @param {Object} options.templateData - Data to render in template (optional)
 * @param {string} options.html - HTML content (optional, if no template)
 * @param {string} options.text - Plain text content (optional)
 */
const sendEmail = async (options) => {
  try {
    // Validate SMTP configuration
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
      throw new Error("SMTP configuration is missing");
    }

    // Create a nodemailer transporter
    const transporter = nodeMailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });

    let html = options.html;

    // Render template if templatePath is provided
    if (options.templatePath) {
      const templatePath = path.isAbsolute(options.templatePath)
        ? options.templatePath
        : path.join(__dirname, "../templates/email", options.templatePath);

      try {
        const template = await fs.readFile(templatePath, "utf-8");
        html = ejs.render(template, options.templateData || {});
      } catch (templateError) {
        console.error("Template error:", templateError);
        // Fallback to simple HTML if template fails
        html = options.message || options.html || "<p>" + options.subject + "</p>";
      }
    } else if (options.message && !html) {
      // Fallback: use message as HTML if no template or HTML provided
      html = `<p>${options.message}</p>`;
    }

    const mailOptions = {
      from: `${env.SMTP_MAIL}`,
      to: options.email,
      subject: options.subject,
      html: html || options.message,
      text: options.text || options.message, // Plain text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
