/**
 * 主題顏色編號:取得color內的值
 */
const color = sessionStorage.getItem("color");

//延續上一頁面的主題顏色
if (color != undefined) {
    colorChange(color);

    //取得該主題選項的id
    let add = parseInt(color) + 1;
    let string = "flexRadioDefault" + add.toString();

    //將預設的選項取消勾選
    document.getElementById('flexRadioDefault1').checked = false;

    //勾選該主題選項
    document.getElementById(string).checked = true;
}

/**
 * 切換顏色
 * @param {*} choose 主題顏色編號(從0開始)
 */
function colorChange(choose) {

    //把選擇的主題顏色編號儲存到color
    sessionStorage.setItem("color", choose);

    //讀取color.json
    let dataUrl = "./json/color.json"; //檔案路徑
    let xhr = new XMLHttpRequest();

    xhr.open('GET', dataUrl, true);
    xhr.send();

    //變更Element顏色
    xhr.onload = function() {
        let data = JSON.parse(this.responseText);

        let container = document.querySelector('.container');
        container.style.backgroundColor = data.color[choose][0];

        let detectionControl = document.querySelector('#detectionControl');
        detectionControl.style.backgroundColor = data.color[choose][3];

        let loadSpin = document.querySelectorAll('.spinner');
        loadSpin.forEach(function(s) {
            s.style.borderTop = '32px solid ' + data.color[choose][3];
        });

        let partTitles = document.querySelectorAll(".partTitle");
        partTitles.forEach(function(partTitle) {
            partTitle.style.color = data.color[choose][2];
        });

        let bar = document.querySelector('#bar');
        bar.style.backgroundColor = data.color[choose][1]

    }

}

/**
 * 背景顏色編號:取得back內的值
 */
let back = sessionStorage.getItem("back");

//若先前有選擇過背景顏色
if (back != undefined) {
    backChange(back); //切換至背景顏色back

    //取得該主題選項的id
    let add = parseInt(back);
    let string = "back" + add.toString();

    //將預設的選項取消勾選
    document.getElementById('back0').checked = false;

    //勾選該主題選項
    document.getElementById(string).checked = true;
}

function backChange(num){
    sessionStorage.setItem("back",num)
    if(num == 0){
        renderer.setClearColor(0xE3EBF1, 1.0);
    }
    else{
        renderer.setClearColor(0x272727, 1.0);
    }
}