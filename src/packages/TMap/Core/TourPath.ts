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
                positions: new Cesium.CallbackProperty(() => {
                    return this.O.polyline.length != 0 ? [...this.O.polyline, this.O.polyline[0]] : this.O.polyline
                }, false),
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

    public override Foucs(): void {

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
        const p = tp.O.map.V.entities.add({
            name: "TourPathPoint",
            position: e,
            billboard: {
                image: startIcon,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                scale: tp.O.pointScale || 1.4,
                disableDepthTestDistance: 50000,
            }
        })
        //@ts-ignore
        p.type = 'TourPathPoint'
        //@ts-ignore
        p.body = tp
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

        const _1 = this.O.map.GetC3FromLngLat(minLngLL.R, maxLatLL.Q, maxLatLL.H) as Cesium.Cartesian3
        const _2 = this.O.map.GetC3FromLngLat(maxLngLL.R, maxLatLL.Q, maxLatLL.H) as Cesium.Cartesian3
        const _3 = this.O.map.GetC3FromLngLat(maxLngLL.R, minLatLL.Q, minLatLL.H) as Cesium.Cartesian3
        const _4 = this.O.map.GetC3FromLngLat(minLngLL.R, minLatLL.Q, minLatLL.H) as Cesium.Cartesian3

        return [_1, _2, _3, _4, _1]
    }

    private GetDirection(bound: Array<Cesium.Cartesian3>) {
        const tp = toRaw(this)
        const rotate = Math.abs((tp.O.rotate || 0)) % 360
        const oll = tp.O.map.GetLngLatFromC3(bound[0])
        const rll = Coordtransform.Offset(oll.R, oll.Q, (tp.O.rotate || 0), 100)
        const rt = tp.O.map.GetC3FromLngLat(rll[0], rll[1], oll.H)
        const r = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(rt, bound[0], new Cesium.Cartesian3()), new Cesium.Cartesian3())

        const l1 = Cesium.Cartesian3.distance(bound[0], bound[1])
        const l2 = Cesium.Cartesian3.distance(bound[1], bound[2])
        const l3 = Cesium.Cartesian3.distance(bound[0], bound[2])
        const t = l2 / l1
        const bo = Math.atan(t) / Mathf.Deg2Rad

        let p!: Cesium.Cartesian3
        let s!: Cesium.Cartesian3
        let l!: number
        if (rotate < 91) {
            s = bound[0]
            const ll = tp.O.map.GetLngLatFromC3(s)
            const pll = Coordtransform.Offset(ll.R, ll.Q, (tp.O.rotate || 0) + 90, 100)
            const pt = tp.O.map.GetC3FromLngLat(pll[0], pll[1], ll.H)
            p = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(pt, s, new Cesium.Cartesian3()), new Cesium.Cartesian3())

            const a1 = 90 - rotate
            const ar = 90 - a1 - bo
            l = l3 * Math.cos(ar * Mathf.Deg2Rad)
        }
        else if (rotate > 90 && rotate < 181) {
            s = bound[3]
            const ll = tp.O.map.GetLngLatFromC3(s)
            const pll = Coordtransform.Offset(ll.R, ll.Q, (tp.O.rotate || 0) - 90, 100)
            const pt = tp.O.map.GetC3FromLngLat(pll[0], pll[1], ll.H)
            p = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(pt, s, new Cesium.Cartesian3()), new Cesium.Cartesian3())

            const a1 = 180 - rotate
            const ar = bo - a1
            l = l3 * Math.cos(ar * Mathf.Deg2Rad)
        }
        else if (rotate > 180 && rotate < 271) {
            s = bound[2]
            const ll = tp.O.map.GetLngLatFromC3(s)
            const pll = Coordtransform.Offset(ll.R, ll.Q, (tp.O.rotate || 0) + 90, 100)
            const pt = tp.O.map.GetC3FromLngLat(pll[0], pll[1], ll.H)
            p = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(pt, s, new Cesium.Cartesian3()), new Cesium.Cartesian3())

            const a1 = 270 - rotate
            const ar = 90 - a1 - bo
            l = l3 * Math.cos(ar * Mathf.Deg2Rad)

        }
        else if (rotate > 270 && rotate < 361) {
            s = bound[1]
            const ll = tp.O.map.GetLngLatFromC3(s)
            const pll = Coordtransform.Offset(ll.R, ll.Q, (tp.O.rotate || 0) - 90, 100)
            const pt = tp.O.map.GetC3FromLngLat(pll[0], pll[1], ll.H)
            p = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(pt, s, new Cesium.Cartesian3()), new Cesium.Cartesian3())

            const a1 = 360 - rotate
            const ar = bo - a1
            l = l3 * Math.cos(ar * Mathf.Deg2Rad)
        }
        return { r, p, s, l, d: l3 }
    }

    private CalculatePath() {
        const tp = toRaw(this)
        const order = tp.GetMaxPositionPoint()
        const bound = tp.GetBound(order)
        const direction = tp.GetDirection(bound)
        const way = tp.GetWay(order, bound, direction)
        return way
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

    private CalculateFromRotate(input: Array<{ x: number, y: number }>, direction: Cesium.Cartesian3) {
        const tp = toRaw(this)
        const turnExtend = tp.O.turnExtend || 50
        const xs = input.map(i => i.x)
        const ys = input.map(i => i.y)
        const ho = tp.O.rotate && tp.O.rotate > 90 && tp.O.rotate < 270 ? -1 : 1
        if (tp.O.type == 'lng') {
            let max = Math.max(...xs)
            let min = Math.min(...xs)
            let maxIndex = xs.findIndex(a => a == max)
            let minIndex = xs.findIndex(a => a == min)
            const c1 = tp.O.map.GetC3FromLngLat(input[maxIndex].x, input[maxIndex].y, tp.O.height || 100)
            const c2 = tp.O.map.GetC3FromLngLat(input[minIndex].x, input[minIndex].y, tp.O.height || 100)
            const c1r = Cesium.Cartesian3.add(c1, Cesium.Cartesian3.multiplyByScalar(direction, turnExtend * ho, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            const c2r = Cesium.Cartesian3.add(c2, Cesium.Cartesian3.multiplyByScalar(direction, -turnExtend * ho, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            return [c1r, c2r]
        }
        else {
            let max = Math.max(...ys)
            let min = Math.min(...ys)
            let maxIndex = ys.findIndex(a => a == max)
            let minIndex = ys.findIndex(a => a == min)
            const c1 = tp.O.map.GetC3FromLngLat(input[maxIndex].x, input[maxIndex].y, tp.O.height || 100)
            const c2 = tp.O.map.GetC3FromLngLat(input[minIndex].x, input[minIndex].y, tp.O.height || 100)
            const c1r = Cesium.Cartesian3.add(c1, Cesium.Cartesian3.multiplyByScalar(direction, turnExtend * ho, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            const c2r = Cesium.Cartesian3.add(c2, Cesium.Cartesian3.multiplyByScalar(direction, -turnExtend * ho, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            return [c1r, c2r]
        }
    }

    private GetCollisionPoints(l: Array<{ a: { x: number, y: number }, b: { x: number, y: number } }>, r: Array<{ a: { x: number, y: number }, b: { x: number, y: number } }>, direction: Cesium.Cartesian3) {
        const tp = toRaw(this)
        const result: Array<Cesium.Cartesian3> = []
        for (let c of l) {
            let temp: Array<{ x: number, y: number }> = []
            for (let o of r) {
                const t = Mathf.GetLinesCrossoverPoint({ a: { x: c.a.x, y: c.a.y }, b: { x: c.b.x, y: c.b.y } }, { c: { x: o.a.x, y: o.a.y }, d: { x: o.b.x, y: o.b.y } })
                if (t.r) {
                    temp.push(t.intersect)
                }
            }
            if (temp.length < 2) {
                /**
                 * 自己想想我这里为什么 continue 而不进行判断
                 */
                // temp = [{ x: c.a.x, y: c.a.y }, { x: c.b.x, y: c.b.y }]
                continue
            }

            result.push(...tp.CalculateFromRotate(temp, direction))
        }
        return result
    }

    private GetNearest(result: Array<Cesium.Cartesian3>) {
        const tp = toRaw(this)
        if (tp.O.position) {
            const start = Cesium.Cartesian3.distance(tp.O.position, result[0])
            const end = Cesium.Cartesian3.distance(tp.O.position, result[result.length - 1])
            if (start > end) {
                result.push(tp.O.position)
            }
            else {
                result.unshift(tp.O.position)
            }
        }
        return result
    }

    private GetWay(s: { minLngIndex: number, maxLngIndex: number, minLatIndex: number, maxLatIndex: number }, bound: Array<Cesium.Cartesian3>, direction: { r: Cesium.Cartesian3, p: Cesium.Cartesian3, s: Cesium.Cartesian3, l: number, d: number }) {
        const tp = toRaw(this)

        const sections = tp.GetSections()
        const temp: Array<{ a: { x: number, y: number }, b: { x: number, y: number } }> = []

        const turnPadding = tp.O.turnPadding || 50
        let distance = turnPadding / 2

        while (distance < direction.l) {
            const current = Cesium.Cartesian3.add(direction.s, Cesium.Cartesian3.multiplyByScalar(direction.p, distance, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            const w1 = Cesium.Cartesian3.add(current, Cesium.Cartesian3.multiplyByScalar(direction.r, direction.d, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            const a = tp.O.map.GetLngLatFromC3(w1)
            const w2 = Cesium.Cartesian3.add(current, Cesium.Cartesian3.multiplyByScalar(direction.r, -direction.d, new Cesium.Cartesian3()), new Cesium.Cartesian3())
            const b = tp.O.map.GetLngLatFromC3(w2)
            temp.push({ a: { x: a.R, y: a.Q }, b: { x: b.R, y: b.Q } })
            distance += turnPadding
        }

        const result = tp.GetCollisionPoints(temp, sections, direction.r)

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

        return tp.GetNearest(result)
    }

    public OnDragging(e: Cesium.Cartesian3, id: string, name: string): void {
        const tp = toRaw(this)
        if (name == 'TourPathPoint') {
            const point = tp.points.find(p => p.id == id)
            if (point) {
                point.position = e as unknown as Cesium.PositionProperty
                tp.UpdatePath()
            }
        }
    }

    public OnDraggingEnd(e: Cesium.Cartesian3, id: string, name: string): void {
        const tp = toRaw(this)
        if (name == 'TourPathPoint') {
            tp.OnDragging(e, id, name)
            tp.UpdateTourPath()
        }
    }
}

export { TourPath }