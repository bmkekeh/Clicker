import assert from "../assertions.ts";
import { database } from "../database.ts";

type AccountRow = {
    username: string;
    password: string;
    salt: string;
};

/**
 * Converts bytes into Base64 so they can be stored
 * in a varchar column.
 */
function bytesToBase64(bytes: Uint8Array): string {
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return globalThis.btoa(binary);
}

/**
 * Converts a Base64 string from the database
 * back into an ArrayBuffer-backed Uint8Array.
 */
function base64ToBytes(
    value: string,
): Uint8Array<ArrayBuffer> {
    const binary = globalThis.atob(value);

    const bytes = new Uint8Array(
        new ArrayBuffer(binary.length),
    );

    for (
        let index = 0;
        index < binary.length;
        index++
    ) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

/**
 * Uses PBKDF2 to derive a secure password hash.
 *
 * The same password and salt produce the same hash.
 */
async function derivePassword(
    password: string,
    salt: Uint8Array<ArrayBuffer>,
): Promise<string> {
    const encoder = new TextEncoder();

    const passwordBytes = encoder.encode(password);

    const keyMaterial =
        await globalThis.crypto.subtle.importKey(
            "raw",
            passwordBytes,
            {
                name: "PBKDF2",
            },
            false,
            ["deriveBits"],
        );

    const derivedBits =
        await globalThis.crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt,
                iterations: 100000,
                hash: "SHA-256",
            },
            keyMaterial,
            256,
        );

    return bytesToBase64(
        new Uint8Array(derivedBits),
    );
}

export default class Account {
    #username: string;

    private constructor(username: string) {
        assert(
            username.trim().length > 0,
            "Username must not be empty.",
        );

        this.#username = username;
        this.#checkAccount();
    }

    get username(): string {
        return this.#username;
    }

    #checkAccount(): void {
        assert(
            this.#username.trim().length > 0,
            "Username must not be empty.",
        );
    }

    static async register(
        username: string,
        password: string,
    ): Promise<Account> {
        const normalizedUsername = username.trim();

        assert(
            normalizedUsername.length > 0,
            "Username must not be empty.",
        );

        assert(
            password.length > 0,
            "Password must not be empty.",
        );

        const existingAccount =
            await database.query<AccountRow>(
                `
                    select
                        username,
                        password,
                        salt
                    from account
                    where username = $1;
                `,
                [normalizedUsername],
            );

        assert(
            existingAccount.rows.length === 0,
            "That username is already registered.",
        );

        const salt: Uint8Array<ArrayBuffer> =
            globalThis.crypto.getRandomValues(
                new Uint8Array(
                    new ArrayBuffer(16),
                ),
            );

        const passwordHash =
            await derivePassword(
                password,
                salt,
            );

        await database.query(
            `
                insert into account (
                    username,
                    password,
                    salt
                )
                values ($1, $2, $3);
            `,
            [
                normalizedUsername,
                passwordHash,
                bytesToBase64(salt),
            ],
        );

        return new Account(normalizedUsername);
    }

    static async signIn(
        username: string,
        password: string,
    ): Promise<Account | null> {
        const normalizedUsername = username.trim();

        if (
            normalizedUsername.length === 0
            || password.length === 0
        ) {
            return null;
        }

        const result =
            await database.query<AccountRow>(
                `
                    select
                        username,
                        password,
                        salt
                    from account
                    where username = $1;
                `,
                [normalizedUsername],
            );

        if (result.rows.length === 0) {
            return null;
        }

        const accountRow = result.rows[0];

        const salt = base64ToBytes(
            accountRow.salt,
        );

        const enteredPasswordHash =
            await derivePassword(
                password,
                salt,
            );

        if (
            enteredPasswordHash
            !== accountRow.password
        ) {
            return null;
        }

        return new Account(accountRow.username);
    }
}