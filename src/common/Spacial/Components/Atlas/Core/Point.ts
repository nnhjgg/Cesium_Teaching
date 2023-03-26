import { Atlas } from "../Atlas";
import { Entity } from "./Entity";
import blurIcon from '../../../Assets/blur.png'
import focusIcon from '../../../Assets/focus.png'
import originIcon from '../../../Assets/origin.png'
import { ref } from "vue";

interface IPointOptions {
    atlas: Atlas,
    parent?: Entity | null,
    position: Cesium.Cartesian3
}

interface IPointEvent {
    OnMouseDown: () => void,
    OnMouseUp: () => void,
    OnMouseMove: (isMouseDown: boolean) => void,
    OnLeftClick: () => void,
    OnMidClick: () => void,
    OnRightClick: () => void,
    OnDragStart: () => void,
    OnDragging: (e: Cesium.Cartesian3) => void,
    OnDragEnd: () => void,
}

class Point extends Entity implements IPointEvent {
    constructor(options: IPointOptions) {
        super(options.atlas, options.parent)
        this.Create(options.position)
    }

    public height = ref<number>(200)

    public body!: Cesium.Entity

    public origin!: Cesium.Entity

    public Create(p: Cesium.Cartesian3): void {
        let a = this.atlas?.GetLngLatFromC3(p) as { R: number, Q: number, H: number }
        let c = this.atlas?.GetC3FromLngLat(a.R, a.Q, this.height.value) as Cesium.Cartesian3
        this.body = this.atlas.viewer.entities.add({
            name: "Point",
            position: c,
            billboard: {
                image: blurIcon,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                scale: 1,
                disableDepthTestDistance: 50000
            },
            label: {
                text: `Point`,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                fillColor: Cesium.Color.WHITE,
                font: '15px sans-serif',
                pixelOffset: new Cesium.Cartesian2(0, -17), // 文字向左偏移一段距离(像素)
                eyeOffset: new Cesium.Cartesian3(0, 0.4, 0), // 文字上升一段距离(米)
                showBackground: true,
                backgroundColor: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
                backgroundPadding: new Cesium.Cartesian2(10, 6),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                disableDepthTestDistance: 50000
            },
            polyline: {
                // clampToGround: true,
                positions: [p, c],
                width: 2,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: new Cesium.Color(1.0, 1.0, 1.0, 1),
                    dashLength: 14 //短划线长度
                }),
                // 此参数是在被遮挡时,显示的颜色
                depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    color: new Cesium.Color(1.0, 1.0, 1.0, 1),
                    dashLength: 14 //短划线长度
                }),
            }
        })
        //@ts-ignore
        this.body.type = 'Point'
        //@ts-ignore
        this.body.body = this

        this.origin = this.atlas.viewer.entities.add({
            name: "Origin",
            position: p,
            billboard: {
                image: originIcon,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                scale: 1,
                disableDepthTestDistance: 50000
            },
        })
        //@ts-ignore
        this.body.origin = this.origin
        //@ts-ignore
        this.origin.type = 'Origin'
        //@ts-ignore
        this.origin.body = this.origin
    }

    public Destroy(): void {
        this.atlas.viewer.entities.remove(this.body)
    }

    public Update(): void {
        if (this.parent) {
            this.parent.Update()
        }
    }

    public OnMouseDown() {

    }

    public OnMouseUp() {

    }

    public OnMouseMove(isMouseDown: boolean) {

    }

    public OnLeftClick() {

    }

    public OnMidClick() {

    }

    public OnRightClick() {

    }

    public OnDragStart() {

    }

    public OnDragging(e: Cesium.Cartesian3) {
        let a = this.atlas?.GetLngLatFromC3(e) as { R: number, Q: number, H: number }
        let b = this.atlas?.GetC3FromLngLat(a.R, a.Q, this.height.value)
        let c = this.atlas?.GetC3FromLngLat(a.R, a.Q, 0)
        this.body.position = b as unknown as Cesium.PositionProperty
        this.origin.position = c as unknown as Cesium.PositionProperty
        //@ts-ignore
        this.body.polyline.positions = [b, c]
    }

    public OnDragEnd() {

    }
}

export { Point, IPointOptions }