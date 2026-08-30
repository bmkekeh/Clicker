import Account from "../model/account.ts";
import Building from "../model/building.ts";
import GameStore from "../model/game-store.ts";
import type {
    MarkovModel,
} from "../model/markov-chain.ts";
import Upgrade from "../model/upgrade.ts";
import AccountView from "../view/account-view.ts";
import GameController from "./game-controller.ts";

export default class AccountController {
    #view: AccountView;
    #upgrades: Upgrade[];
    #buildings: Building[];
    #markovModel: MarkovModel;

    constructor(
        upgrades: Upgrade[],
        buildings: Building[],
        markovModel: MarkovModel,
    ) {
        this.#upgrades = upgrades;
        this.#buildings = buildings;
        this.#markovModel = markovModel;
        this.#view = new AccountView();

        this.#view.onRegister(() => {
            void this.#handleRegister();
        });

        this.#view.onSignIn(() => {
            void this.#handleSignIn();
        });
    }

    async #handleRegister(): Promise<void> {
        const username =
            this.#view.username;

        const password =
            this.#view.password;

        this.#view.setButtonsDisabled(
            true,
        );

        this.#view.showMessage(
            "Creating your account...",
        );

        try {
            const account =
                await Account.register(
                    username,
                    password,
                );

            await this.#startGame(
                account,
            );
        } catch (error) {
            this.#view.showMessage(
                this.#getErrorMessage(
                    error,
                ),
            );
        } finally {
            this.#view.setButtonsDisabled(
                false,
            );
        }
    }

    async #handleSignIn(): Promise<void> {
        const username =
            this.#view.username;

        const password =
            this.#view.password;

        if (
            username.trim().length === 0
            || password.length === 0
        ) {
            this.#view.showMessage(
                "Enter a username and password.",
            );

            return;
        }

        this.#view.setButtonsDisabled(
            true,
        );

        this.#view.showMessage(
            "Signing in...",
        );

        try {
            const account =
                await Account.signIn(
                    username,
                    password,
                );

            if (account === null) {
                this.#view.showMessage(
                    "Incorrect username or password.",
                );

                return;
            }

            await this.#startGame(
                account,
            );
        } catch (error) {
            this.#view.showMessage(
                this.#getErrorMessage(
                    error,
                ),
            );
        } finally {
            this.#view.setButtonsDisabled(
                false,
            );
        }
    }

    async #startGame(
        account: Account,
    ): Promise<void> {
        this.#view.showMessage(
            "Loading your game...",
        );

        const game =
            await GameStore.loadOrCreate(
                account.username,
                this.#upgrades,
                this.#buildings,
            );

        game.setMarkovModel(
            this.#markovModel,
        );

        new GameController(
            account.username,
            game,
        );
    }

    #getErrorMessage(
        error: unknown,
    ): string {
        if (error instanceof Error) {
            return error.message;
        }

        return "An unexpected error occurred.";
    }
}