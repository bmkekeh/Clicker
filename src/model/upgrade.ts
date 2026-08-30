import assert from "../assertions.ts";

export default abstract class Upgrade {
    #name: string;
    #description: string;
    #cost: number;
    #purchased: boolean;

    constructor(
        name: string,
        description: string,
        cost: number,
    ) {
        assert(
            name.trim().length > 0,
            "Upgrade name must not be empty.",
        );

        assert(
            description.trim().length > 0,
            "Upgrade description must not be empty.",
        );

        assert(
            Number.isFinite(cost) && cost > 0,
            "Upgrade cost must be greater than zero.",
        );

        this.#name = name;
        this.#description = description;
        this.#cost = cost;
        this.#purchased = false;

        this.#checkUpgrade();
    }

    #checkUpgrade(): void {
        assert(
            this.#name.trim().length > 0,
            "Upgrade name must not be empty.",
        );

        assert(
            this.#description.trim().length > 0,
            "Upgrade description must not be empty.",
        );

        assert(
            Number.isFinite(this.#cost) && this.#cost > 0,
            "Upgrade cost must be greater than zero.",
        );

        assert(
            typeof this.#purchased === "boolean",
            "Purchased must be a boolean.",
        );
    }

    get name(): string {
        return this.#name;
    }

    get description(): string {
        return this.#description;
    }

    get cost(): number {
        return this.#cost;
    }

    get purchased(): boolean {
        return this.#purchased;
    }

    abstract apply(currentPower: number): number;

    purchase(currentPower: number): number {
        assert(
            !this.#purchased,
            "An upgrade cannot be purchased more than once.",
        );

        assert(
            Number.isFinite(currentPower)
            && currentPower >= 1,
            "Current click power must be at least one.",
        );

        const newPower = this.apply(currentPower);

        assert(
            newPower > currentPower,
            "An upgrade must increase click power.",
        );

        this.#purchased = true;

        assert(
            this.#purchased,
            "A purchased upgrade must be marked as purchased.",
        );

        this.#checkUpgrade();

        return newPower;
    }

    restorePurchase(): void {
        assert(
            !this.#purchased,
            "The upgrade is already marked as purchased.",
        );

        this.#purchased = true;

        assert(
            this.#purchased,
            "The saved upgrade must be marked as purchased.",
        );

        this.#checkUpgrade();
    }
}