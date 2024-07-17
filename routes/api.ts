import express from "express";
import mediaController from "../controllers/mediaController";

const router = express.Router();

const {
  getRoot,
  getSearch,
  getChapters,
  getMetadata,
  getTrending,
  getPages,
  getNewReleases,
} = mediaController;

router.get("/", getRoot);
router.get("/search", getSearch);
router.get("/chapters/:slug", getChapters);
router.get("/manga/:slug", getMetadata);
router.get("/read/:slug/:chapter", getPages);
router.get("/trending", getTrending);
router.get("/new", getNewReleases);

export default router;
