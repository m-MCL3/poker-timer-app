# Timer Specification

## Timer State

idle  
running  
paused  
finished

## 状態遷移

idle → running  
running → paused  
paused → running  
running → finished

## レベル遷移

0秒到達時

次 item へ自動移行  
最終 item は停止

## 手動操作

Next Item  
Previous Item

手動移動時はフル時間で開始。