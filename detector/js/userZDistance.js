/**
 * 儲存使用者肩膀Z位置的陣列   
 * (由於偵測距離誤差大，所以每10次求其平均值來判斷使用者距離)
 */
let userZList = [];

/**
 * 初始為0  
 * 1:啟動倒數3,2,1,變成 2  
 * 2:表示錄製中  
 * (錄製前)當使用者距離在適當範圍內時，變成 1    
 * 錄製結束時,變回初始值 0   
 */
let userZFlag = 0;

let recordTimer; //用來倒數3,2,1
let recordCountDown = 3; //現在倒數的秒數(3=>2=>1)

function userZDistance(userShoulderZ) {
    if (userZFlag == 1) {

        //啟動倒數3,2,1
        //顯示 loading spinner 中間的文字
        document.getElementById("loading").style.display = "flex";
        document.getElementById("loading").style.opacity = 1;
        document.querySelector(".message").style.display = "block";
        document.getElementById("message").innerHTML = "";
        document.getElementById("message").style.opacity = 1;
        document.getElementById("spinner").style.opacity = 0;

        userZFlag = 2
        recordCountDown = 3
        recordTimer = setInterval(recordCD, 1000);
    }
    if (document.getElementById("stopBtn").disabled == false && userZFlag == 0) { //按下錄製按鈕後錄製按鈕會disable
        document.getElementById("distance1").disabled = true;
        document.getElementById("distance2").disabled = true;
        document.getElementById("distance3").disabled = true;

        getUserPositionZ(userShoulderZ);
    } else if (document.getElementById("stopBtn").disabled == true) { //按下停止按鈕後停止按鈕會disable
        document.getElementById("alertPanel").innerHTML = "Please stand properly and do not do other actions when detecting the distance.";
    }
}


/**
 * 顯示倒數3,2,1  
 * 倒數至0時會開始錄製
 */
function recordCD() {

    if (recordCountDown == 0) {

        record(); //開始錄製JSON

        clearInterval(recordTimer); //停止倒數

        recordCountDown = 3

        defaultLoading();

    } else {

        //顯示並放大倒數的數字
        document.getElementById("message").style.fontSize = "100px";
        document.getElementById("message").innerHTML = recordCountDown;

    }
    recordCountDown = recordCountDown - 1; //數字倒數
}


/**
 * 偵測使用者Z位置
 * @param {*} userShoulderZ 使用者兩肩膀Z位置的平均值
 */
function getUserPositionZ(userShoulderZ) {

    if (userZList.length == 15) {

        //取平均
        let avgZ = 0;
        for (let indexZ = 0; indexZ < userZList.length; indexZ++) {
            avgZ += userZList[indexZ];
        }
        avgZ /= 15

        //判斷是否符合距離選項
        if (document.getElementById("distance1").checked == true) {//short
            if (avgZ < -0.275) { //距離太近
                showBigText("Move<br>backward")
                document.getElementById("alertPanel").innerHTML = "You're too close to the camera, please move backward.";
            } else if (avgZ > -0.24) { //距離太遠
                showBigText("Move<br>forward")
                document.getElementById("alertPanel").innerHTML = "You're too far from the camera, please move forward.";
            } else { //距離適當
                document.getElementById("alertPanel").innerHTML = "Good";
                userZFlag = 1;
            }
        }
        else if (document.getElementById("distance2").checked == true) {//medium
            if (avgZ < -0.17) { //距離太近
                showBigText("Move<br>backward")
                document.getElementById("alertPanel").innerHTML = "You're too close to the camera, please move backward.";
            } else if (avgZ > -0.13) { //距離太遠
                showBigText("Move<br>forward")
                document.getElementById("alertPanel").innerHTML = "You're too far from the camera, please move forward.";
            } else { //距離適當
                document.getElementById("alertPanel").innerHTML = "Good";
                userZFlag = 1;
            }
        } 
        else if (document.getElementById("distance3").checked == true) {//long
            if (avgZ < -0.13) { //距離太近
                showBigText("Move<br>backward")
                document.getElementById("alertPanel").innerHTML = "You're too close to the camera, please move backward.";
            } else if (avgZ > -0.1) { //距離太遠
                showBigText("Move<br>forward")
                document.getElementById("alertPanel").innerHTML = "You're too far from the camera, please move forward.";
            } else { //距離適當
                document.getElementById("alertPanel").innerHTML = "Good";
                userZFlag = 1;
            }
        }
        else if (document.getElementById("distance4").checked == true) {//extremely short 
            if (avgZ < -0.33) { //距離太近
                showBigText("Move<br>backward")
                document.getElementById("alertPanel").innerHTML = "You're too close to the camera, please move backward.";
            } else if (avgZ > -0.29) { //距離太遠
                showBigText("Move<br>forward")
                document.getElementById("alertPanel").innerHTML = "You're too far from the camera, please move forward.";
            } else { //距離適當
                document.getElementById("alertPanel").innerHTML = "Good";
                userZFlag = 1;
            }
        }
        userZList = [];
    } else {
        userZList.push(userShoulderZ);
    }
}

/**
 * 在Loading Spinner顯示放大的文字 (無Spinner框)
 * @param {*} text 文字內容
 */
function showBigText(text) {
    document.getElementById("loading").style.display = "flex";
    document.getElementById("loading").style.opacity = 1;
    document.getElementById("spinner").style.opacity = 0;
    document.querySelector(".message").style.display = "block";
    document.getElementById("message").innerHTML = text;
    document.getElementById("message").style.fontSize = "70px"
}

/**
 * Loading Spinner 預設文字與樣式
 */
function defaultLoading() {
    document.getElementById("message").innerHTML = "Loading";
    document.getElementById("loading").style.display = "none";
    document.getElementById("loading").style.opacity = 0;
    document.getElementById("message").style.fontSize = "x-large";
    document.getElementById("alertPanel").innerHTML = "";
}