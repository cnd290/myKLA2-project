/**
 * 儲存聲音播放器的陣列   
 * 初始值為一空陣列[]  
 * 陣列內容格式:[Audio,Audio...]  
 * 
 * 若Audio播放器在暫停/停止狀態 : soundsArr[i].paused為false  
 * 若Audio播放器在播放狀態 : soundsArr[i].paused為true  
 */
let soundsArr = [];

/**
 * 停止所有soundsArr中的Audio播放器
 */
function stopSound() {
    for (const sound of soundsArr) {
        sound.pause(); //暫停播放器
        sound.currentTime = 0; //播放器時間歸零
    }
}

/**
 * 播放所有soundsArr中的Audio播放器
 */
function playSound() {
    for (const sound of soundsArr) {
        sound.play(); //播放播放器
    }
}

/**
 * 暫停所有soundsArr中的Audio播放器
 */
function pauseSound() {
    for (const sound of soundsArr) {
        sound.pause();
    }
}

/**
 * 恢復resume所有soundsArr中的Audio播放器
 */
function resumeSound() {
    for (const sound of soundsArr) {

        //若音檔還未播完 則繼續play
        if (sound.currentTime > 0 && sound.currentTime < sound.duration) {
            sound.play();
        }

    }
}

/**
 * 取得音檔 並 匯入聲音播放器陣列soundsArr  
 * @param {*} voiceResult JSON檔結果的"voice"音檔資料陣列  
 * voiceResult格式:[  
 *          {fileName:音檔A檔名, audio:音檔A聲音資料, volume:音檔A音量},  
 *          {fileName:音檔B檔名, audio:音檔B聲音資料, volume:音檔B音量},...  
 * ] 
 */
function getSoundFile(voiceResult) {

    soundsArr = []; //換到下一個JSON檔的時候 要把上個JSON檔紀錄的Audio播放器先清掉

    //針對voiceResult中的每個音檔資料(Base64)建播放器,並將播放器推入soundsArr
    for (let voiceNum = 0; voiceNum < voiceResult.length; voiceNum++) {

        let audioBlob = base64ToBlob(voiceResult[voiceNum].audio); //將音檔聲音資料從Base64形式轉成blob

        const url = URL.createObjectURL(audioBlob); //建立Blob音檔(audioBlob)的儲存位址

        /*
            new Audio(url): Audio:音檔播放器 (url:Blob音檔儲存位址)
            The Audio() constructor creates and returns a new HTMLAudioElement, 
            a new HTMLAudioElement object, configured to be used for 
            playing back the audio from the file specified by url.
        */
        const soundAudio = new Audio(url); //建立Blob音檔播放器
        soundAudio.volume = voiceResult[voiceNum].volume; //將播放器音量調整至該音檔在JSON設定的音量

        soundsArr.push(soundAudio); //將Blob音檔播放器加入soundsArr
    }
}

/**
 * 將聲音資料Base64字串轉為Blob音檔
 * @param {*} base64String 聲音資料Base64字串
 * @returns Blob音檔
 */
let base64ToBlob = function(base64String) {

    //將Base64轉為ArrayBuffer
    const arrBuffer = base64ToArrayBuffer(base64String);

    //由 arrBuffer 建立 Blob音檔
    return new Blob([arrBuffer], {
        type: "audio/mpeg "
    });
};

/**
 * 將聲音資料Base64字串轉為ArrayBuffer
 * @param {*} base64String 
 * @returns 儲存聲音資料ArrayBuffer
 */
let base64ToArrayBuffer = function(base64String) {

    //由Base64字串 =(解碼)=> 音檔Binary字串
    let binary = window.atob(base64String);

    //建立一個儲放Uint8Array的ArrayBuffer (且此Buffer長度為 音檔Binary字串長度)
    let buffer = new ArrayBuffer(binary.length);
    let bytes = new Uint8Array(buffer); //8位元(非負)整數型Array (0-255)

    //將音檔Binary字串存入Uint8Array 
    //(Uint8Array在ArrayBuffer中，所以音檔Binary字串亦會被放入ArrayBuffer)
    for (let i = 0; i < buffer.byteLength; i++) {
        bytes[i] = binary.charCodeAt(i) & 0xFF; //& 0xFF : 能去掉正負號
    }

    return buffer;
};