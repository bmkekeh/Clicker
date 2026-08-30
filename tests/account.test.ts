import { beforeEach, expect, test } from "vitest";

import Account from "../src/model/account.ts";
import { database, resetDatabase } from "../src/database.ts";

beforeEach(async () => {
    await resetDatabase();
});

test("Registering an account returns an Account with the given username", async () => {
    const account = await Account.register(
        "nova",
        "correct horse battery staple",
    );

    expect(account.username).toBe("nova");
});

test("Registering rejects an empty username", async () => {
    await expect(
        Account.register("", "some password"),
    ).rejects.toThrow();
});

test("Registering rejects an empty password", async () => {
    await expect(
        Account.register("nova", ""),
    ).rejects.toThrow();
});

test("Registering rejects a username that is already taken", async () => {
    await Account.register("nova", "first password");

    await expect(
        Account.register("nova", "a different password"),
    ).rejects.toThrow();
});

test("Signing in with the correct password returns the account", async () => {
    await Account.register("nova", "correct horse battery staple");

    const account = await Account.signIn(
        "nova",
        "correct horse battery staple",
    );

    expect(account).not.toBeNull();
    expect(account?.username).toBe("nova");
});

test("Signing in with the wrong password returns null", async () => {
    await Account.register("nova", "correct horse battery staple");

    const account = await Account.signIn(
        "nova",
        "wrong password",
    );

    expect(account).toBeNull();
});

test("Signing in with an unregistered username returns null", async () => {
    const account = await Account.signIn(
        "nobody",
        "any password",
    );

    expect(account).toBeNull();
});

test("Signing in with an empty username returns null", async () => {
    const account = await Account.signIn("", "any password");

    expect(account).toBeNull();
});

test("Signing in with an empty password returns null", async () => {
    await Account.register("nova", "correct horse battery staple");

    const account = await Account.signIn("nova", "");

    expect(account).toBeNull();
});

test("Passwords are never stored in plain text", async () => {
    const plainTextPassword = "correct horse battery staple";

    await Account.register("nova", plainTextPassword);

    const result = await database.query<{
        password: string;
    }>(
        `
            select password
            from account
            where username = $1;
        `,
        ["nova"],
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.password).not.toBe(
        plainTextPassword,
    );
});

test("Two accounts with the same password get different salts and different hashes", async () => {
    await Account.register("nova", "same password");
    await Account.register("comet", "same password");

    const result = await database.query<{
        username: string;
        password: string;
        salt: string;
    }>(
        `
            select username, password, salt
            from account
            where username in ($1, $2);
        `,
        ["nova", "comet"],
    );

    expect(result.rows).toHaveLength(2);

    const [first, second] = result.rows;

    expect(first?.salt).not.toBe(second?.salt);
    expect(first?.password).not.toBe(second?.password);
});