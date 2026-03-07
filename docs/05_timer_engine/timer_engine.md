# Timer Engine

Timer is deterministic.

Time is calculated from:

startEpochMs
currentEpochMs

Remaining time is computed rather than stored.

Advantages:

- no drift
- deterministic behaviour
- safe resume