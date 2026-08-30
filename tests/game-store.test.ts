import { beforeEach, expect, test } from "vitest";

import Account from "../src/model/account.ts";
import GameStore from "../src/model/game-store.ts";
import PowerUpgrade from "../src/model/power-upgrade.ts";
import MultiplierUpgrade from "../src/model/multiplier-upgrade.ts";
import StarCollector from "../src/model/star-collector.ts";
import NebulaFactory from "../src/model/nebula-factory.ts";
import type Building from "../src/model/building.ts";
import type Upgrade from "../src/model/upgrade.ts";
//import { resetDatabase } from "../src/database.ts";
import {
    database,
    resetDatabase,
} from "../src/database.ts";

beforeEach(async () => {
    await resetDatabase();

    /*
     * game.account has a foreign key to account.username, so an
     * Account must exist before a Game can be created for it.
     */
    await Account.register("nova", "some password");
    await Account.register("comet", "some password");
});

function freshUpgrades(): Upgrade[] {
    return [
        new PowerUpgrade(
            "Solar Flare",
            "Adds five to click power.",
            10,
            5,
        ),
        new MultiplierUpgrade(
            "Gravity Well",
            "Multiplies click power by two.",
            30,
            2,
        ),
    ];
}

function freshBuildings(): Building[] {
    return [
        new StarCollector(
            "Star Collector",
            "Produces one stardust per second.",
            50,
            1,
        ),
        new NebulaFactory(
            "Nebula Factory",
            "Produces five stardust per second.",
            200,
            5,
        ),
    ];
}

test("Loading a saved game without a star fails", async () => {
    await GameStore.loadOrCreate(
        "nova",
        freshUpgrades(),
        freshBuildings(),
    );

    await database.query(
        `
            delete from star
            where game = $1;
        `,
        ["nova"],
    );

    await expect(
        GameStore.loadOrCreate(
            "nova",
            freshUpgrades(),
            freshBuildings(),
        ),
    ).rejects.toThrow(
        "The saved game does not contain a star.",
    );
});

test("loadOrCreate creates a brand new game for a new account", async () => {
    const game = await GameStore.loadOrCreate(
        "nova",
        freshUpgrades(),
        freshBuildings(),
    );

    expect(game.stardust).toBe(0);
    expect(game.clickPower).toBe(1);
    expect(game.star.totalClicks).toBe(0);
    expect(game.upgrades).toHaveLength(2);
    expect(game.buildings).toHaveLength(2);
});

test("loadOrCreate returns the same saved state on a second call", async () => {
    const firstGame = await GameStore.loadOrCreate(
        "nova",
        freshUpgrades(),
        freshBuildings(),
    );

    firstGame.click();
    firstGame.click();

    await GameStore.save("nova", firstGame);

    const secondGame = await GameStore.loadOrCreate(
        "nova",
        freshUpgrades(),
        freshBuildings(),
    );

    expect(secondGame.stardust).toBe(2);
    expect(secondGame.star.totalClicks).toBe(2);
});

test("Saving a purchased upgrade restores it as purchased after loading", async () => {
    const upgrades = freshUpgrades();
    const [powerUpgrade] = upgrades;

    const game = await GameStore.loadOrCreate(
        "nova",
        upgrades,
        freshBuildings(),
    );

    for (let i = 0; i < 10; i += 1) {
        game.click();
    }

    game.purchaseUpgrade(powerUpgrade!);

    await GameStore.save("nova", game);

    const reloadedGame = await GameStore.loadOrCreate(
        "nova",
        freshUpgrades(),
        freshBuildings(),
    );

    const [reloadedPowerUpgrade] = reloadedGame.upgrades;

    expect(reloadedPowerUpgrade?.purchased).toBe(true);
    expect(reloadedGame.clickPower).toBe(6);
});

test("Saving a purchased building restores its quantity after loading", async () => {
    const buildings = freshBuildings();
    const [starCollector] = buildings;

    const game = await GameStore.loadOrCreate(
        "nova",
        freshUpgrades(),
        buildings,
    );

    for (let i = 0; i < 120; i += 1) {
        game.click();
    }

    const firstPurchase = game.purchaseBuilding(starCollector!);
    const secondPurchase = game.purchaseBuilding(starCollector!);

    expect(firstPurchase).toBe(true);
    expect(secondPurchase).toBe(true);

    await GameStore.save("nova", game);

    const reloadedGame = await GameStore.loadOrCreate(
        "nova",
        freshUpgrades(),
        freshBuildings(),
    );

    const [reloadedStarCollector] = reloadedGame.buildings;

    expect(reloadedStarCollector?.quantity).toBe(2);
});

test("Two different accounts have independent, separately saved games", async () => {
    const novaGame = await GameStore.loadOrCreate(
        "nova",
        freshUpgrades(),
        freshBuildings(),
    );

    novaGame.click();

    await GameStore.save("nova", novaGame);

    const cometGame = await GameStore.loadOrCreate(
        "comet",
        freshUpgrades(),
        freshBuildings(),
    );

    expect(cometGame.stardust).toBe(0);
    expect(novaGame.stardust).toBe(1);
});