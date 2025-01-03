
/**
 * exportStatus 陣列是為了記錄每一個filelist按鈕的狀態(true/false)    
 * 若下次再按回原本的按鈕 可以依exportStauts去判斷現在此file該亮哪個顏色
 * 每個file預設都為true  (綠燈)
 */
let exportStatus = []; 

//大紅綠燈
const greenLight = document.getElementById("greenLight");
const redLight = document.getElementById("redLight");

/**
 * 一剛開始檔案還未做編輯時 以及 檔案匯出之後
 * export status那會顯示綠燈 fileList該json檔旁也會顯示綠燈
 */
function turnGreen() {
    //fileList那邊的燈
    const greenLightId = "greenLight_" + arrayName[nowIndex];   //此id每個filelist的按鈕都有被定義一個
    const redLightId = "redLight_" + arrayName[nowIndex];       //此id每個filelist的按鈕都有被定義一個

    const green = document.getElementById(greenLightId);
    const red = document.getElementById(redLightId);
    green.style.display = "inline-block";
    red.style.display = "none";
    exportStatus[nowIndex] = true;

    //editList那邊的燈
    greenLight.style.display = "inline-block";
    redLight.style.display = "none";
}

/**
 * 若檔案有做過編輯 (錄音或按下編輯按鈕等等) 在還未匯出json檔之前   
 * export status那會顯示紅燈 fileList該json檔旁也會顯示紅燈
 */
function turnRed() {
    //fileList那邊的燈
    const greenLightId = "greenLight_" + arrayName[nowIndex];   //此id每個filelist的按鈕都有被定義一個
    const redLightId = "redLight_" + arrayName[nowIndex];       //此id每個filelist的按鈕都有被定義一個

    const green = document.getElementById(greenLightId);
    const red = document.getElementById(redLightId);
    red.style.display = "inline-block";
    green.style.display = "none";
    exportStatus[nowIndex] = false;

    //editList那邊的燈
    greenLight.style.display = "none";
    redLight.style.display = "inline-block";
}

//若離開此頁面 有做編輯還未匯出的檔案 會跳提醒
window.onbeforeunload = function(e) {
    let event = window.event || e;

    for (const status of exportStatus) {
        //若有status為false 代表有檔案做編輯沒匯出
        if (!status) {
            event.returnValue = ("您尚有檔案未匯出，是否要離開此頁面?");
            break;
        }
    }
}