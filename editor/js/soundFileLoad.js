const soundLoader = document.getElementById("soundLoader");

let soundFileSelectedId; //目前按下的按鈕的row id 及 soundsArr中此按鈕對應音檔的id

/**
 * 記錄各個JSON檔的音檔資料
 * key -> json檔名稱   value -> soundsArr -> 此json檔的array(用來放各個音檔的)
 */
const soundFileMap = new Map();

/**
 * 目前選取的json檔的array(用來放各個音檔的)
 */
let soundsArr = [];

/**
 * 切換該音檔的音量是否靜音
 * @param {*} checked 該音檔的勾選狀態
 * @param {*} id 該checkbox的id
 */
function changeCheckbox(checked, id) {
    //藉由checkbox的id來取得音檔的id
    id = id.replace("checkbox_", "")

    //有勾選的 -> 不是靜音
    if (checked == true) {
        let index = soundsArr.findIndex((sound => sound.id == id))
        soundsArr[index].audio.volume = soundsArr[index].volume;
    }
    //沒有勾選的 -> 靜音
    else {
        let index = soundsArr.findIndex((sound => sound.id == id))
        soundsArr[index].audio.volume = 0;
    }
}

/**
 * 建立該音檔的音量調整bar
 * @param {*} id 為該音檔的id
 */
function setVolumeInput(id) {
    const volumeInput = document.getElementById(`volume_${id}`);

    //拖拉滑桿的時候觸發
    volumeInput.oninput = (e) => {
        change(e.target.value);
    };
    volumeInput.onchange = (e) => {
        change(e.target.value);
    };

    /**
     * 調整音量
     * @param {*} value 音量大小
     */
    function change(value) {
        //找出該音檔資料
        let index = soundsArr.findIndex((sound => sound.id == id))
        const sound = soundsArr[index];

        //調整音量
        sound.volume = value;

        //更新Map資料
        soundFileMap.set(arrayName[nowIndex], soundsArr);

        //有勾選的才需要調整播放器的音量
        const soundCheckbox = document.getElementById(`checkbox_${id}`);
        if (soundCheckbox.checked == true) {
            sound.audio.volume = value;
        }

        //代表有做過編輯，編輯過的檔案變紅燈
        turnRed();
    }
}

//暫停所有音檔聲音 並讓聲音時間歸零  stop & end & 要進入loop第二輪之前的時候會進來
function endFilesSound() {
    for (const sound of soundsArr) {
        sound.audio.pause();
        sound.audio.currentTime = 0; //時間歸零
    }
}



//播放出所有音檔聲音 
function playFilesSound() {
    for (const sound of soundsArr) {
        sound.audio.play();
    }
}


//暫停所有音檔聲音 
function pauseFilesSound() {
    for (const sound of soundsArr) {
        if (!sound.audio.paused) { //正在播放
            sound.audio.pause();
        }
    }
}


//繼續播放所有音檔聲音 
function resumeFilesSound() {
    for (const sound of soundsArr) {
        //當已經播放過了
        if (sound.audio.currentTime > 0 && sound.audio.currentTime < sound.audio.duration) {
            sound.audio.play();
        }
    }
}


//往前五秒或往後五秒
function setSoundFilesTime(time) {
    for (const sound of soundsArr) {
        sound.audio.currentTime = time; //time是已經調整過的往後五秒或往前五秒的那個時間

        //pause的情況 不能直接幫他開始播放
        if (newBeginStatus == 0 && playStatus == 0 && endStatus == 0) {
            return;
        }
        //end的情況 而且是按往後五秒的狀況  
        else if (newBeginStatus == 1 && playStatus == 0 && endStatus == 1 && sound.audio.currentTime > Math.floor(animation[animation.length - 1].time.Time)) {
            return;
        }
        //如果現在音檔按完 往後五秒/往前五秒的時間 還未超出此音檔長度才繼續播 
        //不然音檔已經播完 按了往後五秒聲音又會重頭開始播
        else if (sound.audio.currentTime < sound.audio.duration) {
            sound.audio.play();
        }
    }
}




//---------------------------------------------------------------------------

/**
 * 按下匯入音檔按鈕時  
 * 匯入檔案時觸發
 */
soundLoader.onchange = function(evt) {

    //匯入音檔前要先匯入JSON檔 並且選定某一JSON檔案 這樣才能知道這些音檔要紀錄在哪個檔案下
    //當還沒匯入過檔案時nowIndex會為undefined
    //當匯入又刪除時nowIndex會為空("")
    if (nowIndex == undefined || nowIndex === "") {
        const alertContent = document.getElementById("alertContent");
        const confirmBtn = document.getElementById("confirmBtn");

        alertContent.style.visibility = "visible";
        alertContent.innerHTML = "You need to import and select a JSON file before importing the sound file.";

        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => {
            disappearAlertPanel();
        };

        /**
         * 加此行 把input的value重新設置為空 
         * 因為用change的話若上個檔案刪掉後 再重新載入 
         * value還是一樣的 就不會載入此檔案了
         */
        soundLoader.value = null;
        return;
    }

    //可一次匯入多個音檔
    for (let i = 0; i < evt.target.files.length; i++) {
        const file = evt.target.files[i];
        const fileName = file.name;

        //當有匯入檔案
        if (soundLoader.value != null) {
            addSoundListItem(fileName, file, 1); //file(匯入音檔)本身就為blob的一種
        }
    }

    /**
     * 加此行 把input的value重新設置為空 
     * 因為用change的話若上個檔案刪掉後 再重新載入 
     * value還是一樣的 就不會載入此檔案了
     */
    soundLoader.value = null;

    //播放過程中以及暫停的時候 如果插入了新的音檔 要提醒他 此新增的音檔要在下一次從頭播放的時候才會播放
    if (newBeginStatus == 0) {
        const alertContent = document.getElementById("alertContent");
        const confirmBtn = document.getElementById("confirmBtn");

        alertContent.style.visibility = "visible";
        alertContent.innerHTML = "The newly added sound file will be played until the next time JSON file <br> is played from the beginning .";

        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => {
            disappearAlertPanel();
        };
    }
};


/**
 * 匯入外在音檔或錄完音後 要把音檔記錄下來及顯示
 * @param {*} fileName 匯入音檔名或是錄音完的音檔名
 * @param {*} audioBlob 匯入音檔或是錄音完音檔的內容(blob) 
 * @param {*} volume 匯入音檔或是錄音完音檔的音量
 */
function addSoundListItem(fileName, audioBlob, volume) {

    const randId = getRandomId(); //隨意產生id

    const url = URL.createObjectURL(audioBlob); //建立新的物件URL 代表了所指定的 blob 物件

    /*
        new Audio(url):
        The Audio() constructor creates and returns a new HTMLAudioElement, 
        a new HTMLAudioElement object, configured to be used for 
        playing back the audio from the file specified by url.
    */
    soundsArr.push({ id: randId, fileName: fileName, audio: new Audio(url), volume: volume });
    soundFileMap.set(arrayName[nowIndex], soundsArr); //key -> json檔名稱   soundsArr -> 此json檔的array(用來放各個音檔的)
    makeSoundBtn(randId, fileName, volume); //顯示匯入的音檔或是錄音完的音檔在soundList畫面上
    turnRed(); //代表有做過編輯，編輯過的檔案變紅燈

}


/**
 * @param {*} id 目前按下的按鈕的row id 及 soundsArr中此按鈕對應音檔的id
 */
function get_soundFile(id) {
    //上一次按下的summary
    const preSummary = document.getElementById(`sound_${soundFileSelectedId}`);
    if (preSummary != null) { //有preDetails才進(有可能是第一個或是上一個sound已被刪除)
        //將上一次聲音的音量調整關起來
        const preDetails = preSummary.parentElement;
        preDetails.open = false;
    }
    soundFileSelectedId = id;
}

/**
 * 點選完soundList音檔後 按下刪除音檔按鈕
 * soundFileSelectedId -> 按下的按鈕的row id = 此按鈕對應音檔的id
 */
function delSoundItem() {
    const soundRow = document.getElementById(soundFileSelectedId);
    soundRow.remove(); //把該按鈕的row移除掉

    //得到此音檔id在soundsArr中的index
    const removeIndex = soundsArr.findIndex((sound => sound.id == soundFileSelectedId));

    //此音檔被按刪除後 可以立刻停下來 不再播放出聲音
    soundsArr[removeIndex].audio.pause();
    soundsArr[removeIndex].audio.currentTime = 0;

    //此JSON file的紀錄音檔陣列移除此音檔
    soundsArr.splice(removeIndex, 1);

    turnRed(); //代表有做過編輯，編輯過的檔案變紅燈
};


/**
 * 點選任一個JSON file 會載入該JSON file相對應的所有音檔
 */
function uploadSoundData() {
    const soundList = document.getElementById("soundListBody");
    soundList.innerHTML = ""; //會先把soundList畫面清空 -> 把上一個JSON file顯示的音檔清掉

    //若Map中有記錄此JSON file對應的所有音檔 -> 找得到此JSON file相對應的soundsArr
    if (soundFileMap.get(arrayName[nowIndex])) {
        soundsArr = soundFileMap.get(arrayName[nowIndex]);

        //讓此JSON file對應的所有音檔顯示在soundList畫面上
        for (const sound of soundsArr) {
            makeSoundBtn(sound.id, sound.fileName, sound.volume);
        }
    } else { //若Map中沒有記錄此JSON file對應的所有音檔 -> 找不到此JSON file相對應的soundsArr
        //把目前soundsArr清空掉 此soundsArr中還記錄著上一個JSON file的各個音檔 要避免掉裡面舊的音檔繼續播放出聲音
        soundsArr = [];
    }
}

/**
 * 顯示出該JSON file對應的音檔在soundList上
 * @param {*} id 此音檔的id
 * @param {*} fileName 此音檔的檔名
 * @param {*} volume 此音檔紀錄的音量
 */
function makeSoundBtn(id, fileName, volume) {
    const soundList = document.getElementById("soundListBody");
    const row = soundList.insertRow(-1); //新增table的row
    const sound = row.insertCell(0); //新增row的cell
    row.id = id;

    sound.innerHTML = `
    <details>
        <summary class='soundButton' title='${ fileName }' id='sound_${id}'>
                <div class='buttonText' ondblclick='changeSoundName(this)'>${ fileName }</div>
                <div class='soundButtonDiv'>
                    <input checked='' name='checkbox_${id}' type='checkbox' id='checkbox_${id}' class='soundButtonCheckBox' onclick='changeCheckbox(this.checked,this.id)'>
                    <label for='checkbox_${id}' class='cbx'></label>
                </div>
        </summary>
        <div class="volumeDiv">
            <label name='volume_${id}'>volume</label>
            <input id='volume_${id}' type='range' for='volume_${id}' step='0.01' value='${volume}' max='1'>
        </div>
    </details>
    `
    const soundBtn = document.getElementById("sound_" + id)

    soundBtn.onclick = () => { //soundList上的按鈕
        get_color(soundBtn); //按鈕按下及滑過的顏色反應
        get_soundFile(id); //用一變數(soundFileSelectedId)來記錄現在目前的id -> 按下的按鈕的row id 及 soundsArr中此按鈕對應音檔的id
    }
    setVolumeInput(id);
}


function changeSoundName(element) {
    let oldhtml = element.innerHTML;
    //如果已經雙擊過，內容已經存在input，不做任何操作
    if (oldhtml.indexOf('type="text"') > 0) {
        return;
    }
    //創建新的input元素
    let soundNameInput = document.createElement('input');
    //為新增元素添加類型
    soundNameInput.type = 'text';
    //為新增元素添加value值
    soundNameInput.value = oldhtml;
    //為新增元素添加鼠標離開事件
    soundNameInput.onblur = function() {
            //當觸發時判斷新增元素值是否為空，為空則不修改，並返回原有值
            if (this.value && this.value.trim() !== "") {
                element.innerHTML = this.value == oldhtml ? oldhtml : this.value;
            } else {
                element.innerHTML = oldhtml;
            }

            const renameIndex = soundsArr.findIndex((sound => sound.id == soundFileSelectedId));
            soundsArr[renameIndex].fileName = element.innerText;
            soundFileMap.set(arrayName[nowIndex], soundsArr); //key -> json檔名稱   soundsArr -> 此json檔的array(用來放各個音檔的)
        }
        //設置該標籤內容為空
    element.innerHTML = '';
    //添加input至該標籤中
    element.appendChild(soundNameInput);
    //選取輸入欄內所有文字
    soundNameInput.setSelectionRange(0, oldhtml.length);
    //點擊輸入欄效果
    soundNameInput.focus();

}



/**
 * 若直接把該JSON file刪除掉 也會把soundFileMap中該file及該file對應的音檔刪除掉   
 * 下次重新匯入此JSON file 會再藉由JSON裡面紀錄的音檔內容來重新set進Map裡
 */
function deleteSoundFiles() {
    endFilesSound(); //JSON刪掉的時候 要把他的所有聲音都關掉
    soundFileMap.delete(arrayName[nowIndex]); //刪除Map中的音檔資料
}

/**
 * 點選任一soundList上的音檔 按匯出MP3按鈕後
 */
function exportMP3() {
    //得到目前按下按鈕對應的音檔之id在soundsArr中的index
    const exportIndex = soundsArr.findIndex((sound => sound.id == soundFileSelectedId));
    if (exportIndex == -1) { //代表尚未按下soundList上的音檔
        const alertContent = document.getElementById("alertContent");
        const confirmBtn = document.getElementById("confirmBtn");

        alertContent.style.visibility = "visible";
        alertContent.innerHTML = "You need to click the sound file before exporting it.";

        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => {
            disappearAlertPanel();
        };
        return; //不往下做
    }

    let link = document.createElement("a");
    document.body.appendChild(link);
    link.href = soundsArr[exportIndex].audio.src; //audio.src為此音檔的URL
    link.download = soundsArr[exportIndex].fileName.replace(".mp3","")+".mp3";
    // 手動 click -> 按下按鈕後 手動幫按link 讓音檔匯出
    link.click();

}