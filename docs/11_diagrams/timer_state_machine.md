# Timer State Machine

```mermaid
stateDiagram-v2

[*] --> idle

idle --> running : start
running --> paused : pause
paused --> running : resume

running --> finished : last item ends

paused --> idle : reset
running --> idle : reset
finished --> idle : reset
```
