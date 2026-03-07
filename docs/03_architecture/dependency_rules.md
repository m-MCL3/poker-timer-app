# Dependency Rules

## 1. 原則

依存方向は内側へ向ける。  
外側の都合を内側へ持ち込まない。

## 2. Domain で禁止

- React import
- localStorage 直接利用
- `Date.now()` 直接利用
- window / document 参照

## 3. Usecase で避けること

- JSX
- DOM 依存
- localStorage 直操作
- prompt / alert / confirm
- 画面レイアウト専用ロジック

## 4. UI で避けること

- TimerState を直接解釈して高度な遷移判断をすること
- Break 表示ルールを独自実装すること
- current / next 表示文字列を再発明すること

## 5. 実装判断の目安

- 表示用に計算したい → Snapshot
- 状態を変えたい → Usecase
- 型として保証したい → Domain
- 保存形式に合わせたい → Infrastructure
