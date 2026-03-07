# ADR-004: Preset 保存形式は現時点を v1 とする

## Status
Accepted

## Context
モック段階で migration を積むと、設計理解のノイズが増える。

## Decision
現時点の TournamentStructure 保存形式を `schemaVersion: 1` とし、それ以前の互換は持たない。

## Consequences

### 良い点
- 現行設計に集中できる
- 古い概念を引きずらない

### 悪い点
- 過去保存データは読み込めない
- 本番移行時には versioning 方針の見直しが必要
