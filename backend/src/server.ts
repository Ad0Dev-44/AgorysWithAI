import express, { Request, Response } from "express";
import datasetRoutes from "./routes/dataset.routes";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();

    res.json({
      message: "Backend server is running smoothly!",
      database: "Connected to Neon 🚀",
      users: userCount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed.",
    });
  }
});
app.use("/api/datasets", datasetRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is blasting off on http://localhost:${PORT}`);
});
