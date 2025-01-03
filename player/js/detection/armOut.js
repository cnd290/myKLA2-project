/**
 * 
 * @param {*} mult 等於1代表VRM的右邊、使用者的左邊、程式碼中寫right的部分，反之則為另一邊
 * @param {*} part 判斷為上手臂或下手臂
 * @param {*} armData [shoulder, elbow, wrist, shoulderRotation]
 * @param {*} hand hand為results.rightHandLandmarks 或是 results.leftHandLandmarks
 * @param {*} standard JSON檔中紀錄的旋轉角度
 * @returns 評分分數 (0~3)
 */

function armOutDetection(mult, part, armData, hand, standard) {
    return new Promise(async(resolve) => {
        /**
         * 最後要回傳回去評分分數 (0~3)
         */
        let armOutScore = 0;
      
        let shoulder = armData[0];
        let elbow = armData[1];
        let wrist = armData[2];
        let midFin = hand[9];
  

        /**
         * openvtuber的計算旋轉角度方法會用到的 -> shoulderRotation : 兩肩之間的轉動角度
         */
        let shoulderRotation = armData[3]; 


        /**
         * 以非同步作法達到同步效果 等ajax那邊接到傳回值才繼續做下去  
         * detected 為 傳回來計算完的旋轉角度  
         */
        const detected = await getDetectedArmOut(shoulder, elbow, wrist, midFin, mult, shoulderRotation);
        

        armOutScore = calcArmOutAngle(detected, part, standard);    
        resolve(armOutScore);   //回傳評分結果

    })
    
}


/**
 * 計算使用者的部位旋轉角度
 * @param {*} shoulder 為右邊或左邊的肩膀點資料
 * @param {*} elbow 為右邊或左邊的手肘點資料
 * @param {*} wrist 為右邊或左邊的手腕點資料
 * @param {*} midFin 為右邊或左邊的中指點資料
 * @param {*} mult 等於1代表VRM的右邊、使用者的左邊、程式碼中寫right的部分，反之則為另一邊
 * @param {*} shoulderRotation openvtuber的計算旋轉角度方法會用到的 -> shoulderRotation : 兩肩之間的轉動角度
 * @returns 
 */
function getDetectedArmOut(shoulder, elbow, wrist, midFin, mult, shoulderRotation){
    return new Promise((resolve) => {
        /**
         * 算完的資料
         */
        let rot;

        let armPart = [ shoulder, elbow, wrist, midFin ] ;

        const [upperY,upperZ,lowerZ,upperZo] = moveArmOut(armPart, mult, shoulderRotation);
        rot = [upperY,upperZ,lowerZ,upperZo];

        //回傳算完的旋轉角度資料
        resolve({
            upperY: rot[0],
            upperZ: rot[1],
            lowerZ: rot[2],
            upperZo: rot[3]
        })


    })

}


/**
 * 比對使用者部位旋轉角度跟json檔紀錄該部位的旋轉角度的差距 進而評分
 * @param {*} detected 從後端傳回來計算完的旋轉角度  
 * @param {*} part 判斷為上手臂或下手臂  
 * @param {*} standard JSON檔中紀錄的旋轉角度  
 * @returns 
 */
function calcArmOutAngle(detected, part, standard) { 
    /**
     * 回傳的評分分數
     */
    let armOutScore = 0;

    //上手臂
    if(part == "upper"){

        /**
         * 算出(使用者部位旋轉角度跟json檔紀錄該部位的旋轉角度)之誤差值 
         */
        let upperScore = 0;
        upperScore += Math.abs(standard.y - detected.upperY);
        upperScore += Math.abs(standard.z - detected.upperZ);
        upperScore /= 2;
    
        //利用誤差值去判斷在哪個區間 進而知道落在哪個分數
        armOutScore = calcScore(upperScore, 0.15, 0.24, 0.33); //最後得到好壞界線數值標準
    }
    //下手臂
    else if(part=="lower"){ 

        /**
         * 算出(使用者部位旋轉角度跟json檔紀錄該部位的旋轉角度)之誤差值 
         */
        let lowerScore = 0;
        lowerScore += Math.abs(standard.z - (detected.lowerZ - detected.upperZo));

        //利用誤差值去判斷在哪個區間 進而知道落在哪個分數
        armOutScore = calcScore(lowerScore, 0.073, 0.235, 0.4);
    }

    return armOutScore;
}



/**  
 * 計算手臂旋轉角度
 * @param {*} arm 該手臂的值 0:肩膀 1:手肘 2:手腕 3:中指 4:大拇指 5:小指 
 * @param {*} mult  1:vrm右手 我們的左手 -1:vrm左手 我們的右手
 * @param {*} shoulderRotation 兩肩之間的角度
 */
 function moveArmOut(arm, mult, shoulderRotation) {
    
    if (arm[0].visibility >= 0.65 && arm[1].visibility >= 0.65 && arm[2]) { //當visibility >= 0.65 時在webcam的畫面上才會出現偵測點及線(有偵測到)

        // pointToVec = new THREE.Vector3 -> 都是將偵測點的資料轉為Vector3的形式，差別為pointToVec只須給部位就會將該部位的XYZ變成Vector3的形式，反之new THREE.Vector3()方法則需要給三個值才可轉成Vector3的形式
        // getAngle 需要以Vector3形式才可計算
        // XZ平面上，求上手臂Y的轉動角度
        let shoulderVecY = pointToVec(arm[0]) // 肩膀點 // = new THREE.Vector3(arm[0].x, arm[0].y, arm[0].z)
        let elbowVecY = new THREE.Vector3(arm[1].x, arm[0].y, arm[1].z) // 手肘X，肩膀Y，手肘Z
        let otherVecY = new THREE.Vector3(arm[0].x - (10 * mult), arm[0].y, arm[0].z) //肩膀X左右延伸，肩膀Y，肩膀Z
        let upperY = getAngle(elbowVecY, shoulderVecY, otherVecY) * mult // 三點求角度

        //手往後，手腕高於手肘
        if (arm[2].y <= arm[1].y && arm[3].z > -0.0035) { 
            upperY *= -0.1 * mult //mult讓我們的右手有辦法往後彎 不然只能一直在前方擺動
        }

        //手肘後於肩膀，手腕低於手肘
        if (arm[2].y > arm[1].y && arm[0].z + 0.1 < arm[1].z) { 
            upperY *= -1.5 
        }

        //openvtuber的寫法
        let upperZo = (getRotation(arm[1], arm[0]) - shoulderRotation); //openvtuber的寫法


        // XY平面上，求上手臂Z的轉動角度
        let shoulderVecZ = pointToVec(arm[0]) // 肩膀點
        let elbowVecZ = new THREE.Vector3(arm[1].x, arm[1].y, arm[0].z) // 手肘X，手肘Y，肩膀Z
        let otherVecZ = new THREE.Vector3(arm[0].x - (10 * mult), arm[0].y, arm[0].z) // 肩膀X左右延伸，肩膀Y，肩膀Z
        let upperZ = getAngle(elbowVecZ, shoulderVecZ, otherVecZ) * mult // 三點求角度

        // 手肘低(高)於肩膀
        if ((arm[0].y < arm[1].y) * mult) { //若mult為負 乘上去小於會變成大於
            upperZ *= -1
        }

        //rightLowerZ openvtuber的寫法  -> https://github.com/voidedWarranties
        let lowerZ = getRotation(arm[2], arm[1]) + shoulderRotation*mult;

        if(mult==-1){//左手問題
            if(arm[0].y < arm[1].y){
                lowerZ = lowerZ - Math.PI*2
            }
            if(arm[2].y > arm[1].y){
                lowerZ = lowerZ + Math.PI*2
            }
        }

        //手臂沒有舉起來 然後擺在身體前的狀況
        if(-(arm[0].x + 0.3 > arm[2].x) * mult && arm[1].y < arm[2].y){ // 手腕在肚子前，手腕低於手肘
            upperY *= 0.1 * mult
            upperZ *= 0.8
        }

        //return計算結果回去
        return[upperY,upperZ,lowerZ,upperZo];
   


    } else {
        //若沒偵測到手
        return[0,0,0,0];
    }
    

}