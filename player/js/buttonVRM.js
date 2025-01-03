
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

//按下播放鍵先進入此function
function clickExecute() {

    document.getElementById("start").disabled = true; //不讓使用者在偵測距離期間 一直不斷按下播放按紐 會壞掉(?)
    document.getElementById("pause").disabled = true; //讓偵測使用者距離期間還不能按pause 等開始跑vrm 進到animate()時 才能按pause

    if (playStatus == 1) {
        // 若已經在執行，則不再處理
        return;
    }

    if (animation.length == 0) { //若沒有選擇任何json檔案
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        alertContent.style.visibility = "visible";
        const confirmBtn = document.getElementById("confirmBtn");
        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => { disappearAlertPanel() };
        alertContent.innerHTML = "Please choose the right JSON file first.";
        return;
    }

    //mediapipeDetector.js那就需要用到這些判斷播放等等狀態的flag了 所以一點下撥放按鈕 就需要改變flag
    endStatus = 0; 
    playStatus = 1;
    stopWarning();
    userZFlag = 3;
}


/**
 * 會藉由clickExecute()進入 或是      
 * 遇到special暫停三秒後 會直接進到executeVRM() newBeginStatus == 0的情況  
 */
function execute() {
    
    //若從specialFrame暫停三秒後會進execute() 這邊也需要改一下狀態flag情況 
    //因為譬如 -> 剛剛暫停三秒期間 playStatus = 0 但現在狀態改變了
    endStatus = 0; 
    playStatus = 1;
    stopWarning();

    //為從頭開始
    if (newBeginStatus == 1) {

        //若json檔中包括音檔 就播放聲音
        if (voiceData.length != 0) {
            playSound();
        }

        frame = 0;                  //把播放幀數重置
        clock.elapsedTime = 0;      //clock時間歸零
        stopTime = 0;               //用來記錄暫停的時間變數重置
        clock.start();              //開始計時
        newBeginStatus = 0;         //開始後將 newBeginStatus 改為 0

        startVideoRecord();
    } else if (newBeginStatus == 0) { // 若非從頭開始，從上次暫停的時間開始

        //若json檔中包括音檔 就繼續播放聲音
        if (voiceData.length != 0) {
            resumeSound();
        }

        clock.start();
        clock.elapsedTime = stopTime;
        //將暫停的時間變數重置
        stopTime = 0;

        resumeVideoRecord()
    }

    animate();   //執行vrm動畫

}

/**
 * 按下暫停鍵
 */
function pause() {
    //按下暫停按鈕後 就可以按播放按鈕了
    document.getElementById("start").disabled = false;

    //變回初始狀態
    userZFlag = 0;
    //flaggg預設為0 所以按pause之後 要先重設
    flaggg = 0; 

    //若json檔中包括音檔 就暫停聲音
    if (voiceData.length != 0) {
        pauseSound();
    }

    //直接按暫停的時間
    stopTime = clock.elapsedTime; 
    clock.stop();   //clock停止
    //顯示暫停的時間在播放器下方
    calculateTime(stopTime.toFixed(2), "minute", "second");

    //flag 可參考上方表格
    newBeginStatus = 0;
    playStatus = 0;
    endStatus = 0;

    animateDefault();
    pauseVideoRecord();
}

/**  
 * 遇到special暫停三秒期間 會直接進到pauseVRM()
 * -> (因為暫停三秒期間不需要暫停聲音或是暫停錄製使用者畫面)
 * specialTime預設為null
 * specialTime為記錄在JSON檔案中 部位被做標記之幀數的該時間點 為了在暫停三秒時 顯示該時間在下方
 */
function pauseVRM(specialTime = null) {

    //若沒有選擇檔案 不繼續執行下面的程式碼
    if (animation.length == 0) {
        return;
    }
    if (specialTime != null) {
        stopTime = specialTime;       //用來記錄現在暫停時的時間 -> 執行special暫停時的時間
    } else {
        stopTime = clock.elapsedTime; //用來記錄現在暫停時的時間 -> 直接按暫停的時間
    }
    clock.stop();                     //clock停止

    //顯示暫停的時間在播放器下方
    calculateTime(stopTime.toFixed(2), "minute", "second");

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
    if (recordTimer != undefined) {
        clearInterval(recordTimer); //停止倒數三秒後開始播放動畫的倒數器
        defaultAnimation();
    }

    defaultLoading();


    //播放按鈕可以按 暫停按鈕不能按
    document.getElementById("start").disabled = false;
    document.getElementById("pause").disabled = true;

    //變回初始狀態
    userZFlag = 0;
    flaggg = 0; //flaggg預設為0 所以按stop之後 要先重設

    //若json檔中包括音檔 就停止聲音
    if (voiceData.length != 0) {
        stopSound();
    }

    //clock停止
    clock.stop();

    //在執行special的暫停三秒期間(三秒後vrm會繼續動) 若按下stop鍵後三秒後就不能再讓vrm繼續動起來 所以要clearTimeout
    if (specialTimeout != undefined) {
        clearTimeout(specialTimeout); //如果setTimeout還未被執行，可以使用clearTimeout()來阻止它
        stopCountDown(); 
        defaultAnimation();
    }

    document.getElementById("num").innerHTML = ""; //321的字在按stop時清空掉
    allScoreList = [];

    //清空所有動作名稱相對應的editJson中的arr 
    //-> (arr為用來存現在specialFrame進行的時間 被做標記的部位名稱 使用者此部位的分數 的陣列)
    //arr裡面記的資料需要清空
    for (let seqArr = 0; seqArr < sequence.length; seqArr++) { 
        let actionName = sequence[seqArr];
        editJson[actionName].arr = [];
    }

    positionReset();

    frame = 0;               //把播放幀數重置
    clock.elapsedTime = 0;   //clock時間歸零
    stopTime = 0;            //用來記錄暫停的時間變數重置

    //顯示的時間也歸零
    document.getElementById("second").innerHTML = "00.00";
    document.getElementById("minute").innerHTML = "00";

    //flag 可參考上方表格
    newBeginStatus = 1;
    playStatus = 0;
    endStatus = 0;
    animateDefault();
    resetTweenData();
    stopVideoRecord();
}

/**
 * JSON檔所有幀數跑完後會執行
 */
function end() {
    //播放按鈕可以按 暫停按鈕不能按
    document.getElementById("start").disabled = false;
    document.getElementById("pause").disabled = true;

    clock.stop();
    stopSound();

    //flag 可參考上方表格
    newBeginStatus = 1;
    playStatus = 0;
    endStatus = 1;


    animateDefault();
    resetTweenData();

    //播完後 讓scoreList顯示出來
    document.getElementById("scoreList").style.display = "block";
    countTimes(); //最後評分標語次數

    stopVideoRecord();
}