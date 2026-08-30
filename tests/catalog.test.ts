import {
    beforeEach,
    expect,
    test,
} from "vitest";

import {
    initializeDatabase,
    resetDatabase,
} from "../src/database.ts";

import MultiplierUpgrade from "../src/model/multiplier-upgrade.ts";
import NebulaFactory from "../src/model/nebula-factory.ts";
import PowerUpgrade from "../src/model/power-upgrade.ts";
import StarCollector from "../src/model/star-collector.ts";

beforeEach(async () => {
    await resetDatabase();
    await initializeDatabase();
});

test(
    "PowerUpgrade.getAll loads power upgrades",
    async () => {
        const upgrades =
            await PowerUpgrade.getAll();

        expect(upgrades).toHaveLength(4);

        expect(
            upgrades.map(
                (upgrade) => upgrade.name,
            ),
        ).toEqual([
            "Comet Strike",
            "Solar Flare",
            "Stellar Pulse",
            "Supernova Burst",
        ]);
    },
);

test(
    "MultiplierUpgrade.getAll loads multiplier upgrades",
    async () => {
        const upgrades =
            await MultiplierUpgrade.getAll();

        expect(upgrades).toHaveLength(4);

        expect(
            upgrades.map(
                (upgrade) => upgrade.name,
            ),
        ).toEqual([
            "Cosmic Prism",
            "Gravity Well",
            "Lunar Lens",
            "Quantum Orbit",
        ]);
    },
);

test(
    "StarCollector.getAll loads star collectors",
    async () => {
        const buildings =
            await StarCollector.getAll();

        expect(buildings).toHaveLength(3);

        expect(
            buildings.map(
                (building) => building.name,
            ),
        ).toEqual([
            "Photon Collector",
            "Solar Harvester",
            "Star Collector",
        ]);
    },
);

test(
    "NebulaFactory.getAll loads nebula factories",
    async () => {
        const buildings =
            await NebulaFactory.getAll();

        expect(buildings).toHaveLength(3);

        expect(
            buildings.map(
                (building) => building.name,
            ),
        ).toEqual([
            "Dark Matter Plant",
            "Galactic Foundry",
            "Nebula Factory",
        ]);
    },
);