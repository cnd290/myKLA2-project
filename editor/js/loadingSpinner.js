
/**
 * 顯示 Loading Spinner(包含spinner與message文字)
 */
function showLoadingSpinner() {
    const loadingBar = document.getElementById('loading');
    loadingBar.style.display = "flex";
    loadingBar.style.opacity = 1;
}

/**
 * 關閉隱藏 Loading Spinner(包含spinner與message文字)
 */
function disappearLoadingSpinner() {
    const loadingBar = document.getElementById('loading');
    loadingBar.style.display = "none";
    loadingBar.style.opacity = 0;
}