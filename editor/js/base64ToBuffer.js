
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

