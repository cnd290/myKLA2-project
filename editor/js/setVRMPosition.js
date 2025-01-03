//-------------------------everyNode (includes tween)--------------------------

// 藉由animate()進入everyNode()
// everyNode用處 : 讓虛擬人物利用json檔中一幀幀紀錄資料擺出相對應的動作 


//用在補間的資料
let hipsPosition = {    //補間動畫資料
    y: 0
};

function updateHipsPosition(position) {     //進行動畫function
    allVrms[0].humanoid.humanBones.hips[0].node.position.y = position.y + adjustHipPosition;
}

let rightUpperLegRotation = {
    x: 0,
    z: 0
};

function updateRightUpperLegRotation(rotation) {
    const rightUpperLegNode = vrmManager.rotation(Bone.RightUpperLeg);
    rightUpperLegNode.x = rotation.x;
    rightUpperLegNode.z = rotation.z;
}

let rightLowerLegRotation = {
    x: 0
};

function updateRightLowerLegRotation(rotation) {
    const rightLowerLegNode = vrmManager.rotation(Bone.RightLowerLeg);
    rightLowerLegNode.x = rotation.x;
}

let leftUpperLegRotation = {
    x: 0,
    z: 0
};

function updateLeftUpperLegRotation(rotation) {
    const leftUpperLegNode = vrmManager.rotation(Bone.LeftUpperLeg);
    leftUpperLegNode.x = rotation.x;
    leftUpperLegNode.z = rotation.z;
}

let leftLowerLegRotation = {
    x: 0
};

function updateLeftLowerLegRotation(rotation) {
    const leftLowerLegNode = vrmManager.rotation(Bone.LeftLowerLeg);
    leftLowerLegNode.x = rotation.x;
}

let rightUpperArmRotation = {
    y: 0,
    z: -(Math.PI / 2 - 0.35)
};

function updateRightUpperArmRotation(rotation) {
    const rightUpperArmNode = vrmManager.rotation(Bone.RightUpperArm);
    rightUpperArmNode.y = rotation.y;
    rightUpperArmNode.z = rotation.z;
}

let rightLowerArmRotation = {
    y: 0,
    z: -0.15
};

function updateRightLowerArmRotation(rotation) {
    const rightLowerArmNode = vrmManager.rotation(Bone.RightLowerArm);
    rightLowerArmNode.y = rotation.y;
    rightLowerArmNode.z = rotation.z;
}

let leftUpperArmRotation = {
    y: 0,
    z: Math.PI / 2 - 0.35
};

function updateLeftUpperArmRotation(rotation) {
    const leftUpperArmNode = vrmManager.rotation(Bone.LeftUpperArm);
    leftUpperArmNode.y = rotation.y;
    leftUpperArmNode.z = rotation.z;
}

let leftLowerArmRotation = {
    y: 0,
    z: 0.15
};

function updateLeftLowerArmRotation(rotation) {
    const leftLowerArmNode = vrmManager.rotation(Bone.LeftLowerArm);
    leftLowerArmNode.y = rotation.y;
    leftLowerArmNode.z = rotation.z;
}

let spineRotation = { 
    x: 0,
    y: 0,
    z: 0
};

function updateSpineRotation(rotation) {
    const chestNode = vrmManager.rotation(Bone.Spine);
    chestNode.x = rotation.x;
    chestNode.y = rotation.y;
    chestNode.z = rotation.z;
}

//Index為該幀幀數 有些部位不需要補間動畫 只需要擺放相對應轉動角度及張開程度
let everyNode = (index) => {    

    { //hips position
        const y = animation[index].hipPosition.y;

        hipsPosition = {
            y: y,
        };
        updateHipsPosition(hipsPosition);

    }


    // right blink
    {
        allVrms[0].blendShapeProxy._blendShapeGroups.Blink_R.weight = animation[index].eye.rightBlink;
    }
    // left blink
    {
        allVrms[0].blendShapeProxy._blendShapeGroups.Blink_L.weight = animation[index].eye.leftBlink;
    }
    //eyes
    {
        vrmManager.setLookAtTarget(animation[index].eye.iris.x, animation[index].eye.iris.y);
    }


    // mouth
    {
        allVrms[0].blendShapeProxy._blendShapeGroups.A.weight = animation[index].mouth.A;
        allVrms[0].blendShapeProxy._blendShapeGroups.E.weight = animation[index].mouth.E;
        allVrms[0].blendShapeProxy._blendShapeGroups.I.weight = animation[index].mouth.I;
        allVrms[0].blendShapeProxy._blendShapeGroups.O.weight = animation[index].mouth.O;
    }


    // neck 虛擬人物的脖子轉動角度為JSON檔此幀的脖子轉動角度
    { 
        allVrms[0].humanoid.humanBones.neck[0].node.rotation.x = animation[index].neck.x;
        allVrms[0].humanoid.humanBones.neck[0].node.rotation.y = animation[index].neck.y;
        allVrms[0].humanoid.humanBones.neck[0].node.rotation.z = animation[index].neck.z;
    }


    // spine
    {
        /**
         * 此幀json檔中紀錄的spine x,y,z旋轉角度
         */
        const x = animation[index].spine.x;
        const y = animation[index].spine.y;
        const z = animation[index].spine.z;

        //除了最後一幀資料 他下一筆沒有資料了 所以就不跑補間 只跑最後一筆自己的資料
        if (index < animation.length - 1) {
            /**
             * 下一幀json檔中紀錄的spine x,y,z旋轉角度
             */
            const x1 = animation[index + 1].spine.x; 
            const y1 = animation[index + 1].spine.y;
            const z1 = animation[index + 1].spine.z;

            //期間為兩幀之間的時間差
            const duration = animation[index + 1].time.Time - animation[index].time.Time;

            //利用在JSON檔紀錄的這一幀與下一幀腰的轉動角度來呈現補間動畫
            /**
             * 建立補間動畫
             * @param {*} current 補間動畫資料
             * @param {*} target 目標動作
             * @param {*} update 進行動畫function
             * @param {*} name 補間動畫名稱
             * @param {*} reset 恢復動作(目標動作後執行)
             */
            vrmManager.tween(spineRotation, {
                x: x,
                y: y,
                z: z
            }, () => { updateSpineRotation(spineRotation) }, "spine", {
                x: x1,
                y: y1,
                z: z1
            }, duration);
        } else {
            spineRotation = {
                x: x,
                y: y,
                z: z
            };
            updateSpineRotation(spineRotation)
        }
    }


    // rightUpperArm
    {
        const y = animation[index].rightUpperArm.y;
        const z = animation[index].rightUpperArm.z;

        if (index < animation.length - 1) { //除了最後一frame(index)資料 他下一筆沒有資料了 所以就不跑補間 只跑最後一筆自己的資料
            const y1 = animation[index + 1].rightUpperArm.y;
            const z1 = animation[index + 1].rightUpperArm.z;
            const duration = animation[index + 1].time.Time - animation[index].time.Time;
            vrmManager.tween(rightUpperArmRotation, {
                y: y,
                z: z
            }, () => { updateRightUpperArmRotation(rightUpperArmRotation) }, "rightUpperArm", {
                y: y1,
                z: z1
            }, duration);
        } else {
            rightUpperArmRotation = {
                y: y,
                z: z
            }
            updateRightUpperArmRotation(rightUpperArmRotation)
        }

    }
    //rightLowerArm
    {
        const y = animation[index].rightLowerArm.y;
        const z = animation[index].rightLowerArm.z;


        if (index < animation.length - 1) { //除了最後一frame(index)資料 他下一筆沒有資料了 所以就不跑補間 只跑最後一筆自己的資料
            const y1 = animation[index + 1].rightLowerArm.y;
            const z1 = animation[index + 1].rightLowerArm.z;
            const duration = animation[index + 1].time.Time - animation[index].time.Time;
            vrmManager.tween(rightLowerArmRotation, {
                y: y,
                z: z
            }, () => { updateRightLowerArmRotation(rightLowerArmRotation) }, "rightLowerArm", {
                y: y1,
                z: z1
            }, duration);
        } else {
            rightLowerArmRotation = {
                y: y,
                z: z
            }
            updateRightLowerArmRotation(rightLowerArmRotation)
        }
    }
    // leftUpperArm
    {
        const y = animation[index].leftUpperArm.y;
        const z = animation[index].leftUpperArm.z;

        if (index < animation.length - 1) { //除了最後一frame(index)資料 他下一筆沒有資料了 所以就不跑補間 只跑最後一筆自己的資料
            const y1 = animation[index + 1].leftUpperArm;
            const z1 = animation[index + 1].leftUpperArm;
            const duration = animation[index + 1].time.Time - animation[index].time.Time;
            vrmManager.tween(leftUpperArmRotation, {
                y: y,
                z: z
            }, () => { updateLeftUpperArmRotation(leftUpperArmRotation) }, "leftUpperArm", {
                y: y1,
                z: z1
            }, duration);
        } else {
            leftUpperArmRotation = {
                y: y,
                z: z
            }
            updateLeftUpperArmRotation(leftUpperArmRotation)
        }

    }
    //leftLowerArm
    {
        const y = animation[index].leftLowerArm.y;
        const z = animation[index].leftLowerArm.z;



        if (index < animation.length - 1) { //除了最後一frame(index)資料 他下一筆沒有資料了 所以就不跑補間 只跑最後一筆自己的資料
            const y1 = animation[index + 1].leftLowerArm.y;
            const z1 = animation[index + 1].leftLowerArm.z;
            const duration = animation[index + 1].time.Time - animation[index].time.Time;
            vrmManager.tween(leftLowerArmRotation, {
                y: y,
                z: z
            }, () => { updateLeftLowerArmRotation(leftLowerArmRotation) }, "leftLowerArm", {
                y: y1,
                z: z1
            }, duration);
        } else {
            leftLowerArmRotation = {
                y: y,
                z: z
            };
            updateLeftLowerArmRotation(leftLowerArmRotation)
        }
    }


    //rightHand (wrist)
    {
        allVrms[0].humanoid.humanBones.rightHand[0].node.rotation.z = animation[index].rightHand.z;
    }
    //leftHand
    {
        allVrms[0].humanoid.humanBones.leftHand[0].node.rotation.z = animation[index].leftHand.z;
    }


    //finger
    //right thumb
    {
        allVrms[0].humanoid.humanBones.rightThumbProximal[0].node.rotation.y = animation[index].rightThumb.proximal.y;

        allVrms[0].humanoid.humanBones.rightThumbIntermediate[0].node.rotation.y = animation[index].rightThumb.intermediate.y;

        allVrms[0].humanoid.humanBones.rightThumbDistal[0].node.rotation.y = animation[index].rightThumb.distal.y;
    }
    //right index
    {
        allVrms[0].humanoid.humanBones.rightIndexProximal[0].node.rotation.x = animation[index].rightIndex.proximal.x;
        
        allVrms[0].humanoid.humanBones.rightIndexProximal[0].node.rotation.z = animation[index].rightIndex.proximal.z;

        allVrms[0].humanoid.humanBones.rightIndexIntermediate[0].node.rotation.z = animation[index].rightIndex.intermediate.z;

        allVrms[0].humanoid.humanBones.rightIndexDistal[0].node.rotation.z = animation[index].rightIndex.distal.z;
    }
    //right middle
    {
        allVrms[0].humanoid.humanBones.rightMiddleProximal[0].node.rotation.z = animation[index].rightMiddle.proximal.z;

        allVrms[0].humanoid.humanBones.rightMiddleIntermediate[0].node.rotation.z = animation[index].rightMiddle.intermediate.z;

        allVrms[0].humanoid.humanBones.rightMiddleDistal[0].node.rotation.z = animation[index].rightMiddle.distal.z;
    }
    //right ring
    {
        allVrms[0].humanoid.humanBones.rightRingProximal[0].node.rotation.x = animation[index].rightRing.proximal.x;
        
        allVrms[0].humanoid.humanBones.rightRingProximal[0].node.rotation.z = animation[index].rightRing.proximal.z;

        allVrms[0].humanoid.humanBones.rightRingIntermediate[0].node.rotation.z = animation[index].rightRing.intermediate.z;

        allVrms[0].humanoid.humanBones.rightRingDistal[0].node.rotation.z = animation[index].rightRing.distal.z;
    }
    //right little
    {
        allVrms[0].humanoid.humanBones.rightLittleProximal[0].node.rotation.x = animation[index].rightLittle.proximal.x;
        
        allVrms[0].humanoid.humanBones.rightLittleProximal[0].node.rotation.z = animation[index].rightLittle.proximal.z;

        allVrms[0].humanoid.humanBones.rightLittleIntermediate[0].node.rotation.z = animation[index].rightLittle.intermediate.z;

        allVrms[0].humanoid.humanBones.rightLittleDistal[0].node.rotation.z = animation[index].rightLittle.distal.z;
    }

    //left thumb
    {
        allVrms[0].humanoid.humanBones.leftThumbProximal[0].node.rotation.y = animation[index].leftThumb.proximal.y;

        allVrms[0].humanoid.humanBones.leftThumbIntermediate[0].node.rotation.y = animation[index].leftThumb.intermediate.y;

        allVrms[0].humanoid.humanBones.leftThumbDistal[0].node.rotation.y = animation[index].leftThumb.distal.y;
    }
    //left index
    {
        allVrms[0].humanoid.humanBones.leftIndexProximal[0].node.rotation.x = animation[index].leftIndex.proximal.x;
        
        allVrms[0].humanoid.humanBones.leftIndexProximal[0].node.rotation.z = animation[index].leftIndex.proximal.z;

        allVrms[0].humanoid.humanBones.leftIndexIntermediate[0].node.rotation.z = animation[index].leftIndex.intermediate.z;

        allVrms[0].humanoid.humanBones.leftIndexDistal[0].node.rotation.z = animation[index].leftIndex.distal.z;
    }
    //left middle
    {
        allVrms[0].humanoid.humanBones.leftMiddleProximal[0].node.rotation.z = animation[index].leftMiddle.proximal.z;

        allVrms[0].humanoid.humanBones.leftMiddleIntermediate[0].node.rotation.z = animation[index].leftMiddle.intermediate.z;

        allVrms[0].humanoid.humanBones.leftMiddleDistal[0].node.rotation.z = animation[index].leftMiddle.distal.z;
    }
    //left ring
    {
        allVrms[0].humanoid.humanBones.leftRingProximal[0].node.rotation.x = animation[index].leftRing.proximal.x;
        
        allVrms[0].humanoid.humanBones.leftRingProximal[0].node.rotation.z = animation[index].leftRing.proximal.z;

        allVrms[0].humanoid.humanBones.leftRingIntermediate[0].node.rotation.z = animation[index].leftRing.intermediate.z;

        allVrms[0].humanoid.humanBones.leftRingDistal[0].node.rotation.z = animation[index].leftRing.distal.z;
    }
    //right little
    {
        allVrms[0].humanoid.humanBones.leftLittleProximal[0].node.rotation.x = animation[index].leftLittle.proximal.x;
       
        allVrms[0].humanoid.humanBones.leftLittleProximal[0].node.rotation.z = animation[index].leftLittle.proximal.z;

        allVrms[0].humanoid.humanBones.leftLittleIntermediate[0].node.rotation.z = animation[index].leftLittle.intermediate.z;

        allVrms[0].humanoid.humanBones.leftLittleDistal[0].node.rotation.z = animation[index].leftLittle.distal.z;
    }


    // rightUpperLeg
    {
        const x = animation[index].rightUpperLeg.x;
        const z = animation[index].rightUpperLeg.z;

        if (index < animation.length - 1) { //除了最後一frame(index)資料 他下一筆沒有資料了 所以就不跑補間 只跑最後一筆自己的資料
            const x1 = animation[index + 1].rightUpperLeg.x;
            const z1 = animation[index + 1].rightUpperLeg.z;
            const duration = animation[index + 1].time.Time - animation[index].time.Time;
            vrmManager.tween(rightUpperLegRotation, {
                x: x,
                z: z
            }, () => { updateRightUpperLegRotation(rightUpperLegRotation) }, "rightUpperLeg", {
                x: x1,
                z: z1
            }, duration);
        } else {
            rightUpperLegRotation = {
                x: x,
                z: z
            };
            updateRightUpperLegRotation(rightUpperLegRotation);
        }
    }
    //rightLowerLeg
    {
        const x = animation[index].rightLowerLeg.x;

        if (index < animation.length - 1) { //除了最後一frame(index)資料 他下一筆沒有資料了 所以就不跑補間 只跑最後一筆自己的資料
            const x1 = animation[index + 1].rightLowerLeg.x;
            const duration = animation[index + 1].time.Time - animation[index].time.Time;
            vrmManager.tween(rightLowerLegRotation, {
                x: x
            }, () => { updateRightLowerLegRotation(rightLowerLegRotation) }, "rightLowerLeg", {
                x: x1
            }, duration);
        } else {
            rightLowerLegRotation = {
                x: x
            };
            updateRightLowerLegRotation(rightLowerLegRotation);
        }

    }
    // leftUpperLeg
    {
        const x = animation[index].leftUpperLeg.x;
        const z = animation[index].leftUpperLeg.z;

        if (index < animation.length - 1) { //除了最後一frame(index)資料 他下一筆沒有資料了 所以就不跑補間 只跑最後一筆自己的資料
            const x1 = animation[index + 1].leftUpperLeg.x;
            const z1 = animation[index + 1].leftUpperLeg.z;
            const duration = animation[index + 1].time.Time - animation[index].time.Time;
            vrmManager.tween(leftUpperLegRotation, {
                x: x,
                z: z
            }, () => { updateLeftUpperLegRotation(leftUpperLegRotation) }, "leftUpperLeg", {
                x: x1,
                z: z1
            }, duration);
        } else {
            leftUpperLegRotation = {
                x: x,
                z: z
            };
            updateLeftUpperLegRotation(leftUpperLegRotation)
        }
    }
    //leftLowerLeg
    {
        const x = animation[index].leftLowerLeg.x;

        if (index < animation.length - 1) { //除了最後一frame(index)資料 他下一筆沒有資料了 所以就不跑補間 只跑最後一筆自己的資料
            const x1 = animation[index + 1].leftLowerLeg.x;
            const duration = animation[index + 1].time.Time - animation[index].time.Time;
            vrmManager.tween(leftLowerLegRotation, {
                x: x
            }, () => { updateLeftLowerLegRotation(leftLowerLegRotation) }, "leftLowerLeg", {
                x: x1
            }, duration);
        } else {
            leftLowerLegRotation = {
                x: x
            }
            updateLeftLowerLegRotation(leftLowerLegRotation);
        }

    }
}

//-------------------------------------------------------------------------------

/**
 * vrm動作重置function   
 * 用在 -> 按下stop按鈕   
 * 按下往前五秒按鈕時間小於0   
 */
 function positionReset() { 
    vrmManager.setPreset(Preset.BlinkR, 0);
    vrmManager.setPreset(Preset.BlinkL, 0);
    vrmManager.setLookAtTarget(0, 0);

    allVrms[0].blendShapeProxy._blendShapeGroups.A.weight = 0;
    allVrms[0].blendShapeProxy._blendShapeGroups.E.weight = 0;
    allVrms[0].blendShapeProxy._blendShapeGroups.I.weight = 0.2;
    allVrms[0].blendShapeProxy._blendShapeGroups.O.weight = 0;

    vrmManager.rotation(Bone.Neck).x = 0;
    vrmManager.rotation(Bone.Neck).y = 0;
    vrmManager.rotation(Bone.Neck).z = 0;

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
    allVrms[0].humanoid.humanBones.hips[0].node.position.y = 1;
}

/**
 * 按stop按鈕跟影片播放結束時 補間動畫資料需要先還原   
 * 下次播放的時候 才不會從最後停止的動作開始做
 */
 function resetTweenData() { 
    hipsPosition = {
        y: 0
    };


    rightUpperLegRotation = {
        x: 0,
        z: 0
    };



    rightLowerLegRotation = {
        x: 0
    };


    leftUpperLegRotation = {
        x: 0,
        z: 0
    };


    leftLowerLegRotation = {
        x: 0
    };


    rightUpperArmRotation = {
        y: 0,
        z: -(Math.PI / 2 - 0.35)
    };



    rightLowerArmRotation = {
        y: 0,
        z: -0.15
    };



    leftUpperArmRotation = {
        y: 0,
        z: Math.PI / 2 - 0.35
    };


    leftLowerArmRotation = {
        y: 0,
        z: 0.15
    };


    spineRotation = {
        x: 0,
        y: 0,
        z: 0
    };


}

/**
 * 讓vrm可以即時擺出相對應姿勢
 * 暫停期間若按下往前五秒/往後五秒 要讓vrm馬上擺出該對應的姿勢
 * 用在 -> forward跟backward的時候
 */
 function setPosition(index) {
    {
        allVrms[0].humanoid.humanBones.hips[0].node.position.y = animation[index].hipPosition.y + adjustHipPosition;
        console.log("setPosition" + allVrms[0].humanoid.humanBones.hips[0].node.position.y)
    }

    {
        allVrms[0].blendShapeProxy._blendShapeGroups.Blink_R.weight = animation[index].eye.rightBlink
    }
    // left blink
    {
        allVrms[0].blendShapeProxy._blendShapeGroups.Blink_L.weight = animation[index].eye.leftBlink
    }
    //eyes
    {
        lookAtTarget.position.x = animation[index].eye.iris.x
        lookAtTarget.position.y = animation[index].eye.iris.y
    }
    // mouth
    {
        allVrms[0].blendShapeProxy._blendShapeGroups.A.weight = animation[index].mouth.A;
        allVrms[0].blendShapeProxy._blendShapeGroups.E.weight = animation[index].mouth.E;
        allVrms[0].blendShapeProxy._blendShapeGroups.I.weight = animation[index].mouth.I;
        allVrms[0].blendShapeProxy._blendShapeGroups.O.weight = animation[index].mouth.O;
    }
    // neck
    {
        allVrms[0].humanoid.humanBones.neck[0].node.rotation.x = animation[index].neck.x
        allVrms[0].humanoid.humanBones.neck[0].node.rotation.y = animation[index].neck.y
        allVrms[0].humanoid.humanBones.neck[0].node.rotation.z = animation[index].neck.z
            // console.log(index)
            //animation ?
    }
    // spine
    {
        allVrms[0].humanoid.humanBones.spine[0].node.rotation.x = animation[index].spine.x
        allVrms[0].humanoid.humanBones.spine[0].node.rotation.y = animation[index].spine.y
        allVrms[0].humanoid.humanBones.spine[0].node.rotation.z = animation[index].spine.z

    }

    //rightUpperArm
    {
        allVrms[0].humanoid.humanBones.rightUpperArm[0].node.rotation.y = animation[index].rightUpperArm.y
        allVrms[0].humanoid.humanBones.rightUpperArm[0].node.rotation.z = animation[index].rightUpperArm.z
    }
    //rightLowerArm
    {
        allVrms[0].humanoid.humanBones.rightLowerArm[0].node.rotation.y = animation[index].rightLowerArm.y
        allVrms[0].humanoid.humanBones.leftLowerArm[0].node.rotation.z = animation[index].leftLowerArm.z;


    }
    //leftUpperArm
    {
        allVrms[0].humanoid.humanBones.leftUpperArm[0].node.rotation.y = animation[index].leftUpperArm.y
        allVrms[0].humanoid.humanBones.leftUpperArm[0].node.rotation.z = animation[index].leftUpperArm.z
    }
    //leftLowerArm
    {
        allVrms[0].humanoid.humanBones.leftLowerArm[0].node.rotation.y = animation[index].leftLowerArm.y
        allVrms[0].humanoid.humanBones.leftLowerArm[0].node.rotation.z = animation[index].leftLowerArm.z;
    }


    //rightHand (wrist)
    {
        allVrms[0].humanoid.humanBones.rightHand[0].node.rotation.z = animation[index].rightHand.z
    }
    //leftHand
    {
        allVrms[0].humanoid.humanBones.leftHand[0].node.rotation.z = animation[index].leftHand.z
    }
    //finger
    //right thumb
    {
        allVrms[0].humanoid.humanBones.rightThumbProximal[0].node.rotation.y = animation[index].rightThumb.proximal.y;

        allVrms[0].humanoid.humanBones.rightThumbIntermediate[0].node.rotation.y = animation[index].rightThumb.intermediate.y;

        allVrms[0].humanoid.humanBones.rightThumbDistal[0].node.rotation.y = animation[index].rightThumb.distal.y;
    }
    //right index
    {
        allVrms[0].humanoid.humanBones.rightIndexProximal[0].node.rotation.x = animation[index].rightIndex.proximal.x;
        allVrms[0].humanoid.humanBones.rightIndexProximal[0].node.rotation.z = animation[index].rightIndex.proximal.z;

        allVrms[0].humanoid.humanBones.rightIndexIntermediate[0].node.rotation.z = animation[index].rightIndex.intermediate.z;

        allVrms[0].humanoid.humanBones.rightIndexDistal[0].node.rotation.z = animation[index].rightIndex.distal.z;
    }
    //right middle
    {
        allVrms[0].humanoid.humanBones.rightMiddleProximal[0].node.rotation.z = animation[index].rightMiddle.proximal.z;

        allVrms[0].humanoid.humanBones.rightMiddleIntermediate[0].node.rotation.z = animation[index].rightMiddle.intermediate.z;

        allVrms[0].humanoid.humanBones.rightMiddleDistal[0].node.rotation.z = animation[index].rightMiddle.distal.z;
    }
    //right ring
    {
        allVrms[0].humanoid.humanBones.rightRingProximal[0].node.rotation.x = animation[index].rightRing.proximal.x;
        allVrms[0].humanoid.humanBones.rightRingProximal[0].node.rotation.z = animation[index].rightRing.proximal.z;

        allVrms[0].humanoid.humanBones.rightRingIntermediate[0].node.rotation.z = animation[index].rightRing.intermediate.z;

        allVrms[0].humanoid.humanBones.rightRingDistal[0].node.rotation.z = animation[index].rightRing.distal.z;
    }
    //right little
    {
        allVrms[0].humanoid.humanBones.rightLittleProximal[0].node.rotation.x = animation[index].rightLittle.proximal.x;
        allVrms[0].humanoid.humanBones.rightLittleProximal[0].node.rotation.z = animation[index].rightLittle.proximal.z;

        allVrms[0].humanoid.humanBones.rightLittleIntermediate[0].node.rotation.z = animation[index].rightLittle.intermediate.z;

        allVrms[0].humanoid.humanBones.rightLittleDistal[0].node.rotation.z = animation[index].rightLittle.distal.z;
    }

    //left thumb
    {
        allVrms[0].humanoid.humanBones.leftThumbProximal[0].node.rotation.y = animation[index].leftThumb.proximal.y;

        allVrms[0].humanoid.humanBones.leftThumbIntermediate[0].node.rotation.y = animation[index].leftThumb.intermediate.y;

        allVrms[0].humanoid.humanBones.leftThumbDistal[0].node.rotation.y = animation[index].leftThumb.distal.y;
    }
    //left index
    {
        allVrms[0].humanoid.humanBones.leftIndexProximal[0].node.rotation.x = animation[index].leftIndex.proximal.x;
        allVrms[0].humanoid.humanBones.leftIndexProximal[0].node.rotation.z = animation[index].leftIndex.proximal.z;

        allVrms[0].humanoid.humanBones.leftIndexIntermediate[0].node.rotation.z = animation[index].leftIndex.intermediate.z;

        allVrms[0].humanoid.humanBones.leftIndexDistal[0].node.rotation.z = animation[index].leftIndex.distal.z;
    }
    //left middle
    {
        allVrms[0].humanoid.humanBones.leftMiddleProximal[0].node.rotation.z = animation[index].leftMiddle.proximal.z;

        allVrms[0].humanoid.humanBones.leftMiddleIntermediate[0].node.rotation.z = animation[index].leftMiddle.intermediate.z;

        allVrms[0].humanoid.humanBones.leftMiddleDistal[0].node.rotation.z = animation[index].leftMiddle.distal.z;
    }
    //left ring
    {
        allVrms[0].humanoid.humanBones.leftRingProximal[0].node.rotation.x = animation[index].leftRing.proximal.x;
        allVrms[0].humanoid.humanBones.leftRingProximal[0].node.rotation.z = animation[index].leftRing.proximal.z;

        allVrms[0].humanoid.humanBones.leftRingIntermediate[0].node.rotation.z = animation[index].leftRing.intermediate.z;

        allVrms[0].humanoid.humanBones.leftRingDistal[0].node.rotation.z = animation[index].leftRing.distal.z;
    }
    //right little
    {
        allVrms[0].humanoid.humanBones.leftLittleProximal[0].node.rotation.x = animation[index].leftLittle.proximal.x;
        allVrms[0].humanoid.humanBones.leftLittleProximal[0].node.rotation.z = animation[index].leftLittle.proximal.z;

        allVrms[0].humanoid.humanBones.leftLittleIntermediate[0].node.rotation.z = animation[index].leftLittle.intermediate.z;

        allVrms[0].humanoid.humanBones.leftLittleDistal[0].node.rotation.z = animation[index].leftLittle.distal.z;
    }

    //rightUpperLeg
    {
        allVrms[0].humanoid.humanBones.rightUpperLeg[0].node.rotation.x = animation[index].rightUpperLeg.x
        allVrms[0].humanoid.humanBones.rightUpperLeg[0].node.rotation.z = animation[index].rightUpperLeg.z
    }
    //rightLowerLeg
    {
        allVrms[0].humanoid.humanBones.rightLowerLeg[0].node.rotation.x = animation[index].rightLowerLeg.x
    }
    //leftUpperLeg
    {
        allVrms[0].humanoid.humanBones.leftUpperLeg[0].node.rotation.x = animation[index].leftUpperLeg.x
        allVrms[0].humanoid.humanBones.leftUpperLeg[0].node.rotation.z = animation[index].leftUpperLeg.z
    }
    //leftLowerLeg
    {
        allVrms[0].humanoid.humanBones.leftLowerLeg[0].node.rotation.x = animation[index].leftLowerLeg.x
    }
}