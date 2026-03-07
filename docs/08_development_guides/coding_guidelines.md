# Coding Guidelines

## 1. 基本方針

コードを書くときは、まず「どの層の責務か」を判断する。  
見た目の都合より責務の置き場所を優先する。

## 2. どこに書くべきか

### Domain
- 型
- discriminated union
- 純粋なデータモデル

### Usecase
- 状態遷移
- 派生表示情報
- バリデーション
- 編集差分適用

### Infrastructure
- LocalStorage
- serialize / deserialize
- キー命名
- 永続化フォーマット

### UI
- JSX
- クリックイベント
- 入力値受け渡し
- confirm / prompt / alert
- 画面遷移

## 3. 命名規則

- 構造が item 基準なら `nextItem`, `currentItem` を使う
- preset は savePreset / loadPreset / renamePreset / deletePreset を優先
- 表示専用データには Snapshot を使う
- domain 用語と UI 用語を混ぜない

## 4. 書いてはいけない例

- UI で Break 判定から複雑な遷移判断を書く
- Domain で localStorage を触る
- Usecase 内で `Date.now()` を呼ぶ
- Editor が draft を直接 mutation する

## 5. テストしやすい形

関数はなるべく次に寄せる。

- input -> output
- state + command -> newState

time-sensitive なロジックは現在時刻を明示引数にする。
