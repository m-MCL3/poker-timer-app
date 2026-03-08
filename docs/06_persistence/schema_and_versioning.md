# スキーマと versioning

## 1. version を持つ理由

タイマー構造は今後拡張される可能性がある。  
保存形式に version を持たせることで、将来の migration を可能にする。

## 2. 保存形式の基本方針

```ts
type PersistedPreset = {
  version: 1
  structure: TimerStructure
}
```

## 3. migration の考え方

- 旧 version を読み込んだら、現 version へ変換する
- migration は Infrastructure で扱う
- Domain は旧形式を知らない

## 4. 今後の拡張候補

- item 名称追加
- blindGroups の拡張
- 設定項目追加
- metadata 追加
