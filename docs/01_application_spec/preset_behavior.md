# Preset 仕様

## 1. Preset の目的

Preset は `TimerStructure` を名前付きで保存し、再利用する仕組みである。

## 2. Save Preset

- Editor の現在構造を保存する
- 名前入力必須
- 空文字は不可
- 既存名なら上書き確認する

## 3. Load Preset

- 選択中 preset を読み込む
- dirty 状態なら破棄確認する
- 読み込んだ structure は Timer に即時反映する
- Editor base も同期する

## 4. Rename Preset

- 選択中 preset が対象
- `Rename Preset` ボタン押下でダイアログ表示
- 新しい名前を入力して改名する
- 重複名は不可
- キャンセル時は何もしない

## 5. Delete Preset

- 選択中 preset を削除する
- 確認ダイアログあり

## 6. Preset の本質

Preset が保存するのは TimerState 全体ではなく、**TimerStructure** である。  
目的は構造の再利用であり、実行途中状態の復元ではない。
