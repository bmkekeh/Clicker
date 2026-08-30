import { expect, test } from "vitest";

//import Building from "../src/model/building.ts";
import type Building from "../src/model/building.ts";
import StarCollector from "../src/model/star-collector.ts";
import NebulaFactory from "../src/model/nebula-factory.ts";
import Game from "../src/model/game.ts";
import type Listener from "../src/model/listener.ts";
import MultiplierUpgrade from "../src/model/multiplier-upgrade.ts";
import PowerUpgrade from "../src/model/power-upgrade.ts";
import Star from "../src/model/star.ts";

function createGame(): {
    game: Game;
    powerUpgrade: PowerUpgrade;
    multiplierUpgrade: MultiplierUpgrade;
    starCollector: Building;
    nebulaFactory: Building;
} {
    const star = new Star(
        "Glowing Star",
        "/star.png",
    );

    const powerUpgrade = new PowerUpgrade(
        "Solar Flare",
        "Adds five to click power.",
        10,
        5,
    );

    const multiplierUpgrade =
        new MultiplierUpgrade(
            "Gravity Well",
            "Multiplies click power by two.",
            30,
            2,
        );

        const starCollector = new StarCollector(
            "Star Collector",
            "Produces one stardust per second.",
            10,
            1,
        );
        
        const nebulaFactory = new NebulaFactory(
            "Nebula Factory",
            "Produces five stardust per second.",
            50,
            5,
        );

    const game = new Game(
        star,
        [
            powerUpgrade,
            multiplierUpgrade,
        ],
        [
            starCollector,
            nebulaFactory,
        ],
    );

    return {
        game,
        powerUpgrade,
        multiplierUpgrade,
        starCollector,
        nebulaFactory,
    };
}

function clickManyTimes(
    game: Game,
    times: number,
): void {
    for (let i = 0; i < times; i += 1) {
        game.click();
    }
}

test("Game starts with correct values", () => {
    const { game } = createGame();

    expect(game.stardust).toBe(0);
    expect(game.clickPower).toBe(1);
    expect(game.star.totalClicks).toBe(0);
    expect(game.upgrades).toHaveLength(2);
    expect(game.buildings).toHaveLength(2);
    expect(game.stardustPerSecond).toBe(0);
});

test("Game click increases clicks and stardust", () => {
    const { game } = createGame();

    game.click();

    expect(game.star.totalClicks).toBe(1);
    expect(game.stardust).toBe(1);
});

test("Game cannot purchase upgrade without enough stardust", () => {
    const {
        game,
        powerUpgrade,
    } = createGame();

    const purchased =
        game.purchaseUpgrade(powerUpgrade);

    expect(purchased).toBe(false);
    expect(game.stardust).toBe(0);
    expect(game.clickPower).toBe(1);
});

test("Game purchases PowerUpgrade successfully", () => {
    const {
        game,
        powerUpgrade,
    } = createGame();

    clickManyTimes(game, 10);

    const purchased =
        game.purchaseUpgrade(powerUpgrade);

    expect(purchased).toBe(true);
    expect(game.stardust).toBe(0);
    expect(game.clickPower).toBe(6);
    expect(powerUpgrade.purchased).toBe(true);
});

test("Game cannot purchase same upgrade twice", () => {
    const {
        game,
        powerUpgrade,
    } = createGame();

    clickManyTimes(game, 10);
    game.purchaseUpgrade(powerUpgrade);

    const secondPurchase =
        game.purchaseUpgrade(powerUpgrade);

    expect(secondPurchase).toBe(false);
    expect(game.clickPower).toBe(6);
});

test("PowerUpgrade affects later clicks", () => {
    const {
        game,
        powerUpgrade,
    } = createGame();

    clickManyTimes(game, 10);
    game.purchaseUpgrade(powerUpgrade);
    game.click();

    expect(game.stardust).toBe(6);
});

test("Game purchases MultiplierUpgrade successfully", () => {
    const {
        game,
        powerUpgrade,
        multiplierUpgrade,
    } = createGame();

    clickManyTimes(game, 10);
    game.purchaseUpgrade(powerUpgrade);

    clickManyTimes(game, 5);

    const purchased =
        game.purchaseUpgrade(multiplierUpgrade);

    expect(purchased).toBe(true);
    expect(game.stardust).toBe(0);
    expect(game.clickPower).toBe(12);
});

test("Game rejects an upgrade that does not belong to it", () => {
    const { game } = createGame();

    const outsideUpgrade = new PowerUpgrade(
        "Outside Upgrade",
        "Does not belong to the game.",
        5,
        1,
    );

    expect(() => {
        game.purchaseUpgrade(outsideUpgrade);
    }).toThrow();
});

test("Game requires exactly two upgrades", () => {
    const {
        starCollector,
        nebulaFactory,
    } = createGame();

    const star = new Star(
        "Glowing Star",
        "/star.png",
    );

    const powerUpgrade = new PowerUpgrade(
        "Solar Flare",
        "Adds five to click power.",
        10,
        5,
    );

    expect(() => {
        new Game(
            star,
            [powerUpgrade],
            [
                starCollector,
                nebulaFactory,
            ],
        );
    }).toThrow();
});

test("Game requires one upgrade of each type", () => {
    const {
        starCollector,
        nebulaFactory,
    } = createGame();

    const star = new Star(
        "Glowing Star",
        "/star.png",
    );

    const firstUpgrade = new PowerUpgrade(
        "Solar Flare",
        "Adds five.",
        10,
        5,
    );

    const secondUpgrade = new PowerUpgrade(
        "Bigger Star",
        "Adds ten.",
        20,
        10,
    );

    expect(() => {
        new Game(
            star,
            [
                firstUpgrade,
                secondUpgrade,
            ],
            [
                starCollector,
                nebulaFactory,
            ],
        );
    }).toThrow();
});

test("Clicking notifies listeners", () => {
    const { game } = createGame();

    let notified = false;

    const listener: Listener = {
        notify(): void {
            notified = true;
        },
    };

    game.registerListener(listener);
    game.click();

    expect(notified).toBe(true);
});

test("Successful upgrade purchase notifies listeners", () => {
    const {
        game,
        powerUpgrade,
    } = createGame();

    clickManyTimes(game, 10);

    let notified = false;

    const listener: Listener = {
        notify(): void {
            notified = true;
        },
    };

    game.registerListener(listener);
    game.purchaseUpgrade(powerUpgrade);

    expect(notified).toBe(true);
});

test("Failed upgrade purchase notifies listeners", () => {
    const {
        game,
        powerUpgrade,
    } = createGame();

    let notified = false;

    const listener: Listener = {
        notify(): void {
            notified = true;
        },
    };

    game.registerListener(listener);

    const purchased =
        game.purchaseUpgrade(powerUpgrade);

    expect(purchased).toBe(false);
    expect(notified).toBe(true);
});

test("Game does not register the same listener twice", () => {
    const { game } = createGame();

    let notificationCount = 0;

    const listener: Listener = {
        notify(): void {
            notificationCount += 1;
        },
    };

    game.registerListener(listener);
    game.registerListener(listener);

    game.click();

    expect(notificationCount).toBe(1);
});

test("Game starts with game-started event", () => {
    const { game } = createGame();

    expect(game.lastEvent).toEqual({
        type: "game-started",
    });
});

/*
 * Building tests
 */

test("Game purchases a building successfully", () => {
    const {
        game,
        starCollector,
    } = createGame();

    clickManyTimes(game, 10);

    const purchased =
        game.purchaseBuilding(starCollector);

    expect(purchased).toBe(true);
    expect(game.stardust).toBe(0);
    expect(starCollector.quantity).toBe(1);
    expect(game.stardustPerSecond).toBe(1);
});

test("Game cannot purchase building without enough stardust", () => {
    const {
        game,
        starCollector,
    } = createGame();

    const purchased =
        game.purchaseBuilding(starCollector);

    expect(purchased).toBe(false);
    expect(game.stardust).toBe(0);
    expect(starCollector.quantity).toBe(0);
    expect(game.stardustPerSecond).toBe(0);
});

test("Game can purchase multiple copies of a building", () => {
    const {
        game,
        starCollector,
    } = createGame();

    clickManyTimes(game, 20);

    game.purchaseBuilding(starCollector);
    game.purchaseBuilding(starCollector);

    expect(starCollector.quantity).toBe(2);
    expect(game.stardust).toBe(0);
    expect(game.stardustPerSecond).toBe(2);
});

test("Building produces passive stardust", () => {
    const {
        game,
        starCollector,
    } = createGame();

    starCollector.restoreQuantity(3);

    game.collectPassiveStardust();

    expect(game.stardustPerSecond).toBe(3);
    expect(game.stardust).toBe(3);
});

test("Multiple buildings combine their production", () => {
    const {
        game,
        starCollector,
        nebulaFactory,
    } = createGame();

    starCollector.restoreQuantity(2);
    nebulaFactory.restoreQuantity(3);

    game.collectPassiveStardust();

    expect(game.stardustPerSecond).toBe(17);
    expect(game.stardust).toBe(17);
});

test("Building quantity can be restored", () => {
    const {
        starCollector,
    } = createGame();

    starCollector.restoreQuantity(4);

    expect(starCollector.quantity).toBe(4);
    expect(starCollector.totalProduction).toBe(4);
});

test("Game rejects a building that does not belong to it", () => {
    const { game } = createGame();

    const outsideBuilding = new StarCollector(
        "Outside Building",
        "Does not belong to the game.",
        5,
        1,
    );

    expect(() => {
        game.purchaseBuilding(outsideBuilding);
    }).toThrow();
});

test("Successful building purchase notifies listeners", () => {
    const {
        game,
        starCollector,
    } = createGame();

    clickManyTimes(game, 10);

    let notified = false;

    const listener: Listener = {
        notify(): void {
            notified = true;
        },
    };

    game.registerListener(listener);
    game.purchaseBuilding(starCollector);

    expect(notified).toBe(true);
});

test("Failed building purchase notifies listeners", () => {
    const {
        game,
        starCollector,
    } = createGame();

    let notified = false;

    const listener: Listener = {
        notify(): void {
            notified = true;
        },
    };

    game.registerListener(listener);

    const purchased =
        game.purchaseBuilding(starCollector);

    expect(purchased).toBe(false);
    expect(notified).toBe(true);
});

test("Passive stardust collection notifies listeners", () => {
    const {
        game,
        starCollector,
    } = createGame();

    starCollector.restoreQuantity(2);

    let notified = false;

    const listener: Listener = {
        notify(): void {
            notified = true;
        },
    };

    game.registerListener(listener);
    game.collectPassiveStardust();

    expect(notified).toBe(true);
});

test("Building purchase creates building-purchased event", () => {
    const {
        game,
        starCollector,
    } = createGame();

    clickManyTimes(game, 10);
    game.purchaseBuilding(starCollector);

    expect(game.lastEvent).toEqual({
        type: "building-purchased",
        buildingName: "Star Collector",
    });
});

test("Passive production creates passive-stardust-earned event", () => {
    const {
        game,
        starCollector,
    } = createGame();

    starCollector.restoreQuantity(3);
    game.collectPassiveStardust();

    expect(game.lastEvent).toEqual({
        type: "passive-stardust-earned",
        amount: 3,
    });
});

test("Building returns its description and production rate", () => {
    const building = new StarCollector(
        "Star Collector",
        "Produces one stardust per second.",
        10,
        1,
    );

    expect(building.description).toBe(
        "Produces one stardust per second.",
    );

    expect(building.stardustPerSecond).toBe(1);
});

test("Passive collection does nothing when production is zero", () => {
    const { game } = createGame();

    const previousEvent = game.lastEvent;

    game.collectPassiveStardust();

    expect(game.stardust).toBe(0);
    expect(game.lastEvent).toEqual(previousEvent);
});