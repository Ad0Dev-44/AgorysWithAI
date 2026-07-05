import "dotenv/config";
import app from "./app.js";
import { prisma } from "./lib/prisma.ts";

const PORT = process.env.PORT || 5000;

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// ---------------- OPTIONAL: DB CONNECTION TEST ----------------
async function testDB() {
  try {
    const userCount = await prisma.user.count();

    console.log("🟢 Database connected to Neon");
    console.log(`👤 Users in DB: ${userCount}`);
  } catch (error) {
    console.error("🔴 Database connection failed:", error);
  }
}

testDB();