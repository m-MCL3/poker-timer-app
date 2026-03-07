# UI Snapshots

## 1. Snapshot の目的

Snapshot は、UI に必要な派生情報だけをまとめた表示モデルである。
State や structure の内部事情を UI に漏らさないための境界になる。

## 2. TimerSnapshot

TimerSnapshot が持つ主な情報

- title
- status
- currentItemNumber
- totalItemCount
- currentItemLabel
- remainingMs
- showBreakBanner
- showCurrentBlinds
- currentBlindGroups
- nextItemText

### なぜ currentItemLabel を持つのか
`LEVEL 3` や `BREAK` を UI 側で組み立てると表示ルールが散るため。

### なぜ nextItemText を持つのか
次 item が Level か Break かで文言が変わるため。  
UI に条件分岐を持たせない。

## 3. EditorSnapshot

EditorSnapshot が持つ主な情報

- title
- isDirty
- isEditable
- rows

各 row は次を持つ。

- itemId
- itemIndex
- itemNumber
- itemKind
- itemLabel
- durationMinutesText
- blindCells
- canRemove
- canEditBlinds

### なぜ text 化するのか
input にそのまま渡しやすく、UI で null / number / string の変換を繰り返さずに済むため。
