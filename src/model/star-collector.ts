import { database } from "../database.ts";
import Building from "./building.ts";


type StarCollectorRow = {
    name: string;
    description: string;
    cost: number;
    stardust_per_second: number;
};

export default class StarCollector extends Building {
    static async getAll(): Promise<StarCollector[]> {
        const result =
            await database.query<StarCollectorRow>(`
                select
                    building.name,
                    building.description,
                    building.cost,
                    building.stardust_per_second
                from building
                join star_collector
                    on star_collector.building = building.name
                order by building.name;
            `);

        return result.rows.map(
            (row) =>
                new StarCollector(
                    row.name,
                    row.description,
                    row.cost,
                    row.stardust_per_second,
                ),
        );
    }
}