import { PrismaClient } from "@prisma/client";
import { runSeed } from "./seed-runner";

const prisma = new PrismaClient();

runSeed(prisma)
  .then(() => console.log("Seed complete."))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
