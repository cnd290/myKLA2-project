/**
 * 切換VRM Model
 * @param {*} index 選項編號
 */
function vrmChange(index) {
    //id為其 VRM Model 的檔名(不含副檔名)
    let vrmFileName = document.getElementById("vrmSelect").options[index].id;

    //移除原先顯示的VRM Model
    scene.remove(allVrms[0].scene);

    //載入新vrm至場景當中
    vrmLoad(vrmFileName)
}