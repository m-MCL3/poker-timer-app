# Architecture

The application follows a Clean Architecture inspired structure.

Layers:

- UI
- Usecases
- Domain
- Infrastructure

```mermaid
flowchart TD

UI --> Usecase
Usecase --> Domain
Infrastructure --> Domain
```