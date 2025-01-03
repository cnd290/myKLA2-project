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
                if (eyesCheck.checked) { //當眼睛被勾選
                    tfVideo = input; //傳送Video畫面給TensorFlow偵測器

                    //TensorFlow模組(tfModel)載入完成
                    if (tfModel) {
                        await tfDetection(); //進行TensorFlow偵測
                    } else {
                        //TensorFlow模組(tfModel)未載入完成
                        await startTfDetector();
                    }

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
        // videoElement.classList.toggle('selfie', options.selfieMode);
        holistic.setOptions(options);
    });