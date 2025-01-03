/**
 * 進行頭部偵測與評分
 * @param {*} face faceLandmarks
 * @param {*} standard JSON檔該幀頭部的正確標準  
 * @returns 
 */
function compareHead(face, standard) {
    /*
        roll:左右晃(z軸)
        yaw: 轉頭(y軸)
        pitch:點頭(x軸)
        左右以螢幕上畫面為準(螢幕畫面右臉=人的左臉)
    */
    return new Promise((resolve) => {
        if (face != undefined) {
            
            let faceRight = face[356];
            let faceLeft = face[127];
            let faceTop = face[10];
            let faceBottom = face[200];
            let detectedHead = headCalc(faceRight,faceLeft,faceTop,faceBottom);

            //頭部未被偵測到,評分為0
            if (detectedHead == undefined) {
                resolve(0);
            }

            //計算臉部X,Y,Z三方向的旋轉誤差
            const deltaX = Math.abs(detectedHead.pitch - standard.x);
            const deltaY = Math.abs(detectedHead.yaw - standard.y);
            const deltaZ = Math.abs(detectedHead.roll - standard.z);

            //計算平均誤差
            const delta = (deltaX + deltaY + deltaZ) / 3;

            //計算head的等第分數
            let finalScore = calcScore(delta, 0.1, 0.15, 0.25);
            resolve(finalScore);
           
        } else {
            //臉部未被偵測到,評分為0
            resolve(0);
        }
    });
}

function headCalc(faceRight,faceLeft,faceTop,faceBottom) {

    /*
        roll:左右晃(彩虹)(z軸)
        yaw: 轉頭(y軸)
        pitch:點頭(x軸)
    */
    let roll = 0;
    let yaw = 0;
    let pitch = 0;

    if ((faceRight == undefined && faceLeft == undefined && faceTop == undefined && faceBottom == undefined)) {
        let detectedHead = { roll: 0, yaw: 0, pitch: 0 };
        return detectedHead;
    }

    //利用Math.atan()來讓斜率轉成弧度值
    const rollSlope = slope(faceLeft.y, faceRight.y, faceLeft.x, faceRight.x);
    roll = Math.atan(rollSlope);

    const yawSlope = slope(faceLeft.z, faceRight.z, faceLeft.x, faceRight.x);
    yaw = Math.atan(yawSlope);
    const pitchSlope = slope(faceTop.z, faceBottom.z, faceTop.y, faceBottom.y);
    pitch = Math.atan(pitchSlope) * (-1);

    let detectedHead = { roll: roll, yaw: yaw, pitch: pitch };
    return detectedHead;
}






