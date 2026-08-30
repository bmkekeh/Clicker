export default class AccountView {
    #root: HTMLDivElement;
    #usernameInput: HTMLInputElement;
    #passwordInput: HTMLInputElement;
    #registerButton: HTMLButtonElement;
    #signInButton: HTMLButtonElement;
    #messageText: HTMLParagraphElement;

    constructor() {
        const root =
            document.querySelector<HTMLDivElement>("#app");

        if (root === null) {
            throw new Error("App element was not found.");
        }

        this.#root = root;

        this.#root.innerHTML = `
            <main class="account">
                <h1>Cosmic Clicker</h1>

                <section class="account-form">
                    <h2>Account</h2>

                    <label for="username">
                        Username
                    </label>

                    <input
                        id="username"
                        type="text"
                        autocomplete="username"
                    />

                    <label for="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        autocomplete="current-password"
                    />

                    <div class="account-buttons">
                        <button
                            id="register-button"
                            type="button"
                        >
                            Register
                        </button>

                        <button
                            id="sign-in-button"
                            type="button"
                        >
                            Sign In
                        </button>
                    </div>

                    <p
                        id="account-message"
                        class="message"
                    ></p>
                </section>
            </main>
        `;

        this.#usernameInput =
            this.#getElement<HTMLInputElement>(
                "#username",
            );

        this.#passwordInput =
            this.#getElement<HTMLInputElement>(
                "#password",
            );

        this.#registerButton =
            this.#getElement<HTMLButtonElement>(
                "#register-button",
            );

        this.#signInButton =
            this.#getElement<HTMLButtonElement>(
                "#sign-in-button",
            );

        this.#messageText =
            this.#getElement<HTMLParagraphElement>(
                "#account-message",
            );
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

    get username(): string {
        return this.#usernameInput.value;
    }

    get password(): string {
        return this.#passwordInput.value;
    }

    onRegister(
        listener: () => void,
    ): void {
        this.#registerButton.addEventListener(
            "click",
            listener,
        );
    }

    onSignIn(
        listener: () => void,
    ): void {
        this.#signInButton.addEventListener(
            "click",
            listener,
        );
    }

    showMessage(message: string): void {
        this.#messageText.textContent = message;
    }

    setButtonsDisabled(
        disabled: boolean,
    ): void {
        this.#registerButton.disabled = disabled;
        this.#signInButton.disabled = disabled;
    }
}