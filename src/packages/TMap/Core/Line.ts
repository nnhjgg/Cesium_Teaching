import { toRaw } from "vue";
import { TMap } from "../Type";
import { Actor } from "./Actor";
import startIcon from '../Assets/Icon/lineS.png'
import midIcon from '../Assets/Icon/lineM.png'
import stopIcon from '../Assets/Icon/lineE.png'

class Line extends Actor {
    constructor(options: TMap.ILine) {
        super(options)
        this.type = "Line"
        this.CreateRoot()
    }

    private get O() {
        return this.options as TMap.ILine
    }

    static icons = [startIcon, midIcon, stopIcon]

    private points: Array<Cesium.Entity> = []

    private downPosition!: Cesium.Cartesian3

    public override CreateRoot() {
        this.root = this.O.map.V.entities.add({
            name: "LineRoot",
            polyline: {
                positions: this.O.polyline || [],
                width: this.O.width || 5,
                material: Cesium.Color.fromCssColorString(this.O.color || '#ff0000'),
            },
        })
        //@ts-ignore
        this.root.type = 'LineRoot'
        //@ts-ignore
        this.root.body = this
        this.CreateDefaultPoints()
    }

    private CreateDefaultPoints() {
        if (this.O.polyline) {
            for (let position of this.O.polyline) {
                const p = this.O.map.V.entities.add({
                    name: "LinePoint",
                    position: position,
                    billboard: {
                        image: Line.icons[this.points.length == 0 ? 0 : 2],
                        verticalOrigin: Cesium.VerticalOrigin.CENTER,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        scale: this.O.pointScale || 1.4,
                        disableDepthTestDistance: 50000,
                    }
                })
                //@ts-ignore
                p.type = 'LinePoint'
                //@ts-ignore
                p.body = this
                this.points.push(p)
            }
        }
    }

    public override Show() {
        const line = toRaw(this)
        line.show.value = true
        line.root.show = true
        for (let p of line.points) {
            p.show = true
        }
    }

    public override Hide() {
        const line = toRaw(this)
        line.show.value = false
        line.root.show = false
        for (let p of line.points) {
            p.show = false
        }
    }

    public override Destroy() {
        const line = toRaw(this)
        line.O.map.V.entities.remove(this.root)
        for (let p of line.points) {
            line.O.map.V.entities.remove(p)
        }
    }

    public InsertPoint(e: Cesium.Cartesian3) {
        const line = toRaw(this)
        const p = this.O.map.V.entities.add({
            name: "LinePoint",
            position: e,
            billboard: {
                image: Line.icons[line.points.length == 0 ? 0 : 2],
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                scale: this.O.pointScale || 1.4,
                disableDepthTestDistance: 50000,
            }
        })
        //@ts-ignore
        p.type = 'LinePoint'
        //@ts-ignore
        p.body = this
        line.points.push(p)
        line.UpdateLinePath()
        line.UpdatePointsIcon()
    }

    public DeletePoint(current: string | number) {
        const line = toRaw(this)
        if (typeof current == 'number') {
            line.O.map.V.entities.remove(line.points[current])
            line.points.splice(current, 1)
        }
        else {
            const index = line.points.findIndex(p => p.id == current)
            if (index != -1) {
                line.O.map.V.entities.remove(line.points[index])
                line.points.splice(index, 1)
            }
        }
        line.UpdateLinePath()
        line.UpdatePointsIcon()
    }

    public GetLinePath() {
        const line = toRaw(this)
        const path: Array<Cesium.Cartesian3> = []
        for (let p of line.points) {
            //@ts-ignore
            path.push(p.position.getValue(new Cesium.JulianDate()))
        }
        return path
    }

    public GetLineLength() {
        const line = toRaw(this)
        //@ts-ignore
        const path = line.GetLinePath()
        let distance = 0
        if (path.length > 1) {
            for (let i = 1; i < path.length; i++) {
                distance += Cesium.Cartesian3.distance(path[i - 1], path[i])
            }
        }
        return parseFloat(distance.toFixed(2))
    }

    private UpdatePointsIcon() {
        const line = toRaw(this)
        for (let i = 0; i < line.points.length; i++) {
            //@ts-ignore
            line.points[i].billboard.image = Line.icons[i == 0 ? 0 : i == line.points.length - 1 ? 2 : 1]
        }
    }

    public UpdateLinePath() {
        const line = toRaw(this)
        //@ts-ignore
        line.root.polyline.positions = line.GetLinePath()
    }

    public ChangeColor(color: string) {
        const line = toRaw(this)
        line.O.color = color
        //@ts-ignore
        line.root.polyline.material = Cesium.Color.fromCssColorString(color)
    }

    public ChangePointScale(scale: number) {
        const line = toRaw(this)
        line.O.pointScale = scale
        for (let p of line.points) {
            //@ts-ignore
            p.billboard.scale = scale
        }
    }

    public override OnDragging(e: Cesium.Cartesian3, id: string, name: string): void {
        const line = toRaw(this)
        if (name == 'LineRoot') {
            if (line.O.totalDragable) {
                const delta = Cesium.Cartesian3.subtract(e, this.downPosition, new Cesium.Cartesian3())
                for (let p of line.points) {
                    p.position = Cesium.Cartesian3.add((p.position?.getValue(new Cesium.JulianDate()) as Cesium.Cartesian3), delta, new Cesium.Cartesian3()) as unknown as Cesium.PositionProperty
                }
                this.downPosition = e
                this.UpdateLinePath()
            }
        }
        else if (name == 'LinePoint') {
            if (line.O.dragable == undefined || line.O.dragable) {
                const point = line.points.find(p => p.id == id)
                if (point) {
                    point.position = e as unknown as Cesium.PositionProperty
                    line.UpdateLinePath()
                }
            }
        }
    }

    public override OnDraggingEnd(e: Cesium.Cartesian3, id: string, name: string): void {
        const line = toRaw(this)
        line.OnDragging(e, id, name)
    }

    public override OnMouseDown(e: Cesium.Cartesian3, id: string, name: string): void {
        this.downPosition = e
    }
}

export { Line }