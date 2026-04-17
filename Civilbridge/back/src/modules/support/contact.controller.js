import prisma from "../../config/prisma.js";
import { emailService } from "../../services/email.service.js";

const SUPPORT_EMAIL = process.env.INBOUND_ALERT_EMAIL || "samuelnizeyimana505@gmail.com";
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

export async function submitContact(req, res) {
  try {
    const { name, email, phone, topic, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Name, email, and message are all required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const normalizedTopic = topic?.trim() || "General help request";
    const normalizedPhone = phone?.trim() || "";
    const compiledMessage = [
      `Topic: ${normalizedTopic}`,
      normalizedPhone ? `Phone: ${normalizedPhone}` : null,
      "",
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    // Save to DB
    await prisma.contactMessage.create({
      data: {
        name:    name.trim(),
        email:   email.trim().toLowerCase(),
        message: compiledMessage,
      },
    });

    // Notify support team
    await emailService.sendEmail(
      SUPPORT_EMAIL,
      `New Contact Message from ${name.trim()}`,
      `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#0c1220;">New Message via CivilBridge Contact Form</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:bold;width:120px;">Name</td><td style="padding:8px;">${name.trim()}</td></tr>
            <tr style="background:#f7f9ff;"><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Phone</td><td style="padding:8px;">${normalizedPhone || "Not provided"}</td></tr>
            <tr style="background:#f7f9ff;"><td style="padding:8px;font-weight:bold;">Topic</td><td style="padding:8px;">${normalizedTopic}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;vertical-align:top;">Message</td><td style="padding:8px;white-space:pre-wrap;">${message.trim()}</td></tr>
          </table>
          <p style="color:#888;font-size:12px;margin-top:24px;">Sent from the CivilBridge contact form. Reply directly to the sender's email above.</p>
        </div>
      `,
      `New message from ${name.trim()} (${email.trim()})\nPhone: ${normalizedPhone || "Not provided"}\nTopic: ${normalizedTopic}\n\n${message.trim()}`
    );

    // Confirmation to sender
    await emailService.sendEmail(
      email.trim(),
      "We received your message — CivilBridge",
      `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#0c1220;">Thanks for reaching out, ${name.trim().split(" ")[0]}!</h2>
          <p style="color:#444;line-height:1.6;">
            We've received your message and our team will get back to you as soon as possible —
            usually within one business day.
          </p>
          <blockquote style="border-left:3px solid #00f2ff;margin:20px 0;padding:12px 16px;background:#f7f9ff;color:#555;font-style:italic;">
            "${message.trim().slice(0, 300)}${message.trim().length > 300 ? "…" : ""}"
          </blockquote>
          <p style="color:#444;">In the meantime, you can:</p>
          <ul style="color:#444;line-height:1.8;">
            <li>Browse available <a href="${FRONTEND_URL}/plans" style="color:#0066cc;">construction plans</a></li>
            <li>Explore <a href="${FRONTEND_URL}/experts" style="color:#0066cc;">verified professionals</a></li>
            <li>Check <a href="${FRONTEND_URL}/marketplace" style="color:#0066cc;">property listings</a></li>
          </ul>
          <p style="color:#888;font-size:12px;margin-top:32px;">
            CivilBridge — Rwanda's Construction Platform<br/>
            <a href="mailto:${SUPPORT_EMAIL}" style="color:#888;">${SUPPORT_EMAIL}</a>
          </p>
        </div>
      `,
      `Hi ${name.trim().split(" ")[0]}, we received your message and will reply shortly.\n\nYour message:\n${message.trim()}`
    );

    return res.status(201).json({ success: true, message: "Message sent. We'll be in touch soon." });
  } catch (err) {
    return res.status(500).json({ message: "Failed to send message. Please try again." });
  }
}
