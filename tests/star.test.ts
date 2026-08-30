import { expect, test } from "vitest";
import Star from "../src/model/star.ts";

test("Star starts with zero clicks", () => {
  const star = new Star(
    "Glowing Star",
    "/star.png",
  );

  expect(star.totalClicks).toBe(0);
});

test("Star registers a click", () => {
  const star = new Star(
    "Glowing Star",
    "/star.png",
  );

  star.registerClick();

  expect(star.totalClicks).toBe(1);
});

test("Star requires a name", () => {
  expect(() => {
    new Star(
      "",
      "/star.png",
    );
  }).toThrow();
});

test("Star returns its name and image URL", () => {
    const star = new Star(
      "Glowing Star",
      "/star.png",
    );
  
    expect(star.name).toBe("Glowing Star");
    expect(star.imageUrl).toBe("/star.png");
  });
  
test("Star requires an image URL", () => {
  expect(() => {
    new Star(
      "Glowing Star",
      "",
    );
  }).toThrow();
});