
/**
 * 用來記錄現在按下editList button 的 id   
 * 或是 現在按下summary 的 id
 */
let selectedPartId;

/**
 * 按下編輯按鈕觸發
 */
function markPose() {
    //如果沒有選取或匯入任何JSON檔的時候就無法編輯
    if(animation.length == 0){
        return;
    }

    //不是end的時候才能在按編輯按鈕的時候顯示出被編輯的資料
    if (!(newBeginStatus == 1 && playStatus == 0 && endStatus == 1)) { 

        /**
         * 如果JSON檔中有紀錄錄音檔內容  
         * 若再做編輯 在按下書籤按鈕時 JSON檔案長度會跟音檔的長度不一樣  
         * (因為 音檔長度理應要包括所有有做特殊標記的每幀暫停三秒時間)
         */
        if (soundsArr.length > 0) { 
            pause(); //跳出提醒時 先讓JSON檔暫停
            disappearAlertPanel();
            const alertContent = document.getElementById("alertContent");
            const confirmBtn = document.getElementById("confirmBtn");
            const cancel = document.getElementById("cancel");

            alertContent.style.visibility = "visible";
            alertContent.innerHTML = "If you mark it, the recorded sound and the animation<br>may not match. Are you sure you want to continue marking ?";

            confirmBtn.style.display = "inline-block";
            confirmBtn.onclick = () => {
                disappearAlertPanel();
                confirmMarkPose();
            };
            cancel.style.visibility = "visible";

        } else {
            confirmMarkPose();
        }
    } else {
        //若animation已播完時 按下了編輯按鈕 提醒使用者
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        alertContent.style.visibility = "visible";
        const confirmBtn = document.getElementById("confirmBtn");
        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => { disappearAlertPanel() };
        alertContent.innerHTML = "Cannot mark when the animation is finished !";
        return;
    }

}

/**
 * 確定做下標記
 */
function confirmMarkPose() {
    //選單中目前選的選項的value(部位名稱) -> (是紀錄在json檔中部位名稱 不是要顯示給使用者看的)
    let bodyPart = document.getElementById("bodySelect").options[document.getElementById("bodySelect").selectedIndex].value; 

    //每個editList上按鈕的id 為選擇的部位名加上被做標記時的幀數
    let objId = bodyPart + "_" + (frame - 1); 

    //重複編輯的狀況 (同一幀同一部位)
    if (document.getElementById(objId) != undefined) { 
        disappearAlertPanel(); //先清空顯示提醒字區域
        const alertContent = document.getElementById("alertContent");
        alertContent.style.visibility = "visible";
        const confirmBtn = document.getElementById("confirmBtn");
        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => { disappearAlertPanel() };
        alertContent.innerHTML = "You have already marked this before !";
        return; //下面程式碼就不繼續執行了 因為重複mark了同幀同部位 所以下面程式碼也不用繼續進行下去了
    }


    //按下編輯按鈕 紀錄起JSON檔中的editorTime
    //pause的情況下 按下編輯按鈕 -> 被編輯的時間會等於按下暫停的時間
    if (newBeginStatus == 0 && playStatus == 0 && endStatus == 0) { 
        //json檔中有一變數(editorTime)用來記錄被做編輯的時間 
        animation[frame - 1].editorTime = stopTime; //frame要先減1 因為frame跑完後會先加1 

    } 
    //stop的情況下 跟 影片還沒開始播放的情況下
    else if (newBeginStatus == 1 && playStatus == 0 && endStatus == 0) { 
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        alertContent.style.visibility = "visible";
        const confirmBtn = document.getElementById("confirmBtn");
        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => { disappearAlertPanel() };
        alertContent.innerHTML = "Before marking, please play the json file first !";
        return;
    }
    //播放中 被編輯的時間就會等於現在clock目前播到的時間
    else {
        animation[frame - 1].editorTime = clock.elapsedTime; 
    }


    //按下編輯按鈕執行的json檔此幀的選擇部位的special變數變為true 代表有做標記
    animation[frame - 1][bodyPart].special = true;

    //按下編輯按鈕 JSON檔中有一變數紀錄打在輸入框的動作名稱
    let descriptText = document.getElementById("inputSpecialTitle").value;
    animation[frame - 1][bodyPart].descriptText = descriptText;
    document.getElementById("inputSpecialTitle").value = ""; //每一次按完編輯按鈕 把輸入框的字清空

    uploadEditData(); //用來更新editList的畫面 (顯示整個details)
    turnRed();        //進入一function 讓File List上此檔案旁以及Edit List下方的紅燈亮起 綠燈不顯示

}



//----------------------------------------------------------------------------------------------------

/**
 * specialFrame是用來記錄   
 * 此json檔中有部位被做特殊標記(special變數為true)之幀數  
 * (有重複紀錄幀數的可能)  
 * ->是為了用在animate()裡判斷哪幀該暫停三秒
 */
let specialFrame = []; 

/**
 * 創建json物件 -> 為了方便在editList上創建details用的       
 * detail -> 會以動作名稱來分成一個一個的  
 * 所以 每一個動作名稱有一個相對應的json物件  
 * 若有重複動作名稱 則不重複建立json物件  
 */
let editJson = {}; 

/**
 * 用來紀錄每一次按編輯按鈕前所打的的動作名稱   
 * (陣列中動作名稱不會重複出現)  
 * 有可能為untitled
 */
let groupSequence = []; 


/**
 * 一JSON檔載入時會跑此function來載入資料在editList上    
 * 按編輯按鈕也會跑此function來載入資料在editList上  
 * 刪除編輯資料按紐後也會跑此function來重新載入資料在editList上
 */
function uploadEditData() { 
    //每一次進來先清空再重新紀錄
    specialFrame = []; 

    //每一次進來先清空table(清空editList畫面) 再重新載入
    let editTable = document.getElementById('editList');
    editTable.innerHTML = ""; 

    /**
     * 按編輯按鈕跟刪除編輯資料按鈕的情況下 都有可能會跑此for迴圈 
     * -> 若先前已有編輯過的動作名稱details 
     * -> (這些動作名稱已紀錄在groupSequence陣列中 且 這些動作名稱都存有相對應的json物件)  
     * 基於每次都會清空editList畫面 所以要重新載入之前已經建立好的各個details
     */
    for (let i = 0; i < groupSequence.length; i++) { 

        let row = editTable.insertRow(-1); //新增table的row
        let pose = row.insertCell(0);      //新增row的cell
        const key = groupSequence[i];      //key為陣列中紀錄的各個動作名稱(不重複)

        //顯示已有編輯過的動作名稱details出來 (不包括button) (id : 每個動作名稱所建立的JSON物件 裡面包括了自己的id)
        pose.innerHTML = "<details id='" + editJson[key].id + "'>" +
            "<summary id='" + editJson[key].id + "_summary" + "' onclick='get_color(this);get_pose(this.id);get_name(this.id);'><div style='width:18vw; overflow:hidden; text-overflow: ellipsis;'>▶ " + key + "</div></summary>" +
            "</details>";
    };

    //動作部位之選單的所有選項
    let bodyPart = document.getElementById("bodySelect").options;

    /**
     * 一JSON檔剛載入時 各個動作名稱的editJson(json物件)跟details都是第一次建   
     * -> 會重新建立 並依之前JSON檔來判斷要顯示的資料
     */
    for (let i = 0; i < animation.length; i++) { //i為幀數
        for (let j = 0; j < bodyPart.length; j++) {

            //若此幀此部位有被做標記
            if (animation[i][bodyPart[j].value].special == true) { 

                specialFrame.push(i); 

                //顯示在Edit List按鈕上的時間 => 抓JSON檔中此幀被做特殊標記時記錄下的時間
                const editorTimeStr = calculateEditorTime(animation[i].editorTime.toFixed(2));

                //每個Edit List上按鈕的id (id為選擇的部位名加上被做標記時的幀數)
                let objId = bodyPart[j].value + "_" + i;

                /**
                 * 顯示在Edit List按鈕上的時間跟選擇部位名  
                 * bodyPart[j].text是為了給編輯者看的選擇部位名 
                 */
                let output = bodyPart[j].text + "&emsp;" + editorTimeStr + "&emsp;";

                //animation每一幀中有做編輯的部位在JSON檔中記錄的動作名稱
                let desText = animation[i][bodyPart[j].value].descriptText;

                /**
                 * 若沒有打動作名稱 則預設為Untitled
                 */
                let groupName = "Untitled";
                if (desText != "") {
                    groupName = desText;
                }

                /**
                 * JSON物件格式長這樣 -> {"手平舉": {"id":"123"}}  
                 * 若此動作名稱的JSON物件還未被定義 -> 代表此動作名稱的details是第一次建
                 */
                if (editJson[groupName] == undefined) {

                    let row = editTable.insertRow(-1);  //新增table的row
                    let pose = row.insertCell(0);       //新增row的cell

                    //隨意產生id
                    const randId = getRandomId(); 
                    editJson[groupName] = {
                        id: randId
                    };

                    //要在按下去summary時能變色(get_color()) 並且為了可以刪除掉 也必須要可以抓到此summary的id(get_pose())
                    pose.innerHTML = "<details id='" + randId + "'>" +
                        "<summary id='" + editJson[groupName].id + "_summary" + "' onclick='get_color(this);get_pose(this.id);get_name(this.id);'><div style='width:18vw; overflow:hidden; text-overflow: ellipsis;'>▶ " + groupName + "</div></summary>" +
                        "</details>"; 

                    //只有在第一次創建此動作名稱details時才會推進陣列
                    groupSequence.push(groupName); 
                }

                //在相對應的details中加入相對應的button (無論是不是第一次建json物件 建details)
                const editGroup = document.getElementById(editJson[groupName].id);  //details
                //要在按下去button時能變色(get_color()) 並且為了可以刪除掉 也必須要可以抓到此button的id(get_pose())
                editGroup.innerHTML += "<button onclick='get_color(this);get_pose(this.id)' class='editListButton' id='" +
                    objId + "'> " + output + " </button>";


            }
        }
    }
}

/**
 * 讓使用者在點選該summary時會在輸入名稱的框框中直接打上名稱
 * @param {*} id 此summary的id
 */
function get_name(id){
    let name = document.getElementById(id).innerText;
    if(name.charAt(0)=="▶"){
        name = name.replace("▶ ","")
        document.getElementById(id).children[0].innerHTML = "▼ "+name;
    }
    else{
        name = name.replace("▼ ","")
        document.getElementById(id).children[0].innerHTML = "▶ "+name;
    }
    name = name.replace("▼ ","").replace("▶ ","")
    if(name!="Untitled"){
        document.getElementById("inputSpecialTitle").value = name;
    }
    else{
        document.getElementById("inputSpecialTitle").value = "";
    }
    
}

/**
 * 按editList的按紐會抓到他們的button id  
 * 或者 按details包的summary會抓到他的summary id  
 * 為了之後刪除用 要能抓到他們的id
 */
function get_pose(id) {
    selectedPartId = id;
}

/**
 * (fileLoad.js呼叫的) JSON檔載入時 需要特別先把上一個檔案的資料清空  
 * 進入uploadEditData()再重新建立details 把相對應按紐建立在此details裡
 */
function setInitEditGroup() { 
    editJson = {};
    groupSequence = [];
}


/**
 * 把時間轉換成給使用者看的形式
 */
function calculateEditorTime(time) { 
    let minString = "00"; //預設分鐘數為顯示成00
    let secString;
    if (Math.floor(time) >= 60) {                 //時間到分鐘(>=60秒) Math.floor() -> 小於等於所給數字的最大整數
        if ((Math.floor(time)) / 60 < 10) {       //時間小於10分 分數位前面要顯示一個0
            minString = "0" + Math.floor(time / 60);        //分數位呈現出 0x : 這種形式
            if (Math.floor(time) % 60 < 10) {
                secString = "0" + (time % 60).toFixed(2);   //秒數位呈現出 : 0x.xx這種形式
            } else {
                secString = (time % 60).toFixed(2);         //秒數位呈現出 : xx.xx這種形式
            }
        } else {
            minString = Math.floor(time / 60);              //分數位呈現出 xx : 這種形式
            if (Math.floor(time) % 60 < 10) {
                secString = "0" + (time % 60).toFixed(2);   //秒數位呈現出 : 0x.xx這種形式
            } else {
                secString = (time % 60).toFixed(2);         //秒數位呈現出 : xx.xx這種形式
            }
        }
    } else { //只有到秒
        if (Math.floor(time) < 10) {        //時間小於10秒 秒數位前面要顯示一個0
            secString = "0" + time;         //呈現出 : 0x.xx這種形式
        } else {
            secString = time;               //呈現出 : xx.xx這種形式
        }
    }
    return minString + " : " + secString;
}