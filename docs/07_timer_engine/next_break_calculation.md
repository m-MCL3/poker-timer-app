# 次の Break までの算出

## 1. 目的

Timer 画面では「次の Break までの時間」を表示する。  
この値は UI ではなく Usecase が算出する。

## 2. 算出ルール

現在 item から先へ順に走査し、最初に見つかった `kind = "break"` までの所要時間を合計する。

### 現在 item が Level の場合
- 現在 item の残り時間を起点にする
- その後ろの item を順に加算する
- 最初の Break が見つかった時点で終了する

### 現在 item が Break の場合
- 表示は `NOW` とする

### 先に Break が存在しない場合
- 表示は `NO BREAK` とする

## 3. 重要方針

- UI は item 配列を走査しない
- 合計時間は Usecase 内で ms 基準で算出し、Snapshot では text 化する
- 仕様の変更点はこの文書に反映する

## 4. 表示形式

- 通常: `MM:SS`
- Break 中: `NOW`
- 今後 Break が無い: `NO BREAK`
