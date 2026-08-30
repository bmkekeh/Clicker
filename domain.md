---
title: Domain Model for Cosmic Clicker
author: Ekeh Chukwuemeka (ekehcb@myumanitoba.ca)
date: Summer 2026
---

# Domain model

The domain model for **Cosmic Clicker** consists of an `Account` that owns one saved `Game`. Each game contains one clickable `Star`, two upgrades, and two buildings.

Players earn Stardust by clicking the star and from passive building production. Stardust can be used to purchase upgrades that increase click power and buildings that produce more Stardust over time.

```mermaid
classDiagram

    class Account {
        -~string username
        -string passwordHash
        -string salt
        -Game game
        +register(username : string, password : string) boolean
        +signIn(password : string) boolean
    }

    class GameStore {
        +createGame(account : Account) Game
        +loadGame(account : Account) Game
        +saveGame(game : Game) void
    }

    class Listener {
        <<interface>>
        +notify() void
    }

    class Game {
        -Account account
        -Star star
        -Upgrade[] upgrades
        -Building[] buildings
        -Listener[] listeners
        -number stardust
        -number clickPower
        +click() void
        +purchaseUpgrade(upgrade : Upgrade) boolean
        +purchaseBuilding(building : Building) boolean
        +collectPassiveStardust() void
        +registerListener(listener : Listener) void
        +notifyListeners() void
    }

    class Star {
        -string name
        -Game game
        -string imageUrl
        -number totalClicks
        +registerClick() void
    }

    class Upgrade {
        <<abstract>>
        -string name
        -Game game
        -string description
        -number cost
        -boolean purchased
        +apply(currentPower : number) number
    }

    class PowerUpgrade {
        -number powerIncrease
        +apply(currentPower : number) number
    }

    class MultiplierUpgrade {
        -number multiplier
        +apply(currentPower : number) number
    }

    class Building {
        <<abstract>>
        -string name
        -Game game
        -string description
        -number cost
        -number quantity
        -number stardustPerSecond
        +purchase() void
        +produceStardust() number
    }

    class StarCollector {
        +produceStardust() number
    }

    class NebulaFactory {
        +produceStardust() number
    }

    Account "1" *-- "1" Game : owns

    Game "1" *-- "1" Star : owns
    Game "1" *-- "2" Upgrade : owns
    Game "1" *-- "2" Building : owns
    Game "1" o-- "*" Listener : notifies

    GameStore ..> Account : identifies
    GameStore ..> Game : loads and saves

    Upgrade <|-- PowerUpgrade
    Upgrade <|-- MultiplierUpgrade

    Building <|-- StarCollector
    Building <|-- NebulaFactory

    note for Account "Class invariants:
    <ul>
        <li>username is not empty</li>
        <li>username is globally unique</li>
        <li>passwordHash is not empty</li>
        <li>salt is not empty</li>
        <li>plain-text passwords are not stored</li>
    </ul>"

    note for Game "Class invariants:
    <ul>
        <li>account is not null</li>
        <li>star is not null</li>
        <li>stardust >= 0</li>
        <li>clickPower >= 1</li>
        <li>contains one PowerUpgrade and one MultiplierUpgrade</li>
        <li>contains one StarCollector and one NebulaFactory</li>
    </ul>"

    note for Star "Class invariants:
    <ul>
        <li>name is not empty</li>
        <li>the combination of game and name is unique</li>
        <li>imageUrl is not empty</li>
        <li>totalClicks >= 0</li>
    </ul>"

    note for Upgrade "Class invariants:
    <ul>
        <li>name is not empty</li>
        <li>the combination of game and name is unique</li>
        <li>description is not empty</li>
        <li>cost > 0</li>
        <li>a purchased upgrade cannot be purchased again</li>
    </ul>"

    note for PowerUpgrade "Class invariants:
    <ul>
        <li>powerIncrease > 0</li>
    </ul>"

    note for MultiplierUpgrade "Class invariants:
    <ul>
        <li>multiplier > 1</li>
    </ul>"

    note for Building "Class invariants:
    <ul>
        <li>name is not empty</li>
        <li>the combination of game and name is unique</li>
        <li>description is not empty</li>
        <li>cost > 0</li>
        <li>quantity >= 0</li>
        <li>stardustPerSecond > 0</li>
    </ul>"

    note for StarCollector "Class invariants:
    <ul>
        <li>stardustPerSecond = 1</li>
    </ul>"

    note for NebulaFactory "Class invariants:
    <ul>
        <li>stardustPerSecond = 5</li>
    </ul>"
```

# Design notes

- Added an `Account` class so each player can register, sign in, and own one saved game.
- Added secure password storage using a password hash and randomly generated salt instead of storing plain-text passwords.
- Added a `GameStore` class to create, load, and save game data.
- Added database persistence using PGlite.
- Added an abstract `Building` class with the `StarCollector` and `NebulaFactory` subclasses.
- Added passive Stardust production based on building quantity and production rate.
- Updated the `Game` class to manage upgrades, buildings, passive Stardust collection, and registered listeners.
- Added the listener pattern so registered listeners are notified when the game state changes.
- Added composition, aggregation, dependencies, multiplicities, and class invariants.
- Changed the upgrade and building relationships to show that each game owns exactly two upgrade objects and two building objects.
- Added persistence for Stardust, click power, total clicks, purchased upgrades, and building quantities.
- Updated the uniqueness constraints based on Phase 2 feedback.
- Removed global uniqueness from `Star.name`, `Upgrade.name`, and `Building.name`.
- Modelled star, upgrade, and building names as unique only within the game that owns them.
- Kept `Account.username` globally unique because it identifies an individual player.
- Updated the domain model to match the completed implementation.