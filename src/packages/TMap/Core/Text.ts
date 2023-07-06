import { TMap } from "../Type";
import { Actor } from "./Actor";
import { toRaw } from "vue";

class Text extends Actor {
    constructor(options: TMap.IText) {
        super(options)
        this.type = "Text"
        this.CreateRoot()
    }

    private get O() {
        return this.options as TMap.IText
    }

    public override CreateRoot() {
        this.root = this.O.map.V.entities.add({
            name: "TextRoot",
            position: this.O.position,
            label: {
                text: `${this.O.label || ''}`,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString(this.O.color || '#ffffff'),
                font: '16px sans-serif',
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString(this.O.fillColor || '#000000dd'),
                backgroundPadding: new Cesium.Cartesian2(14, 14),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                disableDepthTestDistance: 50000,
            },
        })
        //@ts-ignore
        this.root.type = 'TextRoot'
        //@ts-ignore
        this.root.body = this
    }

    public override Show() {
        const text = toRaw(this)
        text.show.value = true
        text.root.show = true
    }

    public override Hide() {
        const text = toRaw(this)
        text.show.value = false
        text.root.show = false
    }

    public override Destroy() {
        const text = toRaw(this)
        text.O.map.V.entities.remove(text.root)
    }

    public override OnDragging(e: Cesium.Cartesian3, id: string, name: string): void {
        const text = toRaw(this)
        if (text.O.dragable == undefined || text.O.dragable) {
            if (name == 'TextRoot') {
                text.ChangePosition(e)
            }
        }
    }

    public override OnDraggingEnd(e: Cesium.Cartesian3, id: string, name: string): void {
        const text = toRaw(this)
        text.OnDragging(e, id, name)
    }

    public ChangePosition(e: Cesium.Cartesian3) {
        const text = toRaw(this)
        text.O.position = e
        text.root.position = e as unknown as Cesium.PositionProperty
    }
}

export { Text }