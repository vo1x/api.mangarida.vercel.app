const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");

const { getRoot, getSearch, getChapters, getMetadata } = mediaController;

router.get("/", getRoot);
router.get("/search", getSearch);
router.get("/chapters/:slug", getChapters);
router.get("/manga/:slug", getMetadata);

module.exports = router;
