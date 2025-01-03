// 記錄旋轉角度
let legRotation = {
    rightUpperX: 0,
    rightUpperZ: 0,
    rightLowerX: 0,
    leftUpperX: 0,
    leftUpperZ: 0,
    leftLowerX: 0
}

// 由mediapipe.js呼叫
// result為所有偵測資料
function legDetection(results) {

    if (results.poseLandmarks != undefined) {
        const leftHip = results.poseLandmarks[23];
        const leftKnee = results.poseLandmarks[25];
        const leftAnkle = results.poseLandmarks[27];

        const rightHip = results.poseLandmarks[24];
        const rightKnee = results.poseLandmarks[26];
        const rightAnkle = results.poseLandmarks[28];

        /**
         * [[右屁股,右膝蓋,右腳踝],[左屁股,左膝蓋,左腳踝]]
         */
        let legParts = [
            [rightHip, rightKnee, rightAnkle],
            [leftHip, leftKnee, leftAnkle]
        ];

        // mult用來判斷左右邊
        // mult等於一代表VRM的右邊、使用者的左邊、程式碼中寫right的部分，反之則為另一邊
        // 當visibility >= 0.65 時在webcam的畫面上才會出現偵測點及線(有偵測到)
        if (legParts[0][0].visibility >= 0.65 && legParts[1][0].visibility >= 0.65) {
            for (let i = 0; i < legParts.length; i++) {
                let mult = Math.pow(-1, i);
                moveLeg(legParts[i], mult);
            }
        } else { // 沒偵測到時的初始動作(站立)
            vrmManager.rotation(Bone.RightUpperLeg).x = 0;
            vrmManager.rotation(Bone.RightUpperLeg).z = 0;
            vrmManager.rotation(Bone.RightLowerLeg).x = 0;
            vrmManager.rotation(Bone.LeftUpperLeg).x = 0;
            vrmManager.rotation(Bone.LeftUpperLeg).z = 0;
            vrmManager.rotation(Bone.LeftLowerLeg).x = 0;
        }
    }
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
    if (leg[0].visibility >= 0.65 && leg[1].visibility >= 0.65 && leg[2].visibility >= 0.65) {//當visibility >= 0.65 時在webcam的畫面上才會出現偵測點及線(有偵測到)

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


        if (mult == 1) { //vrm右腿動畫
            //更新legRotation中的值
            vrmManager.tween(legRotation, {
                rightUpperX: upperX,
                rightUpperZ: upperZ,
                rightLowerX: lowerX
            }, () => updateLegRotation(legRotation, "right"), "rightLeg", {
                rightUpperX: 0,
                rightUpperZ: 0,
                rightLowerX: 0
            });
        } else if (mult == -1) { //vrm左腿動畫
            //更新legRotation中的值
            vrmManager.tween(legRotation, {
                leftUpperX: upperX,
                leftUpperZ: upperZ,
                leftLowerX: lowerX
            }, () => updateLegRotation(legRotation, "left"), "leftLeg", {
                leftUpperLeg: 0,
                leftUpperZ: 0,
                leftLowerX: 0
            });
        }
    } else {
        //未偵測到完整腿部時的初始動作
        vrmManager.rotation(Bone.RightUpperLeg).x = 0;
        vrmManager.rotation(Bone.RightUpperLeg).z = 0;
        vrmManager.rotation(Bone.RightLowerLeg).x = 0;
        vrmManager.rotation(Bone.LeftUpperLeg).x = 0;
        vrmManager.rotation(Bone.LeftUpperLeg).z = 0;
        vrmManager.rotation(Bone.LeftLowerLeg).x = 0;
    }
}

//更新vrm腿部的轉動角度
function updateLegRotation(rotation, side) {
    if (side == "right") {
        const rightUpperLeg = vrmManager.rotation(Bone.RightUpperLeg);
        rightUpperLeg.x = rotation.rightUpperX;
        rightUpperLeg.z = rotation.rightUpperZ;
        vrmManager.rotation(Bone.RightLowerLeg).x = rotation.rightLowerX;
    } else if (side == "left") {
        const leftUpperLeg = vrmManager.rotation(Bone.LeftUpperLeg);
        leftUpperLeg.x = rotation.leftUpperX;
        leftUpperLeg.z = rotation.leftUpperZ;
        vrmManager.rotation(Bone.LeftLowerLeg).x = rotation.leftLowerX;
    }
}

