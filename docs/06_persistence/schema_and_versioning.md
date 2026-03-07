# Schema and Versioning

## 1. 現方針

モック段階では migration を持たず、**現時点の構造を v1 とする**。
それ以前の互換は切り捨てる。

## 2. この方針を採る理由

- 仕様が動いている段階で旧互換を持つとノイズになる
- item 基準設計へ完全に寄せたい
- 旧モデルが残ると理解の妨げになる

## 3. 現在の形式

```text
{
  schemaVersion: 1,
  structure: TournamentStructure
}
```

## 4. 将来の方針

保存形式を変更する必要が出た場合は、

- schemaVersion を上げる
- deserialize で分岐する
- 必要なら migrate を導入する

ただし、モック段階ではそこまでしない。
