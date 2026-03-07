# ADR-004: Preset 保存形式は現時点を v1 とする

## Status
Accepted

## Context
モック段階で保存形式がまだ固まり切っていない時期に migration を積むと、設計理解の邪魔になる。

## Decision
現時点の TournamentStructure 保存形式を `schemaVersion: 1` とし、それ以前の互換は持たない。

## Consequences
### 良い点
- 現行設計に集中できる
- 古い概念を引きずらない

### 悪い点
- 過去保存データは読み込めない
- 本番移行時には改めて versioning 方針の見直しが必要
