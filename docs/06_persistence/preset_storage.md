# Preset 保存設計

## 1. 保存対象

Preset が保存するのは `TimerStructure` である。  
TimerRuntime や TimerSnapshot は保存対象にしない。

## 2. 理由

- Preset の目的は構造の再利用
- 実行途中状態の復元は別機能
- Snapshot は再生成可能
- Runtime は時刻依存であり、保存責務を分けた方が明快

## 3. 保存単位

- 1 preset = 1 TimerStructure
- preset 一覧は summary を別で持つか、structure 群から導出する

## 4. Repository の責務

- 保存
- 読み込み
- 改名
- 削除
- 一覧取得

## 5. Usecase との分担

- repository: 永続化
- presetUsecase: 名前規約、重複判定、一覧整形
