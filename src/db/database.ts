import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import dotenv from "dotenv";
dotenv.config();

export let db: ReturnType<typeof drizzle> = undefined as any;

export async function initDatabase() {
    const queryClient = postgres(process.env.DATABASE_URL as string);
    db = drizzle(queryClient);
}
