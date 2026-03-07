# ADR-003: Editor は baseStructure + operations で持つ

## Status
Accepted

## Context
Editor が draft 構造を直接持つと、Cancel や差分管理が不安定になりやすい。  
また編集途中の意味づけが UI に漏れやすい。

## Decision
EditorState は `baseStructure`, `operations`, `isEditable` を持つ。  
表示用 structure は materialize により都度再構成する。

## Consequences
### 良い点
- Cancel が簡単
- dirty 判定が明確
- 変更履歴の意味が残る

### 悪い点
- 初見では draft 直接更新より理解コストが高い
