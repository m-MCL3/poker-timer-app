# Dependency Rules

## 1. 基本原則

依存方向は内側へ向ける。  
外側の都合を内側へ持ち込まない。

---

## 2. 禁止事項

### Domain で禁止
- React import
- localStorage 直接使用
- `Date.now()` 直接使用
- window / document 参照

### Usecase で避けること
- JSX / UI 部品参照
- 画面レイアウト都合の分岐
- localStorage 直操作
- prompt / alert / confirm 呼び出し

### UI で避けること
- TimerState を直接解釈して高度な遷移判断をすること
- structure の正規性を画面ごとに独自解釈すること

---

## 3. 許可される依存

- UI → Usecase / Domain 型
- Usecase → Domain
- Infrastructure → Domain / Usecase で必要な型
- UI → Infrastructure 直参照は最小限にとどめる

---

## 4. 実装時の指針

- 何かを「表示用に計算したい」と思ったら Snapshot を検討する
- 何かを「保存形式に合わせたい」と思ったら Infrastructure に寄せる
- 何かを「状態遷移させたい」と思ったら Usecase に寄せる
- 何かを「型として保証したい」と思ったら Domain に寄せる
