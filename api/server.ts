import express from "express";
import cors, { CorsOptions } from "cors";

import imageProxy from "../middlewares/imageProxy";
import router from "../routes/api";

const app = express();

const allowedOrigins: string[] = [
  "https://mangarida.vercel.app",
  "http://localhost:5173",
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/", router);
app.use("/image", imageProxy);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});