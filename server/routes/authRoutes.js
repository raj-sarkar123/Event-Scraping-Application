import express from "express";
import passport from "passport";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173"
  }),
  (req, res) => {
   res.redirect("http://localhost:5173/admin/dashboard");

  }
);

router.get("/me", (req, res) => {
  res.json(req.user || null);
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

export default router;
