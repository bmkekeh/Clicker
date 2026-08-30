import { database } from "../database.ts";
import Game from "./game.ts";
import Star from "./star.ts";
import Upgrade from "./upgrade.ts";
import Building from "./building.ts";

type GameRow = {
    account: string;
    stardust: number;
    click_power: number;
};

type StarRow = {
    name: string;
    image_url: string;
    total_clicks: number;
};

type GameUpgradeRow = {
    upgrade: string;
};

type GameBuildingRow = {
    building: string;
    quantity: number;
};

export default class GameStore {
    static async loadOrCreate(
        username: string,
        upgrades: Upgrade[],
        buildings: Building[],
    ): Promise<Game> {
        const gameResult =
            await database.query<GameRow>(
                `
                    select
                        account,
                        stardust,
                        click_power
                    from game
                    where account = $1;
                `,
                [username],
            );

        if (gameResult.rows.length === 0) {
            return await GameStore.create(
                username,
                upgrades,
                buildings,
            );
        }

        const gameRow = gameResult.rows[0];

        const starResult =
            await database.query<StarRow>(
                `
                    select
                        name,
                        image_url,
                        total_clicks
                    from star
                    where game = $1;
                `,
                [username],
            );

        if (starResult.rows.length === 0) {
            throw new Error(
                "The saved game does not contain a star.",
            );
        }

        const starRow = starResult.rows[0];

        const purchasedResult =
            await database.query<GameUpgradeRow>(
                `
                    select
                        upgrade
                    from game_upgrade
                    where game = $1;
                `,
                [username],
            );

        const purchasedNames = new Set(
            purchasedResult.rows.map(
                (row) => row.upgrade,
            ),
        );

        for (const upgrade of upgrades) {
            if (purchasedNames.has(upgrade.name)) {
                upgrade.restorePurchase();
            }
        }

        const buildingResult =
            await database.query<GameBuildingRow>(
                `
                    select
                        building,
                        quantity
                    from game_building
                    where game = $1;
                `,
                [username],
            );

        const buildingQuantities = new Map(
            buildingResult.rows.map(
                (row) => [
                    row.building,
                    row.quantity,
                ],
            ),
        );

        for (const building of buildings) {
            const quantity =
                buildingQuantities.get(building.name);

            if (quantity !== undefined) {
                building.restoreQuantity(quantity);
            }
        }

        const star = new Star(
            starRow.name,
            starRow.image_url,
            starRow.total_clicks,
        );

        return new Game(
            star,
            upgrades,
            buildings,
            gameRow.stardust,
            gameRow.click_power,
        );
    }

    static async create(
        username: string,
        upgrades: Upgrade[],
        buildings: Building[],
    ): Promise<Game> {
        const star = new Star(
            "Glowing Star",
            "/star.png",
        );

        const game = new Game(
            star,
            upgrades,
            buildings,
        );

        await database.query(
            `
                insert into game (
                    account,
                    stardust,
                    click_power
                )
                values ($1, $2, $3);
            `,
            [
                username,
                game.stardust,
                game.clickPower,
            ],
        );

        await database.query(
            `
                insert into star (
                    name,
                    image_url,
                    total_clicks,
                    game
                )
                values ($1, $2, $3, $4);
            `,
            [
                star.name,
                star.imageUrl,
                star.totalClicks,
                username,
            ],
        );

        return game;
    }

    static async save(
        username: string,
        game: Game,
    ): Promise<void> {
        await database.query(
            `
                update game
                set
                    stardust = $1,
                    click_power = $2
                where account = $3;
            `,
            [
                game.stardust,
                game.clickPower,
                username,
            ],
        );

        await database.query(
            `
                update star
                set
                    name = $1,
                    image_url = $2,
                    total_clicks = $3
                where game = $4;
            `,
            [
                game.star.name,
                game.star.imageUrl,
                game.star.totalClicks,
                username,
            ],
        );

        await database.query(
            `
                delete from game_upgrade
                where game = $1;
            `,
            [username],
        );

        for (const upgrade of game.upgrades) {
            if (upgrade.purchased) {
                await database.query(
                    `
                        insert into game_upgrade (
                            game,
                            upgrade
                        )
                        values ($1, $2)
                        on conflict (game, upgrade)
                        do nothing;
                    `,
                    [
                        username,
                        upgrade.name,
                    ],
                );
            }
        }

        for (const building of game.buildings) {
            await database.query(
                `
                    insert into game_building (
                        game,
                        building,
                        quantity
                    )
                    values ($1, $2, $3)
                    on conflict (game, building)
                    do update set
                        quantity = excluded.quantity;
                `,
                [
                    username,
                    building.name,
                    building.quantity,
                ],
            );
        }
    }
}