/**
 * Flag:是否將錄製內容push進animationJSON  
 * 0:否 1:是
 */
let recordSwitch = 0;


let animationJSON = []; //vrm動作JSON資料

/**
 * 紀錄每一幀VRM各部位旋轉角度等資訊
 */
function recordJSON() {

    /**
     * 部位:{   
     *     VRM細部資料,   
     *     special:是否會在此部位做標記,   
     *     descriptText:動作名稱   
     * },   
     *    
     * hipPosition:Hips的Y座標位置,  
     *   
     * time:{   
     *      Time:此幀執行時間   
     * },   
     * editorTime:此幀被做特殊標記時記錄下的時間  
     */
    const thisFrame = {
        eye: {
            rightBlink: vrmManager.getPreset(Preset.BlinkR),
            leftBlink: vrmManager.getPreset(Preset.BlinkL),
            iris: {
                x: vrmManager.getLookAtTarget().x,
                y: vrmManager.getLookAtTarget().y
            },
            special: false,
            descriptText: ""
        },
        mouth: {
            A: vrmManager.getPreset(Preset.A),
            E: vrmManager.getPreset(Preset.E),
            I: vrmManager.getPreset(Preset.I),
            O: vrmManager.getPreset(Preset.O),
            eMouthShape: vrmManager.getEMouthShape(),
            mouthRatio: vrmManager.getMouthRatio(),
            special: false,
            descriptText: ""
        },
        neck: {
            x: vrmManager.rotation(Bone.Neck).x,
            y: vrmManager.rotation(Bone.Neck).y,
            z: vrmManager.rotation(Bone.Neck).z,
            special: false,
            descriptText: ""
        },
        spine: {
            x: vrmManager.rotation(Bone.Spine).x,
            y: vrmManager.rotation(Bone.Spine).y,
            z: vrmManager.rotation(Bone.Spine).z,
            special: false,
            descriptText: ""
        },
        rightUpperArm: {
            y: vrmManager.rotation(Bone.RightUpperArm).y,
            z: vrmManager.rotation(Bone.RightUpperArm).z,
            special: false,
            descriptText: ""
        },
        rightLowerArm: {
            y: vrmManager.rotation(Bone.RightLowerArm).y,
            z: vrmManager.rotation(Bone.RightLowerArm).z,
            special: false,
            descriptText: ""
        },
        leftUpperArm: {
            y: vrmManager.rotation(Bone.LeftUpperArm).y,
            z: vrmManager.rotation(Bone.LeftUpperArm).z,
            special: false,
            descriptText: ""
        },
        leftLowerArm: {
            y: vrmManager.rotation(Bone.LeftLowerArm).y,
            z: vrmManager.rotation(Bone.LeftLowerArm).z,
            special: false,
            descriptText: ""
        },
        rightHand: {
            z: vrmManager.rotation(Bone.RightHand).z,
            special: false,
            descriptText: ""
        },
        leftHand: {
            z: vrmManager.rotation(Bone.LeftHand).z,
            special: false,
            descriptText: ""
        },
        rightThumb: {
            proximal: {
                y: vrmManager.rotation(Bone.RightThumbProximal).y
            },
            intermediate: {
                y: vrmManager.rotation(Bone.RightThumbIntermediate).y
            },
            distal: {
                y: vrmManager.rotation(Bone.RightThumbDistal).y
            },
            special: false,
            descriptText: ""
        },
        rightIndex: {
            proximal: {
                x: vrmManager.rotation(Bone.RightIndexProximal).x,
                z: vrmManager.rotation(Bone.RightIndexProximal).z
            },
            intermediate: {
                z: vrmManager.rotation(Bone.RightIndexIntermediate).z
            },
            distal: {
                z: vrmManager.rotation(Bone.RightIndexDistal).z
            },
            special: false,
            descriptText: ""
        },
        rightMiddle: {
            proximal: {
                z: vrmManager.rotation(Bone.RightMiddleProximal).z
            },
            intermediate: {
                z: vrmManager.rotation(Bone.RightMiddleIntermediate).z
            },
            distal: {
                z: vrmManager.rotation(Bone.RightMiddleDistal).z
            },
            special: false,
            descriptText: ""
        },
        rightRing: {
            proximal: {
                x: vrmManager.rotation(Bone.RightRingProximal).x,
                z: vrmManager.rotation(Bone.RightRingProximal).z
            },
            intermediate: {
                z: vrmManager.rotation(Bone.RightRingIntermediate).z
            },
            distal: {
                z: vrmManager.rotation(Bone.RightRingDistal).z
            },
            special: false,
            descriptText: ""
        },
        rightLittle: {
            proximal: {
                x: vrmManager.rotation(Bone.RightLittleProximal).x,
                z: vrmManager.rotation(Bone.RightLittleProximal).z
            },
            intermediate: {
                z: vrmManager.rotation(Bone.RightLittleIntermediate).z
            },
            distal: {
                z: vrmManager.rotation(Bone.RightLittleDistal).z
            },
            special: false,
            descriptText: ""
        },
        leftThumb: {

            proximal: {
                y: vrmManager.rotation(Bone.LeftThumbProximal).y
            },
            intermediate: {
                y: vrmManager.rotation(Bone.LeftThumbIntermediate).y
            },
            distal: {
                y: vrmManager.rotation(Bone.LeftThumbDistal).y
            },
            special: false,
            descriptText: ""
        },
        leftIndex: {
            proximal: {
                x: vrmManager.rotation(Bone.LeftIndexProximal).x,
                z: vrmManager.rotation(Bone.LeftIndexProximal).z
            },
            intermediate: {
                z: vrmManager.rotation(Bone.LeftIndexIntermediate).z
            },
            distal: {
                z: vrmManager.rotation(Bone.LeftIndexDistal).z
            },
            special: false,
            descriptText: ""
        },
        leftMiddle: {
            proximal: {
                z: vrmManager.rotation(Bone.LeftMiddleProximal).z
            },
            intermediate: {
                z: vrmManager.rotation(Bone.LeftMiddleIntermediate).z
            },
            distal: {
                z: vrmManager.rotation(Bone.LeftMiddleDistal).z
            },
            special: false,
            descriptText: ""
        },
        leftRing: {
            proximal: {
                x: vrmManager.rotation(Bone.LeftRingProximal).x,
                z: vrmManager.rotation(Bone.LeftRingProximal).z
            },
            intermediate: {
                z: vrmManager.rotation(Bone.LeftRingIntermediate).z
            },
            distal: {
                z: vrmManager.rotation(Bone.LeftRingDistal).z
            },
            special: false,
            descriptText: ""
        },
        leftLittle: {
            proximal: {
                x: vrmManager.rotation(Bone.LeftLittleProximal).x,
                z: vrmManager.rotation(Bone.LeftLittleProximal).z
            },
            intermediate: {
                z: vrmManager.rotation(Bone.LeftLittleIntermediate).z
            },
            distal: {
                z: vrmManager.rotation(Bone.LeftLittleDistal).z
            },
            special: false,
            descriptText: ""
        },
        rightUpperLeg: {
            x: vrmManager.rotation(Bone.RightUpperLeg).x,
            z: vrmManager.rotation(Bone.RightUpperLeg).z,
            special: false,
            descriptText: ""
        },
        rightLowerLeg: {
            x: vrmManager.rotation(Bone.RightLowerLeg).x,
            special: false,
            descriptText: ""
        },
        leftUpperLeg: {
            x: vrmManager.rotation(Bone.LeftUpperLeg).x,
            z: vrmManager.rotation(Bone.LeftUpperLeg).z,
            special: false,
            descriptText: ""
        },
        leftLowerLeg: {
            x: vrmManager.rotation(Bone.LeftLowerLeg).x,
            special: false,
            descriptText: ""
        },
        hipPosition: {
            y: vrmManager.position(Bone.Hips).y
        },
        time: {
            Time: clock.elapsedTime
        },
        editorTime: 0,

    }



    if (recordSwitch) {
        animationJSON.push(thisFrame);
    }
}

/**
 * 使用者選擇的偵測距離
 */
let userPositionZ;


function clickRecord() {
    document.getElementById("stopBtn").disabled = false; //Able停止按鈕
    document.getElementById("recordBtn").disabled = true; //Disable錄製按紐
}

/**
 * 開始錄製
 */
function record() {
    clock.start(); //為了紀錄每幀執行時間，開始計時

    animationJSON = []; //清空animationJSON

    recordSwitch = 1; //開始push進animationJSON
}

function stop() {

    defaultLoading();

    recordSwitch = 0; //停止push進animationJSON

    //document.getElementById("stopBtn").disabled == false(停止錄製按鈕可以按) && userZFlag == 0(偵測使用者距離還沒到good之前) 以外的狀況進if 
    //不想讓他進的狀況 -> (偵測使用者距離但還沒到顯示good之前 已經可以按停止錄製按鈕了(因為錄製按鈕已按下了) 但不希望產出一個沒有資料的JSON檔)
    if (!(document.getElementById("stopBtn").disabled == false && userZFlag == 0)) {
        downloadFile();
    }
    document.getElementById("stopBtn").disabled = true; //Disable停止按紐
    document.getElementById("recordBtn").disabled = false; //Able錄製按紐

    userZFlag = 0;

    //允許更動偵測距離選項
    document.getElementById("distance1").disabled = false;
    document.getElementById("distance2").disabled = false;
    document.getElementById("distance3").disabled = false;


    animationJSON = []; //清空animationJSON
}


/**
 * 下載JSON檔
 */
function downloadFile() {
    // 檔名（包含副檔名）
    let fileName = "animation.json";

    if (document.getElementById("distance2").checked == true) {
        userPositionZ = "medium"
    } 
    else if (document.getElementById("distance1").checked == true) {
        userPositionZ = "short"
    }
    else if (document.getElementById("distance3").checked == true) {
        userPositionZ = "long"
    }
    else if (document.getElementById("distance4").checked == true) {
        userPositionZ = "extremelyShort"
    }
    

    // 檔案內容
    const dataObj = {
        animation: animationJSON,
        voice: "",
        userPositionZ: userPositionZ
    }

    const data = JSON.stringify(dataObj); //轉成字串

    // 生成 Blob 物件
    let blob = new Blob([data], {
        type: "charset=UTF-8",
    });

    // 生成 Blob 的網址
    let href = URL.createObjectURL(blob);

    // 生成 html 超連結（Blob網址）標籤，放入body
    let link = document.createElement("a");
    document.body.appendChild(link);
    link.href = href;
    link.download = fileName;

    // 手動 click
    link.click();
}

function downloadJSON(){
    let fileName = "animation.json";

    //讀取example.json
    let dataUrl = "./json/example.json"; //檔案路徑
    let xhr = new XMLHttpRequest();

    xhr.open('GET', dataUrl, true);
    xhr.send();

    //變更Element顏色
    xhr.onload = function() {
        let json = JSON.parse(this.responseText);
        // 檔案內容
        const dataObj = {
            animation: json.animation,
            voice: json.voice,
            userPositionZ: json.userPositionZ
        }

        const data = JSON.stringify(dataObj); //轉成字串

        // 生成 Blob 物件
        let blob = new Blob([data], {
            type: "charset=UTF-8",
        });

        // 生成 Blob 的網址
        let href = URL.createObjectURL(blob);

        // 生成 html 超連結（Blob網址）標籤，放入body
        let link = document.createElement("a");
        document.body.appendChild(link);
        link.href = href;
        link.download = fileName;

        // 手動 click
        link.click();
    }
}