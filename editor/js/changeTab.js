

/**
 * 用listPlaceFlag來判斷從哪裡的  
 * listPlaceFlag 0 -> 從fileList來的  
 * listPlaceFlag 1 -> 從editList來的  
 * listPlaceFlag 2 -> 從soundList來的  
 */
let listPlaceFlag = 0;

/**
 * 預設值為-1  
 * 之後會用來記錄目前按下的按鈕物件
 */
let filePressBtn = -1;
let editPressBtn = -1;
let soundPressBtn = -1;

/**
 * 切換到soundList
 */
function changeToSound() {
    if (listPlaceFlag == 0) {  
        /**
         * 切到soundList的時候 如果剛剛是從fileList過來的
         * 要先記錄fileList目前按下的那個按鈕物件 為了切回去讓按鈕重新上色用
         */
        filePressBtn = bPre; 
    } else if (listPlaceFlag == 1) {
        /**
         * 切到soundList的時候 如果剛剛是從editList過來的
         * 要先記錄editList目前按下的那個按鈕物件 為了切回去讓按鈕重新上色用
         */
        editPressBtn = bPre; 
    }

    listPlaceFlag = 2;

    let fileBoxColor1 = document.querySelector('.listOuterFrame');
    fileBoxColor1.style.backgroundColor = "#A3A3A3"; //soundList的外框顏色在每個主題下都是固定

    let fileBox3 = document.querySelector('.fileListWhitePart');
    fileBox3.style.display = "none";

    let fileBox23 = document.querySelector('.editListWhitePart');
    fileBox23.style.display = "none";

    let fileBox33 = document.querySelector('.soundListWhitePart');
    fileBox33.style.display = "flex";

    if (soundPressBtn != -1) {
        /**
         * 如果切回到現在soundList這   
         * 之前有記錄到目前按下的soundList按鈕物件的話   
         * 就會讓soundList之前選取的那個檔案按鈕重新上色     
         */
        get_color(soundPressBtn); 
    }


}

/**
 * 切換到editList
 */
function changeToEdit() {

    if (listPlaceFlag == 0) {
        /**
         * 切到editList的時候 如果剛剛是從fileList過來的
         * 要先記錄fileList目前按下的那個按鈕物件 為了切回去讓按鈕重新上色用
         */
        filePressBtn = bPre;
    } 
    else if (listPlaceFlag == 2) {
        /**
         * 切到editList的時候 如果剛剛是從soundList過來的
         * 要先記錄soundList目前按下的那個按鈕物件 為了切回去讓按鈕重新上色用
         */
        soundPressBtn = bPre;
    }
    listPlaceFlag = 1;

    let fileBoxColor1 = document.querySelector('.listOuterFrame');
    fileBoxColor1.style.backgroundColor = "rgb(157, 173, 194)"; //editList的顏色在每個主題下都是固定

    let fileBox3 = document.querySelector('.fileListWhitePart');
    fileBox3.style.display = "none";

    let fileBox23 = document.querySelector('.editListWhitePart');
    fileBox23.style.display = "flex";

    let fileBox33 = document.querySelector('.soundListWhitePart');
    fileBox33.style.display = "none";

    if (editPressBtn != -1) {
        /**
         * 如果切回到現在editList這   
         * 之前有記錄到目前按下的editList按鈕物件的話   
         * 就會讓editList之前選取的那個檔案按鈕重新上色     
         */
        get_color(editPressBtn); 
    }
}

/**
 * 切換到fileList
 */
function changeToFile() {
    if (listPlaceFlag == 1) {
        /**
         * 切到fileList的時候 如果剛剛是從editList過來的
         * 要先記錄editList目前按下的那個按鈕物件 為了切回去讓按鈕重新上色用
         */
        editPressBtn = bPre;
    } else if (listPlaceFlag == 2) {
        /**
         * 切到fileList的時候 如果剛剛是從soundList過來的
         * 要先記錄soundList目前按下的那個按鈕物件 為了切回去讓按鈕重新上色用
         */
        soundPressBtn = bPre;
    }
    listPlaceFlag = 0;

    if (fileColor != undefined) {
        let fileBoxColor1 = document.querySelector('.listOuterFrame');
        fileBoxColor1.style.backgroundColor = fileColor; //fileList 的顏色要照各種主題顏色來定
    } else {
        let fileBoxColor1 = document.querySelector('.listOuterFrame');
        fileBoxColor1.style.backgroundColor = "#E6D8BB"; //預設主題的fileList外框顏色(黃色)
    }
    let fileBox3 = document.querySelector('.fileListWhitePart');
    fileBox3.style.display = "flex";

    let fileBox23 = document.querySelector('.editListWhitePart');
    fileBox23.style.display = "none";

    let fileBox33 = document.querySelector('.soundListWhitePart');
    fileBox33.style.display = "none";

    if (filePressBtn != -1) {
        /**
         * 如果切回到現在fileList這   
         * 之前有記錄到目前按下的fileList按鈕物件的話   
         * 就會讓fileList之前選取的那個檔案按鈕重新上色     
         */
        get_color(filePressBtn); 
    }
}

