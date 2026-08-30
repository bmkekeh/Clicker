import Building from "../model/building.ts";
import Game from "../model/game.ts";
import type Listener from "../model/listener.ts";
import Upgrade from "../model/upgrade.ts";

export default class GameView implements Listener {
    #root: HTMLDivElement;
    #game: Game;
    #starButton: HTMLButtonElement;
    #roboBuyButton: HTMLButtonElement;
    #stardustText: HTMLParagraphElement;
    #clickCountText: HTMLParagraphElement;
    #clickPowerText: HTMLParagraphElement;
    #productionText: HTMLParagraphElement;
    #messageText: HTMLParagraphElement;
    #upgradeButtons: Map<Upgrade, HTMLButtonElement>;
    #buildingButtons: Map<Building, HTMLButtonElement>;

    constructor(game: Game) {
        const root =
            document.querySelector<HTMLDivElement>("#app");

        if (root === null) {
            throw new Error(
                "App element was not found.",
            );
        }

        this.#root = root;
        this.#game = game;

        this.#root.innerHTML = `
            <main class="game">
                <h1>Cosmic Clicker</h1>

                <section class="stats">
                    <p id="click-count"></p>
                    <p id="stardust"></p>
                    <p id="click-power"></p>
                    <p id="production"></p>
                </section>

                <button
                    id="star-button"
                    class="star-button"
                    type="button"
                    aria-label="Click the glowing star"
                >
                    <img id="star-image" />
                </button>

                <section class="robo-buy">
                    <h2>Robo-Buy</h2>

                    <button
                        id="robo-buy-button"
                        type="button"
                    >
                        Enable Robo-Buy
                    </button>
                </section>

                <section class="shop">
                    <h2>Upgrades</h2>
                    <div id="upgrade-list"></div>
                </section>

                <section class="shop">
                    <h2>Buildings</h2>
                    <div id="building-list"></div>
                </section>

                <p id="message" class="message"></p>
            </main>
        `;

        this.#starButton =
            this.#getElement<HTMLButtonElement>(
                "#star-button",
            );

        this.#roboBuyButton =
            this.#getElement<HTMLButtonElement>(
                "#robo-buy-button",
            );

        this.#stardustText =
            this.#getElement<HTMLParagraphElement>(
                "#stardust",
            );

        this.#clickCountText =
            this.#getElement<HTMLParagraphElement>(
                "#click-count",
            );

        this.#clickPowerText =
            this.#getElement<HTMLParagraphElement>(
                "#click-power",
            );

        this.#productionText =
            this.#getElement<HTMLParagraphElement>(
                "#production",
            );

        this.#messageText =
            this.#getElement<HTMLParagraphElement>(
                "#message",
            );

        const starImage =
            this.#getElement<HTMLImageElement>(
                "#star-image",
            );

        starImage.src =
            this.#game.star.imageUrl;

        starImage.alt =
            this.#game.star.name;

        this.#upgradeButtons =
            new Map<Upgrade, HTMLButtonElement>();

        this.#buildingButtons =
            new Map<Building, HTMLButtonElement>();

        this.#createUpgradeButtons(
            this.#game.upgrades,
        );

        this.#createBuildingButtons(
            this.#game.buildings,
        );

        this.#game.registerListener(this);

        this.notify();
    }

    #getElement<T extends Element>(
        selector: string,
    ): T {
        const element =
            this.#root.querySelector<T>(selector);

        if (element === null) {
            throw new Error(
                `Missing element: ${selector}`,
            );
        }

        return element;
    }

    #createUpgradeButtons(
        upgrades: readonly Upgrade[],
    ): void {
        const upgradeList =
            this.#getElement<HTMLDivElement>(
                "#upgrade-list",
            );

        for (const upgrade of upgrades) {
            const button =
                document.createElement("button");

            button.type = "button";
            button.className =
                "upgrade-button";

            upgradeList.append(button);

            this.#upgradeButtons.set(
                upgrade,
                button,
            );
        }
    }

    #createBuildingButtons(
        buildings: readonly Building[],
    ): void {
        const buildingList =
            this.#getElement<HTMLDivElement>(
                "#building-list",
            );

        for (const building of buildings) {
            const button =
                document.createElement("button");

            button.type = "button";
            button.className =
                "building-button";

            buildingList.append(button);

            this.#buildingButtons.set(
                building,
                button,
            );
        }
    }

    onStarClick(
        listener: () => void,
    ): void {
        this.#starButton.addEventListener(
            "click",
            listener,
        );
    }

    onRoboBuyClick(
        listener: () => void,
    ): void {
        this.#roboBuyButton.addEventListener(
            "click",
            listener,
        );
    }

    onUpgradeClick(
        listener: (upgrade: Upgrade) => void,
    ): void {
        for (
            const [upgrade, button]
            of this.#upgradeButtons
        ) {
            button.addEventListener(
                "click",
                () => {
                    listener(upgrade);
                },
            );
        }
    }

    onBuildingClick(
        listener: (building: Building) => void,
    ): void {
        for (
            const [building, button]
            of this.#buildingButtons
        ) {
            button.addEventListener(
                "click",
                () => {
                    listener(building);
                },
            );
        }
    }

    notify(): void {
        this.#clickCountText.textContent =
            `Total clicks: ${
                this.#game.star.totalClicks
            }`;

        this.#stardustText.textContent =
            `Stardust: ${
                this.#game.stardust
            }`;

        this.#clickPowerText.textContent =
            `Click power: ${
                this.#game.clickPower
            }`;

        this.#productionText.textContent =
            `Production: ${
                this.#game.stardustPerSecond
            } stardust per second`;

        if (this.#game.roboBuyEnabled) {
            this.#roboBuyButton.textContent =
                "Disable Robo-Buy";
        } else {
            this.#roboBuyButton.textContent =
                "Enable Robo-Buy";
        }

        for (
            const [upgrade, button]
            of this.#upgradeButtons
        ) {
            button.disabled =
                upgrade.purchased;

            if (upgrade.purchased) {
                button.textContent =
                    `${upgrade.name} — Purchased`;
            } else {
                button.textContent =
                    `${upgrade.name} — ` +
                    `${upgrade.description} ` +
                    `(Cost: ${upgrade.cost} stardust)`;
            }
        }

        for (
            const [building, button]
            of this.#buildingButtons
        ) {
            button.textContent =
                `${building.name} — ` +
                `${building.description} ` +
                `(Cost: ${building.cost} stardust, ` +
                `Owned: ${building.quantity}, ` +
                `Production: ${building.totalProduction}/second)`;
        }

        switch (this.#game.lastEvent.type) {
            case "game-started":
                this.#messageText.textContent =
                    "Click the star to collect Stardust.";
                break;

            case "star-clicked":
                this.#messageText.textContent =
                    `You earned ${
                        this.#game.lastEvent
                            .earnedStardust
                    } stardust. ` +
                    `Current Stardust: ${
                        this.#game.stardust
                    }.`;
                break;

            case "upgrade-purchased":
                this.#messageText.textContent =
                    `${
                        this.#game.lastEvent
                            .upgradeName
                    } purchased successfully.`;
                break;

            case "upgrade-already-purchased":
                this.#messageText.textContent =
                    `${
                        this.#game.lastEvent
                            .upgradeName
                    } has already been purchased.`;
                break;

            case "building-purchased":
                this.#messageText.textContent =
                    `${
                        this.#game.lastEvent
                            .buildingName
                    } purchased successfully.`;
                break;

            case "passive-stardust-earned":
                this.#messageText.textContent =
                    `Your buildings produced ${
                        this.#game.lastEvent.amount
                    } stardust.`;
                break;

            case "not-enough-stardust":
                this.#messageText.textContent =
                    `You need ${
                        this.#game.lastEvent
                            .missingStardust
                    } more stardust.`;
                break;
        }
    }
}