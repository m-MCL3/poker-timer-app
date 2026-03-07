# Architecture Diagram

```mermaid
flowchart TD

UI[UI Layer<br/>Pages / Components]
Usecase[Usecases<br/>Timer / Editor / Preset]
Domain[Domain<br/>TournamentStructure / Items / States]
Infra[Infrastructure<br/>LocalStorage / Serialization]

UI --> Usecase
Usecase --> Domain
Infra --> Domain
```
