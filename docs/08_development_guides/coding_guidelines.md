# コーディングガイドライン

## 1. 命名規則

- Domain はポーカー用語を使う
- UI は表示語を使ってよい
- データ構造の正式名称は docs に合わせる

例

### Domain
- `sb`
- `bb`
- `ante`
- `TimerStructure`
- `TimerRuntime`

### UI 表示
- `Bring-in`
- `Complete`
- `remainingText`
- `nextBreakText`

## 2. props 命名

props は Snapshot 名に揃える。  
UI コンポーネントごとに独自用語を増やしすぎない。

## 3. コメント方針

- 「何を変更したか」ではなく「そのコードが何を表すか」を書く
- 一時的な仮実装には TODO / FIXME を残す
- docs に書くべき設計意図をコードコメントに埋め込みすぎない

## 4. 実装時の判断

- 表示用に整形するなら Snapshot
- 状態を変えるなら Usecase
- 純粋な型なら Domain
- 保存形式なら Infrastructure
