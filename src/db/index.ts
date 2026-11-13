import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/** Drizzle client bound to the D1 database of the current request (binding `DB`). */
export function getDb() {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema, casing: "snake_case" });
}
