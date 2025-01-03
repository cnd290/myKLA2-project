/**
 * 顯示 Loading Spinner(包含spinner與message文字)
 */
function showLoadingSpinner() {
    const loadingBar = document.getElementById('loading');
    loadingBar.style.display = "flex";
    //剛開始先讓body的class不為loaded
    //loading的opacity會變回1
    document.body.classList.remove('loaded');
}


/**
 * 關閉隱藏 Loading Spinner(包含spinner與message文字)
 */
function disappearLoadingSpinner() {
    //當載好後就會讓body新增一個class為loaded(會執行transition動畫，也就是讓opacity一秒後從1變成0)
    document.body.classList.add('loaded');
}

setTimeout(() => {
    document.getElementById("message").innerHTML = "Please<br>wait<br>patiently"
}, "1500")

/**
 * 在Loading Spinner顯示放大的文字 (無Spinner框)
 * @param {*} text 文字內容
 */
function showBigText(text) {
    showLoadingSpinner();
    document.getElementById("spinner").style.opacity = 0;
    document.querySelector(".message").style.display = "block";
    document.getElementById("message").innerHTML = text;
    document.getElementById("message").style.fontSize = "50px"
}


/**
 * Loading Spinner 預設文字與樣式
 */
function defaultLoading() {
    disappearLoadingSpinner();
    setTimeout(function(){
        document.getElementById("message").innerHTML = "Loading";
        document.getElementById("spinner").style.opacity = 1;
        document.getElementById("message").style.fontSize = "3vh";
    },1000)
    document.getElementById("alertContent").innerHTML = "";
}