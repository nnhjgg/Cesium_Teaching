import { toRaw } from "vue";
import { TMap } from "../Type";
import { Actor } from "./Actor";

class SingleLine extends Actor {
    constructor(options: TMap.ISingleLine) {
        super(options)
        this.type = "SingleLine"
        this.CreateRoot()
    }

    private get O() {
        return this.options as TMap.ISingleLine
    }

    public override CreateRoot() {
        this.root = this.O.map.V.entities.add({
            name: "SingleLineRoot",
            polyline: {
                positions: this.O.polyline,
                width: this.O.width || 5,
                material: Cesium.Color.fromCssColorString(this.O.color || '#ff0000'),
            },
        })
        //@ts-ignore
        this.root.type = 'SingleLineRoot'
        //@ts-ignore
        this.root.body = this
    }

    public override Show() {
        const sl = toRaw(this)
        sl.show.value = true
        sl.root.show = true
    }

    public override Hide() {
        const sl = toRaw(this)
        sl.show.value = false
        sl.root.show = false
    }

    public override Destroy() {
        const sl = toRaw(this)
        sl.O.map.V.entities.remove(sl.root)
    }


    public UpdateSingleLinePath(e: Array<Cesium.Cartesian3>) {
        const sl = toRaw(this)
        sl.O.polyline = e
        //@ts-ignore
        sl.root.polyline.positions = e
    }

    public AddPoint(e: Cesium.Cartesian3) {
        const sl = toRaw(this)
        sl.O.polyline.push(e)
        //@ts-ignore
        sl.root.polyline.positions = sl.O.polyline
    }

    public ChangeColor(color: string) {
        const sl = toRaw(this)
        sl.O.color = color
        //@ts-ignore
        sl.root.polyline.material = Cesium.Color.fromCssColorString(color)
    }
}

export { SingleLine }