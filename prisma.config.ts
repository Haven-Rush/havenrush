import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// `quiet: true` suppresses dotenv's "injected env (N) from .env" console
// line. Without it, that line has ended up piped into a redirected
// `prisma migrate dev > migration.sql` and committed as invalid leading
// SQL (see prisma/migrations/20260920221259_init and DECISIONS.md).
loadEnv({ quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
