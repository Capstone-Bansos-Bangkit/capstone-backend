import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import dotenv from "dotenv";
dotenv.config();

async function main() {
    const client = postgres(process.env.DATABASE_URL as string, { max: 1 });
    await migrate(drizzle(client), {
        migrationsFolder: "./db/migrations",
    });

    await client.end();
}

main();
