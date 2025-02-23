# myKLA2-project
myKLA2 為一個線上動作訓練系統。系統以線上的方式克服距離問題及提升便利性，並利用虛擬角色來協助陪伴與減少人力動作教導時間。錄製動作後，透過虛擬角色演示動作，並偵測學習者表現以提供準確度評分。

## 專案技術 :
- HTML、JavaScript、CSS 開發
- MediaPipe、Tensorflow 進行偵測
- Three.js 架設 3D 場景
- @pixiv/three-vrm 控制角色動畫

## 專案成就 :
畢業專題發表經業界評審評分後，獲得了第一名。該系統被認為具有創新性、實用性及市場潛力。 

系統畫面 & 介紹影片 : https://youtu.be/ubc_HWpQ0n8

## 系統的操作 :
**系統分為三個頁面，分別為 Detector、Editor 以及 Player**

Detector (姿勢偵測網頁) : 剛開始會先選擇要讓 VRM 模型檔案 (虛擬角色)動的部位，以及你跟鏡頭的偵測距離。接著按下錄製，系統會告知太近或太遠來讓你站到對的位置上。之後會利用電腦鏡頭去偵測使用者動作，再計算各部位角度，對應到虛擬角色身上，來讓虛擬角色做出動作，並且也會開始錄虛擬角色每一幀各部位旋轉的角度等資訊。最後停止錄製會匯出一 JSON 檔。

Editor (動畫編輯網頁) : 會先匯入 JSON 檔，在開始播放後，可以在希望之後使用者跟著一起做的關鍵動作上，選擇部位、打上動作名稱，接著按下編輯按鈕。另外，也可以配合動作，錄製提醒的聲音，最後匯出包含聲音跟經過編輯的 JSON 檔。

Player (動作學習網頁) : 匯入經過編輯的 JSON 檔後，使用者將按下播放，會先讓學習者站到當初在 Detector 設定離鏡頭的距離上。之後，學習者需要開始跟著虛擬角色做出動作，並且會在剛剛編輯過的點上停下來，來讓使用者能夠跟上動作。另外，頁面上還會提示動作，在這個時間點也會去偵測使用者動作的準確度。最後會列出成績，可以匯出成績 PDF 檔以及匯出剛剛過程中錄製使用者畫面的 MP4 檔。
## Demo :
https://cnd290.github.io/myKLA2-project/
