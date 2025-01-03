
/**
 * 按下匯出json檔按鈕觸發
 */
async function exportFile() {

    showLoadingSpinner();

    // 檔名（包含副檔名）
    let fileName = "animation.json";

    //要先清空上一個JSON檔紀錄的voice陣列 -> 每次要匯出時 會把此檔案的音檔全部記錄進去voice陣列
    nowData.voice = [];
    
    //讓此JSON檔的soundsArr中的所有音檔轉成base64形式存進JSON檔中的voice陣列
    for (let soundNum = 0; soundNum < soundsArr.length; soundNum++) {
        //把每一筆音檔資訊推進voice陣列
        nowData.voice.push(await setNowDataVoice(soundNum))
    }


    // 檔案內容（建議用模組字串``，方便排版）
    const data = JSON.stringify(nowData); //editor 的json檔

    // 生成 Blob 物件
    let blob = new Blob([data], {
        type: "charset=UTF-8",
    });

    // 生成 Blob 的網址
    let href = URL.createObjectURL(blob);

    // 生成 html 超連結（Blob網址）標籤，放入body
    let link = document.createElement("a");
    document.body.appendChild(link);
    link.href = href;
    link.download = fileName;
    // 手動 click
    link.click();
    disappearLoadingSpinner();
    turnGreen(); //匯出檔案後會顯示綠燈

}

/**
 * 將soundsArr中的第soundNum的音檔剪輯過長部分並轉成base64形式  
 * 回傳形式為一json物件 其中包括  
 * filename(此音檔名稱) audio(此音檔base64字串) volume(此音檔音量)
 */
 function setNowDataVoice(soundNum) {
    return new Promise(async(resolve) => {
        /**
         * soundsArr[soundNum].audio.src -> 播放器中此音檔的url(路徑)  
         * 從此路徑中取出Blob檔案
         */
        let audioBlob = await fetch(soundsArr[soundNum].audio.src).then(r => r.blob());

        const specialFrameSet = new Set(specialFrame);
        const specialTimeSum = specialFrameSet.size * 3;

        //動畫最後一幀執行的時間 (實際結束時間)
        const jsonEndTime = animation[animation.length - 1].time.Time + specialTimeSum;

        //音檔長度小於等於JSON結束時間
        if (soundsArr[soundNum].audio.duration <= jsonEndTime) {
            const audioBase64 = await blobToBase64(audioBlob);

            //最後回傳此筆音檔的資料回去 (音檔名 & 音檔內容(base64) & volume(此音檔音量))
            resolve({ filename: soundsArr[soundNum].fileName, audio: audioBase64, volume: soundsArr[soundNum].volume });
        } else { //音檔長度大於JSON結束時間
            const audioBase64 = await cutBlobLength(audioBlob, jsonEndTime.toFixed(2));

            //最後回傳此筆音檔的資料回去 (音檔名 & 音檔內容(base64) & volume(此音檔音量))
            resolve({ filename: soundsArr[soundNum].fileName, audio: audioBase64, volume: soundsArr[soundNum].volume });
        }


    })
}