/**
 * 存音檔blob的陣列
 */
let audioChunks = [];

/**
 * 錄音器
 */
let mediaRecorder;

//檢查鏡頭與錄音設備是否支援
if (navigator.mediaDevices) {
    console.log('getUserMedia supported.');
} else {
    console.log('getUserMedia not supported on your browser!');
}

//設定要錄製成audio(錄音檔，只有聲音沒有影像)
let constraints = {
    audio: true
}

/**
 * 增益節點，也就是控制音量的地方
 */
let gainNode;

/**
 * 錄音檔編號
 */
let recordCnt = 1;

//錄製設定
navigator.mediaDevices.getUserMedia(constraints)
    .then(

        function(stream) { //stream -> 錄製到的聲音串流
            //建立API容器
            const AudioContext = window.AudioContext || window.webkitAudioContext; // 跨瀏覽器
            const ctx = new AudioContext(); // 建立 Web Audio Api 的容器 //用以建立音訊處理Node

            /*
                音訊處理Node(如:振盪器、控制音量的增益節點)
                **需透過新的MediaStream(串流音源)才能立即改變MediaStream的音量**
                =>(convert a MediaStream to another MediaStream)
                (1)建立音源Node
                (2)建立增益節點，也就是控制音量的地方
                (3)建立音源儲存位置Node
            */
            const source = ctx.createMediaStreamSource(stream); //透過stream建立一個新audio來源
            gainNode = ctx.createGain(); //增益節點，也就是控制音量的地方
            const dest = ctx.createMediaStreamDestination(); //建立一個新的MediaStream儲存位置給新音源

            //將音訊處理Node彼此串起(有點像是加上彼此功能)
            source.connect(gainNode); //音源串連增益節點(音量調整)
            gainNode.connect(dest); //再串上儲存位置(將有音量調整功能的音訊串流存放)
            gainNode.gain.value = 0; //音量預設為0

            //mediaRecorder是建一個mediaRecorder物件來錄製我們放在儲存位置的音源
            mediaRecorder = new MediaRecorder(dest.stream);

            //當 mediaRecorder start
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data); //audioChunks裡面為blob
            });

            //當 mediaRecorder stop (當停止錄音時 播放end的時候)
            mediaRecorder.addEventListener("stop", () => {
                    //錄完音的音檔一個一個紀錄在該JSON file的soundsArr裡面 並且顯示每一筆錄音資料在soundList上
                    addSoundListItem("recordFile" + recordCnt + ".mp3", audioChunks[0], 1);
                    recordCnt += 1;
                    //清空上一個存音檔blob的陣列
                    audioChunks = [];
                    if(interruptFlag==1){
                        get_data(nextBId);
                        interruptFlag = 0;
                    }
            });


            //在全局變量中放入音源和儲存位置兩變數
            //避免將音頻丟失在garbage collection中。
            //garbage collection：
            //  *這個演算法將原本「這個物件再也不會被使用」的廣泛定義縮減到「沒有其他任何物件參考它」
            //  *JS的garbage collection是以「沒有其他任何物件參考它」，可能就會被瀏覽器視為垃圾。
            window.leakMyAudioNodes = [source, dest];



        },
        err => console.error(err)
    )


const record = document.getElementById('record'); //錄製音檔按鈕
record.onclick = () => {
    const recordStartImg = document.getElementById('recordStartImg');
    //若沒有選擇檔案 提醒要先選擇檔案
    if (animation.length == 0) {
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        const confirmBtn = document.getElementById("confirmBtn");

        alertContent.style.visibility = "visible";
        alertContent.innerHTML = "You haven't selected JSON file, so you can't record it yet.";

        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => { disappearAlertPanel() };
        return; //不繼續執行下面程式碼
    }

    if (recordStartImg.style.display == "block") { //當顯示錄製按鈕時
        changeToPauseImg();
        recordVoice();
        //execute需放在recordVoice後執行
        //因為execute裡面會依照mediaRecorder的state進行播放器按鈕設定
        execute();
    } else { //當顯示暫停按紐時
        changeToStartImg();
        recordPause();
        pause();
    }
}


//有聲錄音
function unmuteRecord() {
    gainNode.gain.value = 1; //音量預設為1
}

//無聲錄音
function muteRecord() {
    gainNode.gain.value = 0; //音量預設為0
}

/**
 * 當record按鈕Disable的時候顯示的樣式  
 * 使用時機:  
 * 1)special frame的時候  
 * 2)沒有record的execute情況
 */
function disableRecord() {
    const recordStartImg = document.getElementById('recordStartImg');
    const recordDisableImg = document.getElementById('recordDisableImg');
    const recordPauseImg = document.getElementById('recordPauseImg');

    recordStartImg.style.display = "none";
    recordPauseImg.style.display = "none";
    recordDisableImg.style.display = "block";

    document.getElementById("record").disabled = true;

}



/**
 * 錄音按鈕圖示切換至start    
 * [start]為該按鈕的初始樣式    
 * 使用時機:    
 * 1)按下[pause] -> [start]    
 * 2)當播放完畢後還原初始樣式    
 */
function changeToStartImg() {
    const recordStartImg = document.getElementById('recordStartImg');
    const recordDisableImg = document.getElementById('recordDisableImg');
    const recordPauseImg = document.getElementById('recordPauseImg');
    recordStartImg.style.display = "block";
    recordDisableImg.style.display = "none";
    recordPauseImg.style.display = "none";
}


/**
 * 錄音按鈕圖示切換至pause   
 * 使用時機:  
 * 1)按下[start] -> [pause]  
 * 2)當正在錄音時，按鈕顯示的樣式
 */
function changeToPauseImg() {
    const recordStartImg = document.getElementById('recordStartImg');
    const recordDisableImg = document.getElementById('recordDisableImg');
    const recordPauseImg = document.getElementById('recordPauseImg');
    recordStartImg.style.display = "none";
    recordDisableImg.style.display = "none";
    recordPauseImg.style.display = "block";
}

/**
 * 將播放器按鈕們設定成record模式初始該有的樣式    
 * 使用時機:按下錄製按鈕後剛開始record時=>record狀態的初始樣式 
 */
function setBtnsToRecordMode() {
    changeToPauseImg();

    document.getElementById("play").disabled = true;
    document.getElementById("pause").disabled = true;
    document.getElementById("forward").disabled = true;
    document.getElementById("backward").disabled = true;
    document.getElementById('stop').disabled = true;

    document.getElementById('bookmark').checked = true;
    document.getElementById('bookmark').disabled = true;

    document.getElementById("loopBtn").disabled = true;
    document.getElementById("loopBtn").checked = false;
    document.getElementById("imgLoop").style.display = "none";
    document.getElementById("imgNoLoop").style.display = "inline-block";
}

/**
 * 將播放器按鈕們設定成default模式初始該有的樣式  
 * 使用時機:當播放器結束播放時，切換成預設模式
 */
function setBtnsToDefaultMode() {
    changeToStartImg();
    document.getElementById("record").disabled = false;

    document.getElementById("play").disabled = false;
    document.getElementById("pause").disabled = true;
    document.getElementById("forward").disabled = false;
    document.getElementById("backward").disabled = false;
    document.getElementById('stop').disabled = false;

    document.getElementById('bookmark').checked = false;
    document.getElementById('bookmark').disabled = false;

    document.getElementById("loopBtn").disabled = false;
    document.getElementById("imgLoop").style.display = "inline-block";
    document.getElementById("imgNoLoop").style.display = "none";

}



/**
 * 錄製音檔
 */
function recordVoice() {
    const state = mediaRecorder.state; //影音的錄製狀態
    if (state == "paused") {
        mediaRecorder.resume(); //影音錄製繼續
    } else if (state == "inactive") { //還未開始錄製情況
        // media
        mediaRecorder.start();

    }
}

/**
 * 暫停錄音
 */
function recordPause() {
    mediaRecorder.pause();
}

//停止錄音
function recordStop() {
    mediaRecorder.stop();
}

let btnVoice = document.getElementById("voice"); //麥克風按鈕


btnVoice.onclick = function() { //麥克風按鈕
    if (this.checked) {
        //切換麥克風圖示
        document.getElementById("microOn").style.display = "block";
        document.getElementById("microOff").style.display = "none";

        //開始有聲錄音(按下錄製鍵時)
        unmuteRecord();

    } else {
        //切換麥克風圖示
        document.getElementById("microOff").style.display = "block";
        document.getElementById("microOn").style.display = "none";

        //變成無聲錄音(按下錄音暫停鍵時)
        muteRecord();
    }
};