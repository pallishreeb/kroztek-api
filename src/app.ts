import express from "express";
import path from "path";
import cors from "cors";
import routes from "./routes";
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Kroztek API is running",
  });
});

app.use("/api", routes);

export default app;