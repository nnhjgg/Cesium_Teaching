import { toRaw } from "vue";
import { TMap } from "../Type";
import { Actor } from "./Actor";
import { TMapImageryProvider } from "../Manager/TMapImageryProvider";

class ImageryProvider extends Actor {
    constructor(options: TMap.IImageryProvider) {
        super(options)
        this.type = 'ImageryProvider'
        this.CreateRoot()
    }

    private layer!: Cesium.ImageryLayer

    private get O() {
        return this.options as TMap.IImageryProvider
    }

    public CreateRoot(): void {
        this.layer = this.O.map.V.imageryLayers.addImageryProvider(new TMapImageryProvider(this.O))
    }

    public Show(): void {
        const ip = toRaw(this)
        ip.show.value = true
        ip.layer.show = true
    }

    public Hide(): void {
        const ip = toRaw(this)
        ip.show.value = false
        ip.layer.show = false
    }

    public Destroy(): void {
        const ip = toRaw(this)
        ip.O.map.V.imageryLayers.remove(ip.layer)
    }
}

export { ImageryProvider }