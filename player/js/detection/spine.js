
/**
 * 
 * @param {*} pose 為results.poseLandmarks  
 * @param {*} standard JSON檔中紀錄的旋轉角度
 * @returns 評分分數 (0~3)
 */
function compareSpine(pose, standard) {
    return new Promise(async(resolve) => {
        if (pose != undefined) { 
            const resultPoseLandmarks = pose;

            /**
             * 以非同步作法達到同步效果 等ajax那邊接到傳回值才繼續做下去  
             * detected 為 傳回來計算完的旋轉角度  
             */
            const detected = await getDetectedSpine(resultPoseLandmarks);

            /**
             * 回傳的評分分數
             */
            let spineScore = 0;

            /**
             * 算出(使用者部位旋轉角度跟json檔紀錄該部位的旋轉角度)之誤差值 
             * roll:左右晃(z軸)
             * yaw: 轉身(y軸)
             * pitch:鞠躬(x軸)
             */
            let score = 0;
            score += Math.abs(detected.pitch - standard.x);
            score += Math.abs(detected.yaw - standard.y);
            score += Math.abs(detected.roll - standard.z);
            score /= 3;
            //利用誤差值去判斷在哪個區間 進而知道落在哪個分數
            spineScore = calcScore(score, 0.125, 0.187, 0.25);

            resolve(spineScore);
        }
        else{ //若沒偵測到 就給他0分
            resolve(0);
        }
    })

}


/**
 * 計算使用者的部位旋轉角度
 * @param {*} resultPoseLandmarks 為results.poseLandmarks 
 * @returns 
 */
function getDetectedSpine(resultPoseLandmarks){
    return new Promise((resolve) => {
        let leftHip = resultPoseLandmarks[23];
        let rightHip = resultPoseLandmarks[24];
        let rightShoulder = resultPoseLandmarks[12];
        let leftShoulder = resultPoseLandmarks[11];
        let midShoulderY = (rightShoulder.y + leftShoulder.y) / 2;
        let midShoulderZ = (rightShoulder.z + leftShoulder.z) / 2;
        let midHipY = (rightHip.y + leftHip.y) / 2;
        let midHipZ = (rightHip.z + leftHip.z) / 2;

        /*
            roll:左右晃(z軸)
            yaw: 轉身(y軸)
            pitch:鞠躬(x軸)
        */
        let roll = 0;
        let yaw = 0;
        let pitch = 0;

        //若這些點沒偵測到 roll yaw pitch都回傳0
        if (!(leftHip && rightHip && rightShoulder)) {
            res.send({ roll: 0, yaw: 0, pitch: 0 });
            return;
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
            pitch = 0; //不讓身體往後彎
        }


        //回傳算完的旋轉角度資料
        resolve({ roll: roll, yaw: yaw, pitch: pitch });

    })
}
