// 關閉分數框的function
function closeScore(){
    let scoreList = document.querySelector("#scoreList");
    scoreList.className = "closeScore";// 用keyframe做出動畫的class(scoreList漸淡的動畫)

    // 分數框會在按下叉叉一秒後漸漸變淡並關起
    // 設置一秒後那些紀錄分數的地方都還原(剛開始那些紀錄分數的地方都是空的)
    setTimeout(function () {
        scoreList.style.display = "none";// 成績框框消失

        //將成績框框中的所有成績的顯示框還原
        document.getElementById("Excellent").innerHTML = "";
        document.getElementById("Good").innerHTML = "";
        document.getElementById("OK").innerHTML = "";
        document.getElementById("Bad").innerHTML = "";
        document.getElementById("finalScore").innerHTML = "";
        document.getElementById("detailList").innerHTML = "";

        // 由於分數框的class還是做動畫的class所以需重新設置
        // 若未重新設置class則下次結算分數時在不按叉叉的情況下會直接漸淡消失
        document.getElementById("scoreList").setAttribute("class","scoreListNormal");
        
    }, 1000);
    //成績框中的叉叉看不見
    document.getElementById("close").style.visibility = "hidden";

    tableContentArr = [];// 關掉時才清掉要匯出的table內容
    document.getElementById("downloadPDFBtn").style.visibility = "hidden";// 匯出PDF檔案的按鈕消失
    document.getElementById("downloadVideo").style.visibility = "hidden";// 匯出影片的按鈕消失
}

/**
 * 為了random分數
 * 會由0跑到3再回0繼續跑
 * 為了可以一直不停顯示各分數
 * (allScore陣列中的value不停顯示)
 */
let a = 0; 
let sec = 0; //為了累積秒數，只會在randScore中使用，為了判斷秒數是否為三秒(random分數只顯示一秒)
let allScore = ["Bad","OK","Good","Excellent"]; //所有能顯示的成績
let x = 3 // allScore.length - 1，為了從allScore中的Excellent開始算次數

//算出每種成績次數的function
function countTimes(){ // 是在JSON檔跑完之後先跑，每跑完一個成績後又會回來算下一個成績數量
    let count;// 算出每種成績的次數
    if(x>=0){// 算完所有成績次數後就不會再算
        // allScoreList為記下每一specialframe的各部位的分數(數字)，並看allScoreList中符合分數等於x的
        // count會等於從allScoreList中篩出等於x的並存在count此陣列中
        count = allScoreList.filter(value => value == x)
        count = count.length // 此陣列則可代表有多少符合的
        oneToCount(count,allScore[x]) 
    }
}
/**
 * 用來從1開始顯示次數直到達到分數次數
 * (若某分數的次數為3則會顯示1 2 3)
 */
let one = 1;
/**
 * 此function用來讓各分數的次數從1開始顯示到該次數
 * count為該分數之次數
 * score為該分數顯示框的element的id
 */
function oneToCount(count,score){
    let countDown = setInterval(function () {
        if(one<count){// 顯示比該分數數量小的數(由1開始)
            document.getElementById(score).innerHTML = one;
            one+=1;
        }
        else{//當該數與分數次數一樣時(最後顯示次數)
            document.getElementById(score).innerHTML = count;
            clearInterval(countDown);
            x-=1;// 計算下一個分數的次數(allScore陣列往前一格)
            one = 1;// 將次數還原
            if(x>=0){// 當還有分數還沒計算到
                countTimes();
            }
            else{
                randScore();// 最後分數的random
            }
        }
    }, 200);
}

function totalScore(finalScoreList){// 算出各成績集結起來的總平均成績
    // 求最後總分的平均數
    let finalScore = 0;
    for(let i=0;i<finalScoreList.length;i++){
        finalScore += finalScoreList[i];// 將所有分數相加
    }
    finalScore /= finalScoreList.length;// 分數總和除總數

    // 最後成績判斷
    if(finalScore > 2.5){
        return "Excellent";
    }
    else if(finalScore > 1.5 && finalScore <= 2.5){
        return "Good";
    }
    else if(finalScore > 0.5 && finalScore <= 1.5){
        return "OK";
    }
    else if(finalScore <= 0.5){
        return "Bad";
    }   
}

function randScore(){// 隨機呈現總分數
    setTimeout(function () {
        if(sec < 1){// random分數只random一秒
            a += 1;
            if(a == 4){
                a = 0;
            }
            // 顯示隨機的分數
            let finalScoreText = document.getElementById("finalScore");
            finalScoreText.innerHTML = allScore[a];
            sec += 0.05;
            randScore();
        }
        else{ // 過了一秒後
            sec = 0;// 秒數還原
            // 顯示最後總成績
            document.getElementById("finalScore").innerHTML = totalScore(allScoreList);
            // 顯示成績細部資料
            resultDetail();
            // 隨機成績還原
            x = 3;
        }
    }, 50);
}

let tableContentArr = [];// 儲存所有標註動作的細部資料的陣列
function resultDetail(){// 將有部位做特殊標記的每一幀每一部未的詳細資料都顯示在分數框右側
    for(let seqArr = 0; seqArr < sequence.length; seqArr++){// 迴圈以動作名稱的陣列來跑
        let actionName = sequence[seqArr];
        let id = editJson[actionName].id.toString();// 設置details的id
        document.getElementById("detailList").innerHTML += "<details id='" + id + "'>" +
            "<summary>" + actionName + "</summary>" +
            "<ul></ul></details>";
        
        for(let frame=0; frame<editJson[actionName].arr.length;frame++){// 該動作名稱所標記的部位次數
            let time = editJson[actionName].arr[frame][0].toString();// 標記時間
            let part = editJson[actionName].arr[frame][1].toString().split(/(?=[A-Z])/).join(' ');// 標記部位
            part = part[0].toUpperCase()+part.slice(1);
            let score = editJson[actionName].arr[frame][2].toString();// 標記分數
            
            //分數轉評分
            let judgeScore =
                score == 3      // 當分數為3的時候
                ? "Excellent"   // judgeScore為Excellent(以此類推)
                : score == 2
                ? "Good"
                : score == 1
                ? "OK"
                : "Bad";

            //顯示details中的li的內容
            let output = time + "&emsp;" + part + "&emsp;" + judgeScore;
            document.getElementById(id).innerHTML += "<li>"+output+"</li>";

            //將資料存進tableContentArr中
            let tableArr = [time, actionName, part, judgeScore];//[編輯時間,動作名稱,部位,評分]
            tableContentArr.push(tableArr);

            //顯示兩匯出按鈕
            document.getElementById("downloadPDFBtn").style.visibility = "visible";
            document.getElementById("downloadVideo").style.visibility = "visible";
            
        }
        //將該動作名稱中的所有成績資訊清空
        editJson[actionName].arr = [];
        
    };
    allScoreList = [];//將紀錄所有成績的陣列清空
    document.getElementById("close").style.visibility = "visible";//顯示叉叉按鈕
}

//為了將資料傳到printPdf才可匯出PDF檔
function exportTable(tableContentArr) {
    sessionStorage.setItem('resultPdf', JSON.stringify(tableContentArr))// 為了把tableContentArr傳給printPdf
    window.open("printPdf.html", "", "height=700,width=700");// 跳出printPdf.html網頁(height,width為大小)
}