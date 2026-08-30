import assert from "../assertions.ts";

export type MarkovModel = Record<
    string,
    Record<string, number>
>;

export default class MarkovChain {
    #model: MarkovModel;

    constructor(model: MarkovModel) {
        assert(
            Object.keys(model).length > 0,
            "Markov model must contain states.",
        );

        this.#model = model;
    }

    nextState(
        currentState: string,
        randomValue = Math.random(),
    ): string {
        const transitions =
            this.#model[currentState];

        assert(
            transitions !== undefined,
            "Current state must exist in the Markov model.",
        );

        assert(
            randomValue >= 0
            && randomValue < 1,
            "Random value must be between zero and one.",
        );

        let cumulativeProbability = 0;

        for (
            const [nextState, probability]
            of Object.entries(transitions)
        ) {
            cumulativeProbability += probability;

            if (
                randomValue
                < cumulativeProbability
            ) {
                return nextState;
            }
        }

        const states =
            Object.keys(transitions);

        return states[states.length - 1];
    }
}