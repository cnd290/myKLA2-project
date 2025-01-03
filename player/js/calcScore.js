
/**
 * 
 * 此function將會傳入使用者動作跟實際標準的差  
 * 依據差距來判斷為哪一區間  
 * 差距越小代表動作越準確，分數也會越高  
 *   Excellent(3)       Good(2)          OK(1)          Bad(0)  
 * ---------------|---------------|---------------|---------------  
 *             minNum          midNum          maxNum  
 */
function calcScore(score, minNum, midNum, maxNum){
    if(score < minNum){                         //Excellent
        return 3;
    }
    else if(minNum <= score && score < midNum){ //Good
        return 2;
    }
    else if(midNum <= score && score < maxNum){ //OK
        return 1;
    }
    else{                                       //Bad
        return 0;
    }  
}