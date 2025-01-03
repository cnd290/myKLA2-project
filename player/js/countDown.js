/**
 * 右側顯示框
 */
let actionNameTextDiv = document.querySelector("#actionNameText");
/**
 * 倒數三秒計時器
 */
let timer;
/**
 * 倒數的秒數
 */
let num;
/**
 * 判斷是否偵測到使用者
 */
let undetected = false;
/**
 * VRM框框中的文字區塊(用來倒數及顯示分數)
 */
let numDiv = document.querySelector("#num");
/**
 * 儲存被標註的部位
 */
let standardBodyPart;

//go的動畫(一閃一閃)
actionNameText.className = "go";
defaultAnimation()

/**
 * 啟動倒數
 */
function countDown() {
    //還原秒數
    num = 3;

    // 初始化
    init();

    // 倒數3,2,1(實際為每0.666秒倒數一秒)
    timer = setInterval(count, 666); //2000/3
}

// 初始化
async function init() {
    //顯示倒數數字
    numDiv.style.display = "block";
    numDiv.innerHTML = num;
    numDiv.style.fontSize = "3vw";
    numDiv.className = "number-anim";

    //倒數321時 不出現go動畫(動畫為淡入淡出) 為了要好好顯示出動作名稱(不閃)
    actionNameText.className = "";           

    //取得標記的身體部位及動作名稱
    let [actionNameList, standardPart] = await getActionName();

    //顯示動畫名稱至右上顯示框
    showActionName(actionNameList);

    //將標記的身體部位記下以方便算分數
    standardBodyPart = standardPart;
}

/**
 * 倒數三秒時的function
 * 當秒數等於0時會計算分數
 * 其餘則會顯示倒數秒數
 */
async function count() {
    
    num-=1 //秒數減一
    if(num > 0){
        numDiv.innerHTML = num //顯示秒數
    }
    let finalScore = 0; //最後成績

    if (num == 0) {
        let scoreList = await findSpecialPart(standardBodyPart); //當下這一幀的所有分數的陣列

        //求這一幀的平均分數
        for (let a = 0; a < scoreList.length; a++) {
            finalScore += scoreList[a];
        }
        finalScore = finalScore / scoreList.length

        //停止倒數
        stopCountDown();

        //將當下這一幀的分數給予評語並顯示
        if (finalScore > 2.5) {
            numDiv.innerHTML = "Excellent";
        } else if (finalScore > 1.5 && finalScore <= 2.5) {
            numDiv.innerHTML = "Good";
        } else if (finalScore > 0.5 && finalScore <= 1.5) {
            numDiv.innerHTML = "OK";
        } else if (finalScore <= 0.5) {
            numDiv.innerHTML = "Bad";
        }
        numDiv.style.fontSize = "3vw";
       
        //顯示完評語的一秒後會進行
        setTimeout(() => {
            //判斷是否有偵測到使用者並做出對應措施
            if (undetected) {
                undetectedAnimation();
            } else {
                defaultAnimation();
            }
            //將顯示倒數及評語的該element消失看不到
            numDiv.style.display = "none";
            numDiv.className = ""; //清掉321的動畫
        }, 1000);
    }
}

/**
 * 此function為go的預設動畫
 */
function defaultAnimation() {
    actionNameText.className = "go";
    actionNameText.style.fontSize = "60px";
    actionNameText.innerHTML = "Go~";
}

/**
 * 停止倒數->(三秒後偵測使用者動作)
 */
function stopCountDown() {
    if (timer != undefined) {
        clearInterval(timer);
    }
}

/**
 * 為了在該幀當下顯示動作名稱在顯示框中
 * 且將該幀中有special的部位記下以方便傳去其他function計算分數
 * @returns [存放該幀中有標註的動作名稱的陣列,存放該幀中有標註special的身體部位]
 */
function getActionName(){
    return new Promise(async(resolve) => {
        /**
         * 存放該幀中有標註的動作名稱的陣列
         */
        let actionNameList = [];
        /**
         * 存放該幀中有標註special的身體部位
         */
        let standardPart = [];

        //所有身體部位
        const bodyPart = [
            "eye", "mouth", "neck", "spine", "rightHand", "leftHand",
            "rightUpperArm", "rightLowerArm", "leftUpperArm", "leftLowerArm",
            "rightUpperLeg", "rightLowerLeg", "leftUpperLeg", "leftLowerLeg",
            "rightThumb", "rightIndex", "rightMiddle", "rightRing", "rightLittle",
            "leftThumb", "leftIndex", "leftMiddle", "leftRing", "leftLittle"
        ];
        //現在執行的幀數 (-1是因為frame在執行當下會先+1)
        const recentFrame = animation[frame - 1]; 
        //檢查哪些部位的special為true
        for (let j = 0; j < bodyPart.length; j++) {
            if (recentFrame[bodyPart[j]].special == true) {
                standardPart.push(bodyPart[j]); //將此幀有做標記的部位push進陣列中

                if(recentFrame[bodyPart[j]].descriptText != ""){//當該註記動作有名稱時
                    let index = actionNameList.indexOf(recentFrame[bodyPart[j]].descriptText); //檢查名稱陣列中是否已有該名稱
                    //如果沒找到陣列中此動作名稱的index index會回傳-1 
                    //以確保每個動作名稱只會出現一次(不可同時間出現兩次同樣名稱在player框框顯示)
                    if(index==-1){ 
                        actionNameList.push(recentFrame[bodyPart[j]].descriptText);
                    }
                }
            }
        }
        resolve([actionNameList, standardPart]);
    })
}

/**
 * 將該幀中有標註的動作名稱顯示在右上框框中
 * @param {*} actionNameList 存放該幀中有標註的動作名稱的陣列
 */
function showActionName(actionNameList){
    if(actionNameList.length != 0){     //當有名稱時
        actionNameText.className = "";       //倒數321時 不出現go動畫(動畫為淡入淡出) 為了要好好顯示出動作名稱(不閃)
        actionNameText.innerHTML = "";       //不顯示Go的字
        let fontSize = 3.6
        //顯示該幀所有動作名稱
        for(let actionName = 0; actionName < actionNameList.length; actionName++){
            actionNameText.innerHTML += actionNameList[actionName];
            actionNameText.innerHTML += "<br/>";
            fontSize -= 0.3
        }
        actionNameText.style.fontSize = toString(fontSize)+"vw";
    }
}