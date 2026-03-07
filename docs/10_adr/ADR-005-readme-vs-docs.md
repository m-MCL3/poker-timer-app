# ADR-005: README と docs の役割を分離する

## Status
Accepted

## Context
README に設計要素まで入れると、プロダクト概要と技術仕様が混在し、読み手ごとの目的に合わなくなる。

## Decision
README はアプリ概要と機能仕様に限定する。
設計、アーキテクチャ、開発ルールは docs に置く。

## Consequences

### 良い点
- README が入口として読みやすい
- docs に設計情報を集中できる
- 更新責務が明確になる

### 悪い点
- README だけでは設計の全体像は分からない
- docs を読む前提になる
