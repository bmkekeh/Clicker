import assert from "../assertions.ts";

export default abstract class Building {
    #name: string;
    #description: string;
    #cost: number;
    #stardustPerSecond: number;
    #quantity: number;

    constructor(
        name: string,
        description: string,
        cost: number,
        stardustPerSecond: number,
        quantity = 0,
    ) {
        assert(
            name.trim().length > 0,
            "Building name must not be empty.",
        );

        assert(
            description.trim().length > 0,
            "Building description must not be empty.",
        );

        assert(
            Number.isInteger(cost) && cost > 0,
            "Building cost must be a positive integer.",
        );

        assert(
            Number.isInteger(stardustPerSecond)
            && stardustPerSecond > 0,
            "Stardust per second must be a positive integer.",
        );

        assert(
            Number.isInteger(quantity) && quantity >= 0,
            "Building quantity must be a non-negative integer.",
        );

        this.#name = name;
        this.#description = description;
        this.#cost = cost;
        this.#stardustPerSecond = stardustPerSecond;
        this.#quantity = quantity;

        this.#checkBuilding();
    }

    #checkBuilding(): void {
        assert(
            this.#name.trim().length > 0,
            "Building name must not be empty.",
        );

        assert(
            this.#description.trim().length > 0,
            "Building description must not be empty.",
        );

        assert(
            Number.isInteger(this.#cost) && this.#cost > 0,
            "Building cost must be a positive integer.",
        );

        assert(
            Number.isInteger(this.#stardustPerSecond)
            && this.#stardustPerSecond > 0,
            "Stardust per second must be a positive integer.",
        );

        assert(
            Number.isInteger(this.#quantity)
            && this.#quantity >= 0,
            "Building quantity must be non-negative.",
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

    get stardustPerSecond(): number {
        return this.#stardustPerSecond;
    }

    get quantity(): number {
        return this.#quantity;
    }

    get totalProduction(): number {
        return this.#quantity * this.#stardustPerSecond;
    }

    restoreQuantity(quantity: number): void {
        assert(
            Number.isInteger(quantity) && quantity >= 0,
            "Restored building quantity must be a non-negative integer.",
        );
    
        this.#quantity = quantity;
    
        this.#checkBuilding();
    }

    purchase(): void {
        const oldQuantity = this.#quantity;

        this.#quantity += 1;

        assert(
            this.#quantity === oldQuantity + 1,
            "Purchasing a building must increase its quantity by one.",
        );

        this.#checkBuilding();
    }
}