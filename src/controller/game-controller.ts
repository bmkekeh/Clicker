import Building from "../model/building.ts";
import Game from "../model/game.ts";
import GameStore from "../model/game-store.ts";
import Upgrade from "../model/upgrade.ts";
import GameView from "../view/game-view.ts";

export default class GameController {
    #username: string;
    #game: Game;
    #view: GameView;
    #saveQueue: Promise<void>;

    constructor(
        username: string,
        game: Game,
    ) {
        this.#username = username;
        this.#game = game;
        this.#view = new GameView(
            this.#game,
        );
        this.#saveQueue =
            Promise.resolve();

        this.#view.onStarClick(() => {
            void this.#handleStarClick();
        });

        this.#view.onRoboBuyClick(() => {
            void this.#handleRoboBuyClick();
        });

        this.#view.onUpgradeClick(
            (upgrade) => {
                void this.#handleUpgradeClick(
                    upgrade,
                );
            },
        );

        this.#view.onBuildingClick(
            (building) => {
                void this.#handleBuildingClick(
                    building,
                );
            },
        );

        window.setInterval(() => {
            void this.#handlePassiveProduction();
        }, 1000);
    }

    async #handleStarClick(): Promise<void> {
        this.#game.click();

        await this.#saveGame();
    }

    async #handleRoboBuyClick(): Promise<void> {
        if (this.#game.roboBuyEnabled) {
            this.#game.disableRoboBuy();
        } else {
            this.#game.enableRoboBuy();
        }

        await this.#saveGame();
    }

    async #handleUpgradeClick(
        upgrade: Upgrade,
    ): Promise<void> {
        const purchased =
            this.#game.purchaseUpgrade(
                upgrade,
            );

        if (!purchased) {
            return;
        }

        await this.#saveGame();
    }

    async #handleBuildingClick(
        building: Building,
    ): Promise<void> {
        const purchased =
            this.#game.purchaseBuilding(
                building,
            );

        if (!purchased) {
            return;
        }

        await this.#saveGame();
    }

    async #handlePassiveProduction(): Promise<void> {
        if (
            this.#game.stardustPerSecond
            === 0
        ) {
            return;
        }

        this.#game.collectPassiveStardust();

        await this.#saveGame();
    }

    #saveGame(): Promise<void> {
        const nextSave =
            this.#saveQueue.then(
                async () => {
                    await GameStore.save(
                        this.#username,
                        this.#game,
                    );
                },
            );

        /*
         * Keep the queue usable even if
         * one save fails.
         *
         * The original promise is still
         * returned so the caller can see
         * the error.
         */
        this.#saveQueue =
            nextSave.catch(
                (error: unknown) => {
                    console.error(
                        "Failed to save game:",
                        error,
                    );
                },
            );

        return nextSave;
    }
}