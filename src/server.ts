import app from "./app";
import { env } from "./config/env";
import { prisma } from "./core/database/prisma";

async function startServer() {
  try {
    await prisma.$connect();

    console.log("✅ Database connected");

    app.listen(env.port, () => {
      console.log(
        `🚀 Kroztek API running on http://localhost:${env.port}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
}

startServer();