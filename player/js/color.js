/**
 * 主題顏色編號:取得color內的值
 */
const color = sessionStorage.getItem("color");

//若先前有選擇過主題顏色
if (color != undefined) {
    colorChange(color); //切換至主題顏色color
    document.getElementById(color).selected = true; //將選擇該項主題color
}


/**
 * 切換顏色
 * @param {*} choose 主題顏色編號(從0開始)
 */
function colorChange(choose) {

    sessionStorage.setItem("color", choose); //key:color =>value:choose

    let dataUrl = "./json/color.json"; //顏色設定資料的檔案路徑

    //讀JSON檔(顏色設定資料)
    let xhr = new XMLHttpRequest();

    //開啟並讀取檔案
    xhr.open('GET', dataUrl, true);
    xhr.send();

    //讀取完成後進行
    xhr.onload = function() {

        //讀取結果
        let data = JSON.parse(this.responseText);

        //背景顏色
        let bodyColor = document.querySelector('body');
        bodyColor.style.backgroundColor = data.color[choose][0];

        //Loading Bar 的 Spinner
        let loadSpin = document.querySelectorAll('.spinner');
        loadSpin.forEach(function(s) {
            s.style.borderTop = '32px solid ' + data.color[choose][3];
        });

        //Top Bar
        let topBarColor = document.querySelector('#bar');
        topBarColor.style.backgroundColor = data.color[choose][1];

        /*VRM播放器*/
        //VRM播放器的外框 (包住場景與播放器按鈕們)
        let outsideFrameColor = document.querySelector('#outsideFrame');
        outsideFrameColor.style.backgroundColor = data.color[choose][4];

        //VRM場景Container (各種提示+VRM Canvas)
        let KLAColor = document.querySelector('#KLA');
        KLAColor.style.backgroundColor = data.color[choose][7];

        //JSON拖拉提示
        let noticeColor = document.querySelector('#notice');
        noticeColor.style.color = data.color[choose][6];

        //VRM載入進度提示
        let noticeKLAColor = document.querySelector('#noticeKLA');
        noticeKLAColor.style.color = data.color[choose][6];

        //正在播放時間
        const labelEdit1Colors = document.querySelectorAll(".label_edit1");
        labelEdit1Colors.forEach(function(labelEdit1Color) {
            labelEdit1Color.style.color = data.color[choose][5];
        });

        //分隔斜線
        let slashColor = document.querySelector('#slash');
        slashColor.style.color = data.color[choose][5];

        //動畫總時間
        const labelEdit2Colors = document.querySelectorAll(".label_edit2");
        labelEdit2Colors.forEach(function(labelEdit2Color) {
            labelEdit2Color.style.color = data.color[choose][5];
        });


        /*警告提示*/
        //警告提示文字
        const alertContent = document.getElementById('alertContent');
        alertContent.style.color = data.color[choose][4];

        //確認按鈕
        const confirmBtn = document.getElementById("confirmBtn");
        confirmBtn.style.color = data.color[choose][2];
        confirmBtn.style.border = "0px solid " + data.color[choose][2];
        confirmBtn.style.backgroundColor = data.color[choose][3];

        //取消按鈕
        const cancelBtn = document.getElementById("cancel");
        cancelBtn.style.color = data.color[choose][2];
        cancelBtn.style.border = "0px solid " + data.color[choose][2];
        cancelBtn.style.backgroundColor = data.color[choose][3];

        /*倒數區*/
        //區域背景
        const countDown = document.getElementById('countDown');
        countDown.style.backgroundColor = data.color[choose][3];

        //倒數文字
        const actionNameText = document.querySelector("#actionNameText");
        actionNameText.style.color = data.color[choose][2];


        /*scoreList*/
        //區域背景
        const scoreList = document.querySelector('#scoreList');
        scoreList.style.backgroundColor = data.color[choose][3] + "ee";

        //ScoreList 標題(標題內容:Final Score)
        const scoreListHeader = document.querySelector('#scoreList header');
        scoreListHeader.style.color = data.color[choose][1];

        //各等第數量
        const scoreTexts = document.querySelectorAll('.scoreText');
        scoreTexts.forEach(function(scoreText) {
            scoreText.style.color = data.color[choose][2];
        });

        //最後的總平均等第
        const finalScore = document.querySelector('#finalScore');
        finalScore.style.color = data.color[choose][1];

        //部位細項結果區背景
        const resultOutterBackground = document.querySelector('#resultOutterBackground');
        resultOutterBackground.style.backgroundColor = data.color[choose][0];



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