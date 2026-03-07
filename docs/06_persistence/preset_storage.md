# Preset Storage

## 1. 保存先

現時点では LocalStorage を使用する。  
将来的にサーバ保存へ移行する可能性はあるが、現在の仕様では LocalStorage が正である。

---

## 2. 保存単位

保存対象は `TournamentStructure`。  
TimerState 全体ではない。

理由
- 実行中状態は一時的であり、preset の本質ではない
- preset は構造の再利用が目的
- 再生途中の状態と構造の責務を混ぜないため

---

## 3. Storage Keys

- `pokerTimer:structures:index`
- `pokerTimer:structures:{name}`

### index の役割
保存済みプリセット一覧を管理する。  
現在は `name` と `updatedAtEpochMs` を保持する。

---

## 4. 保存形式

現時点を schemaVersion v1 とし、次の形式で保存する。

```text
{
  schemaVersion: 1,
  structure: TournamentStructure
}
```

モック段階では旧互換を持たず、古い構造は破棄する。

---

## 5. 提供操作

- listPresets
- listNames
- has
- savePreset
- loadPreset
- renamePreset
- deletePreset

旧名互換メソッドとして save / load / remove を残す場合があるが、今後は preset 名を含む命名へ統一するのが望ましい。
