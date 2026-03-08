# PresetUsecase

## 1. 役割

PresetUsecase は Preset 名まわりの軽量ルールを担当する。  
保存そのものは Infrastructure が行う。

## 2. 主な関数

- `normalizePresetName`
- `validatePresetName`
- `hasPreset`
- `buildPresetSummaries`

## 3. UI に書かない理由

画面ごとに trim や重複判定がばらつくと整合が崩れるため。  
Preset 名ルールは Usecase に寄せる。

## 4. 保存対象

Preset が扱う主対象は `TimerStructure` であり、Runtime は対象外とする。
