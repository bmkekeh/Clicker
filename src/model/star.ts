import assert from "../assertions.ts";

export default class Star {
    #name: string;
    #imageUrl: string;
    #totalClicks: number;

    constructor(
        name: string,
        imageUrl: string,
        totalClicks = 0,
    ) {
        assert(
            name.trim().length > 0,
            "Star name must not be empty.",
        );

        assert(
            imageUrl.trim().length > 0,
            "Star image URL must not be empty.",
        );

        assert(
            Number.isInteger(totalClicks)
            && totalClicks >= 0,
            "Total clicks must be a non-negative integer.",
        );

        this.#name = name;
        this.#imageUrl = imageUrl;
        this.#totalClicks = totalClicks;

        this.#checkStar();
    }

    #checkStar(): void {
        assert(
            this.#name.trim().length > 0,
            "Star name must not be empty.",
        );

        assert(
            this.#imageUrl.trim().length > 0,
            "Star image URL must not be empty.",
        );

        assert(
            Number.isInteger(this.#totalClicks)
            && this.#totalClicks >= 0,
            "Total clicks must be a non-negative integer.",
        );
    }

    get name(): string {
        return this.#name;
    }

    get imageUrl(): string {
        return this.#imageUrl;
    }

    get totalClicks(): number {
        return this.#totalClicks;
    }

    registerClick(): void {
        const oldTotalClicks = this.#totalClicks;

        this.#totalClicks += 1;

        assert(
            this.#totalClicks === oldTotalClicks + 1,
            "Registering a click must increase total clicks by one.",
        );

        this.#checkStar();
    }
}