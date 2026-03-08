# Container と境界

## 1. Composition Root の役割

依存関係の組み立ては `container.ts` に集約する。  
UI が個別の依存を直接 new しない。

## 2. 基本構成

container は少なくとも次を配線する。

- clock
- timerRuntimeStore
- presetRepository
- timerUsecase
- editorUsecase
- presetUsecase

## 3. UI と container の関係

UI が参照してよいのは、原則として Usecase だけである。

### TimerPage
- `timerUsecase`
- 必要なら settings / navigation 用の軽量依存

### EditorPage
- `editorUsecase`
- `presetUsecase`

### Preset 関連 UI
- `presetUsecase`
- repository 直接参照はしない

## 4. 隠すべきもの

次は UI へ直接公開しない。

- `clock`
- runtime store
- persistence の詳細
- serialize / deserialize
- tick 処理の内部都合

## 5. 境界の目的

この境界を守ることで、次の変更を UI へ波及させにくくする。

- 保存先変更
- deterministic timer の調整
- runtime store の差し替え
- Snapshot の拡張
