# Cosmic Clicker

## Overview

Cosmic Clicker is a clicker game built using TypeScript and the Model-View-Controller (MVC) design pattern. Players create an account, sign in, and click a star to collect Stardust. Stardust can be spent on upgrades that increase click power and buildings that generate passive Stardust over time.

In Phase 3, the game introduces a Robo-Buy feature that uses a trained Markov chain to automatically purchase upgrades and buildings. The Markov model is trained offline using supplied training data and is loaded when the application starts.

The application stores player accounts and game progress using PGlite. Passwords are securely hashed using the Web Crypto API with PBKDF2 before being stored. The project also follows Design by Contract through class invariants, preconditions, and postconditions, and uses the Listener pattern so the views update automatically whenever the game state changes.

---

## Features

- Account registration and sign in
- Secure password hashing with PBKDF2
- Persistent game data using PGlite
- Clicking to collect Stardust
- Upgrades that increase click power
- Buildings that generate passive Stardust
- Automatic saving of game progress
- Robo-Buy using a trained Markov chain
- MVC architecture with listener-based updates

---

## Running the Application

Install the project dependencies:

```bash
npm install
```

Start the application:

```bash
npm run dev
```

Open the URL displayed in the terminal (usually `http://localhost:5173`).

---

## Running the Tests

Run all tests:

```bash
npm test
```

or

```bash
npx vitest
```

Run the tests with coverage:

```bash
npx vitest run --coverage
```

---

## Training the Markov Model

The Robo-Buy feature uses a Markov chain trained from the supplied training data.

The training data is located in:

```text
training/training.csv
```

Run the training program:

```bash
npm run train
```

The training program reads the supplied CSV file, calculates the transition probabilities between states, and writes the trained model to:

```text
public/model.json
```

The generated `model.json` contains the transition probabilities used by the Markov chain during gameplay.

The application automatically loads `public/model.json` when it starts.

---

## Robo-Buy

The Robo-Buy feature can be enabled or disabled while playing.

When enabled:

- Robo-Buy uses the trained Markov model to select the next upgrade or building.
- The next purchase is selected according to the transition probabilities stored in `model.json`.
- If enough Stardust is available, the selected item is purchased automatically.
- If there is not enough Stardust, Robo-Buy waits until enough Stardust has been collected before attempting another purchase.

---

## Project Structure

- `src/model` – Domain model classes and Markov chain implementation
- `src/view` – User interface
- `src/controller` – Application controllers
- `src/database` – Database persistence
- `training` – Markov chain training program and training data
- `public` – Trained Markov model
- `tests` – Unit tests

---

## Other Documentation

- `domain.md` – Domain model
- `flows.md` – Flows of interaction
- `ui-assessment.md` – User interface assessment
- `create-tables.sql` – Database schema and inventory data

---

## Phase 3 Changes

- Added an offline Markov chain training program.
- Added a trained Markov model (`public/model.json`) loaded when the application starts.
- Added Robo-Buy functionality that automatically purchases upgrades and buildings using the trained Markov model.
- Expanded the inventory to include at least ten purchasable upgrades and buildings.