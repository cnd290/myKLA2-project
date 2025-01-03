/**
 * eyeDetection 進行眼部偵測動畫
 * @param {*} results TensorFlow偵測出的臉部結果
 */
function eyeDetection(results) {

    const view = results[0].faceInViewConfidence; //臉部偵測到的程度
    if (view < 1) { //當沒偵測到眼睛(臉部偵測到的程度太低)
        eyeReset(); //眼睛還原至預設眼部動畫  
        return;
    }



    const keypoints = results[0].scaledMesh; //臉部偵測結果點

    //TensorFlow的faceMesh的left即為本人的左
    //但下方的left是以vrm為主，所以會相反，像是將座標貼在臉上
    //增長方向 >>> x往左(vrm的右)，y往下，z往人(後)
    //TensorFlow 的 位置array=> 0:x 1:y 2:z

    /**
     *           vrm 
     *   (右眼)         (左眼)
     */


    /**
     *        vrm右眼位置
     *      387   386  385
     *  263                 362
     *      373   374   380
     */
    const rightEye = {
        //rightEye-左/右眼角(本人的左眼)
        l: keypoints[362], //vrm右眼近鼻(右眼的左眼角)，本人左眼近鼻眼角(左眼的右眼角)
        r: keypoints[263], //vrm右眼遠鼻(右眼的右眼角)，本人左眼遠鼻眼角(左眼的左眼角)
        //rightEye-上/下眼皮
        uL: keypoints[385], //vrm右眼上眼皮近鼻點(右眼上眼皮中線之左點)，本人左眼上眼皮近鼻點(左眼上眼皮中線之右點)
        uC: keypoints[386], //vrm右眼上眼皮點(右眼上眼皮中線之中點)，本人左眼上眼皮點(左眼上眼皮中線之中點)
        uR: keypoints[387], //vrm右眼上眼皮遠鼻點(右眼上眼皮中線之右點)，本人左眼上眼皮遠鼻點(左眼上眼皮中線之左點)
        dL: keypoints[380], //vrm右眼下眼皮近鼻點(右眼下眼皮中線之左點)，本人左眼下眼皮近鼻點(左眼下眼皮中線之右點)
        dC: keypoints[374], //vrm右眼下眼皮中點(右眼下眼皮中線之中點)，本人左眼下眼皮點(左眼下眼皮中線之中點)
        dR: keypoints[373], //vrm右眼下眼皮遠鼻點(右眼下眼皮中線之右點)，本人左眼下眼皮遠鼻點(左眼下眼皮中線之左點)
    }



    /**
     *       vrm左眼位置
     *      158   159  160
     *  133                 33
     *      153   145   144
     */
    const leftEye = {
        //leftEye-左/右眼角(本人的右眼)
        l: keypoints[33], //vrm左眼遠鼻(左眼的左眼角)，本人右眼遠鼻眼角(右眼的右眼角)
        r: keypoints[133], //vrm左眼近鼻(左眼的右眼角)，本人右眼近鼻眼角(右眼的左眼角)
        //leftEye-上/下眼皮
        uL: keypoints[158], //vrm左眼上眼皮近鼻點(左眼上眼皮中線之右點)，本人右眼上眼皮近鼻點(右眼上眼皮中線之左點)
        uC: keypoints[159], //vrm左眼上眼皮中點(左眼上眼皮中線之中點)，本人右眼上眼皮中點(右眼上眼皮中線之中點)
        uR: keypoints[160], //vrm左眼上眼皮遠鼻點(左眼上眼皮中線之左點)，本人右眼上眼皮遠鼻點(右眼上眼皮中線之右點)
        dL: keypoints[153], //vrm左眼下眼皮近鼻點(左眼下眼皮中線之右點)，本人右眼下眼皮近鼻點(右眼下眼皮中線之左點)
        dC: keypoints[145], //vrm左眼下眼皮中點(左眼下眼皮中線之中點)，本人右眼下眼皮中點(右眼下眼皮中線之中點)
        dR: keypoints[144], //vrm左眼下眼皮遠鼻點(左眼下眼皮中線之左點)，本人右眼下眼皮遠鼻點(右眼下眼皮中線之右點)
    }


    /**
     *  vrm右(眼)瞳孔位置
     *        470   
     *  471   468  469
     *        472
     */
    const rightIris = {
        //vrm右瞳孔；本人左瞳孔
        l: keypoints[469], //vrm右瞳孔近鼻側(右瞳孔的左側)，本人左瞳孔近鼻側(左瞳孔的右側)
        r: keypoints[471], //vrm右瞳孔遠鼻側(右瞳孔的右側)，本人左瞳孔近鼻側(左瞳孔的左側)
        u: keypoints[470], //vrm右瞳孔上側，本人左瞳孔上側
        d: keypoints[472], //vrm右瞳孔下側，本人左瞳孔下側
        center: keypoints[468] //vrm右瞳孔中心，本人左瞳孔中心
    }


    /**
     * vrm左(眼)瞳孔位置
     *        477
     *  474   473  476
     *        475
     */
    const leftIris = {
        //vrm左瞳孔；本人右瞳孔
        l: keypoints[476], //vrm左瞳孔遠鼻側(左瞳孔的左側)，本人右瞳孔遠鼻側(右瞳孔的右側)
        r: keypoints[474], //vrm左瞳孔近鼻側(左瞳孔的右側)，本人右瞳孔近鼻側(右瞳孔的左側)
        u: keypoints[477], //vrm左瞳孔上側，本人右瞳孔上側
        d: keypoints[475], //vrm左瞳孔下側，本人右瞳孔下側
        center: keypoints[473] //vrm左瞳孔中心，本人右瞳孔中心
    }

    //移動vrm的眼睛動作
    moveEyes(rightEye, rightIris, leftEye, leftIris);

}

/**
 * moveEyes
 * 移動vrm的眼睛動作
 * @param {*} eyeR 右眼座標位置
 * @param {*} irisR 右瞳孔座標位置
 * @param {*} eyeL 左眼座標位置
 * @param {*} irisL 左瞳孔座標位置
 */
function moveEyes(eyeR, irisR, eyeL, irisL) {

    //計算vrm的眨眼權重 (眼睛睜閉程度) =>0(全開)~1(全閉)
    const rightBlink = blinkDetection(eyeR);
    const leftBlink = blinkDetection(eyeL);

    //計算偵測結果的vrm瞳孔視線位置
    const lookAtTargets = irisDetection(rightBlink, eyeR, irisR, leftBlink, eyeL, irisL);
    const lookAtTargetX = lookAtTargets[0];
    const lookAtTargetY = lookAtTargets[1];

    //設定vrm眼部動畫資料
    vrmManager.setPreset(Preset.BlinkR, rightBlink); //睜/眨眼程度
    vrmManager.setPreset(Preset.BlinkL, leftBlink); //睜/眨眼程度
    vrmManager.setLookAtTarget(lookAtTargetX, lookAtTargetY); //瞳孔視線位置

}

/**
 * eyeReset 眼睛還原至預設眼部動畫  
 * (1)眼睛變成自動眨  
 * (2)瞳孔看向前方  
 */
function eyeReset() {
    if (parseInt(clock.elapsedTime % 5) == 0) {
        //自動進行眨眼
        const preset = Math.sin(clock.elapsedTime * Math.PI * 2); //0 睜開眼睛~1閉上眼睛
        vrmManager.setPreset(Preset.BlinkR, preset);
        vrmManager.setPreset(Preset.BlinkL, preset);
    }
    vrmManager.setLookAtTarget(0, 0);
}

// function eyeCalc(app) {
//     app.post('/eyeMove', (req, res) => {
//         const eyeR = req.body.eyeR;
//         const blinkR = blinkDetection(eyeR);
//         const eyeL = req.body.eyeL;
//         const blinkL = blinkDetection(eyeL);
//         const irisR = req.body.irisR;
//         const irisL = req.body.irisL;

//         const lookAtTargets = irisDetection(blinkR, eyeR, irisR, blinkL, eyeL, irisL);

//         res.send({ blinkR: blinkR, blinkL: blinkL, lookAtTargetX: lookAtTargets[0], lookAtTargetY: lookAtTargets[1] });
//     });

// }

/**
 * blinkDetection
 * 計算vrm的眨眼權重
 * @param {*} eye 左眼或右眼的座標位置
 * @returns 眨眼權重
 */
function blinkDetection(eye) {

    const leftDistance = tfDistance(eye.uL, eye.dL);
    const rightDistance = tfDistance(eye.uR, eye.dR);

    //vrm張開程度(越大(0)-越小(1))
    //眼長約為眼寬的0.4倍，眼睛睜全開的比值約為0.4，全閉約為0.1
    const rate = (leftDistance + rightDistance) / (2 * (tfDistance(eye.l, eye.r)));


    //由於眼睛睜開程度越大，權重數值越小       
    //定義偵測閉眼數值(0.3)調越小就代表越容易閉眼 
    const value = (0.4 - rate) / 0.3;


    //設定0與0.66為二閥值，主要分三種狀況
    /*
        大於0.66 => 1
        0~0.66   =>value
        小於0    => 0
    */
    if (value > 0.66) {
        return 1;
    } else if (value < 0) {
        return 0;
    }
    return value;
}


/**
 * irisDetection 
 * 計算vrm瞳孔視線位置
 * @param {*} rightBlink 右眼(本人左眼)睜閉程度:0(全開)~1(全閉)
 * @param {*} rightEye 右眼(本人左眼)座標位置
 * @param {*} rightIris 右瞳孔(本人左瞳孔)座標位置
 * @param {*} leftBlink 左眼(本人右眼)睜閉程度:0(全開)~1(全閉)
 * @param {*} leftEye 左眼(本人右眼)座標位置
 * @param {*} leftIris 左瞳孔(本人右瞳孔)座標位置
 * @returns  vrm瞳孔視線移動位置座標(x,y)
 */
function irisDetection(rightBlink, rightEye, rightIris, leftBlink, leftEye, leftIris) {

    //=============================================================
    //              瞳孔左右移動(以x方向的變換為主)
    //=============================================================   
    let rightIrisX = undefined; //右瞳孔x座標位置
    let leftIrisX = undefined; //左瞳孔x座標位置

    if (rightBlink <= 0.9) { //右眼未睜開(未睜到一定程度，並不好偵測其位置)
        rightIrisX = getIrisXPosition("right", rightEye.r[0], rightEye.l[0], rightIris.r[0], rightIris.center[0], rightIris.l[0]);
    }
    if (leftBlink <= 0.9) { //左眼未睜開(未睜到一定程度，並不好偵測其位置)
        leftIrisX = getIrisXPosition("left", leftEye.l[0], leftEye.r[0], leftIris.l[0], leftIris.center[0], leftIris.r[0]);
    }

    let lookAtTargetX = 0;
    if (rightIrisX == undefined && leftIrisX != undefined) { //閉右眼，只使用左眼資料
        lookAtTargetX = leftIrisX;
    } else if (leftIrisX == undefined && rightIrisX != undefined) { //閉左眼，只使用右眼資料
        lookAtTargetX = rightIrisX;
    } else if (leftIrisX != undefined && rightIrisX != undefined) { //兩眼皆未閉，則平均移動資料
        lookAtTargetX = (rightIrisX + leftIrisX) / 2;
    } else { //兩眼都閉，則跑0
        lookAtTargetX = 0;
    }


    //=============================================================
    //              瞳孔上下移動(以y方向的變換為主)
    //=============================================================
    /*
        起點:瞳孔中心可以到的最下邊
        終點:瞳孔中心可以到的最上邊位置
    */
    // const irisDownHeight = Math.abs(iris.d[1] - iris.center[1]);
    let rightIrisY = undefined; //右瞳孔y座標位置
    let leftIrisY = undefined; //左瞳孔y座標位置
    if (rightBlink <= 0.9) {
        rightIrisY = getIrisYPosition(rightEye.uC[1], rightEye.dC[1], rightIris.u[1], rightIris.center[1]);
    }
    if (leftBlink <= 0.9) {
        leftIrisY = getIrisYPosition(leftEye.uC[1], leftEye.dC[1], leftIris.u[1], leftIris.center[1]);
    }

    let lookAtTargetY = 0;
    if (rightIrisY == undefined && leftIrisY != undefined) { //閉右眼，只使用左眼資料
        lookAtTargetY = leftIrisY;
    } else if (leftIrisY == undefined && rightIrisY != undefined) { //閉左眼，只使用右眼資料
        lookAtTargetY = rightIrisY;
    } else if (leftIrisY != undefined && rightIrisY != undefined) { //兩眼皆未閉，則平均移動資料
        lookAtTargetY = (rightIrisY + leftIrisY) / 2;
    } else { //兩眼都閉，則跑0
        lookAtTargetY = 0;
    }

    let lookAtTargets = [lookAtTargetX, lookAtTargetY];
    return lookAtTargets;

    /**
     * getIrisXPosition
     * 計算vrm瞳孔視線X座標位置  
     * @param {*} side 左右邊
     * @param {*} eyeStart 眼部X座標起點
     * @param {*} eyeEnd 眼部X座標終點
     * @param {*} irisStart 瞳孔X座標起點
     * @param {*} irisCenter 瞳孔X座標中心點
     * @param {*} irisEnd 瞳孔X座標終點
     * @returns vrm瞳孔視線X座標位置
     */
    function getIrisXPosition(side, eyeStart, eyeEnd, irisStart, irisCenter, irisEnd) {
        const mult = side == "right" ? 1 : -1;
        const startWidth = Math.abs(irisStart - irisCenter);
        const orbitStartX = eyeStart - startWidth * mult; //起點向內移 瞳孔中心能到達的最外點
        const endWidth = Math.abs(irisEnd - irisCenter);
        const orbitEndX = eyeEnd + endWidth * mult; //終點向內移    瞳孔中心能到到達的最內點

        /**
         * orbitWidth 數線長度  
         * eyeStart           orbitStartX                      orbitEndX          eyeEnd
         *     |_(startWidth)_|       |______【orbitWidth】______|   |_(endWidth)_|     
         */
        const orbitWidth = Math.abs(orbitStartX - orbitEndX);

        /**
         * value為iris所在數線orbit上的相對位置
         *  >>>                   value  
         *  >>>orbitStartX----------|-------------orbitEndX   
         *  >>>>>|.........【orbitWidth】..........|  
         */
        const value = Math.abs(orbitStartX - irisCenter) / orbitWidth;

        let xTarget;
        /**
         * 由於vrm的相對X數值大約(起點-終點)呈現(-1,1)
         * 因此由原先value範圍:(0,1)等比位移至(-1,1)
         * 【位移方法】
         * (0,1) 
         * =>(0,2)     減少其單位長，分得更細，點數變多 ( 數值*2 )
         * =>(-1,1)    將起始點改為-1
         */
        if (side == "right") {
            xTarget = 2 * value - 1;
        } else {
            xTarget = (-2 * value) + 1;
        }

        return xTarget;
    }


    /**
     * getIrisYPosition
     * 計算vrm瞳孔視線Y座標位置
     * @param {*} upCenterEye 上眼皮中心點
     * @param {*} downCenterEye 下眼皮中心點
     * @param {*} upperIris 瞳孔上側
     * @param {*} centerIris 瞳孔下側
     * @returns vrm瞳孔視線Y座標位置
     */
    function getIrisYPosition(upCenterEye, downCenterEye, upperIris, centerIris) {
        const start = (downCenterEye + upCenterEye) / 2; //起點為瞳孔中心可以到的最下邊 (上下眼皮間的中點，瞳孔偏下)
        const irisUpHeight = Math.abs(upperIris - centerIris); //瞳孔上側到瞳孔中心的距離
        const end = upCenterEye + irisUpHeight; //終點為瞳孔中心可以到的最上邊位置(上眼皮位置位置向下位移)
        const orbitHeight = Math.abs(start - end); //起點到終點軌道的長度

        /**
         * 由於vrm的相對Y數值大約(起點-終點)呈現 (-0.4 , 0.8)
         * 因此由原先value範圍:(0,1)等比位移至 (-0.4 , 0.8)  
         * (0,1)   
         * =>(0,1.2)       減少其單位長，分得更細，點數變多 ( 數值*1.2 )  
         * =>(-0.4 , 0.8)  將起始點改為-0.4
         */
        const value = Math.abs(start - centerIris) / orbitHeight;
        const lookAtTargetY = value * 1.2 - 0.4; //視線觀看的座標之y
        return lookAtTargetY;
    }
}