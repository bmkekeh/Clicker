import { database } from "../database.ts";
import assert from "../assertions.ts";
import Upgrade from "./upgrade.ts";

type PowerUpgradeRow = {
    name: string;
    description: string;
    cost: number;
    power_increase: number;
};

export default class PowerUpgrade extends Upgrade {
    #powerIncrease: number;

    constructor(name: string, description: string, cost: number, powerIncrease: number,) {
        super(name, description, cost);
        // Precondition
        assert(
            Number.isFinite(powerIncrease) && powerIncrease > 0,
            "Power increase must be greater than zero.",
        );

        this.#powerIncrease = powerIncrease;

        // Constructor postcondition
        this.#checkPowerUpgrade();
    }

    #checkPowerUpgrade(): void {
        assert(
            Number.isFinite(this.#powerIncrease) &&
            this.#powerIncrease > 0,
            "Power increase must be greater than zero.",
        );
    }

    get powerIncrease(): number {
        return this.#powerIncrease;
    }

    apply(currentPower: number): number {
        // Precondition
        assert(
            Number.isFinite(currentPower) && currentPower >= 1,
            "Current click power must be at least one.",
        );

        const newPower = currentPower + this.#powerIncrease;

        // Postcondition
        assert(
            newPower === currentPower + this.#powerIncrease,
            "PowerUpgrade must add its power increase.",
        );

        this.#checkPowerUpgrade();

        return newPower;
    }

    static async getAll(): Promise<PowerUpgrade[]> {
        const result = await database.query<PowerUpgradeRow>(`
            select
                upgrade.name,
                upgrade.description,
                upgrade.cost,
                power_upgrade.power_increase
            from upgrade
            join power_upgrade
                on power_upgrade.upgrade = upgrade.name
            order by upgrade.name;
        `);
    
        return result.rows.map((row) =>
            new PowerUpgrade(
                row.name,
                row.description,
                row.cost,
                row.power_increase,
            )
        );
    }
}