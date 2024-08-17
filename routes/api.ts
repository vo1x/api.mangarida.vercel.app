import express from "express";
import comicKController from "../controllers/comicKController";
const router = express.Router();
const { getRoot, getTrending, getSearch, getChapters, getMetadata, getPages } =
  comicKController;

router.get("/", getRoot);
router.get("/trending", getTrending);
router.get("/search", getSearch);
router.get("/chapters/:mangaID", getChapters);
router.get("/manga/:mangaID", getMetadata);
router.get("/read/:chapterID", getPages);

export default router;
