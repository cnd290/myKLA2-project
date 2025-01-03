// Present a control panel through which the user can manipulate the solution
// options.
const controlsElement = document.getElementsByClassName('control-panel')[0];

new controls
    .ControlPanel(controlsElement, {
        selfieMode: true,
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    })
    .add([
        new controls.StaticText({ title: 'MediaPipe Holistic' }),
        fpsControl,
        new controls.Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
        new controls.SourcePicker({
            onSourceChanged: () => {
                holistic.reset();
            },
            onFrame: async(input, size) => { //input為mediapipe建的video element
                tfVideo = input; //傳送Video畫面給TensorFlow偵測器

                //TensorFlow模組(tfModel)未載入
                if (!tfModel) {
                    //匯入TensorFlow Model 並 開啟TensorFlow偵測器
                    await startTfDetector();
                }

                //當影片錄製畫面來源還未被載入
                if (!recordVideoStream) {
                    recordVideoStream = input.srcObject; //傳送Video畫面來源給影片錄製器
                    setMediaRecorder(); //進行影片錄製器設定
                }

                const aspect = size.height / size.width;
                let width, height;
                if (window.innerWidth > window.innerHeight) {
                    height = window.innerHeight;
                    width = height / aspect;
                } else {
                    width = window.innerWidth;
                    height = width * aspect;
                }
                canvasElement.width = width;
                canvasElement.height = height;

                //傳送畫面給 mediapipe model 偵測
                await holistic.send({ image: input });
            },
            examples: {
                videos: [],
                images: [],
            }
        }),
        new controls.Slider({
            title: 'Model Complexity',
            field: 'modelComplexity',
            discrete: ['Lite', 'Full', 'Heavy'],
        }),
        new controls.Toggle({ title: 'Smooth Landmarks', field: 'smoothLandmarks' }),
        new controls.Slider({
            title: 'Min Detection Confidence',
            field: 'minDetectionConfidence',
            range: [0, 1],
            step: 0.01
        }),
        new controls.Slider({
            title: 'Min Tracking Confidence',
            field: 'minTrackingConfidence',
            range: [0, 1],
            step: 0.01
        }),
    ])
    .on(x => {
        const options = x;
        holistic.setOptions(options);
    });