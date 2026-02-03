// import express from "express";
// import { scrapeAndSaveEvents } from "../controllers/scrapeController.js";

// const router = express.Router();

// // Later we will protect this with admin auth
// router.post("/run", scrapeAndSaveEvents);

// export default router;

import express from "express";
import { scrapeAndSaveEvents } from "../controllers/scrapeController.js";
import requireAdmin from "../middlewares/requireAdmin.js";

const router = express.Router();

router.post("/run", requireAdmin, scrapeAndSaveEvents);

export default router;
