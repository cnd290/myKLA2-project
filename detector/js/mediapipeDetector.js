const controls = window;
const mpHolistic = window;
const drawingUtils = window;
// Our input frames will come from here.
const canvasElement = document.getElementsByClassName('outputCanvas')[0]; //canvas的畫面是透過video畫面去擷取的 (使用者的偵測區)
const canvasCtx = canvasElement.getContext('2d'); //用來在canvas上畫偵測線

// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();



let headCheck = document.getElementById('headCheck');


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

setTimeout(() => {
    document.getElementById("message").innerHTML = "Please<br>wait<br>patiently"
}, "1500")


/**
 * onResults 
 * 以mediapipe偵測結果變動vrm model
 */

function onResults(results) {
    // Add a class to hide the spinner.
    document.body.classList.add('loaded');

    // Remove landmarks we don't want to draw.
    removeLandmarks(results);

    // Update the frame rate.
    fpsControl.tick();

    // Draw the overlays.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (vrmManager) {
        if (vrmManager.vrm) {
            setHipsPosition(); //呼叫hip偵測的function
        }
    }


    // Connect elbows to hands. Do this first so that the other graphics will draw
    // on top of these marks.
    canvasCtx.lineWidth = 5;
    if (results.poseLandmarks) {
        if (results.rightHandLandmarks) {
            canvasCtx.strokeStyle = 'white';
            connect(canvasCtx, [
                [
                    results.poseLandmarks[mpHolistic.POSE_LANDMARKS.RIGHT_ELBOW],
                    results.rightHandLandmarks[0]
                ]
            ]);
        }
        if (results.leftHandLandmarks) {
            canvasCtx.strokeStyle = 'white';
            connect(canvasCtx, [
                [
                    results.poseLandmarks[mpHolistic.POSE_LANDMARKS.LEFT_ELBOW],
                    results.leftHandLandmarks[0]
                ]
            ]);
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

        //用來呼叫身體(不包括頭部)各部位偵測的入口
        moveBody(results);

        /**
         * 左右肩膀z(與鏡頭距離)的平均值
         */
        let userShoulderZ = (results.poseLandmarks[12].z + results.poseLandmarks[11].z) / 2;
        // console.log(userShoulderZ);
        userZDistance(userShoulderZ);

    }
    else{
        bodyReset();
    }

    if (results.faceLandmarks != undefined) {

        // Head 畫上偵測的點跟線
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_RIGHT_EYE, { color: 'rgb(0,217,231)' });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_RIGHT_EYEBROW, { color: 'rgb(0,217,231)' });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_LEFT_EYE, { color: 'rgb(255,138,0)' });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_LEFT_EYEBROW, { color: 'rgb(255,138,0)' });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_FACE_OVAL, { color: '#E0E0E0', lineWidth: 5 });
        drawingUtils.drawConnectors(canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_LIPS, { color: '#E0E0E0', lineWidth: 5 });

        //用來呼叫頭部偵測的入口
        moveHead(results);
    }
    else{
        faceReset();
    }

    canvasCtx.restore();


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






//------------------------------------------------------------------------

function moveBody(results) {
    const spineCheck = document.getElementById('spineCheck');

    //若spine toggle有checked起來 偵測spine
    //呼叫spine偵測的function
    if (spineCheck.checked) {
        spineDetection(results);
    } else {
        //若沒checked的話 就會幫你重置
        vrmManager.rotation(Bone.Spine).x = 0;
        vrmManager.rotation(Bone.Spine).y = 0;
        vrmManager.rotation(Bone.Spine).z = 0;
    }


    let mult = 1; //vrm的右邊 使用者的左邊
    //呼叫arm偵測的function
    const armCheck = document.getElementById('armCheck');
    if (armCheck.checked) {
        const rightShoulder = results.poseLandmarks[12];
        const rightElbow = results.poseLandmarks[14];
        let rightWrist; //在這邊定義 是為了因為下面有用到rightWrist 如果這裡rightHandLandmarks undefined的話 rightWrist在裡面宣告的話 會沒進去 沒宣告到  ->下面要用到rightWrist的時候會錯
        let rightMidFin;

        const leftShoulder = results.poseLandmarks[11];
        const leftElbow = results.poseLandmarks[13];
        let leftWrist;
        let leftMidFin;

        {
            if (results.leftHandLandmarks != undefined) {
                vrmManager.rotation(Bone.LeftLowerArm).y = 0;
                vrmManager.rotation(Bone.LeftLowerArm).z = 0;
                
                leftWrist = results.leftHandLandmarks[0]; //這邊程式碼wrist的部分是連過去handpose
                leftMidFin = results.leftHandLandmarks[9];
                let shoulderPointL = pointToVec(leftShoulder) //pointToVec -> 把型態轉成Vector3 用getAngle() 一定要是Vector3的型態
                let elbowPointL = pointToVec(leftElbow)
                let wristPointL = pointToVec(leftWrist)
                    //肩膀 手肘 手腕夾的夾角
                let armAngleL = getAngle(shoulderPointL, elbowPointL, wristPointL);
                //vrm的左邊 使用者的右邊
                mult = -1;

                //判斷什麼時候進armOutDetection 或 armInDetection (呼叫arm偵測的function)
                //(leftElbow.y > leftShoulder.y && leftElbow.x > leftShoulder.x && armAngleL <= 0.25) || armAngleL > 0.8 => 原本的
                if (armAngleL > 1.2 && leftElbow.y > leftShoulder.y) { //230712 夾角夠大才進armOut 還有肩膀在手肘的上方 所以基本上只有手臂垂放下來或手臂垂放但稍微彎曲的時候才會進去
                    armOutDetection(results, mult);
                } else {
                    armInDetection(results, mult);
                }
            } else {
                //若results.leftHandLandmarks = undefined的話 就會幫你重置
                vrmManager.rotation(Bone.LeftUpperArm).y = 0;
                vrmManager.rotation(Bone.LeftUpperArm).z = rad(75);
                vrmManager.rotation(Bone.LeftLowerArm).y = 0;
                vrmManager.rotation(Bone.LeftLowerArm).z = 0;

            }
        } {
            if (results.rightHandLandmarks != undefined) {
                rightWrist = results.rightHandLandmarks[0]; //這邊程式碼wrist的部分是連過去handpose
                rightMidFin = results.rightHandLandmarks[9]
                let shoulderPointR = pointToVec(rightShoulder) //pointToVec -> 把型態轉成Vector3 用getAngle() 一定要是Vector3的型態
                let elbowPointR = pointToVec(rightElbow)
                let wristPointR = pointToVec(rightWrist)
                    //肩膀 手肘 手腕夾的夾角
                let armAngleR = getAngle(shoulderPointR, elbowPointR, wristPointR)
                    //vrm的右邊 使用者的左邊
                mult = 1;

                //判斷什麼時候進armOutDetection 或 armInDetection (呼叫arm偵測的function)
                //(rightElbow.y > rightShoulder.y && rightElbow.x < rightShoulder.x && armAngleR <= 0.25) || armAngleR > 0.8 => 原本的
                if (armAngleR > 1.2 && rightElbow.y > rightShoulder.y) { //230712 夾角夠大才進armOut 還有肩膀在手肘的上方 所以基本上只有手臂垂放下來或手臂垂放但稍微彎曲的時候才會進去
                    armOutDetection(results, mult);
                } else {
                    armInDetection(results, mult);
                }
            } else {
                //若results.rightHandLandmarks = undefined的話 就會幫你重置
                vrmManager.rotation(Bone.RightUpperArm).y = 0;
                vrmManager.rotation(Bone.RightUpperArm).z = rad(-75);
                vrmManager.rotation(Bone.RightLowerArm).y = 0;
                vrmManager.rotation(Bone.RightLowerArm).z = 0;
            }
        }

    } else {
        //若沒checked的話 就會幫你重置
        vrmManager.rotation(Bone.RightUpperArm).y = 0;
        vrmManager.rotation(Bone.RightUpperArm).z = rad(-75);
        vrmManager.rotation(Bone.RightLowerArm).y = 0;
        vrmManager.rotation(Bone.RightLowerArm).z = 0;
        vrmManager.rotation(Bone.LeftUpperArm).y = 0;
        vrmManager.rotation(Bone.LeftUpperArm).z = rad(75);
        vrmManager.rotation(Bone.LeftLowerArm).y = 0;
        vrmManager.rotation(Bone.LeftLowerArm).z = 0;

    }


    const handCheck = document.getElementById('handCheck');
    //呼叫hand偵測的function
    if (handCheck.checked) {
        if (results.leftHandLandmarks != undefined) {
            mult = -1;
            handDetection(results, mult);
        } else {
            //若results.leftHandLandmarks = undefined的話 就會幫你重置
            vrmManager.rotation(Bone.LeftHand).z = 0;
        }

        if (results.rightHandLandmarks != undefined) {
            mult = 1;
            handDetection(results, mult)
        } else {
            //若results.rightHandLandmarks = undefined的話 就會幫你重置
            vrmManager.rotation(Bone.RightHand).z = 0;
        }

    } else {
        //若沒checked的話 就會幫你重置
        vrmManager.rotation(Bone.RightHand).z = 0;
        vrmManager.rotation(Bone.LeftHand).z = 0;
    }


    //呼叫finger偵測的function
    const fingerCheck = document.getElementById('fingerCheck');
    if (fingerCheck.checked) {
        if (results.rightHandLandmarks == undefined) {
            fingerPoseReset("Right");
        }
        if (results.leftHandLandmarks == undefined) {
            fingerPoseReset("Left");
        }
        fingerDetection(results);
    } else {
        //若沒checked的話 就會幫你重置
        fingerPoseReset("Right");
        fingerPoseReset("Left");
    }


    //呼叫leg偵測的function
    const legCheck = document.getElementById('legCheck');
    if (legCheck.checked) {
        legDetection(results);
    } else {
        //若沒checked的話 就會幫你重置
        vrmManager.rotation(Bone.RightUpperLeg).x = 0;
        vrmManager.rotation(Bone.RightUpperLeg).z = 0;
        vrmManager.rotation(Bone.RightLowerLeg).x = 0;
        vrmManager.rotation(Bone.LeftUpperLeg).x = 0;
        vrmManager.rotation(Bone.LeftUpperLeg).z = 0;
        vrmManager.rotation(Bone.LeftLowerLeg).x = 0;

    }
}



function moveHead(results) {
    //呼叫spine偵測的function
    if (headCheck.checked) {
        headDetection(results);
    } else {
        //若沒checked的話 就會幫你重置
        vrmManager.rotation(Bone.Neck).x = 0;
        vrmManager.rotation(Bone.Neck).y = 0;
        vrmManager.rotation(Bone.Neck).z = 0;

        console.log("done")
    }


    //呼叫mouth偵測的function
    const mouthCheck = document.getElementById('mouthCheck');
    if (mouthCheck.checked) {
        mouthDetection(results);
    } else {
        //若沒checked的話 就會幫你重置
        vrmManager.vrm.blendShapeProxy._blendShapeGroups.I.weight = 0.3
        vrmManager.vrm.blendShapeProxy._blendShapeGroups.A.weight = 0
        vrmManager.vrm.blendShapeProxy._blendShapeGroups.E.weight = 0
        vrmManager.vrm.blendShapeProxy._blendShapeGroups.O.weight = 0
    }
}



/**
 * vrm動作重置function(身體) 
 */
 function bodyReset() { 

    vrmManager.rotation(Bone.Spine).x = 0;
    vrmManager.rotation(Bone.Spine).y = 0;
    vrmManager.rotation(Bone.Spine).z = 0;

    vrmManager.rotation(Bone.RightUpperArm).y = 0;
    vrmManager.rotation(Bone.RightUpperArm).z = -(Math.PI / 2 - 0.35);
    vrmManager.rotation(Bone.RightLowerArm).y = 0;
    vrmManager.rotation(Bone.RightLowerArm).z = -0.15;
    vrmManager.rotation(Bone.LeftUpperArm).y = 0;
    vrmManager.rotation(Bone.LeftUpperArm).z = Math.PI / 2 - 0.35;
    vrmManager.rotation(Bone.LeftLowerArm).y = 0;
    vrmManager.rotation(Bone.LeftLowerArm).z = 0.15;

    vrmManager.rotation(Bone.RightHand).z = -0.1;
    vrmManager.rotation(Bone.LeftHand).z = 0.1;
    vrmManager.rotation(Bone.RightThumbProximal).y = 0;
    vrmManager.rotation(Bone.RightThumbIntermediate).y = 0;
    vrmManager.rotation(Bone.RightThumbDistal).y = 0;
    vrmManager.rotation(Bone.RightIndexProximal).x = 0;
    vrmManager.rotation(Bone.RightIndexProximal).z = 0;
    vrmManager.rotation(Bone.RightIndexIntermediate).z = 0;
    vrmManager.rotation(Bone.RightIndexDistal).z = 0;
    vrmManager.rotation(Bone.RightMiddleProximal).z = 0;
    vrmManager.rotation(Bone.RightMiddleIntermediate).z = 0;
    vrmManager.rotation(Bone.RightMiddleDistal).z = 0;
    vrmManager.rotation(Bone.RightRingProximal).x = 0;
    vrmManager.rotation(Bone.RightRingProximal).z = 0;
    vrmManager.rotation(Bone.RightRingIntermediate).z = 0;
    vrmManager.rotation(Bone.RightRingDistal).z = 0;
    vrmManager.rotation(Bone.RightLittleProximal).x = 0;
    vrmManager.rotation(Bone.RightLittleProximal).z = 0;
    vrmManager.rotation(Bone.RightLittleIntermediate).z = 0;
    vrmManager.rotation(Bone.RightLittleDistal).z = 0;
    vrmManager.rotation(Bone.LeftThumbProximal).y = 0;
    vrmManager.rotation(Bone.LeftThumbIntermediate).y = 0;
    vrmManager.rotation(Bone.LeftThumbDistal).y = 0;
    vrmManager.rotation(Bone.LeftIndexProximal).x = 0;
    vrmManager.rotation(Bone.LeftIndexProximal).z = 0;
    vrmManager.rotation(Bone.LeftIndexIntermediate).z = 0;
    vrmManager.rotation(Bone.LeftIndexDistal).z = 0;
    vrmManager.rotation(Bone.LeftMiddleProximal).z = 0;
    vrmManager.rotation(Bone.LeftMiddleIntermediate).z = 0;
    vrmManager.rotation(Bone.LeftMiddleDistal).z = 0;
    vrmManager.rotation(Bone.LeftRingProximal).x = 0;
    vrmManager.rotation(Bone.LeftRingProximal).z = 0;
    vrmManager.rotation(Bone.LeftRingIntermediate).z = 0;
    vrmManager.rotation(Bone.LeftRingDistal).z = 0;
    vrmManager.rotation(Bone.LeftLittleProximal).x = 0;
    vrmManager.rotation(Bone.LeftLittleProximal).z = 0;
    vrmManager.rotation(Bone.LeftLittleIntermediate).z = 0;
    vrmManager.rotation(Bone.LeftLittleDistal).z = 0;
    vrmManager.rotation(Bone.RightUpperLeg).x = 0;
    vrmManager.rotation(Bone.RightUpperLeg).z = 0;
    vrmManager.rotation(Bone.RightLowerLeg).x = 0;
    vrmManager.rotation(Bone.LeftUpperLeg).x = 0;
    vrmManager.rotation(Bone.LeftUpperLeg).z = 0;
    vrmManager.rotation(Bone.LeftLowerLeg).x = 0;


    // 屁股位置還原到預設位置(需還原才能讓下方左右foot與toes方便與地面比較)
    vrmManager.position(Bone.Hips).y = 0.934829533;
}

function faceReset(){
    vrmManager.setPreset(Preset.BlinkR, 0);
    vrmManager.setPreset(Preset.BlinkL, 0);
    vrmManager.setLookAtTarget(0, 0);

    vrmManager.vrm.blendShapeProxy._blendShapeGroups.I.weight = 0.3
    vrmManager.vrm.blendShapeProxy._blendShapeGroups.A.weight = 0
    vrmManager.vrm.blendShapeProxy._blendShapeGroups.E.weight = 0
    vrmManager.vrm.blendShapeProxy._blendShapeGroups.O.weight = 0

    vrmManager.rotation(Bone.Neck).x = 0;
    vrmManager.rotation(Bone.Neck).y = 0;
    vrmManager.rotation(Bone.Neck).z = 0;
}