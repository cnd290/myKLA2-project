class VRMManager {
    /**
     * 建構子
     * @param {*} currentVrm VRM model
     */
    constructor(currentVrm) {
        this.vrm = currentVrm;
        this.tweens = {};
    }

    /**
     * 取得部位的rotation轉動屬性
     * @param {*} part 部位 (Bone.部位)
     */
    rotation(part) {
        return this.vrm.humanoid.getBoneNode(part).rotation;
    }

    /**
     * 取得部位的position位置屬性(以VRM為主)
     * @param {*} part 部位 (Bone.部位)
     */
    position(part) {
        return this.vrm.humanoid.getBoneNode(part).position;
    }

    /**
     * 設定某調整值(可用於眼睛睜閉與嘴型)
     * @param {*} preset (Preset.調整值名稱)
     */
    setPreset(preset, value) {
        this.vrm.blendShapeProxy.setValue(preset, value);
    }

    /**
     * 取得某調整值(可用於眼睛睜閉與嘴型)
     * @param {*} preset (Preset.調整值名稱)
     */
    getPreset(preset) {
        return this.vrm.blendShapeProxy.getValue(preset);
    }

    /**
     * 設定VRM視線目標
     */
    setLookAtTarget(x, y) {
        this.vrm.lookAt.target.position.x = x;
        this.vrm.lookAt.target.position.y = y;
    }

    /**
     * 取得VRM視線目標
     */
    getLookAtTarget() {
        const target = {
            x: this.vrm.lookAt.target.position.x,
            y: this.vrm.lookAt.target.position.y
        }
        return target;
    }

    /**
     * 建立補間動畫
     * @param {*} current 補間動畫資料
     * @param {*} target 目標動作
     * @param {*} update 進行動畫function
     * @param {*} name 補間動畫名稱
     * @param {*} reset 恢復動作(目標動作後執行)
     */
    tween(current, target, update, name, reset = null, setDuration = 20, resetDuration = 200, resetDelay = 500) {
        const resetName = name + "Reset";
        if (this.tweens[name]) {
            this.tweens[name].stop();
            if (reset) this.tweens[resetName].stop();
        }

        this.tweens[name] = new TWEEN.Tween(current).to(target, setDuration).easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => update())

        if (reset) {
            this.tweens[name].chain(this.tweens[resetName] = new TWEEN.Tween(current).to(reset, resetDuration).easing(TWEEN.Easing.Linear.None)
                .onUpdate(() => update()).delay(resetDelay))
        }

        this.tweens[name].start();
    }

    /**
     * 取得該部位所在的world position(以整個vrm場景為主)
     * @param {*} part 部位(Bone.部位)
     * @returns 該部位所在的world position
     */
    getPartWorldPosition(part) {
        return this.vrm.humanoid.getBoneNode(part).getWorldPosition(new THREE.Vector3());
    }

}

/**
 * 部位名稱集合
 */
const Bone = THREE.VRMSchema.HumanoidBoneName;

/**
 * 可調整值名稱集合
 */
const Preset = THREE.VRMSchema.BlendShapePresetName;