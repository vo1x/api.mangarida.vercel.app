import express from "express";
import mediaController from "../controllers/mediaController";
import comicKController from "../controllers/comicKController";
const router = express.Router();
import limiter from "../middleware/rateLimit";
const { getRoot, getSearch, getChapters, getMetadata, getPages } =
  comicKController;

router.get("/", getRoot);
router.get("/search", getSearch);
router.get("/chapters/:mangaID", getChapters);
router.get("/manga/:mangaID", limiter, getMetadata);
router.get("/read/:chapterID", limiter, getPages);

export default router;
