export default function requireAdmin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  next();
}
