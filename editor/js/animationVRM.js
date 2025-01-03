
//關於JSON檔案的各種運作 ----------------------------------------

let clock = new THREE.Clock();  //建立Three的clock 用於播放JSON檔

let frame = 0;                  //JSON檔從第0幀開始進行

let playStatus = 0;             //用來判斷現在是否為執行檔案的時候

animateDefault();               //剛開始檔案還未播放 要先呼叫animateDefault()

/**
 * 讓vrm本身更新動作並且渲染在畫面上 (更新畫面)
 */
function animateDefault() {
    if (playStatus == 0) {      //不是在播放檔案中
        /**
         * 假如vrm已經載在畫面了 在animateDefault也要讓vrm本身更新動作 
         * 譬如在暫停期間按往後五秒 vrm動作也要更新並且渲染在畫面上
         */
        if (allVrms[0]) {       
            const deltaTime = clock.getDelta();
            allVrms[0].update(deltaTime);

        }
        requestAnimationFrame(animateDefault); //不斷跑遞迴
        renderer.render(scene, camera);        //渲染在畫面上 (更新畫面)
    }

}

let specialTimeout;      //special暫停三秒的計時器

/**
 * true : 正在special的三秒中 其他狀況為false  
 * 每執行一個frame時會先變成false，執行過special會變成true    
 * 目的：那個frame如果有special ，且正在pause三秒(specialFlag已經為true)的話  
 * 就不要再進到if裡面 不讓setTimeout重複進行
 */
let specialFlag = false; 

/**
 * 執行vrm動畫
 */
function animate() {

    /**
     * 在按下pause stop 或end等等情況時 不會再繼續跑遞迴 不會再繼續執行animate()  
     * 因為剛剛execute進入animate()後 會不斷的跑animate() (因為遞迴)  
     * 若在又重新跑animate()的途中遇到此判斷就會return掉 不再跑animate()
     */
    if (playStatus == 0) { 
        return;
    }

    //現在clock計時到的時間
    let nowTime = clock.elapsedTime; 
    //若此時間>=JSON檔案紀錄的最後一幀之當下播放時間時 讓現在時間等於最後一幀的時間 (toFixed為四捨五入到指定小數位數
    if (nowTime >= animation[animation.length - 1].time.Time.toFixed(2)) { 
        nowTime = animation[animation.length - 1].time.Time;
    }
    //顯示時間在播放器下方
    calculateTime(nowTime.toFixed(2), "minute", "second"); 

    //.getDelta ()方法的功能就是獲得前後两次執行該方法的時間間隔
    const deltaTime = clock.getDelta(); 

    //execute (播放)情況
    if (playStatus == 1) { 

        //執行幀數從0~JSON檔長度-1
        if (frame < animation.length) { 
            const frameTime = animation[frame].time.Time; //在JSON檔紀錄的此幀播放時間
            if (nowTime >= frameTime) {     //若現在時間大於等於JSON檔裡此幀紀錄的進行時間時 
                everyNode(frame);           //進everyNode()裡 虛擬人物利用該幀紀錄資料擺出相對應的動作 
                specialFlag = false;        //代表此幀還未執行過暫停三秒 
                frame += 1;                 //幀數+1
            }
            if (frame != 0) {               //若frame為0 到下面frame-1時會有錯誤
                //書籤按鈕
                const bookmark = document.getElementById("bookmark");

                /**
                 * 上面幀數+1 所以這裡要-1去做判斷  
                 * 若有按下書籤按紐 此幀數某部位有包含特殊標記 且此幀還未執行過暫停三秒  
                 * 有部位被做特殊標記的幀數 在播放時須暫停三秒   
                 * 一JSON載入時會跑uploadEditData() function裡面會有一陣列specialFrame來去記錄有部位做特殊標記的幀數
                 */
                if (specialFrame.includes(frame - 1) && bookmark.checked && specialFlag == false) {
                    //經由edit.js那記錄在JSON檔案中 部位被做標記之幀數的該時間點 為了在暫停三秒時 顯示該時間在下方
                    const specialTime = animation[frame - 1].editorTime; 

                    pauseVRM(specialTime);                                 //虛擬人物動作暫停 錄音不暫停

                    /**
                     * 在specialFrame的時候 不得按下暫停錄製  
                     * -> 錄音按鈕不給按下 且顯示錄音按鈕disable的樣子
                     */
                    disableRecord();                             

                    document.getElementById("pause").disabled = true;      //使用者不得在執行暫停三秒時按暫停按鈕
                    document.getElementById("forward").disabled = true;    //使用者不得在執行暫停三秒時按往前五秒按鈕                
                    document.getElementById("backward").disabled = true;   //使用者不得在執行暫停三秒時按往後五秒按鈕  
                    specialFlag = true;                                    //記錄此幀已執行過暫停三秒

                    specialTimeout = setTimeout(() => {
                        //若在錄音期間
                        if (mediaRecorder.state == "recording") {
                            changeToPauseImg();                                     //顯示錄音暫停按鈕圖示(正在錄音中)
                            document.getElementById("record").disabled = false;     //讓按鈕可以按
                        } else { //三秒後 不在錄音期間才可以按暫停、往前、往後
                            document.getElementById("pause").disabled = false;      //三秒後，使用者就可以按暫停按鈕
                            document.getElementById("forward").disabled = false;    //三秒後，使用者就可以按往前五秒按鈕
                            document.getElementById("backward").disabled = false;   //三秒後，使用者就可以按往後五秒按鈕
                        }

                        /**
                         * 三秒後 經由executeVRM()會再進入animate() 虛擬人物繼續執行動作  
                         * (錄音在暫停三秒期間不會有暫停情況 所以只有虛擬人物動作在三秒後要繼續執行的情況)
                         */
                        executeVRM(); 
                    }, 3000)
                }
            }
        }

        //JSON檔所有幀數跑完後
        if (frame >= animation.length) { 
            let loopBtn = document.getElementById("loopBtn");
            if (loopBtn.checked) {                                      //假如循環按鈕有按下去
                frame = 0;                                              //frame歸零 重頭播放

                /**
                 * 時間歸零 顯示的時間也歸零
                 * 若依舊不斷播放 此時的newBeginStatus:0 playStatus:1 endStatus:0 stopTime:0
                 */
                document.getElementById("second").innerHTML = "00.00";  
                document.getElementById("minute").innerHTML = "00";     
                clock.elapsedTime = 0;
   
                endFilesSound();            //要進入第二輪的時候 聲音播放的時間要先歸零
                playFilesSound();           //開始播放第二輪聲音
            } else if (!loopBtn.checked) {  //若沒有按循環播放按鈕 就結束播放 停在最後一幀
                end();
            }

        }
    }
    
    /**
     * 藉由animate()不斷遞迴 clock(時間)不斷跑 
     * 會一直去判斷現在時間是否大於等於JSON檔裡此幀(幀數會不斷+1)紀錄的時間 
     * 再去讓VRM利用該幀資料去擺放出動作
     */
    requestAnimationFrame(animate); //javascript內建函式
    TWEEN.update();                 //TWEEN補間動畫更新
    allVrms[0].update(deltaTime)    //讓vrm本身更新動作 
    renderer.render(scene, camera); //渲染在畫面上
}


//顯示給使用者看的時間 預設為00:00.00 分數位為00 秒數位為00.00
function calculateTime(time, min, sec) {    //用於把時間轉換後呈現在播放區下方給使用者看
    if (Math.floor(time) >= 60) {           //時間到分鐘(>=60秒) Math.floor() -> 小於等於所給數字的最大整數
        if ((Math.floor(time)) / 60 < 10) { //時間小於10分 分數位前面要顯示一個0
            document.getElementById(min).innerHTML = "0" + Math.floor(time / 60);      //分數位呈現出 0x : 這種形式
            if (Math.floor(time) % 60 < 10) {
                document.getElementById(sec).innerHTML = "0" + (time % 60).toFixed(2); //秒數位呈現出 : 0x.xx這種形式
            } else {
                document.getElementById(sec).innerHTML = (time % 60).toFixed(2);       //秒數位呈現出 : xx.xx這種形式
            }
        } else {
            document.getElementById(min).innerHTML = Math.floor(time / 60);            //分數位呈現出 xx : 這種形式
            if (Math.floor(time) % 60 < 10) {
                document.getElementById(sec).innerHTML = "0" + (time % 60).toFixed(2); //秒數位呈現出 : 0x.xx這種形式
            } else {
                document.getElementById(sec).innerHTML = (time % 60).toFixed(2);       //秒數位呈現出 : xx.xx這種形式
            }
        }
    } else { //只有到秒
        document.getElementById(min).innerHTML = "00";           //分數位呈現出 00 : 這種形式
        if (Math.floor(time) < 10) {                             //時間小於10秒 秒數位前面要顯示一個0
            document.getElementById(sec).innerHTML = "0" + time; //呈現出 : 0x.xx這種形式
        } else {
            document.getElementById(sec).innerHTML = time;       //呈現出 : xx.xx這種形式
        }
    }
}















