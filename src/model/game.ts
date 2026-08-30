import assert from "../assertions.ts";
import Building from "./building.ts";
import type Listener from "./listener.ts";
import MarkovChain from "./markov-chain.ts";
import type { MarkovModel } from "./markov-chain.ts";
import MultiplierUpgrade from "./multiplier-upgrade.ts";
import PowerUpgrade from "./power-upgrade.ts";
import {
    itemRoboBuyMap,
    roboBuyItemMap,
} from "./robo-buy-map.ts";
import Star from "./star.ts";
import Upgrade from "./upgrade.ts";

export type GameEvent =
    | {
        type: "game-started";
    }
    | {
        type: "star-clicked";
        earnedStardust: number;
    }
    | {
        type: "upgrade-purchased";
        upgradeName: string;
    }
    | {
        type: "upgrade-already-purchased";
        upgradeName: string;
    }
    | {
        type: "building-purchased";
        buildingName: string;
    }
    | {
        type: "passive-stardust-earned";
        amount: number;
    }
    | {
        type: "not-enough-stardust";
        missingStardust: number;
    };

export default class Game {
    #star: Star;
    #upgrades: Upgrade[];
    #buildings: Building[];
    #stardust: number;
    #clickPower: number;
    #listeners: Listener[];
    #lastEvent: GameEvent;

    #markovChain: MarkovChain | null;
    #roboBuyEnabled: boolean;
    #lastRoboBuyState: string;

    constructor(
        star: Star,
        upgrades: Upgrade[],
        buildings: Building[],
        stardust = 0,
        clickPower = 1,
    ) {
        assert(
            star instanceof Star,
            "Game must contain a valid Star.",
        );

        assert(
            Array.isArray(upgrades)
            && upgrades.length > 0,
            "Game must contain at least one upgrade.",
        );

        assert(
            upgrades.every(
                (upgrade) =>
                    upgrade instanceof Upgrade,
            ),
            "Game must contain valid upgrades.",
        );

        assert(
            Array.isArray(buildings),
            "Game buildings must be stored in an array.",
        );

        assert(
            buildings.every(
                (building) =>
                    building instanceof Building,
            ),
            "Game must contain valid buildings.",
        );

        assert(
            Number.isInteger(stardust)
            && stardust >= 0,
            "Stardust must be a non-negative integer.",
        );

        assert(
            Number.isInteger(clickPower)
            && clickPower >= 1,
            "Click power must be at least one.",
        );

        const powerUpgradeCount =
            upgrades.filter(
                (upgrade) =>
                    upgrade instanceof PowerUpgrade,
            ).length;

        const multiplierUpgradeCount =
            upgrades.filter(
                (upgrade) =>
                    upgrade instanceof MultiplierUpgrade,
            ).length;

        assert(
            powerUpgradeCount >= 1,
            "Game must contain at least one PowerUpgrade.",
        );

        assert(
            multiplierUpgradeCount >= 1,
            "Game must contain at least one MultiplierUpgrade.",
        );

        this.#star = star;
        this.#upgrades = [...upgrades];
        this.#buildings = [...buildings];
        this.#stardust = stardust;
        this.#clickPower = clickPower;
        this.#listeners = [];

        this.#lastEvent = {
            type: "game-started",
        };

        this.#markovChain = null;
        this.#roboBuyEnabled = false;

        /*
         * The Markov chain needs an initial state
         * before the player has purchased anything.
         */
        this.#lastRoboBuyState = "a";

        this.#checkGame();
    }

    #checkGame(): void {
        assert(
            Number.isFinite(this.#stardust)
            && this.#stardust >= 0,
            "Stardust must be non-negative.",
        );

        assert(
            Number.isFinite(this.#clickPower)
            && this.#clickPower >= 1,
            "Click power must be at least one.",
        );

        assert(
            this.#star instanceof Star,
            "Game must contain a valid Star.",
        );

        assert(
            Array.isArray(this.#upgrades)
            && this.#upgrades.length > 0,
            "Game must contain at least one upgrade.",
        );

        assert(
            this.#upgrades.every(
                (upgrade) =>
                    upgrade instanceof Upgrade,
            ),
            "Game must contain valid upgrades.",
        );

        assert(
            Array.isArray(this.#buildings),
            "Game buildings must be stored in an array.",
        );

        assert(
            this.#buildings.every(
                (building) =>
                    building instanceof Building,
            ),
            "Game must contain valid buildings.",
        );

        const powerUpgradeCount =
            this.#upgrades.filter(
                (upgrade) =>
                    upgrade instanceof PowerUpgrade,
            ).length;

        const multiplierUpgradeCount =
            this.#upgrades.filter(
                (upgrade) =>
                    upgrade instanceof MultiplierUpgrade,
            ).length;

        assert(
            powerUpgradeCount >= 1,
            "Game must contain at least one PowerUpgrade.",
        );

        assert(
            multiplierUpgradeCount >= 1,
            "Game must contain at least one MultiplierUpgrade.",
        );

        assert(
            Array.isArray(this.#listeners),
            "Listeners must be stored in an array.",
        );
    }

    #notifyAll(): void {
        this.#listeners.forEach(
            (listener) => {
                listener.notify();
            },
        );
    }

    #rememberPurchasedItem(
        itemName: string,
    ): void {
        const state =
            itemRoboBuyMap[itemName];

        if (state !== undefined) {
            this.#lastRoboBuyState =
                state;
        }
    }

    #findPurchasableItem(
        itemName: string,
    ): Upgrade | Building | null {
        const upgrade =
            this.#upgrades.find(
                (candidate) =>
                    candidate.name === itemName,
            );

        if (upgrade !== undefined) {
            return upgrade;
        }

        const building =
            this.#buildings.find(
                (candidate) =>
                    candidate.name === itemName,
            );

        if (building !== undefined) {
            return building;
        }

        return null;
    }

    #attemptRoboBuy(): void {
        if (
            !this.#roboBuyEnabled
            || this.#markovChain === null
        ) {
            return;
        }

        const nextState =
            this.#markovChain.nextState(
                this.#lastRoboBuyState,
            );

        const itemName =
            roboBuyItemMap[nextState];

        if (itemName === undefined) {
            return;
        }

        const item =
            this.#findPurchasableItem(
                itemName,
            );

        if (item === null) {
            return;
        }

        if (item instanceof Upgrade) {
            if (
                item.purchased
                || this.#stardust < item.cost
            ) {
                return;
            }

            this.purchaseUpgrade(item);

            return;
        }

        if (this.#stardust < item.cost) {
            return;
        }

        this.purchaseBuilding(item);
    }

    registerListener(
        listener: Listener,
    ): void {
        assert(
            listener !== null
            && listener !== undefined,
            "Listener must exist.",
        );

        if (
            !this.#listeners.includes(
                listener,
            )
        ) {
            this.#listeners.push(
                listener,
            );
        }

        assert(
            this.#listeners.includes(
                listener,
            ),
            "Listener must be registered.",
        );

        this.#checkGame();
    }

    get star(): Star {
        return this.#star;
    }

    get upgrades(): readonly Upgrade[] {
        return [...this.#upgrades];
    }

    get buildings(): readonly Building[] {
        return [...this.#buildings];
    }

    get stardust(): number {
        return this.#stardust;
    }

    get clickPower(): number {
        return this.#clickPower;
    }

    get stardustPerSecond(): number {
        return this.#buildings.reduce(
            (total, building) =>
                total
                + building.totalProduction,
            0,
        );
    }

    get lastEvent(): GameEvent {
        return this.#lastEvent;
    }

    get roboBuyEnabled(): boolean {
        return this.#roboBuyEnabled;
    }

    setMarkovModel(
        model: MarkovModel,
    ): void {
        this.#markovChain =
            new MarkovChain(model);
    }

    enableRoboBuy(): void {
        assert(
            this.#markovChain !== null,
            "Robo-buy requires a trained Markov model.",
        );

        this.#roboBuyEnabled = true;

        this.#attemptRoboBuy();

        this.#notifyAll();
    }

    disableRoboBuy(): void {
        this.#roboBuyEnabled = false;

        this.#notifyAll();
    }

    click(): void {
        const oldClicks =
            this.#star.totalClicks;

        const oldStardust =
            this.#stardust;

        const earnedStardust =
            this.#clickPower;

        this.#star.registerClick();

        this.#stardust +=
            earnedStardust;

        this.#lastEvent = {
            type: "star-clicked",
            earnedStardust,
        };

        assert(
            this.#star.totalClicks
            === oldClicks + 1,
            "Clicking must increase total clicks by one.",
        );

        assert(
            this.#stardust
            === oldStardust
            + earnedStardust,
            "Clicking must add click power to stardust.",
        );

        this.#checkGame();

        this.#notifyAll();

        /*
         * Robo-buy runs after the click operation
         * and its postconditions are complete.
         */
        this.#attemptRoboBuy();
    }

    purchaseUpgrade(
        upgrade: Upgrade,
    ): boolean {
        assert(
            this.#upgrades.includes(
                upgrade,
            ),
            "The selected upgrade must belong to this game.",
        );

        if (upgrade.purchased) {
            this.#lastEvent = {
                type:
                    "upgrade-already-purchased",
                upgradeName:
                    upgrade.name,
            };

            this.#notifyAll();

            return false;
        }

        if (
            this.#stardust
            < upgrade.cost
        ) {
            this.#lastEvent = {
                type:
                    "not-enough-stardust",
                missingStardust:
                    upgrade.cost
                    - this.#stardust,
            };

            this.#notifyAll();

            return false;
        }

        const oldStardust =
            this.#stardust;

        const oldClickPower =
            this.#clickPower;

        const newClickPower =
            upgrade.purchase(
                this.#clickPower,
            );

        this.#stardust -=
            upgrade.cost;

        this.#clickPower =
            newClickPower;

        this.#lastEvent = {
            type:
                "upgrade-purchased",
            upgradeName:
                upgrade.name,
        };

        /*
         * Every successful purchase becomes
         * the input state for the next
         * Markov-chain selection.
         */
        this.#rememberPurchasedItem(
            upgrade.name,
        );

        assert(
            this.#stardust
            === oldStardust
            - upgrade.cost,
            "A purchase must deduct the upgrade cost.",
        );

        assert(
            this.#clickPower
            > oldClickPower,
            "A purchase must increase click power.",
        );

        assert(
            upgrade.purchased,
            "The upgrade must be marked as purchased.",
        );

        this.#checkGame();

        this.#notifyAll();

        return true;
    }

    purchaseBuilding(
        building: Building,
    ): boolean {
        assert(
            this.#buildings.includes(
                building,
            ),
            "The selected building must belong to this game.",
        );

        if (
            this.#stardust
            < building.cost
        ) {
            this.#lastEvent = {
                type:
                    "not-enough-stardust",
                missingStardust:
                    building.cost
                    - this.#stardust,
            };

            this.#notifyAll();

            return false;
        }

        const oldQuantity =
            building.quantity;

        const oldStardust =
            this.#stardust;

        building.purchase();

        this.#stardust -=
            building.cost;

        this.#lastEvent = {
            type:
                "building-purchased",
            buildingName:
                building.name,
        };

        /*
         * Manual and robo-buy purchases both
         * become the new Markov-chain state.
         */
        this.#rememberPurchasedItem(
            building.name,
        );

        assert(
            building.quantity
            === oldQuantity + 1,
            "Building quantity must increase by one.",
        );

        assert(
            this.#stardust
            === oldStardust
            - building.cost,
            "A building purchase must deduct its cost.",
        );

        this.#checkGame();

        this.#notifyAll();

        return true;
    }

    collectPassiveStardust(): void {
        const earned =
            this.stardustPerSecond;

        if (earned === 0) {
            return;
        }

        const oldStardust =
            this.#stardust;

        this.#stardust +=
            earned;

        this.#lastEvent = {
            type:
                "passive-stardust-earned",
            amount:
                earned,
        };

        assert(
            this.#stardust
            === oldStardust + earned,
            "Passive production must add stardust.",
        );

        this.#checkGame();

        this.#notifyAll();

        /*
         * Passive production may make the
         * robot's next item affordable.
         */
        this.#attemptRoboBuy();
    }
}