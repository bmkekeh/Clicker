import "./style.css";

import StarCollector from "./model/star-collector.ts";
import NebulaFactory from "./model/nebula-factory.ts";
import PowerUpgrade from "./model/power-upgrade.ts";
import MultiplierUpgrade from "./model/multiplier-upgrade.ts";
import AccountController from "./controller/account-controller.ts";
import type { MarkovModel } from "./model/markov-chain.ts";

import {
    database,
    initializeDatabase,
} from "./database.ts";

await initializeDatabase();

const repl = document.querySelector("#repl");

if (repl === null) {
    throw new Error(
        "Database REPL was not found.",
    );
}

Object.assign(repl, {
    pg: database,
});

const powerUpgrades =
    await PowerUpgrade.getAll();

const multiplierUpgrades =
    await MultiplierUpgrade.getAll();

const starCollectors =
    await StarCollector.getAll();

const nebulaFactories =
    await NebulaFactory.getAll();

const modelResponse =
    await fetch("/model.json");

if (!modelResponse.ok) {
    throw new Error(
        "Could not load trained Markov model.",
    );
}

const markovModel: MarkovModel =
    await modelResponse.json();

new AccountController(
    [
        ...powerUpgrades,
        ...multiplierUpgrades,
    ],
    [
        ...starCollectors,
        ...nebulaFactories,
    ],
    markovModel,
);