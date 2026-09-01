import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Kroztek seed...");

  const company = await prisma.company.upsert({
    where: {
      slug: "kroztek-integrated-solution",
    },
    update: {
      name: "Kroztek Integrated Solution",
      email: "kroztekintegratedsolution@gmail.com",
    },
    create: {
      name: "Kroztek Integrated Solution",
      slug: "kroztek-integrated-solution",
      email: "kroztekintegratedsolution@gmail.com",
    },
  });

  console.log(`🏢 Company: ${company.name}`);
  console.log(`   ID: ${company.id}`);

  const hashedPassword = await bcrypt.hash(
    "KIS@1111",
    10
  );

  const admin = await prisma.user.upsert({
    where: {
      email: "kroztekintegratedsolution@gmail.com",
    },
    update: {
      name: "Kroztek Admin",
      companyId: company.id,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      companyId: company.id,
      name: "Kroztek Admin",
      email: "kroztekintegratedsolution@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`👤 Admin: ${admin.email}`);
  console.log(`   ID: ${admin.id}`);

  console.log("✅ Seed completed successfully");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });