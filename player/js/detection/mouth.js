/**
 * 比對使用者嘴型與JSON檔紀錄的嘴型進而評分
 * @param {*} face results.faceLandmarks
 * @param {*} standard json檔裡面被標記部位的計算值
 * @returns 分數
 */
function compareMouth(face, standard) {

    if(face != undefined){ //當有偵測到時會計算分數
        let mouthScore = 0;
        const mouthRight = face[78];
        const mouthLeft = face[308];
        //左右嘴角距離
        const mouthWidth = distance3d(mouthRight, mouthLeft); 

        const mouthTop = face[13];
        const mouthBottom = face[14];
        //上嘴唇中間點及下嘴唇中間點距離
        const mouthHeight = distance3d(mouthTop, mouthBottom);

        const jaw = face[200];
        /**
         * 下巴至嘴唇上方距離
         */
        let topToJaw = distanceP(jaw, mouthTop); 
        /**
         * 下巴至左嘴角距離
         */
        let leftToJaw = distanceP(jaw, mouthLeft); 
        let playerEMouthShape = leftToJaw / topToJaw; //比值
        let playerMouthRatio = mouthHeight / mouthWidth; //比值


        if(standard.E > 0){
            //比對使用者嘴型與JSON檔紀錄的嘴型
            let eMouthScore = Math.abs(standard.eMouthShape - playerEMouthShape);
            mouthScore = calcScore(eMouthScore, 0.15, 0.175, 0.2);
        }
        else if(standard.A > 0){
            //比對使用者嘴型與JSON檔紀錄的嘴型
            let aMouthScore = Math.abs(standard.mouthRatio - playerMouthRatio);
            mouthScore = calcScore(aMouthScore,  0.065, 0.1325, 0.2);
        }
        else if(standard.I > 0){
            //比對使用者嘴型與JSON檔紀錄的嘴型
            let iMouthScore = Math.abs(standard.mouthRatio - playerMouthRatio);
            mouthScore = calcScore(iMouthScore,  0.1, 0.15, 0.2);
        }
        else if(standard.O > 0){
            //比對使用者嘴型與JSON檔紀錄的嘴型
            let oMouthScore = Math.abs(standard.mouthRatio - playerMouthRatio);
            mouthScore = calcScore(oMouthScore,  0.1, 0.39, 0.645, 0.9);
        }
        return mouthScore;
    }
    else{
        return 0; //若沒偵測到臉 直接把嘴巴偵測分數打0分 (也就是bad
    }
    
}