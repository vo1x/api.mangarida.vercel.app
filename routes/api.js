const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");

const { getRoot } = mediaController;

router.get("/", getRoot);

module.exports = router;
