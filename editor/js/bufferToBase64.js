/**
 * 要把該blob超出動畫時間的部分切掉
 */
function cutBlobLength(blob, endTime) {
    return new Promise(async(resolve) => {
        //先把blob轉成arrayBuffer
        const arrayBuffer = await blobToArrayBuffer(blob);
        //再把arrayBuffer轉成audioBuffer
        const audioBuffer = await arrayBufferToAudioBuffer(arrayBuffer);

        //要為audioBuffer形式 才能裁減
        const [newBuf, frameCount] = cutAudioBuffer(audioBuffer, endTime);

        //剪完之後 要再轉成base64形式 最後回傳回去
        const base64String = audioBufferToBase64(newBuf, frameCount);
        resolve(base64String);
    })
}

/**
 * 把blob形式轉成arrayBuffer形式
 */
function blobToArrayBuffer(blob) {
    return new Promise(async(resolve) => {
        const arrayBuffer = await new Response(blob).arrayBuffer()
        resolve(arrayBuffer);
    })
}

/**
 * 把arrayBuffer形式轉成audioBuffer形式
 */
function arrayBufferToAudioBuffer(arrayBuffer) {
    return new Promise((resolve) => {
        const audioCtx = new AudioContext();
        //透過decodeAudioData來把arrayBuffer形式轉成audioBuffer形式
        audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
            resolve(audioBuffer);
        });
    });
}

/**
 * 把audioBuffer超出動畫時間的部分剪輯掉
 */
function cutAudioBuffer(audioBuffer, endTime) {

    //一個個的聲道*音訊節點均透過其輸出與輸入而相互連結。各個輸入/輸出均具備數個聲道 (Channel)，以構成特定的音訊配置。
    let channels = audioBuffer.numberOfChannels;
    //rate為1秒所佔之空間大小
    let rate = audioBuffer.sampleRate;



    let startOffset = 0; //rate * 0
    let endOffset = accMul(rate , endTime);

    //音檔的空間大小
    let frameCount = endOffset - startOffset;
    let newAudioBuffer;

    /**
     * #剪輯片段主要透過兩步驟 : (blob的形式 會沒辦法剪輯)
     * -> 56行的endOffset-startOffset  設定buffer長度(以設定結尾處)
     * -> 68行的audioBuffer.copyFromChannel(anotherArray, channel, startOffset);
     * 將audioBuffer裡面的資料從startOffset放到anotherArray (為新建的ArrayBuffer) 當中，以設定開始處
     * 
     * #他是先設定結尾再設定開頭
     * 有點像是一個[1,2,3,4,5]要剪成[2,3]這樣
     * 他會先寫B = new int[2]; 56 : B為新創建的audioBuffer 透過(endOffset - startOffset)來限制其長度 也可以說間接用來知道它結束的時間點
     * 然後從第1開始剪 A' = [2,3,4,5] 68 : 然後這邊是把原本舊的還未剪過的audioBuffer 放到新建的arrayBuffer中 然後決定他開始的時間點
     * 然後把A'放到B中，不過B長度只有2，所以B就會等於[2,3] 72 : 將新arrayBuffer的剪好的資料放到新的audioBuffer當中
     * 然後下面迴圈是因為這個音訊可能錄製的時候有多個聲道
     */

    //建立audioBuffer
    //透過限制其Buffer長度(endOffset - startOffset)來控制其end時間
    newAudioBuffer = new AudioContext().createBuffer(channels, endOffset - startOffset, rate);

    //建立ArrayBuffer
    let anotherArray = new Float32Array(frameCount);

    let offset = 0;

    for (let channel = 0; channel < channels; channel++) {

        //(AudioBuffer)audioBuffer >>> (ArrayBuffer) anotherArray
        //startOffset:開始擷取取樣點(若要從第x秒開始就sampleRate*秒數 我們這邊開始時間為0)
        //audioBuffer放到anotherArray
        audioBuffer.copyFromChannel(anotherArray, channel, startOffset);

        //(ArrayBuffer) anotherArray >>> (AudioBuffer)audioBuffer (剪裁過後的audioBuffer) 
        //anotherArray放到newAudioBuffer
        newAudioBuffer.copyToChannel(anotherArray, channel, offset);
    }
    return [newAudioBuffer, frameCount];
}

/**
 * 把audioBuffer形式轉成base64形式
 */
function audioBufferToBase64(audioBuffer, len) {
    const buffer = audioBufferToArrayBuffer(audioBuffer, len);
    const base64String = arrayBufferToBase64(buffer);
    return base64String;
}


/**
 * 把audioBuffer形式轉成arrayBuffer形式
 */
function audioBufferToArrayBuffer(audioBuffer, len) {
    let numOfChan = audioBuffer.numberOfChannels;
    let length = accMul(accMul(len,numOfChan),2) + 44;   // len * numOfChan * 2 + 44)
    let buffer = new ArrayBuffer(length);
    let view = new DataView(buffer);
    let channels = [];
    // let i, 
    let sample = 0;
    let offset = 0;
    let pos = 0;


    //reference:https://zhuanlan.zhihu.com/p/351291031
    // write WAVE header (寫標頭)
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < audioBuffer.numberOfChannels; i++)
        channels.push(audioBuffer.getChannelData(i));
    while (pos < length) {
        for (i = 0; i < numOfChan; i++) { // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            setUint16(sample)
        }
        offset++ // next source sample
    }
    return buffer;


    /**
     *在pos位置寫入16bits(=2bytes =1 halfword)
     */
    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    /**
     *在pos位置寫入32bits(=4bytes =1 word)
     */
    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}


/**
 * 把arrayBuffer形式轉成base64形式
 */
function arrayBufferToBase64(buffer) {
    //把arrayBuffer放到 8位元(非負)整數型Array (0-255)
    let bytes = new Uint8Array(buffer);

    let len = buffer.byteLength;
    let binary = "";
    for (let i = 0; i < len; i++) {
        //把Uint8Array中第i個數字相對應的字元 加到字串中
        binary += String.fromCharCode(bytes[i]);
    }

    //由音檔Binary字串 =(加密)=> Base64字串
    return window.btoa(binary);
};


/**
 * 把blob形式轉成base64形式
 */
function blobToBase64(audioBlob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            //最後回傳此筆音檔的資料回去 (音檔內容(base64))
            //用split是為了要去除掉資料前面的 data:audio/mpeg;base64 字(存下來原本會長這樣: "audio":"data:audio/mpeg;base64,...音檔內容) 而我們只需要音檔內容
            const audioBase64 = evt.target.result.split(',')[1];
            resolve(audioBase64);
        };
        //先以base64的方式讀出該blob 
        reader.readAsDataURL(audioBlob);
    });

}