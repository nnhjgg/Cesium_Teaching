import { TMap } from "../Type";
import { Actor } from "./Actor";
import { toRaw } from "vue";
import startIcon from '../Assets/Icon/lineS.png'
import { Coordtransform } from "../Manager/Coordtransform";
import { Mathf } from "@/libs/Mathf";

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
        const way = tp.GetWay(order, bound)
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

    private GetSections() {
        const tp = toRaw(this)
        let sections: Array<{ a: { x: number, y: number }, b: { x: number, y: number } }> = []
        let points: Array<{ x: number, y: number }> = []
        for (let p of tp.O.polyline) {
            const ll = tp.O.map.GetLngLatFromC3(p)
            points.push({ x: ll.R, y: ll.Q })
        }
        for (let i = 0; i < points.length; i++) {
            if (i == points.length - 1) {
                sections.push({ a: { x: points[i].x, y: points[i].y }, b: { x: points[0].x, y: points[0].y } })
            }
            else {
                sections.push({ a: { x: points[i].x, y: points[i].y }, b: { x: points[i + 1].x, y: points[i + 1].y } })
            }
        }
        return sections
    }

    private GetNearPoints(p: Array<Cesium.Cartesian3>, s: Array<{ a: { x: number, y: number }, b: { x: number, y: number } }>, direction: Cesium.Cartesian3) {
        const tp = toRaw(this)
        const turnExtend = tp.O.turnExtend || 20
        const ll = tp.O.map.GetLngLatFromC3(tp.O.polyline[0])
        const result: Array<Cesium.Cartesian3> = []
        for (let i = 0; i < p.length - 1; i += 2) {
            let temp: Array<number> = []
            const _1 = tp.O.map.GetLngLatFromC3(p[i])
            const _2 = tp.O.map.GetLngLatFromC3(p[i + 1])
            for (let o of s) {
                const r = Mathf.GetLinesCrossoverPoint({ a: { x: _1.R, y: _1.Q }, b: { x: _2.R, y: _2.Q } }, { c: { x: o.a.x, y: o.a.y }, d: { x: o.b.x, y: o.b.y } })
                if (r.r) {
                    temp.push(r.intersect.y)
                }
            }
            if (temp.length < 2) {
                temp = [_1.Q, _2.Q]
            }
            let max = Math.max(...temp)
            let min = Math.min(...temp)
            let maxIndex = temp.findIndex(a => a == max)
            let minIndex = temp.findIndex(a => a == min)
            const tpc = tp.O.map.GetC3FromLngLat(_1.R, temp[maxIndex], ll.H) as Cesium.Cartesian3
            const bpc = tp.O.map.GetC3FromLngLat(_1.R, temp[minIndex], ll.H) as Cesium.Cartesian3

            const tpr = Cesium.Cartesian3.add(tpc, Cesium.Cartesian3.multiplyByScalar(direction, turnExtend, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            const bpr = Cesium.Cartesian3.add(bpc, Cesium.Cartesian3.multiplyByScalar(direction, -turnExtend, new Cesium.Cartesian3()), new Cesium.Cartesian3())

            result.push(tpr, bpr)

        }
        return result
    }

    private GetWay(s: { minLngIndex: number, maxLngIndex: number, minLatIndex: number, maxLatIndex: number }, bound: Array<Cesium.Cartesian3>) {
        const tp = toRaw(this)
        const origin = bound[tp.O.startDirection == TMap.StartDirection.Left ? 1 : 0]
        const ho = tp.O.startDirection == TMap.StartDirection.Left ? -1 : 1

        const turnPadding = tp.O.turnPadding || 20
        const hDistance = Cesium.Cartesian3.distance(bound[0], bound[1])
        const rayDistance = Cesium.Cartesian3.distance(bound[0], bound[2])
        const hDirection = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(bound[1], bound[0], new Cesium.Cartesian3()), new Cesium.Cartesian3())

        const oll = tp.O.map.GetLngLatFromC3(origin)
        const vll = Coordtransform.Offset(oll.R, oll.Q, 0, 100)
        const vp = tp.O.map.GetC3FromLngLat(vll[0], vll[1], oll.H)
        const direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(vp, origin, new Cesium.Cartesian3()), new Cesium.Cartesian3())

        const sections = tp.GetSections()
        const temp: Array<Cesium.Cartesian3> = []

        let distance = turnPadding

        while (distance < hDistance) {
            const current = Cesium.Cartesian3.add(origin, Cesium.Cartesian3.multiplyByScalar(hDirection, distance * ho, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            const w1 = Cesium.Cartesian3.add(current, Cesium.Cartesian3.multiplyByScalar(direction, rayDistance, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            const w2 = Cesium.Cartesian3.subtract(current, Cesium.Cartesian3.multiplyByScalar(direction, rayDistance, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            temp.push(w1, w2)
            distance += turnPadding
        }

        const result = tp.GetNearPoints(temp, sections, direction)

        for (let i = 0; i < result.length - 1; i++) {
            if (i % 4 == 2) {
                if (i != result.length - 1) {
                    const l = new Cesium.Cartesian3(result[i].x, result[i].y, result[i].z)
                    const r = new Cesium.Cartesian3(result[i + 1].x, result[i + 1].y, result[i + 1].z)
                    result[i] = r
                    result[i + 1] = l
                }

            }
        }

        result.unshift(tp.O.position || tp.O.polyline[tp.O.startDirection == TMap.StartDirection.Left ? s.minLngIndex : s.maxLngIndex])

        return result

        // return bound
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