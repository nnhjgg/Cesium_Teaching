import { toRaw } from "vue";
import { TMap } from "../Type";
import { Actor } from "./Actor";
import startIcon from '../Assets/Icon/lineS.png'
import { Mathf } from "@/libs/Mathf";

class Rect extends Actor {
    constructor(options: TMap.IRect) {
        super(options)
        this.type = "Rect"
        this.CreateRoot()
    }

    private get O() {
        return this.options as TMap.IRect
    }

    private points: Array<Cesium.Entity> = []

    private downPosition!: Cesium.Cartesian3

    public override CreateRoot() {
        this.root = this.O.map.V.entities.add({
            name: "RectRoot",
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    return this.O.polyline.length != 0 ? [...this.O.polyline, this.O.polyline[0]] : this.O.polyline
                }, false),
                width: this.O.width || 5,
                material: Cesium.Color.fromCssColorString(this.O.color || '#ff0000'),
            },
            polygon: {
                hierarchy: new Cesium.CallbackProperty(() => {
                    return new Cesium.PolygonHierarchy(this.O.polyline)
                }, false),
                perPositionHeight: true,
                outline: false,
                material: Cesium.Color.fromCssColorString(this.O.fillColor || '#ff000066'),
            }
        })
        //@ts-ignore
        this.root.type = 'RectRoot'
        //@ts-ignore
        this.root.body = this
        this.CreateDefaultPoints()
    }

    private CreateDefaultPoints() {
        if (this.O.polyline.length != 0) {
            for (let position of this.O.polyline) {
                const p = this.O.map.V.entities.add({
                    name: "RectPoint",
                    position: position,
                    billboard: {
                        image: startIcon,
                        verticalOrigin: Cesium.VerticalOrigin.CENTER,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        scale: this.O.pointScale || 1.4,
                        disableDepthTestDistance: 50000,
                    }
                })
                //@ts-ignore
                p.type = 'RectPoint'
                //@ts-ignore
                p.body = this
                this.points.push(p)
            }
        }
    }

    public override Show() {
        const rect = toRaw(this)
        rect.show.value = true
        rect.root.show = true
        for (let p of rect.points) {
            p.show = true
        }
    }

    public override Hide() {
        const rect = toRaw(this)
        rect.show.value = false
        rect.root.show = false
        for (let p of rect.points) {
            p.show = false
        }
    }

    public override Foucs(): void {

    }

    public override Destroy() {
        const rect = toRaw(this)
        rect.O.map.V.entities.remove(rect.root)
        for (let p of rect.points) {
            rect.O.map.V.entities.remove(p)
        }
    }

    public InsertPoint(e: Cesium.Cartesian3) {
        const rect = toRaw(this)
        const p = rect.O.map.V.entities.add({
            name: "RectPoint",
            position: e,
            billboard: {
                image: startIcon,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                scale: rect.O.pointScale || 1.4,
                disableDepthTestDistance: 50000,
            }
        })
        //@ts-ignore
        p.type = 'RectPoint'
        //@ts-ignore
        p.body = rect
        rect.points.push(p)
        rect.UpdateRectPath()
    }

    public DeletePoint(current: string | number) {
        const rect = toRaw(this)
        if (typeof current == 'number') {
            rect.O.map.V.entities.remove(rect.points[current])
            rect.points.splice(current, 1)
        }
        else {
            const index = rect.points.findIndex(p => p.id == current)
            if (index != -1) {
                rect.O.map.V.entities.remove(rect.points[index])
                rect.points.splice(index, 1)
            }
        }
        rect.UpdateRectPath()
    }

    public GetRectPath() {
        const rect = toRaw(this)
        const path: Array<Cesium.Cartesian3> = []
        for (let p of rect.points) {
            //@ts-ignore
            path.push(p.position.getValue(new Cesium.JulianDate()))
        }
        return path
    }

    public GetRectArea() {
        const rect = toRaw(this)
        //@ts-ignore
        const path = rect.GetRectPath()
        const t: Array<[number, number]> = []
        for (let p of path) {
            let a = rect.O.map.GetLngLatFromC3(p)
            t.push([a.R, a.Q])
        }
        return parseFloat(Mathf.CalculateArea(t))
    }

    public UpdateRectPath() {
        const rect = toRaw(this)
        const path = rect.GetRectPath()
        rect.O.polyline = path
    }

    public ChangeSideColor(color: string) {
        const rect = toRaw(this)
        rect.O.color = color
        //@ts-ignore
        rect.root.polyline.material = Cesium.Color.fromCssColorString(color)
    }

    public ChangeFillColor(color: string) {
        const rect = toRaw(this)
        rect.O.fillColor = color
        //@ts-ignore
        rect.root.polygon.material = Cesium.Color.fromCssColorString(color)
    }

    public ChangePointScale(scale: number) {
        const rect = toRaw(this)
        rect.O.pointScale = scale
        for (let p of rect.points) {
            //@ts-ignore
            p.billboard.scale = scale
        }
    }

    public override OnDragging(e: Cesium.Cartesian3, id: string, name: string): void {
        const rect = toRaw(this)
        if (name == 'RectRoot') {
            if (rect.O.totalDragable) {
                const delta = Cesium.Cartesian3.subtract(e, rect.downPosition, new Cesium.Cartesian3())
                for (let p of rect.points) {
                    p.position = Cesium.Cartesian3.add((p.position?.getValue(new Cesium.JulianDate()) as Cesium.Cartesian3), delta, new Cesium.Cartesian3()) as unknown as Cesium.PositionProperty
                }
                rect.downPosition = e
                rect.UpdateRectPath()
            }
        }
        else if (name == 'RectPoint') {
            const point = rect.points.find(p => p.id == id)
            if (point) {
                point.position = e as unknown as Cesium.PositionProperty
                rect.UpdateRectPath()
            }
        }
    }

    public override OnDraggingEnd(e: Cesium.Cartesian3, id: string, name: string): void {
        const rect = toRaw(this)
        rect.OnDragging(e, id, name)
    }

    public override OnMouseDown(e: Cesium.Cartesian3, id: string, name: string): void {
        const rect = toRaw(this)
        rect.downPosition = e
    }
}

export { Rect }