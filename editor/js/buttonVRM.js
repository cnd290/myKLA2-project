
//flag表格
// +----------------+------+-------+------+-----+
// | 標籤\狀態       | play | pause | stop | end |
// +================+======+=======+======+=====+
// | newBeginStatus | 0    | 0     | 1    | 1   |
// +----------------+------+-------+------+-----+
// | playStatus     | 1    | 0     | 0    | 0   |
// +----------------+------+-------+------+-----+
// | endStatus      | 0    | 0     | 0    | 1   |
// +----------------+------+-------+------+-----+

let newBeginStatus = 1;     //用來判斷是否為最一剛開始情況(時間為0)的flag
let endStatus = 0;          //用來判斷現在是否在end的情況
let stopTime;               //用來記錄現在暫停時的時間 (暫停期間)

//按下播放鍵
function execute() {
    //若沒有選擇檔案 提醒要先選擇檔案
    if (animation.length == 0) { 
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        alertContent.style.visibility = "visible";
        const confirmBtn = document.getElementById("confirmBtn");
        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => { disappearAlertPanel() };
        alertContent.innerHTML = "Please choose the right JSON file first !";
        return; //不繼續執行下面程式碼
    }

    //(pause預設是disable) 在沒有在錄製的狀況下 才能讓播放期間pause鍵可按
    if (mediaRecorder.state == "inactive") {
        document.getElementById("pause").disabled = false; 
        //錄音按鈕不給按下 且顯示錄音按鈕disable的樣子
        disableRecord();
    } else { //錄製的狀況下
        //將播放器按鈕們設定成record模式初始該有的樣式   
        setBtnsToRecordMode();
    }

    /**
     * animate()裡 在特殊標記的幀數暫停完三秒後 會進入到executeVRM() 
     * 所以不能把resumeFilesSound()寫在executeVRM() 畢竟聲音剛剛沒有暫停
     * 
     * 在曾經有播放過的情況下 讓聲音resume (暫停聲音後 按下播放要讓聲音繼續播放)
     */
    if (newBeginStatus == 0) {
        resumeFilesSound();
    }
    executeVRM();
}

/**
 * 通常播放會藉由execute()進入   
 * 遇到special暫停三秒後 會直接進到executeVRM() newBeginStatus == 0的情況 
 * -> (因為execute()裡面執行過的事項不用再執行一次)
 */
function executeVRM() {
    let bookMark = document.getElementById("bookmark");

    if (playStatus == 1) {
        //若已經在執行，則不再處理
        return;
    }

    // 為從頭開始
    if (newBeginStatus == 1) { 

        //最一開始 顯示的時間要先歸零
        document.getElementById("second").innerHTML = "00.00";
        document.getElementById("minute").innerHTML = "00";

        //剛開始播放時 若此json檔已經有錄過音或匯入音檔 且 書籤按鈕沒按下 提醒使用者
        if (soundsArr.length > 0 && bookMark.checked == false) { 

            bookMark.checked = true;
            disappearAlertPanel();
            const alertContent = document.getElementById("alertContent");
            const confirmBtn = document.getElementById("confirmBtn");

            alertContent.style.visibility = "visible";
            alertContent.innerHTML = "Your bookmark button has been checked. If you do not check the bookmark<br>button, the length of the sound and the animation may be different.";

            confirmBtn.style.display = "inline-block";
            confirmBtn.onclick = () => { disappearAlertPanel() };
        }

        //播放出所有音檔的聲音
        playFilesSound();

        frame = 0;                          //把播放幀數重置
        clock.elapsedTime = 0;              //clock時間歸零
        stopTime = 0;                       //用來記錄暫停的時間變數重置
        clock.start();                      //開始計時
        newBeginStatus = 0;                 //開始後將 newBeginStatus 改為 0

    } else if (newBeginStatus == 0) {       //若非從頭開始，從上次暫停的時間開始
        clock.start();
        clock.elapsedTime = stopTime;
        stopTime = 0;                       //將暫停的時間變數重置       
    }
    //flag 可參考上方表格
    endStatus = 0;                          
    playStatus = 1;
    animate();                              //執行vrm動畫
}


/**
 * 按下暫停鍵
 */
function pause() {

    pauseFilesSound();

    pauseVRM();
}


/**
 * 通常播放會藉由pause()進入   
 * 遇到special暫停三秒期間 會直接進到pauseVRM()
 * -> (因為暫停三秒期間不需要暫停聲音)
 * specialTime預設為null
 * specialTime為經由edit.js那記錄在JSON檔案中 部位被做標記之幀數的該時間點 為了在暫停三秒時 顯示該時間在下方
 */
function pauseVRM(specialTime = null) {

    if (specialTime != null) {
        stopTime = specialTime;       //用來記錄現在暫停時的時間 -> 執行special暫停時的時間
    } else {
        stopTime = clock.elapsedTime; //用來記錄現在暫停時的時間 -> 直接按暫停的時間
    }
    clock.stop();                     //clock停止

    calculateTime(stopTime.toFixed(2), "minute", "second"); //顯示暫停的時間在播放器下方

    //flag 可參考上方表格
    newBeginStatus = 0;
    playStatus = 0;
    endStatus = 0;
    animateDefault();                 

}

/**
 * 按下停止鍵
 */
function stop() {

    //暫停所有音檔聲音 並讓聲音時間歸零
    endFilesSound();

    clock.stop();                              //clock停止

    //若在special的暫停三秒期間按下stop 要把forward跟backward變回able
    //stop後，使用者就可以按forward/backward按鈕
    document.getElementById("forward").disabled = false;    
    document.getElementById("backward").disabled = false;   

    //在執行special的暫停三秒期間(三秒後vrm會繼續動) 若按下stop鍵後三秒後就不能再讓vrm繼續動起來 所以要clearTimeout
    if (specialTimeout != undefined) { 
        clearTimeout(specialTimeout);
    }

    positionReset();                           //進行vrm動作重置function

    frame = 0;                                 //把播放幀數重置
    clock.elapsedTime = 0;                     //clock時間歸零
    stopTime = 0;                              //用來記錄暫停的時間變數重置

    //顯示的時間也歸零
    document.getElementById("second").innerHTML = "00.00";
    document.getElementById("minute").innerHTML = "00";

    //flag 可參考上方表格
    newBeginStatus = 1;
    playStatus = 0;
    endStatus = 0;


    animateDefault();
    resetTweenData();

    //按下stop後 要等到下次按下play或者按下往後五秒按鈕之後才能再按下pause
    //沒有錄音的情況按下stop 錄製按鈕要變成能按並且顯示錄製按鈕圖示
    setBtnsToDefaultMode();
}

//動畫播放結束 (按下loop按鈕不進來)
function end() {
    clock.stop();               //clock停止
     
    endFilesSound();            //暫停所有音檔聲音 並讓聲音時間歸零      

    //flag 可參考上方表格
    newBeginStatus = 1;
    playStatus = 0;
    endStatus = 1;

    //end後 要等到下次按下play或者按下往前五秒按鈕之後才能再按下pause
    document.getElementById("pause").disabled = true;
    animateDefault();
    resetTweenData();


    //當狀況為有按下錄製按鈕=>結束時圖片會為錄製暫停按鈕圖示時 進入if
    if (document.getElementById('recordPauseImg').style.display == "block") {
        //停止錄音
        recordStop();                   
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        alertContent.style.visibility = "visible";
        const confirmBtn = document.getElementById("confirmBtn");
        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => { disappearAlertPanel() };
        alertContent.innerHTML = "You have successfully recorded the sound.<br>Remember to go to the Edit List to export the file.";
    
        turnRed();

        //將播放器按鈕們設定成default模式初始該有的樣式  
        setBtnsToDefaultMode(); 

    }

    //沒有錄音的情況end 錄製按鈕要變成能按並且顯示錄製按鈕圖示
    changeToStartImg();
    document.getElementById("record").disabled = false;

}



//按下往前五秒鍵
function forward() {

    //json檔為最一開始(時間為0)的情況下按下forward 
    if(frame == 0){ 
        return;
    }

    /**
     * tempTime為往前五秒的時間
     */
    let tempTime = clock.elapsedTime - 5;
    
    //若往前五秒的時間小於0 
    if (tempTime < 0) {
        tempTime = 0;    
        positionReset(); //讓vrm擺出最初始的姿勢
        frame = 0;
    } else {
        //在動畫播放完畢之後(end) 按下往前五秒 pause鍵要變able
        document.getElementById("pause").disabled = false; 

        /**
         * frame 在animate()下面時已經+1了 要先-1才是現在目前的frame   
         * 往回五秒-> 從還沒往回五秒時侯的那一frame 去往前找扣完五秒後的時間大於等於哪一frame的時間 
         * 去跑該frame 找到之後break
         */
        for (let i = frame - 1; i >= 0; i--) { 
            if (tempTime >= animation[i].time.Time) {
                frame = i;
                break;   //break出此for
            }
        }

        /**
         * 讓vrm可以即時擺出相對應姿勢
         * 暫停期間若按下往前五秒 要讓vrm馬上擺出該對應的姿勢
         */
        setPosition(frame); 

    }

    //聲音往前五秒 ---------------------------------------------------
    /**
     * 動畫時間跟錄音的時間會不同步  
     * special暫停三秒期間 只有動畫時間暫停 錄音時間沒有暫停  
     * 所以 錄音時間會等於 目前經過的specialFrame數量*3秒 加上 動畫的時間
     */
    let countSpecialFrame = 0;

    //找出目前經過的specialFrame數量
    for (let j = 0; j < frame; j++) {
        if (specialFrame.includes(j)) {
            countSpecialFrame += 1;
        }
    }

    //往前五秒的聲音播放設定
    setSoundFilesTime(tempTime + countSpecialFrame * 3);

    //---------------------------------------------------------------

    clock.elapsedTime = tempTime;                   //讓現在clock時間變成五秒前的時間

    if (playStatus == 0 && newBeginStatus == 0) {   //暫停期間按forward的時候
        stopTime = clock.elapsedTime;               //用來記錄現在暫停時的時間 
        animateDefault();
    }
    const time = clock.elapsedTime;
    calculateTime(time.toFixed(2), "minute", "second"); //顯示往回五秒前的時間


    if (endStatus == 1) { //動畫完全播完的時候(end) 按forward json會回去繼續播放 跑animate

        //為了要讓他可以跑進animate() 調整flag狀態
        playStatus = 1; 
        endStatus = 0;
        newBeginStatus = 0;

        //clock開始計時 才能不斷判斷現在時間是否大於等於一幀一幀的紀錄時間 進而讓vrm呈現該幀動作
        //開始計時後 讓clock現在時間為往前五秒前的時間
        clock.start(); 
        clock.elapsedTime = tempTime;

        // const deltaTime = clock.getDelta();
        // allVrms[0].update(deltaTime);

        animate();
    }
}

//按下往後五秒鍵
function backward() {
    //若沒有選擇任何檔案的情況 (主要是為了在檔案一剛開始還沒播放 忘記按下檔案時 按往後五秒可以做出提醒)
    if (animation.length == 0) { 
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        alertContent.style.visibility = "visible";
        const confirmBtn = document.getElementById("confirmBtn");
        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => { disappearAlertPanel() };
        alertContent.innerHTML = "Please choose the right JSON file first !";
        return; //不繼續執行下面程式碼
    }

    let bookMark = document.getElementById("bookmark");

    /**
     * tempTime為往後五秒的時間
     */
    let tempTime = clock.elapsedTime + 5;

    //若往後五秒時間超過json檔中最後一幀紀錄的執行時間
    if (tempTime > animation[animation.length - 1].time.Time) {
        tempTime = animation[animation.length - 1].time.Time;
        frame = animation.length - 1;
    } else {
        //在動畫還未播放時 按下往後五秒 pause鍵要變able
        document.getElementById("pause").disabled = false; 

        /**
         * frame 在animate()判斷下面時已經+1了 要先-1才是現在目前的frame   
         * 往後五秒-> 從還沒往後五秒時侯的那一frame 去往後找加完五秒後的時間小於哪一frame的時間 
         * 去跑該frame的前一個frame(所以frame還要再-1) 找到之後break
         */
        for (let i = frame - 1; i <= animation.length - 1; i++) { 

            /**
             * 讓json檔剛拖進(frame=0) 還沒按play時 按backward可以成功讓他跑起來
             * 讓他繼續進行下一輪迴圈(continue) 因為若跑進下面的if i為-1會出錯 會找不到此筆資料
             */
            if (i == -1) { 
                //若JSON檔包含音檔 使用者沒有按下書籤按鈕的情況
                if(bookMark.checked == false){ 
                    bookMark.checked = true;
                    disappearAlertPanel();
                    const alertContent = document.getElementById("alertContent");
                    const confirmBtn = document.getElementById("confirmBtn");

                    alertContent.style.visibility = "visible";
                    alertContent.innerHTML = "Your bookmark button has been checked. If you do not check the bookmark<br>button, the length of the sound and the animation may be different.";

                    confirmBtn.style.display = "inline-block";
                    confirmBtn.onclick = () => { disappearAlertPanel()};
                }
                continue;
            }
            if (tempTime <= animation[i].time.Time) {
                frame = i - 1;
                break;
            }
        }
    }

    /**
     * 讓vrm可以即時擺出相對應姿勢
     * 暫停期間若按下往後五秒 要讓vrm馬上擺出該對應的姿勢
     */
    setPosition(frame); 

    //聲音往後五秒 ---------------------------------------------------
    /**
     * 動畫時間跟錄音的時間會不同步  
     * special暫停三秒期間 只有動畫時間暫停 錄音時間沒有暫停  
     * 所以 錄音時間會等於 目前經過的specialFrame數量*3秒 加上 動畫的時間
     */
    let countSpecialFrame = 0;

    //找出目前經過的specialFrame數量
    for(let j = 0; j < frame; j++){
        if(specialFrame.includes(j)){
            countSpecialFrame += 1;
        }
    }

    //往前五秒的聲音播放設定
    setSoundFilesTime(tempTime + countSpecialFrame * 3);

    //---------------------------------------------------------------

    clock.elapsedTime = tempTime;                  //讓現在clock時間變成五秒後的時間
    if (playStatus == 0 && newBeginStatus == 0) {  //暫停期間按backward的時候
        stopTime = clock.elapsedTime;              //用來記錄現在暫停時的時間 
    }
    const time = clock.elapsedTime;
    calculateTime(time.toFixed(2), "minute", "second"); //顯示往後五秒前的時間

    //按stop按鈕完按backward的情況 跟最一剛開始檔案匯入完的情況
    if (newBeginStatus == 1 && playStatus == 0 && endStatus == 0) { 

        //為了要讓他可以跑進animate() 調整flag狀態
        playStatus = 1; 
        newBeginStatus = 0;

        //clock開始計時 才能不斷判斷現在時間是否大於等於一幀一幀的紀錄時間 進而讓vrm呈現該幀動作
        //開始計時後 讓clock現在時間為第五秒
        clock.start(); 
        clock.elapsedTime = 5;

        // const deltaTime = clock.getDelta();
        // allVrms[0].update(deltaTime);

        animate();
    }

}






