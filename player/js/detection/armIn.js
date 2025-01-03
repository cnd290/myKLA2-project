/**
 * 比對使用者手臂旋轉角度與JSON檔紀錄的旋轉角度進而評分
 * @param {*} mult 等於1代表VRM的右邊、使用者的左邊、程式碼中寫right的部分，反之則為另一邊
 * @param {*} part 判斷為上手臂或下手臂
 * @param {*} pose results.poseLandmarks
 * @param {*} hand results.rightHandLandmarks 或 results.leftHandLandmarks
 * @param {*} standard JSON檔中紀錄的旋轉角度
 * @returns 分數
 */
function compareArm(mult, part, pose, hand, standard){
    return new Promise(async(resolve) => {
        let shoulder;
        let elbow;
        let armScore;
        let otherShoulder
        if(hand==undefined || pose==undefined){ //當沒有偵測到時會回傳0分
            resolve(0);
        }
        else{ //當有偵測到時
            let wrist = hand[0];
            let shoulderRotation
            if(mult==1){
                shoulder = pose[12];//VRM右邊肩膀點
                elbow = pose[14];
                otherShoulder = pose[11]//VRM左邊肩膀點
                shoulderRotation = getRotation(shoulder, otherShoulder);//getRotation計算時傳入參數第一個為右邊第二個為左邊
            }
            else if(mult==-1){
                shoulder = pose[11];//VRM左邊肩膀點
                elbow = pose[13];
                otherShoulder = pose[12]//VRM右邊肩膀點
                shoulderRotation = getRotation(otherShoulder, shoulder);//getRotation計算時傳入參數第一個為右邊第二個為左邊
            }

            // getAngle 需要以Vector3形式才可計算
            // pointToVec = new THREE.Vector3 -> 都是將偵測點的資料轉為Vector3的形式，差別為pointToVec只須給部位就會將該部位的XYZ變成Vector3的形式，反之則需要給三個值才可轉成Vector3的形式
            let shoulderPoint = pointToVec(shoulder);
            let elbowPoint = pointToVec(elbow);
            let wristPoint = pointToVec(wrist);
            let armAngle = getAngle(shoulderPoint, elbowPoint, wristPoint)

            let armData = [shoulder, elbow, wrist, shoulderRotation]

            if(mult==1){
                //判斷要進去armInDetection還是armOutDetection
                //當(手肘低於肩膀且手臂夾角小於0.25時且手肘於身體外)或手臂夾角大於0.8
                if ((elbow.y > shoulder.y && armAngle <= 0.25 && elbow.x < shoulder.x) || armAngle > 0.8) {
                    armScore = await armOutDetection(mult, part, armData, hand, standard);
                } else {
                    armScore = await armInDetection(mult, part, armData, standard);
                }
            }
            else if(mult==-1){
                //判斷要進去armInDetection還是armOutDetection
                //當(手肘低於肩膀且手臂夾角小於0.25時且手肘於身體外)或手臂夾角大於0.8
                if ((elbow.y > shoulder.y && armAngle <= 0.25 && elbow.x > shoulder.x) || armAngle > 0.8) {
                    armScore = await armOutDetection(mult, part, armData, hand, standard);
                } else {
                    armScore = await armInDetection(mult, part, armData, standard);
                }
            }
            resolve(armScore);
        }
        
    })
}

/**
 * 將各部位資料傳至其他function計算旋轉角度及分數
 * @param {*} mult 等於1代表VRM的右邊、使用者的左邊、程式碼中寫right的部分，反之則為另一邊
 * @param {*} part 判斷為上手臂或下手臂
 * @param {*} armData [shoulder, elbow, wrist, shoulderRotation]
 * @param {*} standard JSON檔中紀錄的旋轉角度
 * @returns 分數
 */
function armInDetection(mult, part, armData, standard) {
    return new Promise(async(resolve) => {
        let armInScore;
        
        let shoulder = armData[0];
        let elbow = armData[1];
        let wrist = armData[2];

        armInScore = await getDetectedArmIn(mult, shoulder, elbow, wrist, part, standard);
        resolve(armInScore);
    })
}

/**
 * 將資料傳至後端計算旋轉角度
 * @param {*} mult 等於1代表VRM的右邊、使用者的左邊、程式碼中寫right的部分，反之則為另一邊
 * @param {*} shoulder 肩膀點資料
 * @param {*} elbow 手肘點資料
 * @param {*} wrist 手腕點資料
 * @param {*} part 判斷為上手臂或下手臂
 * @param {*} standard JSON檔中紀錄的旋轉角度
 * @returns 分數
 */
function getDetectedArmIn(mult, shoulder, elbow, wrist, part, standard){
    return new Promise((resolve) => {
        let returnData = armInCalc(mult,shoulder,elbow,wrist)
        let armInScore = calcArmInAngle(part, standard, returnData, mult);
        resolve(armInScore);
           
    });
}

/**
 * 計算旋轉角度差異並傳去其他function評分
 * @param {*} part 判斷為上手臂或下手臂
 * @param {*} standard JSON檔中紀錄的旋轉角度
 * @param {*} returnData 當下使用者的旋轉角度
 * @param {*} mult 等於1代表VRM的右邊、使用者的左邊、程式碼中寫right的部分，反之則為另一邊
 * @returns 分數
 */
function calcArmInAngle(part, standard, returnData, mult){
    let armInScore = 0;
    if(part=="upper"){
        let upperScore = 0;
        //將兩軸旋轉角度的差異算出平均
        upperScore += Math.abs(standard.y - returnData.upperY);
        upperScore += Math.abs(standard.z - returnData.upperZ);
        upperScore /= 2;
        //判斷此差異為哪一分數區間
        armInScore = calcScore(upperScore, 0.45, 0.7, 0.95);
    }
    else if(part=="lower"){
        let lowerScore = 0;
        //將兩軸旋轉角度的差異算出平均
        lowerScore += Math.abs(standard.y - returnData.lowerY);
        lowerScore += Math.abs(standard.z - returnData.lowerZ);
        //判斷此差異為哪一分數區間
        armInScore = calcScore(lowerScore, 0.45, 0.7, 0.95);
    }
    return armInScore;
}

function armInCalc(mult,shoulder,elbow,wrist){
    /**
     * 1:vrm右手 -1:vrm左手
     */
    

    /**
     * [肩膀,手肘,手腕]
     */
    let armPart = [shoulder,elbow,wrist]
    /**
     * 計算完的資料
     */
    let rot;

    /**
     * [ 上手臂Y軸旋轉角度 , 上手臂Z軸旋轉角度 , 下手臂Y軸旋轉角度 , 下手臂Z軸旋轉角度 ]
     */
    const [upperY,upperZ,lowerY,lowerZ] = moveArmIn(armPart, mult)
    rot = [upperY,upperZ,lowerY,lowerZ];
    
    //將計算資料回傳至前端
    let returnData = {
        upperY: rot[0],
        upperZ: rot[1],
        lowerY: rot[2],
        lowerZ: rot[3]
    }
    return returnData;
}

/**
 * 計算手臂旋轉角度
 * @param {*} arm 該手臂的值 0:肩膀 1:手肘 2:手腕 3:中指 4:大拇指 5:小指 
 * @param {*} mult 加權值  1:vrm右手 -1:vrm左手
 */
 function moveArmIn(arm, mult) {
    if (arm[0].visibility >= 0.65 && arm[1].visibility >= 0.65 && arm[2]) { //當visibility >= 0.65 時在webcam的畫面上才會出現偵測點及線(有偵測到)

         // XZ平面上，求上手臂Y的轉動角度
        // getAngle 需要以Vector3形式才可計算
        // pointToVec = new THREE.Vector3 -> 都是將偵測點的資料轉為Vector3的形式，差別為pointToVec只須給部位就會將該部位的XYZ變成Vector3的形式，反之則需要給三個值才可轉成Vector3的形式
        let shoulderVecY = pointToVec(arm[0]); //肩膀的XYZ
        let elbowVecY = new THREE.Vector3(arm[1].x, arm[0].y, arm[1].z); //elbow的x，shoulder的y，elbow的z
        let upperExtendY = new THREE.Vector3(arm[0].x - (10 * mult), arm[0].y, arm[0].z); //shoulder的x左右延伸，shoulder的yz
        // getAngle為利用三點求角度的function
        let upperY = (getAngle(elbowVecY, shoulderVecY, upperExtendY) - Math.PI / 8) * mult; //上手臂y轉動的角度

        // XY平面上，求上手臂Z的轉動角度
        let shoulderVecZ = pointToVec(arm[0]) //肩膀點
        let elbowVecZ = new THREE.Vector3(arm[1].x, arm[1].y, arm[0].z) //elbow的xy，shoulder的z
        let upperExtendZ = new THREE.Vector3(arm[0].x - (10 * mult), arm[0].y, arm[0].z) //shoulder的x左右延伸、shoulder的yz
        let upperZ = getAngle(elbowVecZ, shoulderVecZ, upperExtendZ) * mult; //上手臂z轉動的角度


        if (arm[0].y < arm[1].y) { //手肘低於肩膀
            upperZ *= -1
        }
        if (arm[0].z < arm[1].z) { //手肘後於肩膀
            upperY *= (-1.2);
        }

        //手進肚子 (upperY乘-0.3為了讓手臂敞開一點)
        if(-(arm[0].x + 0.3 > arm[2].x) * mult && arm[1].y < arm[2].y){
            upperY *= -0.3 * mult
        }
        
        // XZ平面上，求下手臂Y的轉動角度
        let lowerElbowVecY = pointToVec(arm[1]); //手肘點
        let wristVecY = new THREE.Vector3(arm[2].x, arm[1].y, arm[2].z); //手腕的x，手肘的y，手腕的z
        let lowerExtendY = new THREE.Vector3(arm[1].x - (10 * mult), arm[1].y, arm[1].z); //elbow的x左右延伸，elbow的yz
        let lowerY = getAngle(wristVecY, lowerElbowVecY, lowerExtendY) * mult; //下手臂的y轉動角度

        // XY平面上，求下手臂Z的轉動角度
        let wristVecZ = new THREE.Vector3(arm[2].x, arm[2].y, arm[1].z); //手腕的xy，手肘的z
        let lowerExtendZ = new THREE.Vector3(arm[1].x - (10 * mult), arm[1].y, arm[1].z); //elbow的x左右延伸，elbow的yz
        let lowerZ = getAngle(wristVecZ, lowerElbowVecY, lowerExtendZ) * mult; //下手臂的z轉動角度

        lowerZ -= Math.PI * mult;

        if ((arm[2].y < arm[1].y) * mult) {// 手腕高於手肘
            lowerZ *= -1;
        }
        
        return[upperY, upperZ, lowerY, lowerZ];
    }
    else {// 當沒偵測到時候回傳0
        return[0,0,0,0];
    }
 }












