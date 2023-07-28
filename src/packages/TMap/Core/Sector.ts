import { Coordtransform } from "../Manager/Coordtransform";
import { TMap } from "../Type";
import { Actor } from "./Actor";
import { toRaw } from "vue";

class Sector extends Actor {
    constructor(options: TMap.ISector) {
        super(options)
        this.type = "Sector"
        this.CreateRoot()
    }

    static once = (Math.PI * 2) / 360

    private center!: Cesium.Entity

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

        if (this.O.icon) {
            this.center = this.O.map.V.entities.add({
                name: "SectorCenter",
                position: this.O.position,
                billboard: {
                    image: this.O.icon,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    scale: this.O.iconScale || 1,
                    disableDepthTestDistance: 50000,
                }
            })
            //@ts-ignore
            this.center.type = 'SectorCenter'
            //@ts-ignore
            this.center.body = this
        }
    }

    public override Show() {
        const sector = toRaw(this)
        sector.show.value = true
        sector.root.show = true
        if (sector.center) {
            sector.center.show = true
        }
    }

    public override Hide() {
        const sector = toRaw(this)
        sector.show.value = false
        sector.root.show = false
        if (sector.center) {
            sector.center.show = false
        }
    }

    public override Destroy() {
        const sector = toRaw(this)
        sector.O.map.V.entities.remove(sector.root)
        if (sector.center) {
            sector.O.map.V.entities.remove(sector.center)
        }
    }

    private GeneratePath() {
        const sector = toRaw(this)
        const path: Array<Cesium.Cartesian3> = []
        const r = this.O.map.GetLngLatFromC3(sector.O.position)
        const a = Coordtransform.Offset(r.R, r.Q, 90, sector.O.radius || 2000)
        const b = Coordtransform.Offset(r.R, r.Q, 0, sector.O.radius || 2000)
        const lngD = a[0] - r.R
        const latD = b[1] - r.Q

        if (sector.O.angle != 360) {
            path.push(sector.O.position)
        }

        for (let i = 0; i < ((sector.O.angle || 360) + 1); i++) {
            const ll = [r.R + lngD * Math.sin(Sector.once * (i + (sector.O.offset || 0))), r.Q + latD * Math.cos(Sector.once * (i + (sector.O.offset || 0)))]
            path.push(sector.O.map.GetC3FromLngLat(ll[0], ll[1], r.H))
        }
        if (sector.O.angle != 360) {
            path.push(sector.O.position)
        }

        return path
    }
}

export { Sector }