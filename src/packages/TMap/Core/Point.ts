import { TMap } from "../Type";
import { Actor } from "./Actor";
import { toRaw } from "vue";

class Point extends Actor {
    constructor(options: TMap.IPoint) {
        super(options)
        this.type = "Point"
        this.CreateRoot()
    }

    private get O() {
        return this.options as TMap.IPoint
    }

    public override CreateRoot() {
        this.root = this.O.map.V.entities.add({
            name: "PointRoot",
            position: this.O.position,
            billboard: {
                image: this.O.icon,
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

    public ChangeIcon(icon: string) {
        const point = toRaw(this);
        //@ts-ignore
        point.root.billboard.image = icon
    }

    public ChangePosition(e: Cesium.Cartesian3) {
        const point = toRaw(this)
        point.O.position = e
        point.root.position = e as unknown as Cesium.PositionProperty
    }

    public ChangeIconScale(scale: number) {
        const point = toRaw(this);
        (point.options as TMap.IPoint).scale = scale
        //@ts-ignore
        point.root.billboard.scale = scale
    }

    public OnClick(e: Cesium.Cartesian3, id: string, name: string): void {

    }
}

export { Point }