const controls = window;
const mpHolistic = window;
const drawingUtils = window;
// Our input frames will come from here.
const canvasElement = document.getElementsByClassName('outputCanvas')[0];//canvas的畫面是透過video畫面去擷取的 (使用者的偵測區)
const canvasCtx = canvasElement.getContext('2d');//用來在canvas上畫偵測線

// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();
//在mediapipeDetector.js 如果mediapipe運作好之後 會加上loaded class 讓.loading進行opacity變0 的動畫 (css)
const loading = document.querySelector('.loading');
//在loaded的transition動畫完成後 讓.loading display none
loading.ontransitionend = () => { 
    loading.style.display = 'none';
    document.getElementById("message").innerHTML = "Loading"
};

function removeElements(landmarks, elements) {
    for (const element of elements) {
        delete landmarks[element];
    }
}

function removeLandmarks(results) {
    if (results.poseLandmarks) {
        removeElements(results.poseLandmarks, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22]);
    }
}

function connect(ctx, connectors) {
    const canvas = ctx.canvas;
    for (const connector of connectors) {
        const from = connector[0];
        const to = connector[1];
        if (from && to) {
            if (from.visibility && to.visibility &&
                (from.visibility < 0.1 || to.visibility < 0.1)) {
                continue;
            }
            ctx.beginPath();
            ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
            ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
            ctx.stroke();
        }
    }
}

/**
 * 因為會一直跑進去onResults function 裡
 * 怕一直不斷進入if裡面 
 * 一進去後就讓flaggg轉為1
 */
let flaggg = 0; 

/**
 * 用來存results.poseLandmarks;
 */
let poseResult;
/**
 * 用來存results.rightHandLandmarks;
 */
let rightHandResult;
/**
 * 用來存results.leftHandLandmarks;
 */
let leftHandResult;
/**
 * 用來存results.faceLandmarks;
 */
let faceResult;

let vrmFlag = 0;
vrmLoad("Girl01");
/**
 * onResults 
 * 以mediapipe偵測結果變動vrm model
 */
function onResults(results) {
    if(vrmFlag==0){
        vrmFlag = 1;
        document.body.classList.add('loaded');
    }
    
    // Add a class to hide the spinner.
    // document.body.classList.add('loaded');
    // Remove landmarks we don't want to draw.
    removeLandmarks(results);
    // Update the frame rate.
    fpsControl.tick();

    // Draw the overlays.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    // Connect elbows to hands. Do this first so that the other graphics will draw
    // on top of these marks.
    canvasCtx.lineWidth = 5;
    if (results.poseLandmarks) {
        poseResult = results.poseLandmarks;

        if (results.rightHandLandmarks != undefined) {
            rightHandResult = results.rightHandLandmarks;
            canvasCtx.strokeStyle = 'white';
            connect(canvasCtx, [
                [
                    results.poseLandmarks[mpHolistic.POSE_LANDMARKS.RIGHT_ELBOW],
                    results.rightHandLandmarks[0]
                ]
            ]);
        } else {
            rightHandResult = undefined;
        }
        if (results.leftHandLandmarks != undefined) {
            leftHandResult = results.leftHandLandmarks;
            canvasCtx.strokeStyle = 'white';
            connect(canvasCtx, [
                [
                    results.poseLandmarks[mpHolistic.POSE_LANDMARKS.LEFT_ELBOW],
                    results.leftHandLandmarks[0]
                ]
            ]);
        } else {
            leftHandResult = undefined
        }
    }
    if (results.poseLandmarks != undefined) {

        // Pose 畫上偵測的點跟線
        drawingUtils.drawConnectors(canvasCtx, results.poseLandmarks, mpHolistic.POSE_CONNECTIONS, { color: 'white' });

        drawingUtils.drawLandmarks(canvasCtx, Object.values(mpHolistic.POSE_LANDMARKS_LEFT)
            .map(index => results.poseLandmarks[index]), { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)' });

        drawingUtils.drawLandmarks(canvasCtx, Object.values(mpHolistic.POSE_LANDMARKS_RIGHT)
            .map(index => results.poseLandmarks[index]), { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)' });
        
        // Hands 畫上偵測的點跟線
        drawingUtils.drawConnectors(canvasCtx, results.rightHandLandmarks, mpHolistic.HAND_CONNECTIONS, { color: 'white' });
        drawingUtils.drawLandmarks(canvasCtx, results.rightHandLandmarks, {
            color: 'white',
            fillColor: 'rgb(0,217,231)',
            lineWidth: 2,
            radius: (data) => {
                return drawingUtils.lerp(data.from.z, -0.15, .1, 10, 1);
            }
        });


        drawingUtils.drawConnectors(canvasCtx, results.leftHandLandmarks, mpHolistic.HAND_CONNECTIONS, { color: 'white' });
        drawingUtils.drawLandmarks(canvasCtx, results.leftHandLandmarks, {
            color: 'white',
            fillColor: 'rgb(255,138,0)',
            lineWidth: 2,
            radius: (data) => {
                return drawingUtils.lerp(data.from.z, -0.15, .1, 10, 1);
            }
        });

        /**
         * 左右肩膀z(與鏡頭距離)的平均值
         */
        let userShoulderZ = (results.poseLandmarks[12].z + results.poseLandmarks[11].z) / 2;
        userZDistance(userShoulderZ);
    }

    if (results.faceLandmarks != undefined) {
        faceResult = results.faceLandmarks; //偵測到使用者臉上的各點之位置數值
        // Head 畫上偵測的點跟線
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_RIGHT_EYE, { color: 'rgb(0,217,231)' });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_RIGHT_EYEBROW, { color: 'rgb(0,217,231)' });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_LEFT_EYE, { color: 'rgb(255,138,0)' });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_LEFT_EYEBROW, { color: 'rgb(255,138,0)' });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_FACE_OVAL, { color: '#E0E0E0', lineWidth: 5 });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_LIPS, { color: '#E0E0E0', lineWidth: 5 });

    } else {
        faceResult = undefined;
    }
    //此時的未偵測狀態
    const recentUndetectStatus = (results.faceLandmarks == undefined && results.poseLandmarks == undefined);
    if (recentUndetectStatus != undetected) { //此時偵測狀態與上一次不同(從偵測/未偵測->未偵測/偵測) 
        undetected = recentUndetectStatus; //更新狀態

        //未偵測 且 沒有specialFlag 
        //若有specialFlag，則在specialFlag結束後開始進行未偵測動畫
        if (undetected && !specialFlag) {
            if (endStatus != 1 && animation.length > 0) { //不在結束狀態
                pause();
            }
            undetectedAnimation(); //進行未偵測動畫
        } else if (!undetected) { //由沒偵測到有偵測
            detectedAnimation(); //跑go 以及顯示warning sign 提醒要再次按播放
        }

    }



    canvasCtx.restore();
    // tfDetection();


}





const holistic = new Holistic({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }
});
holistic.setOptions({
    modelComplexity: 1
});

//mediapipe偵測
holistic.onResults(onResults);


function getPoseResult() {
    return poseResult;
}

function getRightHandResult() {
    return rightHandResult;
}

function getLeftHandResult() {
    return leftHandResult;
}

function getFaceResult() {
    return faceResult;
}