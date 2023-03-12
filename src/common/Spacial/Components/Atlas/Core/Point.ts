import { Atlas } from "../Atlas";
import { Entity } from "./Entity";
import blurIcon from '../../../Assets/blur.png'
import focusIcon from '../../../Assets/focus.png'

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

    public body!: Cesium.Entity

    public Create(p: Cesium.Cartesian3): void {
        this.body = this.atlas.viewer.entities.add({
            name: "Point",
            position: p,
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
            }
        })
        //@ts-ignore
        this.body.type = 'Point'
        //@ts-ignore
        this.body.body = this
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
        console.log("OnMouseDown")
    }

    public OnMouseUp() {
        console.log("OnMouseUp")
    }

    public OnMouseMove(isMouseDown: boolean) {
        console.log("OnMouseMove")
    }

    public OnLeftClick() {
        console.log("OnLeftClick")
    }

    public OnMidClick() {
        console.log("OnMidClick")
    }

    public OnRightClick() {
        console.log("OnRightClick")
    }

    public OnDragStart() {
        console.log("OnDragStart")
    }

    public OnDragging(e: Cesium.Cartesian3) {
        this.body.position = e as unknown as Cesium.PositionProperty
    }

    public OnDragEnd() {
        console.log("OnDragEnd")
    }
}

export { Point, IPointOptions }