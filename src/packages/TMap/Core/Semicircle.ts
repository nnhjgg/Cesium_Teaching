import { toRaw } from 'vue'
import dockIcon from '../Assets/Icon/dock.png'
import { Coordtransform } from '../Manager/Coordtransform'
import { TMap } from '../Type'
import { Actor } from './Actor'

class Semicircle extends Actor {
    public constructor(options: TMap.ISemicircle) {
        super(options)
        this.CreateRoot()
    }

    private get O() {
        return this.options as TMap.ISemicircle
    }

    static once = (Math.PI * 2) / 360

    public Destroy() {
        this.O.map.V.entities.remove(this.root)
    }

    public CreateRoot() {
        const path = this.GetSemicirclePath()
        this.root = this.O.map.V.entities.add({
            name: "SemicircleRoot",
            position: this.O.map.GetC3FromLngLat(this.O.lng, this.O.lat, 0),
            billboard: {
                image: this.O.icon || dockIcon,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                scale: this.O.iconScale || 1,
                disableDepthTestDistance: 50000,
            },
            label: {
                show: false,
                text: '',
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                fillColor: Cesium.Color.WHITE,
                font: '15px sans-serif',
                pixelOffset: new Cesium.Cartesian2(0, 28),
                eyeOffset: new Cesium.Cartesian3(0, 0.4, 0), // 文字上升一段距离(米)
                showBackground: true,
                backgroundColor: new Cesium.Color(0.0, 0.0, 0.0, 0.6),
                backgroundPadding: new Cesium.Cartesian2(10, 6),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                disableDepthTestDistance: 50000,
            },
            polyline: {
                positions: path,
                width: 3,
                material: Cesium.Color.WHITE,
                depthFailMaterial: Cesium.Color.WHITE,
            },
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(path),
                outline: false,
                outlineWidth: 100,
                arcType: Cesium.ArcType.RHUMB,
                extrudedHeight: this.O.height,
                material: Cesium.Color.fromCssColorString('rgba(92,147,242,0.2)')
            }
        })

        //@ts-ignore
        this.root.type = 'SemicircleRoot'
        //@ts-ignore
        this.root.body = this

    }

    private GetSemicirclePath() {
        let path: Array<Cesium.Cartesian3> = []
        let current = 360 / this.O.radius.length

        for (let r = 0; r < this.O.radius.length; r++) {
            const p = [this.O.lng, this.O.lat]
            const a = Coordtransform.Offset(p[0], p[1], 90, this.O.radius[r])
            const b = Coordtransform.Offset(p[0], p[1], 0, this.O.radius[r])
            const lngD = a[0] - p[0]
            const latD = b[1] - p[1]
            for (let i = 0; i < current + 1; i++) {
                path.push(this.O.map.GetC3FromLngLat(p[0] + lngD * Math.sin(Semicircle.once * ((current * r) + i + (this.O.rotate || 0))), p[1] + latD * Math.cos(Semicircle.once * ((current * r) + i + (this.O.rotate || 0))), this.O.height) as Cesium.Cartesian3)
            }
        }
        return path
    }

    public Show(): void {
        const s = toRaw(this)
        s.show.value = true
        s.root.show = true
    }

    public Hide(): void {
        const s = toRaw(this)
        s.show.value = false
        s.root.show = false
    }
}

export { Semicircle }