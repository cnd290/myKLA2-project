/**
 * 用來製造隨機的六碼id
*/
function getRandomId() {
    let str = "";
    for (let i = 0; i < 6; i++) {

        //為0或32
        let toLowercase = Math.floor(Math.random() * 2) * 32;

        /** 
         * 97 -> 65 + 32    65 -> 65 + 0  
         * 純小寫會為這樣: let temp = Math.floor(Math.random() * 26) + 97;  
         * 純大寫會為這樣: let temp = Math.floor(Math.random() * 26) + 65;
         */
        
        let temp = Math.floor(Math.random() * 26) + 65 + toLowercase;
        str += String.fromCharCode(temp);  //id最後出來為六碼 都為英文字母 大寫或小寫
    }

    return str;
}


/**
 * get_color() 
 * -> 用來讓list button摸上去會有顏色
 * -> 讓list button按下去會有顏色
 * bNow : 現在按下的按鈕物件
 * bPre : 為上一次按下的按鈕物件 會在function下方紀錄
 */
let bPre;
function get_color(bNow) {

    /**
     * 若照edit.js那樣寫 從fileList去editList那 會記錄在fileList按下的按鈕物件   
     * 然後最後再回來到fileList這邊 要讓原本紀錄起來的此file按鈕上色  
     * 但若此file這時已經刪掉了 叫get_color(此刪掉的檔案按鈕物件)會有錯 因為找不到此按鈕物件
     */
    if (bNow == undefined) { 
        return;
    }
    
    //現在按下的按鈕上色
    bNow.style.backgroundColor = "#d4d0d0"; 

    /**
     * 有記錄過上一次按下的按鈕物件 以及 現在按下的按鈕物件不等於上一次按下的按鈕物件才進入
     * 寫這一段主要是為了 當A按完後會變色 之後在按B時 B變色 然後必須讓A的顏色回去list背景顏色
     */
    if (bPre != undefined && bNow != bPre) { 
        //上一次按的按鈕背景色變回list背景顏色
        bPre.style.backgroundColor = "#eeeded"; 
        bPre.addEventListener("mouseenter", hoverFileBtn(bPre), false);
    }
    bPre = bNow;
}

/**
 * 滑過按鈕 按鈕會變色
 */
function hoverFileBtn(bPre) {
    // highlight the mouseenter target
    bPre.style.backgroundColor = "#e4e1e1"; //滑過顏色

    // reset the color after a short delay
    setTimeout(function() {
        bPre.style.backgroundColor = "";
    }, 100);
}


/**
 * JavaScript 浮點數乘法運算   
 * Reference:https://ithelp.ithome.com.tw/articles/10229666
 * @param {*} arg1 
 * @param {*} arg2 
 * @returns 
 */
function accMul(arg1,arg2) 
{ 
    var m=0,s1=arg1.toString(),s2=arg2.toString(); 
    try {
        m+=s1.split(".")[1].length;
    } catch(e){} 
    try {
        m+=s2.split(".")[1].length;
    } catch(e){} 
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
}