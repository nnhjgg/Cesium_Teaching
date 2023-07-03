import { TMap } from "../Type";
import { Actor } from "./Actor";
import { toRaw } from "vue";

class TileModel extends Actor {
    constructor(options: TMap.ISpatialModel) {
        super(options)
        this.type = "TileModel"
        this.CreateRoot()
    }

    private tile!: Cesium.Cesium3DTileset

    private get O() {
        return this.options as TMap.ISpatialModel
    }

    public override CreateRoot() {
        this.tile = this.O.map.V.scene.primitives.add(new Cesium.Cesium3DTileset({
            url: this.O.url,
            preferLeaves: true,
            skipLevels: 4,
            show: true,
            maximumScreenSpaceError: this.O.definition || 2,
            maximumMemoryUsage: 4096,
            cullWithChildrenBounds: true,
            immediatelyLoadDesiredLevelOfDetail: false,
            skipLevelOfDetail: false,
            baseScreenSpaceError: 1024,
            skipScreenSpaceErrorFactor: 16,
            loadSiblings: false,
            showOutline: true,
            debugColorizeTiles: false,
            debugWireframe: false,
            debugShowBoundingVolume: false,
            debugShowContentBoundingVolume: false,
            debugShowViewerRequestVolume: false,
            debugShowMemoryUsage: false
        }))
        if (this.O.zoom) {
            this.O.map.V.zoomTo(this.tile)
        }
    }

    public override Show() {
        const tm = toRaw(this)
        tm.show.value = true
        tm.tile.show = true
    }

    public override Hide() {
        const tm = toRaw(this)
        tm.show.value = false
        tm.tile.show = false
    }

    public override Destroy() {
        const tm = toRaw(this)
        this.O.map.V.scene.primitives.remove(tm.tile)
    }
}

export { TileModel }