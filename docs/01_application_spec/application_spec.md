# Application Specification

## Purpose
Poker Timer App is designed to run poker tournament timers for poker circles.
It allows users to define tournament blind structures and run them as a timer.

## Core Concepts

### Tournament Structure
A tournament consists of a sequence of items:

- Level
- Break

Each item has a duration and optional blind configuration.

### Timer Behaviour

States:

- idle
- running
- paused
- finished

Behaviour:

- When timer reaches 0 → automatically move to next item
- If last item finishes → state becomes `finished`
- Manual navigation allowed: Next / Previous

### Screens

Timer Screen
Displays current tournament state.

Editor Screen
Allows editing of tournament structure.

Preset Management
Save / load tournament structures.

## Functional Requirements

Timer:

- Start / Pause / Resume
- Automatic level transition
- Manual navigation
- Display next item

Editor:

- Insert Level
- Insert Break
- Delete item
- Edit duration
- Edit blinds

Presets:

- Save
- Load
- Rename
- Delete