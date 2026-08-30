# Cosmic Clicker

Cosmic Clicker is a full-stack browser-based incremental game built with TypeScript. Players create accounts, collect Stardust by clicking a star, purchase upgrades and automated buildings, and enable an AI-powered Robo-Buy system that makes purchasing decisions using a trained Markov chain.

The project was developed using the Model-View-Controller (MVC) architecture and includes persistent browser-based PostgreSQL storage, secure password hashing, automated testing, Design by Contract, and an offline machine-learning training pipeline.

## Features

### Player Accounts

Players can create an account and sign in to access their saved game.

- Account registration and authentication
- Unique usernames
- Secure password hashing using PBKDF2 and SHA-256
- Random password salts generated using the Web Crypto API
- Persistent account data using PGlite

### Clicker Gameplay

Players collect Stardust by clicking the main star.

The game tracks:

- Current Stardust
- Total clicks
- Click power
- Passive Stardust production

Purchased upgrades increase the amount of Stardust earned per click.

### Upgrade System

The game contains multiple purchasable upgrades with different effects.

Two upgrade strategies are implemented using inheritance and polymorphism:

- `PowerUpgrade` adds a fixed amount to click power.
- `MultiplierUpgrade` multiplies the player's current click power.

Upgrades can only be purchased once and require the player to have enough Stardust.

### Building System

Buildings provide passive Stardust production without requiring the player to click.

The game includes multiple building options based on:

- `StarCollector`
- `NebulaFactory`

Unlike upgrades, buildings can be purchased multiple times. Their total Stardust production increases based on the quantity owned.

### Robo-Buy and Markov Chain

Cosmic Clicker includes an optional Robo-Buy system that automatically purchases items for the player.

Robo-Buy uses a trained Markov chain to determine which item should be considered next based on the previous purchase.

The model is trained offline using supplied CSV training data. The training program:

1. Reads state transitions from the training dataset.
2. Counts transitions between states.
3. Converts the transition counts into probabilities.
4. Generates a trained Markov model.
5. Saves the model as JSON for use by the application.

During gameplay, the application loads the trained model and uses weighted random selection to determine the next state and corresponding purchasable item.

Robo-Buy can be enabled or disabled by the player.

## Architecture

The application follows the Model-View-Controller (MVC) design pattern.

### Model

The model contains the game's domain logic, including:

- Accounts
- Game state
- Stars
- Upgrades
- Buildings
- Persistence
- Markov chain
- Robo-Buy logic

The Markov chain is kept as an internal implementation detail of the domain model.

### View

The view is responsible for displaying the current game state and providing the graphical interface for player interactions.

The interface displays information such as:

- Stardust
- Total clicks
- Click power
- Passive production
- Available upgrades
- Available buildings
- Purchase results
- Robo-Buy status

### Controller

Controllers connect user actions from the view to operations in the domain model.

They handle actions such as:

- Account registration
- Sign in
- Clicking the star
- Purchasing upgrades
- Purchasing buildings
- Enabling and disabling Robo-Buy
- Saving game progress

The model uses the Listener pattern to notify the interface whenever relevant game state changes.

## Persistence

Cosmic Clicker uses PGlite, which provides PostgreSQL functionality directly in the browser.

Persistent data includes:

- Accounts
- Game state
- Stardust
- Click power
- Total clicks
- Purchased upgrades
- Building quantities

Game progress is automatically saved as the player interacts with the application.

Foreign keys and database constraints are used to help maintain valid relationships between stored entities.

## Security

Passwords are not stored as plain text.

Account passwords are processed using the Web Crypto API with:

- PBKDF2
- SHA-256
- Random 16-byte salts
- 100,000 PBKDF2 iterations

The resulting password hash and salt are stored in the database and used to verify future sign-in attempts.

## Design by Contract

The domain model uses assertions to enforce preconditions, postconditions, and class invariants.

Examples include:

- Stardust cannot be negative.
- Click power must be at least one.
- Upgrade costs must be positive.
- Buildings must have valid production values.
- Purchased upgrades cannot be purchased again.
- Game objects must contain valid upgrades and buildings.

These checks help ensure that domain objects remain in valid states.

## UI Design

The application's interface was evaluated using three Human-Computer Interaction heuristics:

- **Visibility** – Important actions and the current game state should be visible to the player.
- **Feedback** – Player actions such as clicking and purchasing provide visible results or error messages.
- **Consistency** – Similar controls, labels, and purchasing interactions follow consistent patterns throughout the application.

The full assessment is available in `ui-assessment.md`.

## Technology Stack

- TypeScript
- HTML
- CSS
- Vite
- PGlite / PostgreSQL
- Web Crypto API
- Vitest
- Node.js
- Mermaid
- Git / GitHub

## Running the Project

### Requirements

Install a recent version of Node.js and npm.

Clone the repository and install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL displayed by Vite in your browser.

It will usually be:

```text
http://localhost:5173
```

## Training the Markov Model

The supplied training data is located at:

```text
training/training.csv
```

Run the offline training program with:

```bash
npm run train
```

The program processes the training data and generates:

```text
public/model.json
```

The generated JSON file represents the trained Markov chain as transition probabilities.

For example, each starting state maps to possible next states and their corresponding probabilities:

```text
state -> {
    nextState1: probability,
    nextState2: probability,
    ...
}
```

The outgoing probabilities for each state sum to approximately `1`.

The application loads this model when it starts and uses it for Robo-Buy decisions.

## Running Tests

Run the complete test suite:

```bash
npm test
```

or:

```bash
npx vitest
```

Run tests with code coverage:

```bash
npx vitest run --coverage
```

The project currently contains 68 automated tests covering the core domain model, account system, persistence, upgrades, buildings, and inventory loading.

## Project Structure

```text
Cosmic-Clicker/
├── public/
│   └── model.json
│
├── src/
│   ├── controller/
│   ├── model/
│   ├── view/
│   ├── database.ts
│   └── main.ts
│
├── tests/
│
├── training/
│   ├── training.csv
│   └── train.ts
│
├── create-tables.sql
├── domain.md
├── flows.md
├── ui-assessment.md
├── package.json
├── tsconfig.json
└── README.md
```

## Design Documentation

Additional documentation is included with the project:

- `domain.md` – Domain model and design decisions
- `flows.md` – Major application flows and interactions
- `ui-assessment.md` – HCI assessment of the user interface
- `create-tables.sql` – Relational database schema and inventory data

## Key Concepts Demonstrated

This project demonstrates practical experience with:

- Object-oriented programming
- TypeScript
- Model-View-Controller architecture
- Relational database design
- SQL
- Data persistence
- Authentication
- Password hashing
- Inheritance and polymorphism
- Design by Contract
- Observer/Listener pattern
- Automated testing
- Markov chains
- Offline model training
- Weighted probabilistic selection
- Human-Computer Interaction principles
- Git version control

## Development

Cosmic Clicker was developed incrementally as part of COMP 2452 – Software Development 2 at the University of Manitoba.

The project began as a small clicker-game domain model and was progressively expanded with persistence, authentication, passive resource generation, UI evaluation, a larger inventory system, and finally an AI-powered Robo-Buy feature using a trained Markov chain.

The result is a complete TypeScript application demonstrating software architecture, database design, testing, UI design, security, and introductory machine-learning concepts.