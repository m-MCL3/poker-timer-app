# Preset Usecases

## 1. 役割

PresetUsecase は Preset 名まわりの軽量ルールを担当する。  
保存そのものは Infrastructure が行う。

## 2. 主な関数

### normalizePresetName
前後空白除去など、比較用の正規化を行う。

### validatePresetName
空文字などを弾く。

### hasPreset
一覧内に同名 preset が存在するか確認する。

### buildPresetSummaries
一覧表示向けの整形や並び替えを行う。

## 3. UI に書かない理由

画面ごとに trim や重複判定がばらつくと整合が崩れるため。  
Preset 名ルールは Usecase に寄せる。
