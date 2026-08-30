import { database } from "../database.ts";
import Building from "./building.ts";

type NebulaFactoryRow = {
    name: string;
    description: string;
    cost: number;
    stardust_per_second: number;
};

export default class NebulaFactory extends Building {
    static async getAll(): Promise<NebulaFactory[]> {
        const result =
            await database.query<NebulaFactoryRow>(`
                select
                    building.name,
                    building.description,
                    building.cost,
                    building.stardust_per_second
                from building
                join nebula_factory
                    on nebula_factory.building = building.name
                order by building.name;
            `);

        return result.rows.map(
            (row) =>
                new NebulaFactory(
                    row.name,
                    row.description,
                    row.cost,
                    row.stardust_per_second,
                ),
        );
    }
}