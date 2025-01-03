let hipsPosition = {
    hipsY: 0
};


/**
 * setHipsPosition 設定vrm Hips位置
 */
function setHipsPosition() {

    // 左右foot與toes，最小數字表示離地最近
    //getPartWorldPosition:取得該部位所在的world position(以整個vrm場景為主)
    const part = ["LeftFoot", "RightFoot", "LeftToes", "RightToes"];
    const positions = [vrmManager.getPartWorldPosition(Bone[part[0]]).y, vrmManager.getPartWorldPosition(Bone[part[1]]).y, vrmManager.getPartWorldPosition(Bone[part[2]]).y, vrmManager.getPartWorldPosition(Bone[part[3]]).y];
    const hipPos = vrmManager.getPartWorldPosition(Bone["Hips"]).y;

    //計算Hips之Y座標位置
    const hipsY = calcHipsPosition(positions, hipPos);
    hipsPosition = {
        hipsY: hipsY,
    }

    //移動Vrm的Hips之Y座標位置
    moveHipPosition(hipsPosition);


}

/**
 * 計算Hips的Y座標位置
 * @param {*} currentPositions 左右Foot與Toes四點位置
 * @param {*} currentHipsPos Hips位置
 * @returns Hips的Y座標位置
 */
function calcHipsPosition(currentPositions, currentHipsPos) {

    //找出左右Foot與Toes四點中,Y座標最小者(最上者)
    const min = Math.min(...currentPositions);
    const part = ["LeftFoot", "RightFoot", "LeftToes", "RightToes"];
    const index = currentPositions.indexOf(min);

    //最一開始建立VrmManager並載入vrm時其Hips,左右Foot與Toes的預設Y位置
    const defaultPositions = vrmManager.defaultWorldPositionY;

    //查找Y座標最小部位的預設Y位置
    const defaultPosition = defaultPositions[part[index]];

    //Hips移動距離 為 最小部位的預設Y位置(較下,數值大) - 最上面部位的現在Y位置(較上,數值小)  
    const movement = defaultPosition - min; //vrm model 向下移動距離=>(min離該部位預設位置的距離)

    //計算Hips移動後的Y座標位置 (vrm向下移動)
    const hipsY = currentHipsPos + movement;

    return hipsY;
}

/**
 * 移動Vrm的Hips之Y座標位置
 * @param {*} position 欲移動到的Y座標位置
 */
function moveHipPosition(position) {
    vrmManager.position(Bone.Hips).y = position.hipsY;
}