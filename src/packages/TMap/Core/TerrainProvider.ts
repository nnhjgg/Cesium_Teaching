import { Actor } from "./Actor"
import { TMap } from "../Type";
import { toRaw } from "vue";

class TerrainProvider extends Actor {
    constructor(options: TMap.ITerrainProvider) {
        super(options)
        this.type = 'TerrainProvider'
        this.CreateRoot()
    }

    public layer!: Cesium.TerrainProvider

    private get O() {
        return this.options as TMap.ITerrainProvider
    }

    public CreateRoot(): void {
        this.layer = new Cesium.CesiumTerrainProvider({
            url: this.O.url
        })
        this.O.map.V.terrainProvider = this.layer
    }

    public Show(): void {

    }

    public Hide(): void {

    }

    public override Foucs(): void {

    }

    public Destroy(): void {
        const tp = toRaw(this)
        //@ts-ignore
        tp.O.map.V.terrainProvider = undefined
    }

}

export { TerrainProvider }