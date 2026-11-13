import { defineConfig } from "drizzle-kit";

// Drizzle only generates SQL migrations; they are applied by Wrangler
// (`npm run db:migrate:local` / `db:migrate:remote`), which tracks them in D1.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
});
