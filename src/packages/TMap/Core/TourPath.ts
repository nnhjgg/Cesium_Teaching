import { TMap } from "../Type";
import { Actor } from "./Actor";
import { toRaw } from "vue";
import startIcon from '../Assets/Icon/lineS.png'

class TourPath extends Actor {
    constructor(options: TMap.ITourPath) {
        super(options)
        this.type = "TourPath"
        this.CreateRoot()
    }

    private points: Array<Cesium.Entity> = []

    private way!: Cesium.Entity

    private get O() {
        return this.options as TMap.ITourPath
    }

    public override CreateRoot() {
        this.root = this.O.map.V.entities.add({
            name: "TourPathRoot",
            polyline: {
                positions: this.O.polyline.length != 0 ? [...this.O.polyline, this.O.polyline[0]] : this.O.polyline,
                width: this.O.width || 5,
                material: Cesium.Color.fromCssColorString(this.O.color || '#ff0000'),
            },
        })
        //@ts-ignore
        this.root.type = 'TourPathRoot'
        //@ts-ignore
        this.root.body = this

        this.way = this.O.map.V.entities.add({
            name: "TourPathWay",
            polyline: {
                positions: [],
                width: this.O.wayWidth || 3,
                material: Cesium.Color.fromCssColorString(this.O.wayColor || '#212121'),
                // depthFailMaterial: Cesium.Color.fromCssColorString(this.O.wayColor || '#212121'),
            },
        })
        //@ts-ignore
        this.way.type = 'TourPathWay'
        //@ts-ignore
        this.way.body = this

        this.CreateDefaultPoints()
        this.UpdateTourPath()
    }

    private CreateDefaultPoints() {
        if (this.O.polyline.length != 0) {
            for (let position of this.O.polyline) {
                const p = this.O.map.V.entities.add({
                    name: "TourPathPoint",
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
                p.type = 'TourPathPoint'
                //@ts-ignore
                p.body = this
                this.points.push(p)
            }
        }
    }

    public override Show() {
        const tp = toRaw(this)
        tp.show.value = true
        tp.root.show = true
        for (let p of tp.points) {
            p.show = false
        }
    }

    public override Hide() {
        const tp = toRaw(this)
        tp.show.value = false
        tp.root.show = false
        for (let p of tp.points) {
            p.show = false
        }
    }

    public override Destroy() {
        const tp = toRaw(this)
        tp.O.map.V.entities.remove(tp.root)
        for (let p of tp.points) {
            tp.O.map.V.entities.remove(p)
        }
    }

    public InsertPoint(e: Cesium.Cartesian3) {
        const tp = toRaw(this)
        const p = this.O.map.V.entities.add({
            name: "TourPathPoint",
            position: e,
            billboard: {
                image: startIcon,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                scale: this.O.pointScale || 1.4,
                disableDepthTestDistance: 50000,
            }
        })
        //@ts-ignore
        p.type = 'TourPathPoint'
        //@ts-ignore
        p.body = this
        tp.points.push(p)
        tp.UpdatePath()
        tp.UpdateTourPath()
    }

    public DeletePoint(current: string | number) {
        const tp = toRaw(this)
        if (typeof current == 'number') {
            tp.O.map.V.entities.remove(tp.points[current])
            tp.points.splice(current, 1)
        }
        else {
            const index = tp.points.findIndex(p => p.id == current)
            if (index != -1) {
                tp.O.map.V.entities.remove(tp.points[index])
                tp.points.splice(index, 1)
            }
        }
        tp.UpdatePath()
        tp.UpdateTourPath()
    }

    public GetPointPath() {
        const rect = toRaw(this)
        const path: Array<Cesium.Cartesian3> = []
        for (let p of rect.points) {
            //@ts-ignore
            path.push(p.position.getValue(new Cesium.JulianDate()))
        }
        return path
    }

    public UpdatePath() {
        const tp = toRaw(this)
        const path = tp.GetPointPath()
        tp.O.polyline = path
        //@ts-ignore
        tp.root.polyline.positions = [...path, path[0]]
    }

    private UpdateTourPath() {
        const tp = toRaw(this)
        if (tp.O.polyline.length > 2) {
            //@ts-ignore
            tp.way.polyline.positions = tp.CalculatePath()
        }
        else {
            //@ts-ignore
            tp.way.polyline.positions = []
        }
    }

    private CalculatePath() {
        const tp = toRaw(this)
        const order = tp.GetMaxPositionPoint()
        const bound = tp.GetBound(order)
        const way = tp.GetWay(bound)
        return way
    }

    private GetMaxPositionPoint(): { minLngIndex: number, maxLngIndex: number, minLatIndex: number, maxLatIndex: number } {
        const tp = toRaw(this)
        let lng: Array<number> = []
        let lat: Array<number> = []
        for (let i = 0; i < tp.O.polyline.length; i++) {
            let ll = this.O.map.GetLngLatFromC3(tp.O.polyline[i])
            lng.push(ll.R)
            lat.push(ll.Q)
        }
        const minLng = Math.min(...lng)
        const maxLng = Math.max(...lng)
        const minLat = Math.min(...lat)
        const maxLat = Math.max(...lat)

        return {
            minLngIndex: lng.findIndex(c => c == minLng),
            maxLngIndex: lng.findIndex(c => c == maxLng),
            minLatIndex: lat.findIndex(c => c == minLat),
            maxLatIndex: lat.findIndex(c => c == maxLat),
        }
    }

    private GetBound(s: { minLngIndex: number, maxLngIndex: number, minLatIndex: number, maxLatIndex: number }) {
        const tp = toRaw(this)
        const minLngLL = this.O.map.GetLngLatFromC3(tp.O.polyline[s.minLngIndex])
        const maxLngLL = this.O.map.GetLngLatFromC3(tp.O.polyline[s.maxLngIndex])
        const minLatLL = this.O.map.GetLngLatFromC3(tp.O.polyline[s.minLatIndex])
        const maxLatLL = this.O.map.GetLngLatFromC3(tp.O.polyline[s.maxLatIndex])

        const _1 = this.O.map.GetC3FromLngLat(maxLngLL.R, maxLatLL.Q, maxLatLL.H) as Cesium.Cartesian3
        const _2 = this.O.map.GetC3FromLngLat(minLngLL.R, maxLatLL.Q, maxLatLL.H) as Cesium.Cartesian3
        const _3 = this.O.map.GetC3FromLngLat(minLngLL.R, minLatLL.Q, minLatLL.H) as Cesium.Cartesian3
        const _4 = this.O.map.GetC3FromLngLat(maxLngLL.R, minLatLL.Q, minLatLL.H) as Cesium.Cartesian3

        return [_1, _2, _3, _4, _1]
    }

    private GetWay(bound: Array<Cesium.Cartesian3>) {
        const tp = toRaw(this)
        const path: Array<Cesium.Cartesian3> = []
        const origin = bound[tp.O.startPoint || TMap.StartPoint.LeftTop]
        const rotate = tp.O.rotate || 0
        const hDistance = Cesium.Cartesian3.distance(bound[0], bound[1])
        const vDistance = Cesium.Cartesian3.distance(bound[0], bound[3])
        const rayDistance = Cesium.Cartesian3.distance(bound[0], bound[2])


        return bound
    }

    public OnDragging(e: Cesium.Cartesian3, id: string, name: string): void {
        const tp = toRaw(this)
        if (name == 'TourPathPoint') {
            if (tp.O.dragable == undefined || tp.O.dragable) {
                const point = tp.points.find(p => p.id == id)
                if (point) {
                    point.position = e as unknown as Cesium.PositionProperty
                    tp.UpdatePath()
                }
            }
        }
    }

    public OnDraggingEnd(e: Cesium.Cartesian3, id: string, name: string): void {
        const tp = toRaw(this)
        if (name == 'TourPathPoint') {
            if (tp.O.dragable == undefined || tp.O.dragable) {
                tp.OnDragging(e, id, name)
                tp.UpdateTourPath()
            }
        }
    }
}

export { TourPath }