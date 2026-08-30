import {
    expect,
    test,
} from "vitest";

import MarkovChain from
    "../src/model/markov-chain.ts";

test(
    "MarkovChain selects first state when random value is inside first probability",
    () => {
        const chain = new MarkovChain({
            a: {
                b: 0.7,
                c: 0.3,
            },
        });

        const nextState =
            chain.nextState(
                "a",
                0.5,
            );

        expect(nextState).toBe("b");
    },
);

test(
    "MarkovChain selects later state using cumulative probability",
    () => {
        const chain = new MarkovChain({
            a: {
                b: 0.7,
                c: 0.3,
            },
        });

        const nextState =
            chain.nextState(
                "a",
                0.9,
            );

        expect(nextState).toBe("c");
    },
);

test(
    "MarkovChain supports transitions to the same state",
    () => {
        const chain = new MarkovChain({
            a: {
                a: 1,
            },
        });

        expect(
            chain.nextState(
                "a",
                0.5,
            ),
        ).toBe("a");
    },
);

test(
    "MarkovChain rejects an unknown current state",
    () => {
        const chain = new MarkovChain({
            a: {
                b: 1,
            },
        });

        expect(() => {
            chain.nextState(
                "unknown",
                0.5,
            );
        }).toThrow();
    },
);

test(
    "MarkovChain rejects random values below zero",
    () => {
        const chain = new MarkovChain({
            a: {
                b: 1,
            },
        });

        expect(() => {
            chain.nextState(
                "a",
                -0.1,
            );
        }).toThrow();
    },
);

test(
    "MarkovChain rejects random values of one or greater",
    () => {
        const chain = new MarkovChain({
            a: {
                b: 1,
            },
        });

        expect(() => {
            chain.nextState(
                "a",
                1,
            );
        }).toThrow();
    },
);

test(
    "MarkovChain requires at least one state",
    () => {
        expect(() => {
            new MarkovChain({});
        }).toThrow();
    },
);