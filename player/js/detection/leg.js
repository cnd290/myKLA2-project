/**
 * 進行腿部部位偵測與評分 (左/右 大/小腿)  
 * @param {*} side 左右邊  
 * @param {*} part 大腿(Upper)/小腿(Lower)  
 * @param {*} pose poseLandmarks  
 * @param {*} standard JSON檔該幀該部位的正確標準  
 * @returns 該腿部部位之等第評分  
 */
function compareLeg(side, part, pose, standard) {
    return new Promise((resolve) => {
        let legScore = 0;
        if (pose != undefined) {

            const leftHip = pose[23];
            const leftKnee = pose[25];
            const leftAnkle = pose[27];
            const rightHip = pose[24];
            const rightKnee = pose[26];
            const rightAnkle = pose[28];

            const legRotateData = legCalc(leftHip, leftKnee, leftAnkle, leftHip, rightHip, rightKnee, rightAnkle);

            legScore = calcLegAngle(legRotateData, side, part, standard);
            resolve(legScore);

        } else {
            resolve(0);
        }
    })
}

/**
 * 計算 腿部部位(左/右 大/小腿) 的成績等第  
 * @param {*} returnData 偵測計算之腿部的旋轉角度
 * @param {*} side 左右邊  
 * @param {*} part 大腿(Upper)/小腿(Lower)  
 * @param {*} standard JSON檔該幀腿部部位的正確標準 
 * @returns 該腿部部位之等第評分  
 */
function calcLegAngle(returnData, side, part, standard) {
    let legScore = 0;
    if (side == "right") {
        if (part == "upper") {
            //計算rightUpperLeg誤差
            let upperScore = 0;
            upperScore += Math.abs(standard.x - returnData.rightUpperX);
            upperScore += Math.abs(standard.z - returnData.rightUpperZ);
            upperScore /= 2;

            //計算rightUpperLeg的等第分數
            legScore = calcScore(upperScore, 0.5, 0.65, 0.9);

        } else if (part == "lower") {
            //計算rightLowerLeg誤差
            let lowerScore = 0;
            lowerScore += Math.abs(standard.x - returnData.rightLowerX);

            //計算rightLowerLeg的等第分數
            legScore = calcScore(lowerScore, 0.5, 0.65, 0.9)
        }
    } else if (side == "left") {
        if (part == "upper") {
            //計算leftUpperLeg誤差
            let upperScore = 0;
            upperScore += Math.abs(standard.x - returnData.leftUpperX);
            upperScore += Math.abs(standard.z - returnData.leftUpperZ);
            upperScore /= 2;

            //計算leftUpperLeg的等第分數
            legScore = calcScore(upperScore, 0.5, 0.65, 0.9)
        } else if (part == "lower") {
            //計算leftLowerLeg誤差
            let lowerScore = 0;
            lowerScore += Math.abs(standard.x - returnData.leftLowerX);

            //計算leftLowerLeg的等第分數
            legScore = calcScore(lowerScore, 0.5, 0.65, 0.9)
        }
    }
    return legScore;
}


function legCalc(leftHip, leftKnee, leftAnkle, leftHip, rightHip, rightKnee, rightAnkle) {
    /**
     * [[右屁股,右膝蓋,右腳踝],[左屁股,左膝蓋,左腳踝]]
     */
    let legParts = [
        [rightHip, rightKnee, rightAnkle],
        [leftHip, leftKnee, leftAnkle]
    ];

    //用來存放各旋轉角度
    let rightUpX;
    let rightUpZ;
    let rightLowX;
    let leftUpX;
    let leftUpZ;
    let leftLowX;
    for (let i = 0; i < legParts.length; i++) {
        mult = Math.pow(-1, i);
        // [ 大腿X軸旋轉角度 , 大腿Z軸旋轉角度 , 小腿X軸旋轉角度 ]
        const [upperX, upperZ, lowerX] = moveLeg(legParts[i], mult);
        //右腳
        if (mult == 1) {
            rightUpX = upperX;
            rightUpZ = upperZ;
            rightLowX = lowerX;
        }
        //左腳
        else if (mult == -1) {
            leftUpX = upperX;
            leftUpZ = upperZ;
            leftLowX = lowerX;
        }
        //未偵測到
        else if (mult == 2) {
            rightUpX = 0;
            rightUpZ = 0;
            rightLowX = 0;
            leftUpX = 0;
            leftUpZ = 0;
            leftLowX = 0;
        }
    }

    const returnData = {
        rightUpperX: rightUpX,
        rightUpperZ: rightUpZ,
        rightLowerX: rightLowX,
        leftUpperX: leftUpX,
        leftUpperZ: leftUpZ,
        leftLowerX: leftLowX
    };

    return returnData;


}


/**
 * 計算腿部旋轉角度
 * @param {*} leg 腿上各關節 0:屁股 1:膝蓋 2:腳踝
 * @param {*} mult 1:VRM右腳 -1:VRM左腳
 */
function moveLeg(leg, mult) {

    let upperX;
    let upperZ;
    let lowerX;
    if (leg[0].visibility >= 0.65 && leg[1].visibility >= 0.65 && leg[2].visibility >= 0.65) { //當visibility >= 0.65 時在webcam的畫面上才會出現偵測點及線(有偵測到)


        // YZ平面上，求大腿X的轉動角度
        // getAngle 需要以Vector3形式才可計算
        // pointToVec = new THREE.Vector3 -> 都是將偵測點的資料轉為Vector3的形式，差別為pointToVec只須給部位就會將該部位的XYZ變成Vector3的形式，反之則需要給三個值才可轉成Vector3的形式
        let kneeVecX = new THREE.Vector3(leg[0].x, leg[1].y, leg[1].z); //hip的x,knee的yz
        let hipVecX = pointToVec(leg[0]); //hip點
        let upperExtendX = new THREE.Vector3(leg[0].x, leg[0].y + 10, leg[0].z); //hip的x,hip的y往下延伸,hip的z
        upperX = getAngle(kneeVecX, hipVecX, upperExtendX); // 求三點夾角

        // XY平面上，求大腿Z的轉動角度
        let kneeVecZ = new THREE.Vector3(leg[1].x, leg[1].y, leg[0].z); //knee的xy,hip的z
        let hipVecZ = pointToVec(leg[0]); //hip點
        let upperExtendZ = new THREE.Vector3(leg[0].x, leg[0].y + 10, leg[0].z); //hip的x,hip的y往下延伸,hip的z
        upperZ = getAngle(kneeVecZ, hipVecZ, upperExtendZ); // 求三點夾角


        //hip,knee,ankle三點所組成的角度 -> 小腿X軸角度
        const lowerHipVec = pointToVec(leg[0]);
        const lowerKneeVec = pointToVec(leg[1]);
        const lowerAnkleVec = pointToVec(leg[2]);
        lowerX = getAngle(lowerHipVec, lowerKneeVec, lowerAnkleVec);


        if (leg[0].z >= leg[1].z) { //當hip在knee後面時
            if (leg[1].x * mult >= leg[0].x * mult) { //knee較hip外側
                upperZ = -upperZ * 2 * mult;
            } else { //knee較hip內側
                upperZ = upperZ * 2 * mult;
            }
            upperX = upperX;
        } else { //當hip在knee前面時
            if (leg[1].x * mult >= leg[0].x * mult) { //knee較hip外側
                upperZ = -upperZ * 2 * mult;
            } else { //knee較hip內側
                upperZ = upperZ * 2 * mult;
            }
            upperX = -upperX;
        }

        lowerX = -(Math.PI - lowerX - Math.PI / 18) * 1.4 + Math.PI / 4;

        // 極限設置
        if (lowerX < -Math.PI / 1.3) {
            lowerX = -Math.PI / 1.3
        } else if (lowerX > 0) {
            lowerX = 0
        }

        if ((upperZ * mult > Math.PI / 1.8) * mult) {
            upperZ = Math.PI / 1.8 * mult
        } else if ((upperZ * mult < -Math.PI / 6) * mult) {
            upperZ = -Math.PI / 6 * mult
        } else {
            upperZ = upperZ
        }

        return [upperX, upperZ, lowerX];



    } else {
        //未偵測到完整腿部
        mult = 2;
        return [0, 0, 0];
    }
}