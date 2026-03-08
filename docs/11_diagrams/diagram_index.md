# 図の索引

このディレクトリには、文章だけでは把握しにくい構造を図として配置する。

## 推奨図一覧

- `architecture.md`: レイヤ構成図
- `domain_model.md`: TimerStructure / TimerItem / BlindGroup / Runtime の関係図
- `editor_operation_model.md`: baseStructure + operations の流れ
- `preset_storage.md`: Preset 保存構造
- `structure_execution_flow.md`: Editor → Apply → Timer 実行の流れ
- `timer_data_flow.md`: Structure / Runtime / Snapshot の流れ
- `timer_state_machine.md`: idle / running / paused / finished の状態遷移図

## 運用ルール

- 図だけで完結させず、対応する md とセットで更新する
- 図の名前は docs の責務名に合わせる
- 仕様変更時は図も同時に見直す
