---
title: Assessment of the Cosmic Clicker User Interface
author: Ekeh Chukwuemeka (ekehcb@myumanitoba.ca)
date: Summer 2026
---

# Phase 1

The Phase 1 interface implemented the minimum viable version of Cosmic Clicker. The player could click the star to collect Stardust, view game statistics, and purchase upgrades to increase click power.

Here's my Phase 1 interface.

![Phase 1 interface](Phase%201.png)

## Phase 1 Visibility

The Phase 1 interface generally provided good visibility for the core gameplay.

- :+1: The star is clearly visible and appears as the primary object the player should interact with.
- :+1: The current Stardust, click power, and total clicks are always displayed, so the player knows the current game state.
- :+1: Upgrade buttons and their costs are visible before purchase.
- :-1: Players are not explicitly told that clicking the star earns Stardust, so new users must discover this themselves.
- :-1: Purchase buttons remain clickable even when the player can't afford the item, the affordability is only communicated after clicking or via an error message, rather than by disabling or greying out the button in advance.

## Phase 1 Feedback

The interface provides immediate feedback for most player actions.

- :+1: Clicking the star immediately updates the Stardust counter.
- :+1: Purchasing an upgrade immediately increases the player's click power.
- :+1: Attempting to purchase an upgrade without enough Stardust displays an appropriate error message.
- :-1: There is no indication that the system is processing anything because all actions happen instantly.
- :-1: There is no indication that progress has been saved because persistence was not part of Phase 1.

## Phase 1 Consistency

The interface is simple and internally consistent.

- :+1: Buttons consistently describe their actions.
- :+1: Similar interface elements use the same layout and styling.
- :+1: Game statistics remain in the same location throughout gameplay.
- :-1: Only upgrades were available, limiting the overall gameplay experience.

---

# Phase 2

Phase 2 expanded the original game by introducing user accounts, persistent game saves, buildings, and passive Stardust production.

The login screen is shown below.

![Phase 2 login](Phase%202%20login.png)

After signing in, the player accesses the main game interface.

![Phase 2 gameplay](Phase%202.png)

## Changes from Phase 1

The major improvements made during Phase 2 include:

- Added account registration.
- Added account sign in.
- Added secure password hashing using PBKDF2 with SHA-256.
- Added persistent game saves using a relational database.
- Added buildings that automatically generate Stardust.
- Added passive Stardust production statistics.
- Added automatic loading of saved games after signing in.

## Phase 2 Visibility

The Phase 2 interface improves visibility by displaying more information about the current game state.

- :+1: The login screen clearly shows the available actions before entering the game.
- :+1: The player can always see their Stardust, click power, total clicks, and passive production.
- :+1: Upgrades and buildings are separated into different sections, making them easy to distinguish.
- :+1: Purchase costs are visible before an item is bought.
- :-1: Purchased upgrades could be disabled or visually highlighted to better indicate that they are no longer available.
- :-1: Passive Stardust production happens automatically but is not visually emphasized when it occurs.

## Phase 2 Feedback

The interface provides useful feedback for almost every player action.

- :+1: Clicking the star immediately updates the Stardust total.
- :+1: Purchasing an upgrade immediately updates the player's click power.
- :+1: Purchasing a building immediately updates passive Stardust production.
- :+1: Invalid purchases display clear error messages.
- :+1: Registering an existing username informs the player that the username is already taken.
- :+1: Entering incorrect login credentials prevents sign in and displays an appropriate error message.
- :-1: Automatic saving occurs in the background without informing the player that the game has been saved.

## Phase 2 Consistency

The Phase 2 interface remains consistent as new functionality is added.

- :+1: Buttons consistently use labels that describe their actions.
- :+1: Username and password input fields are clearly labelled.
- :+1: Upgrade and building buttons follow the same layout and presentation.
- :+1: Similar operations, such as purchasing upgrades and buildings, follow the same sequence of steps.
- :-1: Additional spacing between interface sections could improve readability.

## How I Might Improve the Interface

Based on this assessment, I would make the following improvements if I continued developing Cosmic Clicker.

- Add icons for upgrades and buildings.
- Disable or grey out purchase buttons when the player can't afford the item, instead of only showing an error after the click.
- Display a notification whenever the game is automatically saved.
- Add animations when Stardust is collected.
- Highlight passive Stardust production whenever it occurs.
- Improve spacing between sections to make the interface easier to read.
- Add tooltips that explain upgrades and buildings before they are purchased.