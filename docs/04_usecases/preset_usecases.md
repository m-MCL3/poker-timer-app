# Preset Usecases

## 1. 役割

PresetUsecase は、Preset 名に関する軽量なドメインルールを担当する。

保存そのものは Infrastructure が行うが、名前の扱いは Usecase に閉じ込める。

---

## 2. 主な関数

### normalizePresetName
トリムなどを行い、比較用に正規化する。

### validatePresetName
空文字などを弾く。

### hasPreset
既存 preset 一覧と重複確認する。

### buildPresetSummaries
一覧表示用の並び順を整える。

---

## 3. なぜ名前ルールを UI に書かないのか

UI ごとにトリムやバリデーションがばらつくと不整合になるため。  
Preset 名のルールは複数画面から参照しうるので、Usecase に置く。
