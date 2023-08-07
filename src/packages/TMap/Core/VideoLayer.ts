import { TMap } from "../Type";
import { Actor } from "./Actor";
import { toRaw } from "vue";

class VideoLayer extends Actor {
    constructor(options: TMap.IVideoLayer) {
        super(options)
        this.type = "VideoLayer"
        this.CreateRoot()
    }

    private get O() {
        return this.options as TMap.IVideoLayer
    }

    public override CreateRoot() {
        this.root = this.O.map.V.entities.add({
            name: "VideoLayerRoot",
            position: this.O.position,
            plane: {
                dimensions: this.O.size || new Cesium.Cartesian2(1000, 500),
                //@ts-ignore
                material: this.O.video,
                plane: new Cesium.Plane(this.O.normal || Cesium.Cartesian3.UNIT_Z, 0)
            }
        })
        //@ts-ignore
        this.root.type = 'VideoLayerRoot'
        //@ts-ignore
        this.root.body = this
    }

    public override Show() {
        const vl = toRaw(this)
        vl.show.value = true
        vl.root.show = true
    }

    public override Hide() {
        const vl = toRaw(this)
        vl.show.value = false
        vl.root.show = false
    }

    public override Destroy() {
        const vl = toRaw(this)
        vl.O.map.V.entities.remove(vl.root)
    }

    public override Foucs(): void {

    }

    public override OnDragging(e: Cesium.Cartesian3, id: string, name: string): void {
        const vl = toRaw(this)
        if (name == 'VideoLayerRoot') {
            vl.ChangePosition(e)
        }
    }

    public override OnDraggingEnd(e: Cesium.Cartesian3, id: string, name: string): void {
        const vl = toRaw(this)
        vl.OnDragging(e, id, name)
    }

    public ChangePosition(e: Cesium.Cartesian3) {
        const vl = toRaw(this)
        vl.O.position = e
        vl.root.position = e as unknown as Cesium.PositionProperty
    }

    public ChangeNormal(normal: Cesium.Cartesian3) {
        const vl = toRaw(this)
        //@ts-ignore
        vl.root.plane.plane = new Cesium.Plane(normal, 0)
    }
}

export { VideoLayer }