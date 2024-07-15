const axios = require("axios");







exports.getRoot = async (req, res) => {
  try {
    res.status(200).json({ message: "API is up" });
  } catch (error) {
    res.status(400).json({ error: "Error", error });
  }
};
