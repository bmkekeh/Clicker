import {
    expect,
    test,
    vi,
} from "vitest";

import Game from
    "../src/model/game.ts";

import MultiplierUpgrade from
    "../src/model/multiplier-upgrade.ts";

import PowerUpgrade from
    "../src/model/power-upgrade.ts";

import StarCollector from
    "../src/model/star-collector.ts";

import Star from
    "../src/model/star.ts";

function createRoboBuyGame(): {
    game: Game;
    solarFlare: PowerUpgrade;
    cometStrike: PowerUpgrade;
    gravityWell: MultiplierUpgrade;
    solarHarvester: StarCollector;
} {
    const star = new Star(
        "Glowing Star",
        "/star.png",
    );

    const solarFlare =
        new PowerUpgrade(
            "Solar Flare",
            "Adds five to click power.",
            2,
            5,
        );

    const cometStrike =
        new PowerUpgrade(
            "Comet Strike",
            "Adds ten to click power.",
            3,
            10,
        );

    const gravityWell =
        new MultiplierUpgrade(
            "Gravity Well",
            "Multiplies click power by two.",
            5,
            2,
        );

    const solarHarvester =
        new StarCollector(
            "Solar Harvester",
            "Produces passive Stardust.",
            4,
            3,
        );

    const game = new Game(
        star,
        [
            solarFlare,
            cometStrike,
            gravityWell,
        ],
        [
            solarHarvester,
        ],
    );

    return {
        game,
        solarFlare,
        cometStrike,
        gravityWell,
        solarHarvester,
    };
}

test(
    "Robo-buy starts disabled",
    () => {
        const { game } =
            createRoboBuyGame();

        expect(
            game.roboBuyEnabled,
        ).toBe(false);
    },
);

test(
    "Robo-buy can be enabled and disabled",
    () => {
        const { game } =
            createRoboBuyGame();

        game.setMarkovModel({
            a: {
                c: 1,
            },
            c: {
                c: 1,
            },
        });

        game.enableRoboBuy();

        expect(
            game.roboBuyEnabled,
        ).toBe(true);

        game.disableRoboBuy();

        expect(
            game.roboBuyEnabled,
        ).toBe(false);
    },
);

test(
    "Robo-buy cannot be enabled without a trained model",
    () => {
        const { game } =
            createRoboBuyGame();

        expect(() => {
            game.enableRoboBuy();
        }).toThrow();
    },
);

test(
    "Robo-buy automatically purchases an affordable upgrade",
    () => {
        const {
            game,
            cometStrike,
        } = createRoboBuyGame();

        /*
         * The initial Markov state is "a".
         * State c maps to Comet Strike.
         */
        game.setMarkovModel({
            a: {
                c: 1,
            },
            c: {
                c: 1,
            },
        });

        game.enableRoboBuy();

        game.click();
        game.click();

        expect(
            cometStrike.purchased,
        ).toBe(false);

        game.click();

        expect(
            cometStrike.purchased,
        ).toBe(true);

        expect(
            game.clickPower,
        ).toBe(11);

        expect(
            game.stardust,
        ).toBe(0);
    },
);

test(
    "Disabled robo-buy does not purchase items",
    () => {
        const {
            game,
            cometStrike,
        } = createRoboBuyGame();

        game.setMarkovModel({
            a: {
                c: 1,
            },
            c: {
                c: 1,
            },
        });

        game.enableRoboBuy();
        game.disableRoboBuy();

        game.click();
        game.click();
        game.click();

        expect(
            cometStrike.purchased,
        ).toBe(false);

        expect(
            game.stardust,
        ).toBe(3);
    },
);

test(
    "Manual purchase changes the state used by robo-buy",
    () => {
        const {
            game,
            solarFlare,
            solarHarvester,
        } = createRoboBuyGame();

        /*
         * a = Solar Flare
         * i = Solar Harvester
         *
         * After Solar Flare is manually purchased,
         * the current Markov state becomes a.
         * The model then selects i.
         */
        game.setMarkovModel({
            a: {
                i: 1,
            },
            i: {
                i: 1,
            },
        });

        game.click();
        game.click();

        expect(
            game.purchaseUpgrade(
                solarFlare,
            ),
        ).toBe(true);

        game.enableRoboBuy();

        /*
         * Solar Harvester costs 4.
         * Solar Flare changed click power
         * from 1 to 6.
         */
        game.click();

        expect(
            solarHarvester.quantity,
        ).toBe(1);
    },
);

test(
    "Robo-buy uses Markov transition probabilities",
    () => {
        const {
            game,
            solarFlare,
            cometStrike,
        } = createRoboBuyGame();

        game.setMarkovModel({
            a: {
                a: 0.5,
                c: 0.5,
            },
            c: {
                c: 1,
            },
        });

        const random =
            vi.spyOn(
                Math,
                "random",
            );

        random.mockReturnValue(
            0.75,
        );

        game.enableRoboBuy();

        game.click();
        game.click();
        game.click();

        expect(
            cometStrike.purchased,
        ).toBe(true);

        expect(
            solarFlare.purchased,
        ).toBe(false);

        random.mockRestore();
    },
);