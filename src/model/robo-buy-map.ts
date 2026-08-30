export const roboBuyItemMap: Record<string, string> = {
    a: "Solar Flare",
    b: "Gravity Well",
    c: "Comet Strike",
    d: "Stellar Pulse",
    e: "Supernova Burst",
    f: "Lunar Lens",
    g: "Cosmic Prism",
    h: "Quantum Orbit",
    i: "Solar Harvester",
    j: "Galactic Foundry",
};

export const itemRoboBuyMap: Record<string, string> =
    Object.fromEntries(
        Object.entries(roboBuyItemMap).map(
            ([state, itemName]) => [
                itemName,
                state,
            ],
        ),
    );