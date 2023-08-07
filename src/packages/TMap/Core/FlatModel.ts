import { TMap } from "../Type";
import { Actor } from "./Actor";
import { toRaw } from "vue";

class FlatModel extends Actor {
    constructor(options: TMap.IFlatModel) {
        super(options)
        this.type = "FlatModel"
        this.CreateRoot()
    }

    private layer!: Cesium.ImageryLayer

    private get O() {
        return this.options as TMap.IFlatModel
    }

    public override CreateRoot() {
        this.layer = this.O.map.V.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
            url: this.O.url,
            rectangle: Cesium.Rectangle.fromDegrees(...this.O.bounds),
        }))

        if (this.O.zoom) {
            this.O.map.V.zoomTo(this.layer)
        }
    }

    public override Show() {
        const fm = toRaw(this)
        fm.show.value = true
        fm.layer.show = true
    }

    public override Hide() {
        const fm = toRaw(this)
        fm.show.value = false
        fm.layer.show = false
    }

    public override Destroy() {
        const fm = toRaw(this)
        fm.O.map.V.imageryLayers.remove(fm.layer)
    }

    public override Foucs(): void {
        const fm = toRaw(this)
        this.O.map.V.zoomTo(this.layer)
    }
}

export { FlatModel }