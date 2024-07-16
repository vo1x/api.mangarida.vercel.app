require("dotenv").config;

const express = require("express");
const cors = require("cors");
const app = express();

const imageProxy = require("../middlewares/imageProxy");

const allowedOrigins = [
  "https://mangarida.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials like cookies, authorization headers, etc.

  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const apiRoutes = require("../routes/api");
app.use(express.json());

app.use("/", apiRoutes);
app.use("/image", imageProxy);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
