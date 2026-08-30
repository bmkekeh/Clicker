import { database } from "../database.ts";
import assert from "../assertions.ts";
import Upgrade from "./upgrade.ts";

type MultiplierUpgradeRow = {
    name: string;
    description: string;
    cost: number;
    multiplier: number;
};

export default class MultiplierUpgrade extends Upgrade {
    #multiplier: number;

    constructor(name: string, description: string, cost: number, multiplier: number,) {
        super(name, description, cost,);
        assert(
            Number.isFinite(multiplier) && multiplier > 1,
            "Multiplier must be greater than one.",
        );

        this.#multiplier = multiplier;

        // Constructor postcondition
        this.#checkMultiplierUpgrade();
    }

    #checkMultiplierUpgrade(): void {
        assert(
            Number.isFinite(this.#multiplier) &&
            this.#multiplier > 1,
            "Multiplier must be greater than one.",
        );
    }

    get multiplier(): number {
        return this.#multiplier;
    }

    apply(currentPower: number): number {
        // Precondition
        assert(
            Number.isFinite(currentPower) && currentPower >= 1,
            "Current click power must be at least one.",
        );

        const newPower = currentPower * this.#multiplier;

        // Postcondition
        assert(
            newPower === currentPower * this.#multiplier,
            "MultiplierUpgrade must multiply the current power.",
        );

        this.#checkMultiplierUpgrade();

        return newPower;
    }

    static async getAll(): Promise<MultiplierUpgrade[]> {
        const result = await database.query<MultiplierUpgradeRow>(`
            select
                upgrade.name,
                upgrade.description,
                upgrade.cost,
                multiplier_upgrade.multiplier
            from upgrade
            join multiplier_upgrade
                on multiplier_upgrade.upgrade = upgrade.name
            order by upgrade.name;
        `);
    
        return result.rows.map((row) =>
            new MultiplierUpgrade(
                row.name,
                row.description,
                row.cost,
                row.multiplier,
            )
        );
    }
}