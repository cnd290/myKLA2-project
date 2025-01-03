/**
 * 主題顏色編號:取得color內的值  
 * 抓現在的主題顏色 color為數字(0,1,2...)   
 * -> detector,player那邊設定的主題顏色
 */
const color = sessionStorage.getItem("color"); 

//延續上一頁面的主題顏色
if (color != undefined) {
    colorChange(color);

    //選單選起該主題選項
    document.getElementById(color).selected = true; 
}

/**
 * 用來記錄fileList外框的顏色 
 * 以便利用在edit.js 
 * -> 從editList切換到fileList 可以顯示目前主題的fileList外框顏色
 */
let fileColor;

/**
 * 切換顏色
 * @param {*} choose 主題顏色編號(從0開始)
 */
function colorChange(choose) {

    //把選擇的主題顏色編號儲存到color
    sessionStorage.setItem("color", choose); //key value

    //讀取color.json
    let dataUrl = "./json/color.json"; //檔案路徑
    let xhr = new XMLHttpRequest();

    xhr.open('GET', dataUrl, true);
    xhr.send();

    //變更Element顏色
    xhr.onload = function() {
        let data = JSON.parse(this.responseText); //JSON內容

        let bodyColor = document.querySelector('body');
        bodyColor.style.backgroundColor = data.color[choose][0];

        let loadSpin = document.querySelectorAll('.spinner');
        loadSpin.forEach(function(s) {
            s.style.borderTop = '32px solid ' + data.color[choose][3];
        });

        let topBarColor = document.querySelector('#bar');
        topBarColor.style.backgroundColor = data.color[choose][1];

        let fileBoxColor1 = document.querySelector('.listOuterFrame');
        fileBoxColor1.style.backgroundColor = data.color[choose][3];

        let fileBoxColor2 = document.querySelector('.fileListLabel');
        fileBoxColor2.style.backgroundColor = data.color[choose][3];

        fileColor = data.color[choose][3]; 

        //從其他頁面(player...)切回到editor 讓預設情況是顯示fileList
        changeToFile();

        let titleColor = document.querySelector('.title');
        titleColor.style.color = data.color[choose][2];


        let outsideFrameColor = document.querySelector('#outsideFrame');
        outsideFrameColor.style.backgroundColor = data.color[choose][4];

        const alertContent = document.getElementById('alertContent');
        alertContent.style.color = data.color[choose][4];

        const confirmBtns = document.querySelectorAll(".confirm");
        confirmBtns.forEach(function(confirmBtn) {
            confirmBtn.style.color = data.color[choose][2];
            confirmBtn.style.border = "0px solid " + data.color[choose][2];
            confirmBtn.style.backgroundColor = data.color[choose][3];
        });
        const cancelBtn = document.getElementById("cancel");
        cancelBtn.style.color = data.color[choose][2];
        cancelBtn.style.border = "0px solid " + data.color[choose][2];
        cancelBtn.style.backgroundColor = data.color[choose][3];

        let noticeColor = document.querySelector('#notice');
        noticeColor.style.color = data.color[choose][6];

        let noticeKLAColor = document.querySelector('#noticeKLA');
        noticeKLAColor.style.color = data.color[choose][6];

        const labelEdit1Colors = document.querySelectorAll(".label_edit1");
        labelEdit1Colors.forEach(function(labelEdit1Color) {
            labelEdit1Color.style.color = data.color[choose][5];
        });

        const labelEdit2Colors = document.querySelectorAll(".label_edit2");
        labelEdit2Colors.forEach(function(labelEdit2Color) {
            labelEdit2Color.style.color = data.color[choose][5];
        });

        let slashColor = document.querySelector('#slash');
        slashColor.style.color = data.color[choose][5];

        let KLAColor = document.querySelector('#KLA');
        KLAColor.style.backgroundColor = data.color[choose][7];


    }

}

/**
 * 背景顏色編號:取得back內的值
 */
let back = sessionStorage.getItem("back");

//若先前有選擇過背景顏色
if (back != undefined) {
    backChange(back); //切換至背景顏色back
    back = parseInt(back, 10)+10
    document.getElementById(back).selected = true; //將選擇該項背景back
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