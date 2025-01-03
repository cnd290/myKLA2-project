let spineRotation = { x: 0, y: 0, z: 0 };


function spineDetection(results) {
    if (results.poseLandmarks != undefined) {
        const resultPoseLandmarks = results.poseLandmarks;
        /*
            roll:左右晃(z軸)
            yaw: 轉身(y軸)
            pitch:鞠躬(x軸)
        */


        const { roll, yaw, pitch } = getSpineRotation(resultPoseLandmarks);

        rotateSpine(roll, yaw, pitch);


    }
}

//動作之間有補間動畫
function rotateSpine(roll, yaw, pitch) {
    vrmManager.tween(spineRotation, {
        x: pitch,
        y: yaw,
        z: roll,
    }, () => updateSpineRotation(spineRotation), "spine", {
        x: 0,
        y: 0,
        z: 0
    });
}

//利用計算出來的旋轉角度來擺放虛擬人物的動作
function updateSpineRotation(rotation) {

    let chestNode = vrmManager.rotation(Bone.Spine);
    chestNode.x = rotation.x / 1.4; //為了讓腰往前彎幅度不要那麼大
    chestNode.y = rotation.y;
    chestNode.z = rotation.z;
}



/**
 * 取得身體轉動角度
 * @param {*} resultPoseLandmarks 
 * @returns { roll, yaw, pitch }  roll:左右晃(z軸)   yaw: 轉身(y軸)     pitch:鞠躬(x軸)
 */
function getSpineRotation(resultPoseLandmarks) {
    const leftHip = resultPoseLandmarks[23];
    const rightHip = resultPoseLandmarks[24];
    const rightShoulder = resultPoseLandmarks[12];
    const leftShoulder = resultPoseLandmarks[11];

    const midShoulderY = (rightShoulder.y + leftShoulder.y) / 2;
    const midShoulderZ = (rightShoulder.z + leftShoulder.z) / 2;
    const midHipY = (rightHip.y + leftHip.y) / 2;
    const midHipZ = (rightHip.z + leftHip.z) / 2;


    let roll = 0;
    let yaw = 0;
    let pitch = 0;

    //若這些點沒偵測到 roll yaw pitch都回傳0
    if (!(leftHip && rightHip && rightShoulder)) {
        return { roll, yaw, pitch };
    }

    //利用Math.atan()來讓斜率轉成弧度值
    const rollSlope = slope(leftHip.y, rightHip.y, leftHip.x, rightHip.x); //左右搖擺(z) (從後面看兩個hip點連線的斜率(左右晃))
    roll = Math.atan(rollSlope);

    const yawSlope = slope(leftHip.z, rightHip.z, leftHip.x, rightHip.x); //旋轉(y) (從頭頂上看兩個hip點連線的斜率(旋轉腰))
    yaw = Math.atan(yawSlope);

    const pitchSlope = slope(midHipY, midShoulderY, midHipZ - 0.1, midShoulderZ); //前後(x) (從側面看兩個hip點連線的斜率(前後擺))
    pitch = Math.atan(pitchSlope);

    if (pitch > 0) {
        // spine向前傾時，角度為負,且以斜率換算之不加正負號向前傾角度為(Math.PI / 2 - theta)
        //加上方向=加上負號 => pitch角度為 -(Math.PI / 2 - theta)
        pitch -= Math.PI / 2;
    } else {
        pitch = 0; //為了不讓身體往後彎
    }


    return { roll, yaw, pitch };
}