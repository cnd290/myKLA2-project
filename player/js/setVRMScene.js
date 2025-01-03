//3D場景建立以及載入vrm-------------------------------------------------
//建構場景
let scene = new THREE.Scene();

//建構攝影機(透視投影的攝影機)
let camera = new THREE.PerspectiveCamera(10, document.getElementById("KLA").clientWidth / document.getElementById("KLA").clientHeight, 0.1, 20);
camera.position.x = 0;
camera.position.y = 0.5;
camera.position.z = 11.4;

//建構渲染器
let renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});


//調整大小
renderer.setSize(document.getElementById("KLA").clientWidth, document.getElementById("KLA").clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.setAttribute("id", "vrmWindow");
//將渲染器domElement屬性 (vrm場景) 放置到id為KLA的區域
document.getElementById("KLA").appendChild(renderer.domElement);

//調整大小
window.addEventListener('resize', function() {
    let width = document.getElementById("KLA").clientWidth;
    let height = document.getElementById("KLA").clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

//眼球看的方向
let lookAtTarget = new THREE.Object3D();
camera.add(lookAtTarget);

//平行光
let light = new THREE.DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);

let loadFinish = 0;     //判斷vrm是否載好
let allVrms = [];       //放vrm的陣列
let vrmManager;         //控制vrm

/**
 * adjustHipPosition用處 : detector跟player屁股位置之間的誤差  
 */
let adjustHipPosition = 0;



/**
 * 更換VRM角色
 * @param {*} vrmName 匯入的VRM角色名稱
 */
function vrmLoad(vrmName) {
    //載入字樣
    document.getElementById("loading").style.display = "flex";
    document.body.classList.remove('loaded');
    document.getElementById("noticeKLA").innerHTML = "Wait for loading character...";
    //GLTFLoader為Three.js的  VRM is from '@pixiv/three-vrm'->(控制模型的運作) (three-vrm.js)
    let loader = new THREE.GLTFLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(

        // URL of the VRM you want to load
        './vrm/' + vrmName + '.vrm',


        // called when the resource is loaded
        (gltf) => {


            THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);

            // generate a VRM instance from gltf
            THREE.VRM.from(gltf).then((vrm) => {

                vrmManager = new VRMManager(vrm);
                // add the loaded vrm to the scene
                scene.add(vrm.scene);

                allVrms[0] = vrm;

                vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips).rotation.y = Math.PI;//讓vrm剛開始可以轉到正面
                /**
                 * 我們調整後的vrm屁股位置 (1 : 下一行調整的) - vrm原本屁股在的位置(在editor畫面中顯示看起來不太對) 
                 */
                adjustHipPosition = 1 - vrm.humanoid.humanBones.hips[0].node.position.y;
                
                if(vrmName.charAt(0)=="B"){
                    vrm.humanoid.humanBones.hips[0].node.position.y = 1.1;                                  //我們調整的 載入後vrm屁股在的位置
                }
                else{
                    vrm.humanoid.humanBones.hips[0].node.position.y = 1;                                    //我們調整的 載入後vrm屁股在的位置

                }

                // vrm load完 手擺放的位置
                vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperArm).rotation.z = Math.PI / 2 - 0.35;
                vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightUpperArm).rotation.z = -(Math.PI / 2 - 0.35);
                vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftHand).rotation.z = 0.1;
                vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightHand).rotation.z = -0.1;
                vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerArm).rotation.z = 0.15;
                vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightLowerArm).rotation.z = -0.15;

                vrm.lookAt.target = lookAtTarget;
                loadFinish = 1; //代表vrm載好了
                

                if (loadFinish) { //若載好後
                    document.getElementById("noticeKLA").innerHTML = "Done!"; //顯示的字改顯示Done
                    setTimeout("block_noticeKLA()", 3000);                    //顯示的字 三秒後消失
                    if(vrmFlag==1){
                      document.body.classList.add('loaded');  
                    }
                }

            });

        },

        // called while loading is progressing
        (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

        // called when loading has errors
        (error) => console.error(error)

    );
}

//加上網格線
const gridHelper = new THREE.GridHelper(10, 10);
gridHelper.position.set(0, 0.098, 0);
scene.add(gridHelper);

//讓vrm可以在3D空間中轉動
let orbitControls = new THREE.OrbitControls(camera, renderer.domElement); //讓vrm可以在3D空間中轉動
orbitControls.screenSpacePanning = true;
orbitControls.target.set(0, 1, 0);
orbitControls.update();

function block_noticeKLA() {
    document.getElementById("noticeKLA").innerHTML = "";
}