# Preset Storage

## 1. 保存先

現時点では LocalStorage を使用する。

## 2. 保存対象

保存対象は TournamentStructure である。  
TimerState 全体ではない。

理由
- preset の本質は構造の再利用
- 実行中状態は一時的
- 途中状態まで混ぜると責務が崩れる

## 3. キー構造

- `pokerTimer:structures:index`
- `pokerTimer:structures:{name}`

### index の役割
保存済み preset 一覧を管理する。  
現在は `name` と `updatedAtEpochMs` を扱う。

## 4. 提供操作

- listPresets
- listNames
- has
- savePreset
- loadPreset
- renamePreset
- deletePreset

## 5. 保存形式

現在の保存形式を schemaVersion v1 とする。  
旧構造互換は持たない。
