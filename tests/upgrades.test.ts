import { expect, test } from "vitest";
import MultiplierUpgrade from "../src/model/multiplier-upgrade.ts";
import PowerUpgrade from "../src/model/power-upgrade.ts";

test("PowerUpgrade adds to click power", () => {
  const upgrade = new PowerUpgrade(
    "Solar Flare",
    "Adds five to click power.",
    10,
    5,
  );

  expect(upgrade.apply(1)).toBe(6);
});

test("PowerUpgrade purchase marks upgrade as purchased", () => {
  const upgrade = new PowerUpgrade(
    "Solar Flare",
    "Adds five to click power.",
    10,
    5,
  );

  const newPower = upgrade.purchase(1);

  expect(newPower).toBe(6);
  expect(upgrade.purchased).toBe(true);
});

test("PowerUpgrade cannot be purchased twice", () => {
  const upgrade = new PowerUpgrade(
    "Solar Flare",
    "Adds five to click power.",
    10,
    5,
  );

  upgrade.purchase(1);

  expect(() => upgrade.purchase(6)).toThrow();
});

test("PowerUpgrade requires a positive increase", () => {
  expect(() => {
    new PowerUpgrade(
      "Solar Flare",
      "Adds to click power.",
      10,
      0,
    );
  }).toThrow();
});

test("MultiplierUpgrade multiplies click power", () => {
  const upgrade = new MultiplierUpgrade(
    "Gravity Well",
    "Multiplies click power by two.",
    30,
    2,
  );

  expect(upgrade.apply(6)).toBe(12);
});

test("MultiplierUpgrade purchase marks upgrade as purchased", () => {
  const upgrade = new MultiplierUpgrade(
    "Gravity Well",
    "Multiplies click power by two.",
    30,
    2,
  );

  const newPower = upgrade.purchase(6);

  expect(newPower).toBe(12);
  expect(upgrade.purchased).toBe(true);
});

test("MultiplierUpgrade requires multiplier greater than one", () => {
  expect(() => {
    new MultiplierUpgrade(
      "Gravity Well",
      "Multiplies click power.",
      30,
      1,
    );
  }).toThrow();
});

test("Upgrade requires a name", () => {
  expect(() => {
    new PowerUpgrade(
      "",
      "Adds five to click power.",
      10,
      5,
    );
  }).toThrow();
});

test("Upgrade requires a description", () => {
  expect(() => {
    new PowerUpgrade(
      "Solar Flare",
      "",
      10,
      5,
    );
  }).toThrow();
});

test("Upgrade cost must be greater than zero", () => {
  expect(() => {
    new PowerUpgrade(
      "Solar Flare",
      "Adds five to click power.",
      0,
      5,
    );
  }).toThrow();
});

test("PowerUpgrade returns its power increase", () => {
    const upgrade = new PowerUpgrade(
      "Solar Flare",
      "Adds five to click power.",
      10,
      5,
    );
  
    expect(upgrade.powerIncrease).toBe(5);
  });
  
  test("MultiplierUpgrade returns its multiplier", () => {
    const upgrade = new MultiplierUpgrade(
      "Gravity Well",
      "Multiplies click power by two.",
      30,
      2,
    );
  
    expect(upgrade.multiplier).toBe(2);
  });
  
  test("Upgrade returns its name, description, and cost", () => {
    const upgrade = new PowerUpgrade(
      "Solar Flare",
      "Adds five to click power.",
      10,
      5,
    );
  
    expect(upgrade.name).toBe("Solar Flare");
    expect(upgrade.description).toBe(
      "Adds five to click power.",
    );
    expect(upgrade.cost).toBe(10);
  });