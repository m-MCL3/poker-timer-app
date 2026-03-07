# UI Screens

## 1. Timer Page

### 役割
- 実行中タイマーの表示
- start / pause / resume の入力
- next / prev / reset の入力

### 表示に必要なもの
- title
- current item 番号
- total item 数
- current item label
- remainingMs
- status
- currentBlindGroups
- nextItemText
- showBreakBanner
- showCurrentBlinds

### UI が持つべきでない責務
- Break をどう解釈するか
- nextItemText をどう生成するか
- current blinds をどこから取るか

これらは Snapshot 側で解決する。

## 2. Editor Page

### 役割
- structure 編集
- Preset 操作
- Apply / Cancel

### 表示単位
1 row = 1 item

### row が表すもの
- item 順序
- item 種別
- duration
- blinds 編集欄
- 削除可否

## 3. Settings Page

存在は想定しているが、現時点では詳細未確定。
