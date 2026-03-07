# Coding Guidelines

## 1. 基本方針

このプロジェクトでは、見た目の都合よりも**責務の置き場所**を優先する。  
コードを書くときは、まず「どの層の責務か」を判断する。

---

## 2. どこに書くべきか

### Domain に書くもの
- 型
- 純粋モデル
- discriminated union
- 値オブジェクトに近いもの

### Usecase に書くもの
- 状態遷移
- 派生表示情報の計算
- 編集操作の適用
- 名前正規化やバリデーション

### Infrastructure に書くもの
- LocalStorage
- serialize / deserialize
- キー命名
- 永続化フォーマット

### UI に書くもの
- JSX
- クリックハンドラ
- input 値受け渡し
- confirm / prompt / alert
- 画面遷移

---

## 3. 命名規則

- `Level` / `Break` のような概念名は domain 用語に合わせる
- 「次 level」ではなく、現在設計が item 基準なら `nextItem` と書く
- preset 系は save/load/remove より savePreset/loadPreset/deletePreset を優先する
- 表示専用データには Snapshot を使う

---

## 4. 書いてはいけないコードの例

### UI で Break 判定から複雑な表示分岐を書く
→ Snapshot に寄せる

### Domain で localStorage を触る
→ Infrastructure に寄せる

### Usecase 内で `Date.now()` を呼ぶ
→ `nowEpochMs` を引数で渡す

### Editor が draft オブジェクトを直接 mutation する
→ operations を積んで materialize する

---

## 5. テストしやすい形

関数はなるべく次の形に寄せる。

```text
input -> output
```

特に time-sensitive なロジックは、現在時刻を明示引数にする。
