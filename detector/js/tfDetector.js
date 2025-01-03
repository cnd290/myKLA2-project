let tfVideo;
/**
 * tfModel模組  
 * (1)預設為undefined   
 * (2)於loadTfModel時載入TensorFlow Model 至 tfModel
 */
let tfModel;


/**
 * TensorFlow偵測結果  
 * (1)預設為一空陣列   
 * (2)於tfDetection進行偵測時，會不斷更新
 */
let tfFaceResults = [];

/**
 * Loading Spinner Element
 */
const load = document.getElementById('loading');

/**
 * 眼睛TopBar勾選元件
 */
const eyesCheck = document.getElementById('eyesCheck');

/**
 * 眼睛被勾選時，開始載入及進行 TensorFlow Detection
 */
// eyesCheck.addEventListener('change', async e => {
//     if (e.target.checked) { //當眼睛被勾選
//         if (tfModel == undefined) { //tfModel還未被載入表示TensorFlow偵測器
//             startTfDetector(); //開啟TensorFlow偵測器>>>載入tfModel
//         }
//     }
// });

/**
 * startTfDetection 開啟tensorflow偵測器   
 * (1)開啟Loading Spinner   
 * (2)載入偵測tfModel模組   
 * (3)關閉Loading Spinner  
 */
async function startTfDetector() {

    //開啟Loading Spinner  
    load.style.display = "flex";
    load.style.opacity = 1;
    document.getElementById("spinner").style.opacity = 1;
    document.getElementById("message").style.opacity = 1;



    //載入偵測tfModel模組 
    await loadTfModel();

    //需要跑第一次避免當機(第一次detect會跑比較久)
    await tfDetection()

    //關閉Loading Spinner  
    load.style.display = "none";
    load.style.opacity = 0;
}

/**
 * loadTfModel 
 * 匯入Tensorflow Facemesh package 至 tfModel
 */
async function loadTfModel() {
    tfModel = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
}



/**
 * tfDetection 進行TensorFlow偵測  
 * (1)傳送畫面給TensorFlow模組(tfModel)偵測    
 * (2)TensorFlow偵測結果存入tfFaceResults
 */
async function tfDetection() {
    //若tfFaceResults表示第一次進行TensorFlow偵測
    tfFaceResults = await tfModel.estimateFaces({
        input: tfVideo
    });

}


/**
 * tfResults 以TensorFlow偵測結果變動vrm tfModel
 */
function tfResults() {
    if (!eyesCheck.checked || tfFaceResults.length < 1) { //眼睛未被勾選或是還未獲取TensorFlow偵測結果
        eyeReset(); //還原至眼部預設動作
    } else { //當眼睛被勾選且獲取TensorFlow偵測結果
        eyeDetection(tfFaceResults); //進行眼部偵測動畫
    }
}

/**
 * tfDistance 
 * 計算 TensorFlow 模組產生的結果點之間之 距離
 * @param {*} startPoint 開始點
 * @param {*} endPoint 結束點
 * @returns 兩點距離
 */
function tfDistance(startPoint, endPoint) {
    const [startPointX, startPointY, startPointZ] = startPoint;
    const [endPointX, endPointY, endPointZ] = endPoint;

    const distanceX = endPointX - startPointX;
    const distanceY = endPointY - startPointY;
    const distanceZ = endPointZ - startPointZ;

    return Math.sqrt((distanceX * distanceX) + (distanceY * distanceY) + (distanceZ * distanceZ));
}