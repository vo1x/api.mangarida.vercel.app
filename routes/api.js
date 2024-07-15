const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");

const { getRoot, getSearch } = mediaController;

router.get("/", getRoot);
router.get("/search", getSearch);
router.get("/chapters/:slug", mediaController.getChapters);

module.exports = router;
