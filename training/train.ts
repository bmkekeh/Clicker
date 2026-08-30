import {
    createReadStream,
    writeFileSync,
} from "node:fs";

import {
    createInterface,
} from "node:readline";

type TransitionCounts = Record<
    string,
    Record<string, number>
>;

type MarkovModel = Record<
    string,
    Record<string, number>
>;

const inputPath =
    "training/training.csv";

const outputPath =
    "public/model.json";

function recordTransition(
    counts: TransitionCounts,
    from: string,
    to: string,
): void {
    if (counts[from] === undefined) {
        counts[from] = {};
    }

    if (counts[from][to] === undefined) {
        counts[from][to] = 0;
    }

    counts[from][to] += 1;
}

function makeModel(
    counts: TransitionCounts,
): MarkovModel {
    const model: MarkovModel = {};

    for (const from of Object.keys(counts)) {
        const transitions =
            counts[from];

        const total =
            Object.values(
                transitions,
            ).reduce(
                (sum, count) =>
                    sum + count,
                0,
            );

        if (total === 0) {
            continue;
        }

        model[from] = {};

        for (
            const [to, count]
            of Object.entries(
                transitions,
            )
        ) {
            model[from][to] =
                count / total;
        }
    }

    return model;
}

async function train(): Promise<void> {
    const counts: TransitionCounts = {};

    const input =
        createReadStream(
            inputPath,
        );

    const lines =
        createInterface({
            input,
            crlfDelay: Infinity,
        });

    let lineCount = 0;

    for await (const line of lines) {
        const trimmedLine =
            line.trim();

        if (trimmedLine.length === 0) {
            continue;
        }

        const states =
            trimmedLine
                .split(",")
                .map(
                    (state) =>
                        state.trim(),
                )
                .filter(
                    (state) =>
                        state.length > 0,
                );

        for (
            let index = 0;
            index < states.length - 1;
            index += 1
        ) {
            recordTransition(
                counts,
                states[index],
                states[index + 1],
            );
        }

        lineCount += 1;
    }

    const model =
        makeModel(counts);

    writeFileSync(
        outputPath,
        JSON.stringify(
            model,
            null,
            2,
        ),
    );

    console.log(
        `Training complete: ${lineCount} lines processed.`,
    );

    console.log(
        `Model saved to ${outputPath}.`,
    );
}

await train();