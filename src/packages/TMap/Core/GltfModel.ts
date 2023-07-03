import { toRaw } from "vue";
import { TMap } from "../Type";
import { Actor } from "./Actor";

class GltfModel extends Actor {
    constructor(options: TMap.IGltfModel) {
        super(options)
        this.type = 'GltfModel'
        this.CreateRoot()
    }

    private gltf!: Cesium.Model

    private get O() {
        return this.options as TMap.IGltfModel
    }

    public CreateRoot(): void {
        const modelHeadingPitchRoll = new Cesium.HeadingPitchRoll()
        modelHeadingPitchRoll.heading = Cesium.Math.toRadians(0)
        modelHeadingPitchRoll.pitch = Cesium.Math.toRadians(0)
        modelHeadingPitchRoll.roll = Cesium.Math.toRadians(0)

        const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
            this.O.position || Cesium.Cartesian3.ZERO,
            modelHeadingPitchRoll
        )

        this.gltf = this.O.map.V.scene.primitives.add(
            Cesium.Model.fromGltf({
                url: this.O.url,
                modelMatrix: modelMatrix,
                scale: this.O.scale || 1
            })
        )

        //@ts-ignore
        this.gltf.type = 'GltfModelRoot'
        //@ts-ignore
        this.gltf.body = this
    }

    public Show(): void {
        const gm = toRaw(this)
        gm.show.value = true
        gm.gltf.show = true
    }

    public Hide(): void {
        const gm = toRaw(this)
        gm.show.value = false
        gm.gltf.show = false
    }

    public Destroy(): void {
        const gm = toRaw(this)
        gm.O.map.V.scene.primitives.remove(gm.gltf)
    }
}

export { GltfModel }