function layoutsChange(choose) {
    let outCanvas = document.querySelector('.outputCanvas'); //偵測人的區域
    sessionStorage.setItem('layoutsChoose', choose); //把選擇的版面配置儲存到layoutsChoose
    if (choose == 0) { //Webcam
        renderer.setSize(window.innerWidth / 2.8, window.innerHeight / 2.3); //vrm的那個畫面
        outCanvas.style.width = "44vw";
        outCanvas.style.height = "32vw";
    } else if (choose == 1) { //Tiled
        renderer.setSize(window.innerWidth / 2.3, window.innerHeight / 1.9);
        outCanvas.style.width = "33vw";
        outCanvas.style.height = "24vw";
    } else if (choose == 2) { //Character
        renderer.setSize(window.innerWidth / 1.8, window.innerHeight / 1.5);
        outCanvas.style.width = "22vw";
        outCanvas.style.height = "16vw";
    }
}