# ADR-007 blind の標準語は sb / bb / ante とする

## 決定
Domain では blind のキーを `sb / bb / ante` に統一する。

## 理由
- ポーカーとして一般的
- FL / NL / PL と Stud の違いは表示差分で吸収できる
- `left / mid / right` より意味が明確

## 結果
Stud の `Bring-in / Complete` は UI 表示時のみ変換する。
