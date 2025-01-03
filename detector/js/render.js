/**
 *  import mustache模板引擎  
 *  渲染上方部位toggles
 <li class="py-3 d-flex justify-content-center">
    <div id={{titleId}} class="partTitle">
        {{partTitle}}
        <label class="switch">
            <input type="checkbox" id={{checkId}}>
            <span class="slider"></span>                   
            </label>
    </div>
</li>
 */
const view = {
    "toggles": [{
            titleId: "eyesTitle",
            partTitle: "Eye :",
            checkId: "eyesCheck"
        },
        {
            titleId: "mouthTitle",
            partTitle: "Mouth :",
            checkId: "mouthCheck"
        },
        {
            titleId: "headTitle",
            partTitle: "Neck :",
            checkId: "headCheck"
        },
        {
            titleId: "spineTitle",
            partTitle: "Spine :",
            checkId: "spineCheck"
        },
        {
            titleId: "armTitle",
            partTitle: "Arm :",
            checkId: "armCheck"
        },
        {
            titleId: "handTitle",
            partTitle: "Hand :",
            checkId: "handCheck"
        },
        {
            titleId: "fingerTitle",
            partTitle: "Finger :",
            checkId: "fingerCheck"
        },
        {
            titleId: "legTitle",
            partTitle: "Leg :",
            checkId: "legCheck"
        }

    ]
}




const toggleTemplate = document.getElementById("toggleTemplate").innerHTML;

//view 依照 toggleTemplate 渲染 control
const outputToggles = Mustache.render(toggleTemplate, view);
const control = document.getElementById("control");
control.innerHTML = outputToggles;