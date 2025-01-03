//------------------------------------------------------------------用drag的方式匯入檔案

let dropbox = document.getElementById("KLA"); //有vrm跟場景的那個框

/**
 * 用來放json檔(包括 voice animation userPositionZ) animation部分  
 * 為陣列
 */
let animation = [];

//dropbox  element增加eventListener
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
}





// 針對資料處理的function
function handleFiles(files) {
    // 若副檔名不為.txt 則return
    if (files[0].name.split(".")[1] != "json") {
        return;
    }
    if (files.length > 0) {

        //顯示'可以以拖拉方式匯入檔案'的提醒字改顯示Done 2秒後消失
        document.getElementById("notice").innerHTML = "Done!";
        setTimeout("block_notice()", 2000);

        //為了避免匯入同樣的json檔 -> 匯入的檔案會把該檔案名加到arrayName陣列
        if (arrayName.includes(files[0].name)) {
            disappearAlertPanel();
            const alertContent = document.getElementById("alertContent");
            alertContent.style.visibility = "visible";
            alertContent.innerHTML = "There is already a file with the same name.";
            const confirmBtn = document.getElementById("confirmBtn");
            confirmBtn.style.display = "inline-block";
            confirmBtn.onclick = () => { disappearAlertPanel() };
            return;
        }


        //讀檔的 reader  
        let reader = new FileReader();

        /**
         * 進行順序 : 2
         * 讀完檔案後進行此function  
         * 因拖拉檔案只能一次匯入一個檔案 -> 所以只有一個file (files[0])
         */
        reader.onload = (function(file) {
            return function(event) {
                // event.target.result 為讀檔後的結果   file.name為json檔名稱
                readJSONFile(event.target.result, file.name);
            };
        })(files[0]);

        /**
         * 進行順序 : 1     
         * 這行要寫在下面 因為上面要先設定此reader要進行的事     
         * 接著才進行讀取上傳的檔案
         */
        reader.readAsText(files[0]); // 讀取上傳的檔案

        //把此檔案對應的檔按按鈕加到fileList上
        addFileListItem(files[0].name);

        //剛開始都為綠燈 (true)
        exportStatus.push(true);

    }

}


function block_notice() {
    document.getElementById("notice").innerHTML = "";
}


//--------------------------------------------------------------從filelist按匯入按鈕來匯入檔案

/**
 * arrayName陣列 -> 包含了一筆筆json檔檔名之陣列
 */
let arrayName = new Array();

/**
 * arrayData陣列 -> 包含了一筆筆json檔案的內容之陣列
 */
let arrayData = new Array();

/**
 * nowData = arrayData[nowIndex]  
 * 現在點到的檔案按鈕之對應的json檔內容  
 * 為Object
 */
let nowData;

/**
 * nowIndex為現在點到的檔案按鈕之檔名對應在的json檔檔名陣列裡的index
 */
let nowIndex;

/**
 * 按下匯入檔按按鈕時  
 * 匯入檔案時觸發
 */
const fileUpLoader = document.getElementById('files');
fileUpLoader.addEventListener('change', function(e) {

    //以匯入按鈕來匯入檔案可以一次匯入好幾個檔 -> 跑遍所有匯入的檔案
    for (let i = 0; i < this.files.length; i++) {

        //為了避免匯入同樣的json檔 -> 匯入的檔案會把該檔案名加到arrayName陣列
        if (arrayName.includes(fileUpLoader.files[i].name)) {
            disappearAlertPanel();
            const alertContent = document.getElementById("alertContent");
            alertContent.style.visibility = "visible";
            alertContent.innerHTML = "There is already a file with the same name.";
            const confirmBtn = document.getElementById("confirmBtn");
            confirmBtn.style.display = "inline-block";
            confirmBtn.onclick = () => { disappearAlertPanel() };
            continue;
        }

        //讀檔的 reader
        let reader = new FileReader();


        /**
         * 進行順序 : 2
         * 讀完檔案後進行此function  
         * 因以按鈕方式匯入檔案能一次匯入多個檔案 -> 所以每一次執行一個file (files[i])
         */
        reader.onload = (function(file) {
            return function(event) {
                readJSONFile(event.target.result, file.name);
            };
        })(fileUpLoader.files[i]);

        /**
         * 進行順序 : 1     
         * 這行要寫在下面 因為上面要先設定此reader要進行的事     
         * 接著才進行讀取上傳的檔案
         */
        reader.readAsText(fileUpLoader.files[i]);

        //把此檔案對應的檔按按鈕加到fileList上
        addFileListItem(fileUpLoader.files[i].name);

        //剛開始都為綠燈 (true)
        exportStatus.push(true);


    }

    /**
     * 加此行 把input的value重新設置為空 
     * 因為用change的話若上個檔案刪掉後 再重新載入 
     * value還是一樣的 就不會載入此檔案了
     */
    fileUpLoader.value = null;
});


//------------------------------------------------------------------------------

/**
 * @param {*} fileResult 讀檔後的結果
 * @param {*} fileName json檔名
 */
function readJSONFile(fileResult, fileName) {

    //fileResult為讀檔後的結果
    //JSON.parse() 方法把會把一個 JSON 字串轉換成 JavaScript 的數值或是物件
    const result = JSON.parse(fileResult);

    //把讀檔結果推入arrayData陣列 -> 包含了一筆筆json檔案的內容之陣列
    arrayData.push(result);
    //把此檔案名稱推入arrayName陣列 -> 包含了一筆筆json檔名之陣列
    arrayName.push(fileName);


    //匯入JSON檔後 要把每一個JSON檔中紀錄的各個音檔 先記錄下來在Map中(JSON檔名 跟 音檔陣列)
    /**
     * 暫時存入json檔中一筆筆音檔資料的陣列 -> 之後會放進Map中  
     * 資料包括 id fileName(此音檔名稱) audio(播放器) volume(此音檔音量)
     */
    let tempArr = [];
    //result.voice 為JSON檔中記錄各個音檔內容的陣列
    for (let voiceNum = 0; voiceNum < result.voice.length; voiceNum++) {

        //隨意產生id
        const randId = getRandomId();
        //把voice陣列中的此音檔從base64形式轉成blob
        const audioBlob = base64ToBlob(result.voice[voiceNum].audio)
            //建立新的物件URL 代表了所指定的 blob 物件
        const url = URL.createObjectURL(audioBlob);

        /*
            new Audio(url):
            The Audio() constructor creates and returns a new HTMLAudioElement, 
            a new HTMLAudioElement object, configured to be used for 
            playing back the audio from the file specified by url.
        */
        const tempAudio = new Audio(url);
        //將此播放器的音量調整至記錄在json檔中的音量
        tempAudio.volume = result.voice[voiceNum].volume;
        tempArr.push({ id: randId, fileName: result.voice[voiceNum].filename, audio: tempAudio, volume: result.voice[voiceNum].volume });
    }
    soundFileMap.set(fileName, tempArr); //key -> json檔名稱   tempArr -> 此json檔的音檔陣列(用來放各個音檔資訊)
}

/**
 * 確保檔案全部載好後 再顯示檔案按扭出來  
 * fileName -> 此json檔檔名  
 * 用來新增檔按按鈕在fileList上  
 * 每個檔按按鈕都有get_color get_data function
 */
function addFileListItem(fileName) {
    const table = document.getElementById('filelist');

    const row = table.insertRow(-1);
    const fileBtn = row.insertCell(0);
    let objId = fileName;

    //檔名旁邊要顯示紅燈/綠燈 (red預設為display:none 剛開始file都還未做過編輯 預設情況為綠燈)
    const green = '<img src="img_Reference/greenLight.png" width="10px" style="margin-left:7px;" id="greenLight_' + objId + '">';
    const red = '<img src="img_Reference/redLight.png" width="10px" style="margin-left:7px;display:none;" id="redLight_' + objId + '">';
    const lights = green + " " + red;

    //this 為目前按下的button  this.id 為按下的button的id 
    //button上面顯示檔名以及狀態燈
    fileBtn.innerHTML = "<button title=\"" + fileName + "\" onclick=\"get_data(this.id)\" class=\"fileButton\" id=\"" + objId + "\"><div class='buttonText'>" + fileName + "</div>" + lights + " </button>";

    if (table.innerHTML == '') {
        table.style.display = 'none';
    } else {
        table.style.display = 'block';
    }
}




let interruptFlag = 0; //當確定要中斷錄音及切換到其他檔案時，會把音檔存在切換前的檔案中=>interruptFlag=1
let nextBId = 0;  //用來儲存切換後的檔案的index
/**
 * 點選某個fileList上檔案按鈕進入此function
 * 主要是用些變數為此json檔紀錄一些資料
 * bId 為按下button的id (id名為此檔案的檔名)
 */
function get_data(bId) {
    console.log("getData")

    const state = mediaRecorder.state; //影音的錄製狀態
    if (state == "paused" || state == "recording") {
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        const confirmBtn = document.getElementById("confirmBtn");
        const cancel = document.getElementById("cancel");

        alertContent.style.visibility = "visible";
        alertContent.innerHTML = "The recording is currently in progress. Do you want to interrupt it?";

        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = async() => {
            disappearAlertPanel();
            interruptFlag = 1;
            nextBId = bId;
            recordStop();
        };
        cancel.style.visibility = "visible";
        return;
    } 

    get_color(document.getElementById(bId));

    //現在nowIndex若不為undefined 則代表有按過fileList上的按鈕 
    if (nowIndex != undefined) {
        //主要是為了停止上一個file的音檔以及讓播放器顯示時間歸零 vrm動作回復初始動作等等
        stop();
    }

    //nowIndex為現在點到的檔案按鈕之檔名對應在的json檔檔名陣列裡的index
    for (let i = 0; i < arrayName.length; i++) {
        if (arrayName[i] == bId) {
            nowIndex = i;
        }
    }

    //有點選某個file時 就可按刪除按鈕
    const delBtn = document.getElementById('deleteFileBtn');
    delBtn.disabled = false;

    //用變數來記錄json檔內容
    nowData = arrayData[nowIndex];
    animation = nowData.animation;

    //更新
    setInitEditGroup();
    uploadEditData();

    uploadSoundData();

    // endFilesSound(); 
    // clock.stop();
    // positionReset();
    // frame = 0;
    // clock.elapsedTime = 0;
    // stopTime = 0;
    // newBeginStatus = 1;
    // playStatus = 0;
    // animateDefault();


    //讓播放器下方 顯示出影片長度
    calculateTime(animation[animation.length - 1].time.Time.toFixed(2), "lengthMin", "lengthSec");
    //讓播放器下方 顯示出目前播放的時間為 00:00.00
    document.getElementById("second").innerHTML = "00.00";
    document.getElementById("minute").innerHTML = "00";

    //true -> 顯示綠燈 false -> 顯示紅燈
    if (exportStatus[nowIndex]) {
        turnGreen();
    } else {
        turnRed();
    }
}

/**
 * 按下刪除檔案按鈕觸發
 */
function deleteData() {
    //如果沒有按下任何json檔時不能按刪除按鈕
    if (arrayName.length == 0) {
        const delBtn = document.getElementById('deleteFileBtn');
        delBtn.disabled = true;
        return;
    }

    //按下刪除按鈕時 讓使用者確保要刪除此檔案 按下確認後 進下方的function
    disappearAlertPanel();
    const alertContent = document.getElementById("alertContent");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancel = document.getElementById("cancel");
    alertContent.style.visibility = "visible";
    confirmBtn.style.display = "inline-block";
    confirmBtn.onclick = () => { confirmDelFile() };
    cancel.style.visibility = "visible";
    alertContent.innerHTML = "Are you sure you want to delete the file ?<br>Make sure to export the file that you had edited.";
}


/**
 * 按下刪除檔案按鈕後會跳出提醒 按下確認後 進入此function
 */
function confirmDelFile() {
    //秒數還原
    document.getElementById("lengthMin").innerHTML = "00";
    document.getElementById("lengthSec").innerHTML = "00.00";

    animation = [];
    //現在目前按下的json檔的id
    let nowId = arrayName[nowIndex];

    //把該檔案的按鈕的tr刪掉 (tr >> td >> button)
    document.getElementById(`${nowId}`).parentElement.parentElement.remove();

    //把陣列中的該檔案紀錄內容移除掉
    arrayName.splice(nowIndex, 1);
    arrayData.splice(nowIndex, 1);
    exportStatus.splice(nowIndex, 1);

    nowIndex = ""; //若按下的此檔案被刪除了 代表現在沒有按下任何的檔案了 (按下檔案會get到此按鈕相對應的index)

    //editList內容跟著清掉
    const editTable = document.getElementById('editList');
    editTable.innerHTML = "";

    //editList的大紅綠燈display none
    greenLight.style.display = "none";
    redLight.style.display = "none";

    disappearAlertPanel();
    deleteSoundFiles();

}

/**
 * 把顯示提示字的區域清空   
 * (清空字跟按鈕)
 */
function disappearAlertPanel() {
    const alertContent = document.getElementById("alertContent");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancel = document.getElementById("cancel");

    alertContent.style.visibility = "hidden";
    confirmBtn.style.display = "none";
    cancel.style.visibility = "hidden";
}