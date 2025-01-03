// 記錄旋轉角度
let handRotation = {
    rightHandZ: 0,
    leftHandZ: 0
};

// 由mediapipe.js呼叫
// result為所有偵測資料，mult用來判斷左右邊
// mult等於一代表VRM的右邊、使用者的左邊、程式碼中寫right的部分，反之則為另一邊
function handDetection(results, mult) {

    const leftElbow = results.poseLandmarks[13];
    //變數需先宣告，如果在下方if才宣告，若未跑進下方if時會出現錯誤(找不到變數)
    let leftWrist;
    let leftMidFin;
    let leftThumb;
    let leftLittleFin;

    if (results.leftHandLandmarks != undefined) {
        leftWrist = results.leftHandLandmarks[0];
        leftMidFin = results.leftHandLandmarks[9]
        leftThumb = results.leftHandLandmarks[2];
        leftLittleFin = results.leftHandLandmarks[17];
    }


    const rightElbow = results.poseLandmarks[14];
    let rightWrist; //這邊程式碼wrist的部分是連過去handpose
    let rightMidFin;
    let rightThumb;
    let rightLittleFin;

    if (results.rightHandLandmarks != undefined) {
        rightWrist = results.rightHandLandmarks[0]; //這邊程式碼wrist的部分是連過去handpose
        rightMidFin = results.rightHandLandmarks[9];
        rightThumb = results.rightHandLandmarks[2];
        rightLittleFin = results.rightHandLandmarks[17];
    }
    const hand = [
        [rightElbow, rightWrist, rightMidFin, rightThumb, rightLittleFin],
        [leftElbow, leftWrist, leftMidFin, leftThumb, leftLittleFin]
    ];

    if (mult == 1) {
        moveHand(hand[0], mult)
    } else if (mult == -1) {
        moveHand(hand[1], mult)
    }
}

/**
 * 計算手臂旋轉角度
 * wrist的正負 : 朝手掌方向彎為負，朝手背方向彎為正
 * @param {*} hand 該手臂的值 0:手肘 1:手腕 2:中指 3:大拇指 4:小指 
 * @param {*} mult 加權值  1:vrm右手 -1:vrm左手
 */
function moveHand(hand, mult) {
    // 若沒偵測到就不往下做
    if (hand[0] == undefined || hand[1] == undefined || hand[2] == undefined) {
        return;
    }

    // pointToVec = new THREE.Vector3 -> 都是將偵測點的資料轉為Vector3的形式，差別為pointToVec只須給部位就會將該部位的XYZ變成Vector3的形式，反之則需要給三個值才可轉成Vector3的形式
    // getAngle 需要以Vector3形式才可計算
    let elbowVec = pointToVec(hand[0]);
    let wristVec = pointToVec(hand[1]);
    let midFinVec = pointToVec(hand[2]);

    let handZ = getAngle(midFinVec, wristVec, elbowVec); // 求三點夾角
    handZ = (Math.PI - handZ - 0.8) * 2; //手腕轉動角度為 180度 - (中指 手腕 手肘夾的角度)，*2 -> 幅度大一點

    if ((hand[3].x > hand[1].x) * mult) { // 大拇指較手腕更靠近肚子
        handZ = handZ
    } else {
        handZ = -handZ
    }
    if (hand[3].z > hand[4].z) { // 大拇指後於小指
        handZ = handZ
    } else {
        handZ = -handZ
    }
    if (hand[1].y > hand[0].y) { // 手腕低於手肘
        handZ = handZ
    } else {
        handZ = -handZ
    }
    if(handZ<0){
        console.log("負")
    }
    else{
        console.log("正")
    }

    rotateHand(handZ, mult)

}

function rotateHand(handZ, mult) {
    if (mult == 1) {
        //更新handRotation中的值
        vrmManager.tween(handRotation, {
            rightHandZ: handZ,
        }, () => updateHandRotation(handRotation, "right"), "rightHand", {
            rightHandZ: 0
        });
    } else if (mult == -1) {
        vrmManager.tween(handRotation, {
            leftHandZ: handZ,
        }, () => updateHandRotation(handRotation, "left"), "leftHand", {
            leftHandZ: 0
        });
    }
}

//更新vrm手腕的轉動角度
function updateHandRotation(rotation, side) {
    if (side == "right") {
        vrmManager.rotation(Bone.RightHand).z = rotation.rightHandZ;
    } else if (side == "left") {
        vrmManager.rotation(Bone.LeftHand).z = rotation.leftHandZ;
    }
}









