/**
 * 儲存使用者肩膀Z位置的陣列   
 * (由於偵測距離誤差大，所以每10次求其平均值來判斷使用者距離)
 */
 let userZList = [];

/**
 * 初始為0  
 * 按下play按鈕後變成3，接著會顯示提示字提醒使用者要站好  
 * 三秒過後提示字會消失，且變為0  
 * 當使用者距離符合時會變為1  
 * 變1之後會馬上變成2並開始倒數，之後開始播放動畫
 */
 let userZFlag = 0;
 let recordTimer;//用來倒數3,2,1 (三秒後開始播放動畫)
 let recordCountDown = 3;//現在倒數的秒數(3=>2=>1)

function userZDistance(userShoulderZ){
    if (userZFlag == 1) {
        userZFlag = 2;
        //秒數還原
        recordCountDown = 3
        //倒數三秒開始播放動畫
        recordTimer = setInterval(recordCD, 1000);
    } else if (endStatus == 0 && playStatus == 1 && userZFlag == 0 && flaggg == 1) {
        //提示字(提醒使用者站好)消失
        disappearAlertPanel();
        //顯示使用者距離過近或過遠
        const alertContent = document.getElementById("alertContent");
        alertContent.style.visibility = "visible";
        getUserPositionZ(userShoulderZ);
    } else if (userZFlag == 3 && flaggg == 0) {
        flaggg = 1
        //顯示提示字
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        alertContent.style.visibility = "visible";
        alertContent.innerHTML = "Please stand properly and do not do other actions when detecting the distance."
        //三秒過後提示字消失
        setTimeout(() => {
            userZFlag = 0;
            disappearAlertPanel();
        }, "3000")
    }
}

/**
 * 偵測使用者Z位置
 * @param {*} userShoulderZ 使用者兩肩膀Z位置的平均值
 */
function getUserPositionZ(userShoulderZ) {
    const alertContent = document.getElementById("alertContent");

    if (userZList.length == 10) {
        //取平均
        let avgZ = 0;
        for (let indexZ = 0; indexZ < userZList.length; indexZ++) {
            avgZ += userZList[indexZ];
        }
        avgZ /= 10

        //判斷是否符合距離選項
        if (nowData.userPositionZ == "medium") {
            if (avgZ < -0.17) { //距離太近
                alertContent.innerHTML = "You're too close to the camera, please move backward.";
                showBigText("Move<br>Backward");
            } else if (avgZ > -0.13) { //距離太遠
                alertContent.innerHTML = "You're too far from the camera, please move forward.";
                showBigText("Move<br>Forward");
            } else { //距離適當
                alertContent.innerHTML = "Good !";
                userZFlag = 1;
                actionNameTextDiv.innerHTML = "";
                flaggg = 0
                defaultLoading();
            }
        } else if (nowData.userPositionZ == "short") {
            if (avgZ < -0.275) { //距離太近
                alertContent.innerHTML = "You're too close to the camera, please move backward.";
                showBigText("Move<br>Backward");
            } else if (avgZ > -0.24) { //距離太遠
                alertContent.innerHTML = "You're too far from the camera, please move forward.";
                showBigText("Move<br>Forward");
            } else { //距離適當
                alertContent.innerHTML = "Good !";
                userZFlag = 1;
                actionNameTextDiv.innerHTML = "";
                flaggg = 0
                defaultLoading();
            }
        } else if (nowData.userPositionZ == "long") {
            if (avgZ < -0.13) { //距離太近
                alertContent.innerHTML = "You're too close to the camera, please move backward.";
                showBigText("Move<br>Backward");
            } else if (avgZ > -0.1) { //距離太遠
                alertContent.innerHTML = "You're too far from the camera, please move forward.";
                showBigText("Move<br>Forward");
            } else { //距離適當
                alertContent.innerHTML = "Good !";
                userZFlag = 1;
                actionNameTextDiv.innerHTML = "";
                flaggg = 0
                defaultLoading();
            }
        } else if (nowData.userPositionZ == "extremelyShort") {
            if (avgZ < -0.33) { //距離太近
                alertContent.innerHTML = "You're too close to the camera, please move backward.";
                showBigText("Move<br>Backward");
            } else if (avgZ > -0.29) { //距離太遠
                alertContent.innerHTML = "You're too far from the camera, please move forward.";
                showBigText("Move<br>Forward");
            } else { //距離適當
                alertContent.innerHTML = "Good !";
                userZFlag = 1;
                actionNameTextDiv.innerHTML = "";
                flaggg = 0
                defaultLoading();
            }
        }
        userZList = [];
    } else {
        userZList.push(userShoulderZ);
    }
}

/**
 * 顯示倒數3,2,1  
 * 倒數至0時會開始錄製
 */
function recordCD() {
    //當開始倒數時提醒使用者會錄製使用者的影像
    if (recordCountDown == 3) {
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        alertContent.style.visibility = "visible";
        alertContent.innerHTML = "When the animation start playing, it'll also start recording your actions."
        //兩秒後提醒使用者會錄製使用者的影像的字消失
        setTimeout(() => {
            userZFlag = 0;
            disappearAlertPanel();
        }, "2000")
    }
    //倒數三秒完後開始播放動畫
    if (recordCountDown == 0) {
        execute();
        //停止倒數
        clearInterval(recordTimer);
        //還原秒數
        recordCountDown = 3
        disappearAlertPanel();
        actionNameTextDiv.innerHTML = "Go~";
    } else {
        actionNameTextDiv.innerHTML = recordCountDown;
    }
    recordCountDown = recordCountDown - 1;
}