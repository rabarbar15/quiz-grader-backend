// server.ts
import express, { Application } from "express";
import cors from "cors";
import router from "./routes/apiRoutes";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/api", router);

const PORT: number = parseInt(process.env.PORT || "3001", 10);
app.listen(PORT, (): void => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
