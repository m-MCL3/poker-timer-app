# UI Snapshots

## 1. Snapshot の目的

Snapshot は UI 用の派生データである。  
State や structure の内部事情を UI に漏らさないための境界として機能する。

---

## 2. TimerSnapshot

### 含めるべき情報
- title
- status
- current item の順序
- current item のラベル
- 残り時間
- Break バナー表示要否
- blinds 表示要否
- current blind groups
- next item text

### なぜ currentItemLabel を持つのか
`LEVEL 3` や `BREAK` を UI 側で組み立てると、表示ルールが散るため。

### なぜ nextItemText を持つのか
次 item が Break か Level かで文言が変わるため。  
UI に分岐を持たせない。

---

## 3. EditorSnapshot

### 含めるべき情報
- isDirty
- isEditable
- rows

### row が持つもの
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
input コンポーネントにそのまま渡せるため。  
画面で毎回 null / number / string を切り替える責務を減らす。
