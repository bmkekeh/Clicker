import { PGlite } from "@electric-sql/pglite";
import ddl from "../create-tables.sql?raw";

const isTestEnvironment = import.meta.env.VITEST;

export const database = isTestEnvironment
    ? new PGlite()
    /* v8 ignore next */
    : new PGlite("idb://cosmic-clicker");

export async function initializeDatabase(): Promise<void> {
    await database.exec(ddl);
}

export async function resetDatabase(): Promise<void> {
    await database.exec(`
        drop table if exists
            game_building,
            game_upgrade,
            star,
            game,
            star_collector,
            nebula_factory,
            building,
            power_upgrade,
            multiplier_upgrade,
            upgrade,
            account
        cascade;
    `);

    await initializeDatabase();
}