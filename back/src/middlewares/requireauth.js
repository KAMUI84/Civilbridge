export function requireAuth(req, res, next) {
  // MVP: allow if Authorization exists OR if you have your own session method
  // Replace with your real JWT verification logic.
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  // Example: attach a fake user id for now (replace with decoded JWT id)
  req.user = { id: "demo_user" };

  next();
}