# ADR-003: Editor は baseStructure + operations を真実にする

## Status
Accepted

## Context
draft 構造を直接持つ方式では、Cancel、dirty 判定、差分管理が不安定になりやすい。

## Decision
EditorState は `baseStructure`, `operations`, `isEditable` を持つ。
現在構造は materialize により都度生成する。

## Consequences

### 良い点
- Cancel が簡単
- dirty 判定が明確
- 差分の意味が残る

### 悪い点
- draft 直接更新より理解コストが高い
