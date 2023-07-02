import { TMap } from "../Type";
import { Entity } from "./Entity";
import { toRaw } from "vue";
import _0 from '../Assets/Icon/_0.png'
import _1 from '../Assets/Icon/_1.png'
import _2 from '../Assets/Icon/_2.png'
import _3 from '../Assets/Icon/_3.png'
import _4 from '../Assets/Icon/_4.png'
import _5 from '../Assets/Icon/_5.png'
import _6 from '../Assets/Icon/_6.png'
import _7 from '../Assets/Icon/_7.png'
import _8 from '../Assets/Icon/_8.png'
import _9 from '../Assets/Icon/_9.png'
import _10 from '../Assets/Icon/_10.png'
import _11 from '../Assets/Icon/_11.png'
import _12 from '../Assets/Icon/_12.png'
import _13 from '../Assets/Icon/_13.png'
import _14 from '../Assets/Icon/_14.png'
import _15 from '../Assets/Icon/_15.png'
import _16 from '../Assets/Icon/_16.png'
import _17 from '../Assets/Icon/_17.png'
import _18 from '../Assets/Icon/_18.png'
import _19 from '../Assets/Icon/_19.png'
import _20 from '../Assets/Icon/_20.png'
import _21 from '../Assets/Icon/_21.png'
import _22 from '../Assets/Icon/_22.png'
import _23 from '../Assets/Icon/_23.png'
import _24 from '../Assets/Icon/_24.png'
import _25 from '../Assets/Icon/_25.png'
import _26 from '../Assets/Icon/_26.png'
import _27 from '../Assets/Icon/_27.png'
import _28 from '../Assets/Icon/_28.png'

class Point extends Entity {
    constructor(options: TMap.IPoint) {
        super(options)
        this.type = "Point"
        this.CreateRoot()
    }

    static icons = [_0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28]

    private get O() {
        return this.options as TMap.IPoint
    }

    public override CreateRoot() {
        this.root = this.O.map.V.entities.add({
            name: "PointRoot",
            position: this.O.position,
            billboard: {
                image: Point.icons[this.O.icon || 0],
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                scale: this.O.scale || 1,
                disableDepthTestDistance: 50000,
            }
        })
        //@ts-ignore
        this.root.type = 'PointRoot'
        //@ts-ignore
        this.root.body = this
    }

    public override Show() {
        const point = toRaw(this)
        point.show.value = true
        point.root.show = true
    }

    public override Hide() {
        const point = toRaw(this)
        point.show.value = false
        point.root.show = false
    }

    public override Destroy() {
        const point = toRaw(this)
        point.O.map.V.entities.remove(point.root)
    }

    public override OnDragging(e: Cesium.Cartesian3, id: string, name: string): void {
        const point = toRaw(this)
        if (point.O.dragable == undefined || point.O.dragable) {
            if (name == 'PointRoot') {
                point.ChangePosition(e)
            }
        }
    }

    public override OnDraggingEnd(e: Cesium.Cartesian3, id: string, name: string): void {
        const point = toRaw(this)
        point.OnDragging(e, id, name)
    }

    public ChangeIcon(index: number) {
        const point = toRaw(this);
        (point.options as TMap.IPoint).icon = index
        //@ts-ignore
        point.root.billboard.image = Point.icons[index]
    }

    public ChangePosition(e: Cesium.Cartesian3) {
        const point = toRaw(this)
        point.root.position = e as unknown as Cesium.PositionProperty
    }

    public ChangeIconScale(scale: number) {
        const point = toRaw(this);
        (point.options as TMap.IPoint).scale = scale
        //@ts-ignore
        point.root.billboard.scale = scale
    }

    public GetPosition() {
        const point = toRaw(this)
        return point.root.position?.getValue(new Cesium.JulianDate()) as Cesium.Cartesian3
    }

    public GetIcon() {
        const point = toRaw(this)
        return point.O.icon
    }

    public GetIconScale() {
        const point = toRaw(this)
        return point.O.scale
    }

}

export { Point }