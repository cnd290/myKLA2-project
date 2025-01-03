/**
 * tfVideo TensorFlow 錄製VideoInput
 */
let tfVideo;

/**
 * tfModel模組  
 * (1)預設為undefined   
 * (2)於 loadTfModel 時載入TensorFlow Model 至 tfModel
 */
let tfModel;


/**
 * TensorFlow偵測結果  
 * (1)預設為一空陣列   
 * (2)於tfDetection進行偵測時，會不斷更新
 */
let tfFaceResults = [];


/**
 * startTfDetection 開啟tensorflow偵測器   
 * (1)開啟Loading Spinner   
 * (2)載入偵測tfModel模組   
 * (3)關閉Loading Spinner      
 */
async function startTfDetector() {
    console.log("startTfDetection")

    //載入偵測tfModel模組 
    await loadTfModel();

    //需要跑第一次避免當機
    await tfDetection()

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

    tfFaceResults = await tfModel.estimateFaces({
        input: tfVideo
    });

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

/**
 * 取得目前的臉部各點座標位置
 * @returns 臉部各點座標位置
 */
async function getTfFaceResult() {
    await tfDetection(); //進行偵測臉部各點座標位置
    return tfFaceResults;
}