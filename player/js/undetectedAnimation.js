/** 顯示未偵測動畫 */
function undetectedAnimation() {
    //顯示warning標誌
    const warning = document.getElementById('warning');
    warning.style.visibility = "visible";

    //右上方框格顯示"User NOT Detected"
    /** 右方的上框格 */
    const number = document.getElementById('actionNameText');
    number.className = "undetectedText";
    number.style.fontSize = "30px";
    number.innerHTML = "User <br> NOT Detected";
}

/** 顯示偵測動畫  
 * 【說明】顯示偵測動畫與操作提示
 */
function detectedAnimation() {

    //顯示預設動畫(Go)
    defaultAnimation();

    /*由於未偵測到使用者時
      >>> 已將warning標誌顯示以提醒使用者undetected
      
      因此若有偵測到時
      (1)有匯入JSON
      >>> 將warning的提示字:提醒使用者要自行按下execute
      (2)未匯入任何JSON
      >>> 停止顯示warning標誌
    */
    const warning = document.getElementById('warning');
    if (animation.length > 0) {
        warning.title = "Please play the JSON file."
    } else {
        stopWarning();
    }
}

/** 停止顯示警告標誌   
 * 【說明】 隱藏警告標誌並清空其提示字
 */
function stopWarning() {
    const warning = document.getElementById('warning');
    warning.style.visibility = "hidden";
    warning.title = "";
}