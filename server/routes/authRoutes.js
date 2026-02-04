import express from "express";
import passport from "passport";

const router = express.Router();

/* ================= GOOGLE LOGIN ================= */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/* ================= GOOGLE CALLBACK ================= */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/admin/login`,
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/admin/dashboard`);
  }
);


/* ================= CURRENT USER ================= */
router.get("/me", (req, res) => {
  res.json(req.user || null);
});

/* ================= LOGOUT ================= */
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL);
  });
});

export default router;
