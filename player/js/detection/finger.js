/**
 * 進行手指偵測與評分(一根)   
 *【fingers】 Thumb,Index,Middle,Index,Little  
 *【fingerNum】 0  , 1   ,  2   ,  3 ,  4    
 * @param {*} side 左右邊  
 * @param {*} fingerNum 手指編號  
 * @param {*} hand leftHandLandmarks 或 rightHandLandmarks  
 * @param {*} standard JSON檔該幀手部的正確標準  
 * @returns 該根手指之等第評分  
 */
function compareFinger(side, fingerNum, hand, standard) {
    return new Promise((resolve) => {

        //該手未被偵測到,評分為0
        if (hand == undefined) {
            resolve(0);
        }

        /** 手指名稱 */
        const fingers = ["Thumb", "Index", "Middle", "Ring", "Little"];

        /**手指指節名稱(由下而上)*/
        const finger = fingers[fingerNum];

        /**該手指節點起始編號 */
        const startIndex = fingerNum * 4;

        /**該手指的fingerLandmark*/
        const fingerLandmark = [hand[startIndex + 1], hand[startIndex + 2], hand[startIndex + 3], hand[startIndex + 4]];

        /**手腕landmark*/
        const wristLandmark = hand[0];

        /**中指的最下邊指節點*/
        const midFinBottomLandmark = hand[9];

        /**各手指之等第的最大誤差限制*/
        const rangeLimit = {
            Thumb: {
                excellent: 0.2,
                good: 0.35,
                ok: 0.5
            },
            Index: {
                excellent: 0.1,
                good: 0.15,
                ok: 0.3
            },
            Middle: {
                excellent: 0.15,
                good: 0.3,
                ok: 0.55
            },
            Ring: {
                excellent: 0.15,
                good: 0.25,
                ok: 0.4
            },
            Little: {
                excellent: 0.3,
                good: 0.4,
                ok: 0.45
            }

        }


        /*
         * 手指
         * x方向:手指轉動
         * y方向:手指搖動
         * z方向:手指彈起按下
         */

        /**偵測計算之該根手指旋轉角度*/
        const detectedFinger = calcFingerRotation(side, finger, wristLandmark, midFinBottomLandmark, fingerLandmark);

        //Thumb轉動y方向，其他根手指轉動z方向
        const axis = finger === "Thumb" ? "y" : "z";

        //計算該根手指各指節誤差(由下而上)
        const deltaProximalAxis = Math.abs(standard.proximal[axis] - detectedFinger[0]);
        const deltaIntermediateAxis = Math.abs(standard.intermediate[axis] - detectedFinger[1]);
        const deltaDistalAxis = Math.abs(standard.distal[axis] - detectedFinger[2]);


        let delta = 0;

        //相加各指節誤差
        delta = deltaProximalAxis + deltaIntermediateAxis + deltaDistalAxis;

        if (finger == "Middle" || finger == "Thumb") {
            delta /= 3;
        } else {
            //其他根手指,要多 compare Proximal的X方向
            const deltaProximalX = Math.abs(standard.proximal.x - detectedFinger[3]);
            delta += deltaProximalX;
            delta /= 4;
        }

        let finalDelta = delta;

        //計算finger的等第分數
        const excellentLimit = rangeLimit[finger].excellent;
        const goodLimit = rangeLimit[finger].good;
        const okLimit = rangeLimit[finger].ok;
        const score = calcScore(finalDelta, excellentLimit, goodLimit, okLimit);
        resolve(score);

    });

}


/**
 * @param {*} side 左/右邊(vrm為主詞)
 * @param {*} finger 該手指手指名 "Thumb", "Index", "Middle", "Ring", "Little"
 * @param {*} wristLandmark 手腕座標位置
 * @param {*} midFinBottomLandmark 中指最底端點的座標位置
 * @param {*} fingerLandmark 該根手指座標 
 * @returns 該根手指各節旋轉資訊
 */
function calcFingerRotation(side, finger, wristLandmark, midFinBottomLandmark, fingerLandmark) {
    const mult = side == "right" ? 1 : -1;


    const midFinBottom = pointToVec(midFinBottomLandmark);

    const wrist = pointToVec(wristLandmark);

    //=============================
    //       Vecs 新增 Element
    // Vecs =  [wrist,(由下往上)手指的第一個點,第二個點,第三個點]
    //=============================
    let vecs = []
    vecs.push(wrist);
    for (let index = 0; index < 4; index++) {
        const fingerPoint = pointToVec(fingerLandmark[index]);
        vecs.push(fingerPoint);
    }

    //================================
    // 計算旋轉角度 (三點組成一角度)
    // Thumb:[Proximal.y,Intermediate.y,Distal.y] = [(wrist,一,二),(一,二,三),(二,三,四)] 
    // Middle:[Proximal.z,Intermediate.z,Distal.z] = [(wrist,一,二),(一,二,三),(二,三,四)] 
    // 其他手指:[Proximal.z,Intermediate.z,Distal.z,Proximal.x] = [(wrist,一,二),(一,二,三),(二,三,四),(中指底端,手腕,二)] 
    //================================
    let joints = [];

    for (let i = 1; i < vecs.length - 1; i++) {
        const firstPoint = vecs[i - 1];
        const centerPoint = vecs[i];
        const lastPoint = vecs[i + 1];
        joints.push(mult * getAngle(firstPoint, centerPoint, lastPoint) - Math.PI);
    }
    if (finger !== "Middle" && finger !== "Thumb" && midFinBottom != undefined) {
        joints.push(mult * getAngle(midFinBottom, wrist, vecs[2]));
    }

    const rotations = joints;
    return rotations;
}