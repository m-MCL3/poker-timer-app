# Timer Data Flow

```mermaid
flowchart LR

Structure[TournamentStructure]
State[TimerState]
Snapshot[TimerSnapshot]
UI[Timer UI]

Structure --> State
State --> Snapshot
Snapshot --> UI
```
