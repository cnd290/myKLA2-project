/**
 * 按editList的刪除按鈕觸發
 */
function deleteEditData() {
    /**
     * 如果JSON檔中有紀錄錄音檔內容  
     * 若再刪除 在按下書籤按鈕時 JSON檔案長度會跟音檔的長度不一樣  
     * (因為 音檔長度理應要包括所有有做特殊標記的每幀暫停三秒時間)
     */
    if (soundsArr.length > 0) { 
        pause();    //跳出提醒時 先讓JSON暫停
        disappearAlertPanel();
        const alertContent = document.getElementById("alertContent");
        const confirmBtn = document.getElementById("confirmBtn");
        const cancel = document.getElementById("cancel");

        alertContent.style.visibility = "visible";
        alertContent.innerHTML = "If you delete it, the recorded sound and the animation<br>may not match. Are you sure you want to delete it ?";

        confirmBtn.style.display = "inline-block";
        confirmBtn.onclick = () => {
            disappearAlertPanel();
            confirmDeleteData();
        };
        cancel.style.visibility = "visible";

    } else {
        confirmDeleteData();
    }
}

/**
 * 確定刪除此筆資料
 */
function confirmDeleteData() {
    //selectedPart -> 為editlist上button id 或 summary id   
    const selectedElement = document.getElementById(selectedPartId); 

    //若點下的是按紐
    if (selectedElement.tagName == "BUTTON") {
        //抓到此按紐的parent -> details
        const selectedGroup = selectedElement.parentElement; 

        //idArr[0] -> 部位名稱   idArr[1] -> 幀數  
        let idArr = selectedPartId.split("_"); 

        //若此details中只剩下summary 與剩下的一顆(現在要刪掉的)按鈕 要直接把整個details刪掉
        if (selectedGroup.childElementCount <= 2) { 
            let groupName = "Untitled";

            //animation此幀中有做編輯的此部位在JSON檔中記錄的動作名稱
            const desText = animation[idArr[1]][idArr[0]].descriptText; 

            if (desText != "") {
                groupName = desText;
            }

            //移除掉details的一些屬性 
            deleteGroupData(groupName);
        } else {
            //移除掉button的一些屬性
            //idArr為透過 id split後建立的陣列
            //idArr[0]:部位名稱 ; idArr[1]:frame數
            deletePoseData(idArr);
        }
    }
    //若點下的是summary
    else if (selectedElement.tagName == "SUMMARY") {
        //selectedElement.innerText -> 為summary的字 (動作名稱 等同desText)
        //移除掉details的一些屬性 
        deleteGroupData(selectedElement.innerText.replace("▼ ", "").replace("▶ ", ""));
    }

    uploadEditData();       //刪除後重新更新editList畫面
    selectedPartId = "";    //已完成刪除，清空selectedPartId
    turnRed();              //進入一function 讓File List上此檔案旁以及Edit List下方的紅燈亮起 綠燈不顯示
}

/**
 * 移除掉button的一些屬性      
 * 不用特別remove掉button 因為執行完deletePoseData()後會跑uploadEditData()    
 * 我們要刪掉的button各自對應的此幀數此部位之special變數都已不為true了 就不會顯示在畫面上
 */
function deletePoseData(idArr) {
    animation[idArr[1]][idArr[0]].special = false;   //若此按鈕被刪除 代表此幀此部位的special不為true
    animation[idArr[1]][idArr[0]].descriptText = ""; //若被刪除 此幀此部位編輯過的動作名稱也要刪掉
}


/**
 * 移除掉details內的所有button的一些屬性      
 * 不用特別remove掉details 因為執行完deleteGroupData()後會跑uploadEditData()    
 * 我們要刪掉的details裡所有button各自對應的此幀數此部位之special變數都已不為true了 就不會顯示在畫面上
 */
function deleteGroupData(groupName) { 
    const index = groupSequence.indexOf(groupName);
    //紀錄各個不重複的動作名稱的陣列要把此刪除掉的動作名稱移除掉
    groupSequence.splice(index, 1);     

    const groupId = editJson[groupName].id;
    //抓到整個details的element
    const selectedGroup = document.getElementById(groupId); 

    //details的child為summary跟一堆button  childElementCount為child的數量
    for (let i = 1; i < selectedGroup.childElementCount; i++) { 
        //從selectedGroup的第1項
        //也就是跳過summary(selectedGroup的第0項為summary) 從第一個button開始移除一些屬性 
        let idArr = selectedGroup.children[i].id.split("_");
        deletePoseData(idArr);
    }

    //把此details(動作名稱)相對應的JSON物件刪掉
    delete editJson[groupName]; 

    
}