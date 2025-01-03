/**
 * 影片錄製畫面
 */
let recordVideoStream;

/**
 * 影片錄製器
 */
let mediaRecorder;

/**
 * 下載連結
 */
let videoDownloadLink;

/**
 * 儲存影片檔Blob資料的陣列
 */
let audioChunks = [];

/**
 * 設置影片錄製器mediaRecorder
 */
function setMediaRecorder() {

    //建立影片錄製器(放入影片錄製畫面)
    mediaRecorder = new MediaRecorder(recordVideoStream);

    //當 mediaRecorder start
    mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data); //將 畫面來源 的 data畫面 推入 audioChunks
    });

    //當 mediaRecorder stop (播放end或是按stop的時候)
    mediaRecorder.addEventListener("stop", () => {

        videoDownloadLink = document.createElement("a"); //建立下載連結 (videoDownloadLink)
        videoDownloadLink.href = URL.createObjectURL(audioChunks[0]); //建立影片連結
        videoDownloadLink.download = "audio.mp4"; //影片下載預設檔名

        audioChunks = []; //清空影片檔Blob資料
    });
}

/**
 * 開始錄影 (使用者畫面)
 */
function startVideoRecord() {
    if (mediaRecorder != undefined) {
        mediaRecorder.start();
    }
}

/**
 * 停止錄影 (使用者畫面)
 */
function stopVideoRecord() {
    if (mediaRecorder != undefined) {
        if (mediaRecorder.state != "inactive") {
            mediaRecorder.stop();
        }
    }
}

/**
 * 暫停錄影 (使用者畫面)
 */
function pauseVideoRecord() {
    if (mediaRecorder != undefined) {
        if (mediaRecorder.state != "inactive") {
            mediaRecorder.pause();
        }
    }

}


/**
 * 繼續錄影 (使用者畫面)
 */
function resumeVideoRecord() {
    if (mediaRecorder != undefined) {
        if (mediaRecorder.state != "inactive") {
            mediaRecorder.resume();
        }
    }
}

/**
 * 匯出(使用者畫面)影片
 */
function exportVideo() {
    videoDownloadLink.click(); //點擊下載連結
}