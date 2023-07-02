import { Coordtransform } from "../Manager/Coordtransform";
import { TMap } from "../Type";
import { Entity } from "./Entity";
import { toRaw } from "vue";

class Sector extends Entity {
    constructor(options: TMap.ISector) {
        super(options)
        this.type = "Sector"
        this.CreateRoot()
    }

    static once = (Math.PI * 2) / 360

    private downPosition!: Cesium.Cartesian3

    private get O() {
        return this.options as TMap.ISector
    }

    public override CreateRoot() {
        const path = this.GeneratePath()
        this.root = this.O.map.V.entities.add({
            name: "SectorRoot",
            polyline: {
                positions: [...path, path[0]],
                width: this.O.width || 5,
                material: Cesium.Color.fromCssColorString(this.O.color || '#ff0000'),
            },
            polygon: {
                //@ts-ignore
                hierarchy: path,
                perPositionHeight: true,
                outline: false,
                material: Cesium.Color.fromCssColorString(this.O.fillColor || '#ff000066'),
            }
        })
        //@ts-ignore
        this.root.type = 'SectorRoot'
        //@ts-ignore
        this.root.body = this
    }

    public override Show() {
        const sector = toRaw(this)
        sector.show.value = true
        sector.root.show = true
    }

    public override Hide() {
        const sector = toRaw(this)
        sector.show.value = false
        sector.root.show = false
    }

    public override Destroy() {
        const sector = toRaw(this)
        sector.O.map.V.entities.remove(sector.root)
    }

    private GeneratePath() {
        const path: Array<Cesium.Cartesian3> = []
        const r = this.O.map.GetLngLatFromC3(this.O.position || Cesium.Cartesian3.ZERO)
        const a = Coordtransform.Offset(r.R, r.Q, 90, this.O.radius || 2000)
        const b = Coordtransform.Offset(r.R, r.Q, 0, this.O.radius || 2000)
        const lngD = a[0] - r.R
        const latD = b[1] - r.Q

        path.push(this.O.position || Cesium.Cartesian3.ZERO)
        for (let i = 0; i < ((this.O.angle || 360) + 1); i++) {
            const ll = [r.R + lngD * Math.sin(Sector.once * (i + (this.O.offset || 0))), r.Q + latD * Math.cos(Sector.once * (i + (this.O.offset || 0)))]
            path.push(this.O.map.GetC3FromLngLat(ll[0], ll[1], r.H))
        }
        path.push(this.O.position || Cesium.Cartesian3.ZERO)
        return path
    }

    public override OnDragging(e: Cesium.Cartesian3, id: string, name: string): void {
        const sector = toRaw(this)
        if (sector.O.dragable == undefined || sector.O.dragable) {
            if (name == 'SectorRoot') {
                const delta = Cesium.Cartesian3.subtract(e, this.downPosition, new Cesium.Cartesian3())
                this.O.position = Cesium.Cartesian3.add((this.O.position || Cesium.Cartesian3.ZERO), delta, new Cesium.Cartesian3())
                const path = this.GeneratePath()
                this.downPosition = e
                //@ts-ignore
                sector.root.polyline.positions = [...path, path[0]]
                //@ts-ignore
                sector.root.polygon.hierarchy = path
            }
        }
    }

    public override OnDraggingEnd(e: Cesium.Cartesian3, id: string, name: string): void {
        const sector = toRaw(this)
        sector.OnDragging(e, id, name)
    }

    public ChangePosition(e: Cesium.Cartesian3) {
        const sector = toRaw(this)
        sector.OnDragging(e, '', 'SectorRoot')
    }

    public override OnMouseDown(e: Cesium.Cartesian3, id: string, name: string): void {
        this.downPosition = e
    }
}

export { Sector }