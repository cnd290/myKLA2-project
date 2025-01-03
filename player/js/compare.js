/**
 * 此陣列是為了用於顯示在scoreList上每種評分的數量  
 * 用來存有部位有特殊標記的每一幀的每一部位的分數
 */
let allScoreList = []; 
/**
 * 此function主要為計算當下那一幀的各部位分數
 * @param {*} standardPart 紀錄被標註的身體部位的陣列
 * @returns 存放該幀的所有分數的陣列
 */
function findSpecialPart(standardPart) {
    return new Promise(async(resolve) => {
        let scoreList = []; //為每一special幀用來紀錄每個special部位的分數 跑下一special幀時會清空

        // 偵測點資料
        const pose = getPoseResult();
        const rightHand = getRightHandResult();
        const leftHand = getLeftHandResult();
        const face = getFaceResult();

        const recentFrame = animation[frame - 1]; //現在執行的幀數 (-1是因為frame在執行當下會先+1)
        let showEditTime = calculateShowEditTime(recentFrame.editorTime.toFixed(2));//標記時間(為了在最後顯示成績資料時顯示)

        //將此幀中有標註special的部位都跑過
        for (let j = 0; j < standardPart.length; j++) {
            let partScore;//此幀中有標註special的部位的成績
            let standard = recentFrame[standardPart[j]]; //為此幀此部位紀錄在JSON檔裡的各方向旋轉角度數值
            //判斷為哪部位並進行算分
            switch (standardPart[j]) {
                case 'eye':
                    const tfFace = await getTfFaceResult();
                    partScore = await compareEye(tfFace, standard);
                    break;
                case 'mouth':
                    partScore = await compareMouth(face, standard);
                    break;
                case 'neck':
                    partScore = await compareHead(face, standard);
                    break;
                case 'spine':
                    partScore = await compareSpine(pose, standard);
                    break;
                case 'rightUpperArm':
                    partScore = await compareArm(1, "upper", pose, rightHand, standard);
                    break;
                case 'rightLowerArm':
                    partScore = await compareArm(1, "lower", pose, rightHand, standard);
                    break;
                case 'leftUpperArm':
                    partScore = await compareArm(-1, "upper", pose, leftHand, standard);
                    break;
                case 'leftLowerArm':
                    partScore = await compareArm(-1, "lower", pose, leftHand, standard);
                    break;
                case 'rightHand':
                    partScore = await compareHand(1, pose, rightHand, standard);
                    break;
                case 'leftHand':
                    partScore = await compareHand(-1, pose, leftHand, standard);
                    break;
                case "rightUpperLeg":
                    partScore = await compareLeg("right", "upper", pose, standard);
                    break;
                case "leftUpperLeg":
                    partScore = await compareLeg("left", "upper", pose, standard);
                    break;
                case "rightLowerLeg":
                    partScore = await compareLeg("right", "lower", pose, standard);
                    break;
                case "leftLowerLeg":
                    partScore = await compareLeg("left", "lower", pose, standard);
                    break;
                case "rightThumb":
                    partScore = await compareFinger("right", 0, rightHand, standard);
                    break;
                case "rightIndex":
                    partScore = await compareFinger("right", 1, rightHand, standard);
                    break;
                case "rightMiddle":
                    partScore = await compareFinger("right", 2, rightHand, standard);
                    break;
                case "rightRing":
                    partScore = await compareFinger("right", 3, rightHand, standard);
                    break;
                case "rightLittle":
                    partScore = await compareFinger("right", 4, rightHand, standard);
                    break;

                case "leftThumb":
                    partScore = await compareFinger("left", 0, leftHand, standard);
                    break;
                case "leftIndex":
                    partScore = await compareFinger("left", 1, leftHand, standard);
                    break;
                case "leftMiddle":
                    partScore = await compareFinger("left", 2, leftHand, standard);
                    break;
                case "leftRing":
                    partScore = await compareFinger("left", 3, leftHand, standard);
                    break;
                case "leftLittle":
                    partScore = await compareFinger("left", 4, leftHand, standard);
                    break;
            }
            //將該成績紀錄下來
            scoreList.push(partScore);
            allScoreList.push(partScore);

            /**
             * resultTableBodyPart是為了顯示在最後resultTable上的部位名稱 要顯示成使用者的方向
             */
            let resultTableBodyPart = standardPart[j];
            //將左右換邊
            if (standardPart[j].charAt(0) == 'l') {
                resultTableBodyPart = standardPart[j].replace("left", "right");
            } else if (standardPart[j].charAt(0) == 'r') {
                resultTableBodyPart = standardPart[j].replace("right", "left");
            }

            /**
             * [編輯時間,編輯部位,動作成績]
             */
            let scoreDetails = [showEditTime, resultTableBodyPart, partScore]
            
            //將成績細部資料記錄至Map中
            if (recentFrame[standardPart[j]].descriptText != "") {
                editJson[recentFrame[standardPart[j]].descriptText].arr.push(scoreDetails); //arr是為了顯示每一筆的資料在result table
            } else {
                editJson["Untitled"].arr.push(scoreDetails);
            }

        }
        resolve(scoreList);
    })
}



/**
 * 把時間轉換成給使用者看的形式
 */
 function calculateShowEditTime(time) { 
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