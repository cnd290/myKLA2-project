//------------------------------------------------------------------用drag的方式匯入檔案

let dropbox = document.getElementById("KLA");    //有vrm跟場景的那個框

/**
 * 用來放json檔(包括 voice animation userPositionZ) animation部分  
 * 為陣列
 */
let animation = [];     

/**
 * 用來放json檔(包括 voice animation userPositionZ) voice部分  
 * 為陣列
 */
 let voiceData = [];

/**
 * 每一個檔案在讀入時 此變數會+1   
 * 讀完一個檔案後 會讓此變數-1  
 * 為了之後 在等此變數變回0 讓loading spinner消失      
 * (此作法是為了確保檔案全部都載好後 -> 才讓loading spinner消失)
 */
let loadingFileCnt = 0;     

//dropbox element增加eventListener
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




//針對資料處理的function
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
        //若用拖的方式匯入檔案 會讓sidebar出來 讓使用者選擇檔案
        openNav(); 

        //讀檔的 reader   
        let reader = new FileReader();

        /**
         * 進行順序 : 2
         * 讀檔前進行
         * 當reader讀到檔案時觸發此function 
         * 並且開始顯示出loading spinner
         * 
         * 因拖拉檔案只能一次匯入一個檔案 -> 所以只有一個file (files[0])
         */
        reader.onloadstart = (function(file) {
            return function(event) {
                showLoadingSpinner();
                loadingFileCnt++;
            };
        })(files[0]);

    
        /**
         * 進行順序 : 3
         * 讀完檔案後進行此function  
         * 因拖拉檔案只能一次匯入一個檔案 -> 所以只有一個file (files[0])
         */
        reader.onload = (function(file) {
            return function(event) {
                // result 為讀檔後的結果
                const result = event.target.result;
                //JSON.parse() 方法把會把一個 JSON 字串轉換成 JavaScript 的數值或是物件
                const resultAnimation = JSON.parse(result);
 

                //把讀檔結果推入arrayData陣列 -> 包含了一筆筆json檔案的內容之陣列
                arrayData.push(resultAnimation);
                //把此檔案名稱推入arrayName陣列 -> 包含了一筆筆json檔名之陣列
                arrayName.push(file.name);


                //把此檔案對應的檔按按鈕加到fileList上
                addFileListItem(file.name);

                loadingFileCnt--;
                if (loadingFileCnt == 0) {
                    //讓loading spinner消失
                    disappearLoadingSpinner();
                }
            };
        })(files[0]);

        /**
         * 進行順序 : 1     
         * 這行要寫在下面 因為上面要先設定此reader要進行的事     
         * 接著才進行讀取上傳的檔案
         */
        reader.readAsText(files[0]); 


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
         * 讀檔前進行  
         * 當reader讀到檔案時觸發此function   
         * 並且開始顯示出loading spinner  
         * 
         * 因以按鈕方式匯入檔案能一次匯入多個檔案 -> 所以每一次執行一個file (files[i])
         */
        reader.onloadstart = (function(file) {
            return function(event) {
                showLoadingSpinner();
                loadingFileCnt++;
            };
        })(fileUpLoader.files[i]);

        /**
         * 進行順序 : 3
         * 讀完檔案後進行此function  
         * 因以按鈕方式匯入檔案能一次匯入多個檔案 -> 所以每一次執行一個file (files[i])
         */
        reader.onload = (function(file) {
            return function(event) {
                //event.target.result:讀檔後的結果
                //JSON.parse() 方法把會把一個 JSON 字串轉換成 JavaScript 的數值或是物件   
                const result2 = JSON.parse(event.target.result);
                
                //把讀檔結果推入arrayData陣列 -> 包含了一筆筆json檔案的內容之陣列
                arrayData.push(result2);
                //把此檔案名稱推入arrayName陣列 -> 包含了一筆筆json檔名之陣列
                arrayName.push(file.name);

                //把此檔案對應的檔按按鈕加到fileList上
                addFileListItem(file.name);

                loadingFileCnt--;
                if (loadingFileCnt == 0) {
                    //讓loading spinner消失
                    disappearLoadingSpinner();
                }
            };
        })(fileUpLoader.files[i]);

        /**
         * 進行順序 : 1     
         * 這行要寫在下面 因為上面要先設定此reader要進行的事     
         * 接著才進行讀取上傳的檔案
         */
        reader.readAsText(fileUpLoader.files[i]);
        
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
 * 確保檔案全部載好後 再顯示檔案按扭出來  
 * fileName -> 此json檔檔名  
 * 用來新增檔按按鈕在fileList上  
 * 每個檔按按鈕都有get_color get_data function
 */
function addFileListItem(fileName) {
    const table = document.getElementById('filelist');

    let row = table.insertRow(-1);
    let fileBtn = row.insertCell(0);
    let objId = fileName;

    //this 為目前按下的button  this.id 為按下的button的id 
    //button上面顯示檔名
    fileBtn.innerHTML = "<button title=\""+fileName+"\" onclick=\"get_color(this);get_data(this.id)\" class=\"fileButton\" id=\"" + objId + "\"> " + fileName + " </button>";


    if (table.innerHTML == '') {
        table.style.display = 'none';
    } else {
        table.style.display = 'block';
    }
}



/**
 * get_color() 
 * -> 用來讓fileList button摸上去會有顏色
 * -> 讓fileList button按下去會有顏色
 * bNow : 現在按下的按鈕物件
 * bPre : 為上一次按下的按鈕物件 會在function下方紀錄
 */
let bPre;
function get_color(bNow) {
    //現在按下的按鈕上色
    bNow.style.backgroundColor = "#97A4B8";     

    /**
     * 有記錄過上一次按下的按鈕物件 以及 現在按下的按鈕物件不等於上一次按下的按鈕物件才進入
     * 寫這一段主要是為了 當A按完後會變色 之後在按B時 B變色 然後必須讓A的顏色回去fileList背景顏色
     */
    if (bPre != undefined && bNow != bPre) { 
        //上一次按的按鈕背景色變回fileList背景顏色
        bPre.style.backgroundColor = "#6a7485"; 
        bPre.addEventListener("mouseenter", hoverFileBtn(bPre), false);
    }
    bPre = bNow;
}


/**
 * 滑過按鈕 按鈕會變色
 */
function hoverFileBtn(bPre) {
    // highlight the mouseenter target
    bPre.style.backgroundColor = "#7d8aa0"; //滑過的顏色

    // reset the color after a short delay
    setTimeout(function() {
        bPre.style.backgroundColor = "";
    }, 100);
}



/**
 * 點選某個fileList上檔案按鈕進入此function
 * 主要是用些變數為此json檔紀錄一些資料
 * bId 為按下button的id (id名為此檔案的檔名)
 */
function get_data(bId) { 

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
    const delBtn = document.getElementById('deleteJSON'); 
    delBtn.disabled = false;

    //用變數來記錄json檔內容
    nowData = arrayData[nowIndex];
    animation = nowData.animation;
    voiceData = nowData.voice;

    //紀錄此json檔案中 有部位被做特殊標記之幀數
    uploadEditData();

    //若json檔中voice部分有紀錄資料 -> 代表有此json檔包括音檔
    if (voiceData.length != 0) {
        //此function -> 把此json檔的一個個音檔紀錄到soundsArr(陣列)中
        getSoundFile(voiceData);
    }

    //讓播放器下方 顯示出影片長度
    calculateTime(animation[animation.length - 1].time.Time.toFixed(2), "lengthMin", "lengthSec");
    //讓播放器下方 顯示出目前播放的時間為 00:00.00
    document.getElementById("second").innerHTML = "00.00";
    document.getElementById("minute").innerHTML = "00";

    setInitEditJson();
}


/**
 * 按下刪除檔案按鈕觸發
*/
function deleteData() {

    //如果沒有按下任何json檔時不能按刪除按鈕  
    if (arrayName.length == 0) { 
        const delBtn = document.getElementById('deleteJSON');
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
    alertContent.innerHTML = "Are you sure you want to delete the file ?<br>Make sure to export your file which export status in red light.";
}

/**
 * 按下刪除檔案按鈕後會跳出提醒 按下確認後 進入此function
 */
function confirmDelFile() {
    //秒數還原
    document.getElementById("lengthMin").innerHTML = "00";
    document.getElementById("lengthSec").innerHTML = "00.00";

    disappearAlertPanel();

    animation = [];
    //現在目前按下的json檔的id
    nowId = arrayName[nowIndex];

    //把該檔案的按鈕的tr刪掉 (tr >> td >> button)
    document.getElementById(`${nowId}`).parentElement.parentElement.remove(); 

    //把陣列中的該檔案紀錄內容移除掉
    arrayName.splice(nowIndex, 1);
    arrayData.splice(nowIndex, 1);

    nowIndex = "";  //若按下的此檔案被刪除了 代表現在沒有按下任何的檔案了 (按下檔案會get到此按鈕相對應的index)
    nowId = "";

    //如果沒有檔案時不能按刪除按鈕
    if (arrayName.length == 0) { 
        const delBtn = document.getElementById('deleteJSON');
        delBtn.disabled = true;
    }

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


/**
 * specialFrame是用來記錄   
 * 此json檔中有部位被做特殊標記之幀數  
 * (有重複紀錄幀數的可能)
 */
let specialFrame = [];

/**
 * 紀錄此json檔案中 有部位被做特殊標記之幀數  
 * -> 用在之後判斷哪一幀需要停三秒
 */
function uploadEditData() { 
    specialFrame = [];  //一剛開始需先清空 因為切換到此json檔案 要先把上一個json檔specialFrame紀錄的東西清掉

    let bodyPart = ["eye", "mouth", "neck", "spine", "rightUpperArm", "rightLowerArm", "leftUpperArm", "leftLowerArm", "rightHand", "leftHand", "rightThumb", "rightIndex", "rightMiddle", "rightRing", "rightLittle", "leftThumb", "leftIndex", "leftMiddle", "leftRing", "leftLittle", "rightUpperLeg", "rightLowerLeg", "leftUpperLeg", "leftLowerLeg"]

    for (let i = 0; i < animation.length; i++) {
        for (let j = 0; j < bodyPart.length; j++) {
            //若json檔中此幀此部位的special為true (代表此部位被做特殊標記)
            if (animation[i][bodyPart[j]].special == true) {
                specialFrame.push(i);
            }
        }
    }

}




/**
 * 創建json物件 -> 為了方便在scoreList上的result table(顯示成績的表格)上創建detail用的       
 * detail -> 會以動作名稱來分成一個一個的
 *   
 * 所以 每一個動作名稱有一個相對應的json物件 若有重複動作名稱 則不重複建立json物件  
 * 其中json物件裡的arr -> arr陣列會推入一個個包括   
 * 現在specialFrame進行的時間 被做標記的部位名稱 使用者此部位的分數 的陣列
 */
let editJson = {};


/**
 * 用來儲存所有動作名稱(有順序性)      
 * sequence陣列會依json檔幀數順序來依序加入動作名稱  
 * -> 前面的幀數的動作名稱會先加入此陣列
 */
let sequence = [];

/**
 * 切換json檔案時 -> 要重新創建此檔案的每個json物件   
 * 紀錄的動作名稱為 每一幀中有被做特殊標記的每個部位有紀錄下來的動作名稱  
 * (但動作名稱若遇到重複的 則不重複創建此動作名稱相對應的json物件)
 */
function setInitEditJson() { 
    //切換檔案時進入 剛開始都要先清空
    sequence = [];
    editJson = {};

    //i為幀數
    for (let i = 0; i < animation.length; i++) {
        //bodyPart為紀錄在此幀的所有部位
        const bodyPart = Object.keys(animation[i]);

        //需先-3 因為上面紀錄的 後三個不是部位名稱
        for (let j = 0; j < bodyPart.length - 3; j++) {
            //若此幀此部位有被做標記
            if (animation[i][bodyPart[j]].special == true) {
                //此幀此部位相對應紀錄的動作名稱 (有可能為空)
                const desText = animation[i][bodyPart[j]].descriptText;

                //沒有記錄動作名稱
                if (desText != "") {
                    //若此動作名稱還沒建立過相對應的json物件才進入 (若已建立過 則不再建立一次)
                    if (editJson[desText] == undefined) { 
                        sequence.push(desText);
                        const randId = getRandomId();
                        editJson[desText] = {
                            id: randId,
                            arr: [] 
                        };
                    }
                } 
                //有記錄動作名稱
                else {
                    //若此動作名稱(untitled)還沒建立過相對應的json物件才進入 (若已建立過 則不再建立一次)
                    if (editJson["Untitled"] == undefined) { 
                        const randId = getRandomId();
                        editJson["Untitled"] = {
                            id: randId,
                            arr: []
                        };
                    }
                }

            }
        }
    }
    /**
     * 若有建立起untitled相對應的json物件  
     * 最後才把'Untitled'推進sequence陣列中  
     * 確保他的順序是在最後一個  
     * -> 為了呈現在scorelist result table上時 能排在最下面
     */
    if (editJson["Untitled"] != null) {
        sequence.push("Untitled");
    }
}


/**
 * 用來製造隨機的六碼id
*/
function getRandomId() {
    let str = "";
    for (let i = 0; i < 6; i++) {

        //為0或32
        let toLowercase = Math.floor(Math.random() * 2) * 32;

        /** 
         * 97 -> 65 + 32    65 -> 65 + 0  
         * 純小寫會為這樣: let temp = Math.floor(Math.random() * 26) + 97;  
         * 純大寫會為這樣: let temp = Math.floor(Math.random() * 26) + 65;
         */
        
        let temp = Math.floor(Math.random() * 26) + 65 + toLowercase;
        str += String.fromCharCode(temp);  //id最後出來為六碼 都為英文字母 大寫或小寫
    }

    return str;
}