import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google
export async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "credential is required" });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name || "Google User";

    if (!email) return res.status(400).json({ error: "Google token missing email" });

    // MVP: return your app session (later: store user in DB + real JWT)
    const token = "cb_google_" + Date.now();

    return res.json({
      token,
      user: { full_name: name, contact: email, role: "USER", verified: true },
    });
  } catch (err) {
    console.error("googleLogin error:", err);
    return res.status(401).json({ error: "Google auth failed" });
  }
}