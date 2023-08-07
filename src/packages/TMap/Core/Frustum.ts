import { toRaw } from "vue";
import { TMap } from "../Type";
import { Actor } from "./Actor";

class Frustum extends Actor {
    constructor(options: TMap.IFrustum) {
        super(options)
        this.type = "Frustum"
        this.CreateRoot()
    }

    private geo!: Cesium.Primitive

    private outline!: Cesium.Primitive

    private get O() {
        return this.options as TMap.IFrustum
    }

    public CreateRoot(): void {
        this.CreateFrustum()
        this.CreateOutline()
    }

    public CreateFrustum() {
        const frustum = new Cesium.PerspectiveFrustum({
            fov: Cesium.Math.toRadians(this.O.fov || 40),
            aspectRatio: this.O.aspectRatio || 1.7,
            near: this.O.near || 0.1,
            far: this.O.far || 300,
        })

        const headingPitchRoll = new Cesium.HeadingPitchRoll()
        headingPitchRoll.heading = Cesium.Math.toRadians(this.O.heading || -25)
        headingPitchRoll.pitch = Cesium.Math.toRadians(this.O.pitch || 0)
        headingPitchRoll.roll = Cesium.Math.toRadians(this.O.roll || 30)

        const geometry = new Cesium.FrustumGeometry({
            frustum: frustum,
            origin: this.O.position,
            orientation: Cesium.Quaternion.fromHeadingPitchRoll(headingPitchRoll),
            vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
        })

        const instance = new Cesium.GeometryInstance({
            geometry: geometry,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(this.O.color || '#ff000033')),
            }
        })

        const primitive = new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.PerInstanceColorAppearance({
                closed: true,
                flat: true,
            }),
            asynchronous: false,
        })

        this.geo = this.O.map.V.scene.primitives.add(primitive)

        //@ts-ignore
        this.geo.type = 'FrustumRoot'
        //@ts-ignore
        this.geo.body = this
    }

    public CreateOutline() {
        const frustum = new Cesium.PerspectiveFrustum({
            fov: Cesium.Math.toRadians(this.O.fov || 40),
            aspectRatio: this.O.aspectRatio || 1.7,
            near: this.O.near || 0.1,
            far: this.O.far || 300,
        })

        const headingPitchRoll = new Cesium.HeadingPitchRoll()
        headingPitchRoll.heading = Cesium.Math.toRadians(this.O.heading || -25)
        headingPitchRoll.pitch = Cesium.Math.toRadians(this.O.pitch || 0)
        headingPitchRoll.roll = Cesium.Math.toRadians(this.O.roll || 30)

        const geometry = new Cesium.FrustumOutlineGeometry({
            frustum: frustum,
            origin: this.O.position,
            orientation: Cesium.Quaternion.fromHeadingPitchRoll(headingPitchRoll),
        })

        const instance = new Cesium.GeometryInstance({
            geometry: geometry,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(this.O.color || '#ff0000ff')),
            }
        })

        const primitive = new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.PerInstanceColorAppearance({
                closed: true,
                flat: true,
            }),
            asynchronous: false,
        })

        this.outline = this.O.map.V.scene.primitives.add(primitive)

        //@ts-ignore
        this.outline.type = 'FrustumOutline'
        //@ts-ignore
        this.outline.body = this
    }

    public override Show() {
        const frustum = toRaw(this)
        frustum.show.value = true
        frustum.geo.show = true
        frustum.outline.show = true
    }

    public override Hide() {
        const frustum = toRaw(this)
        frustum.show.value = false
        frustum.geo.show = false
        frustum.outline.show = false
    }

    public override Foucs(): void {

    }

    public override Destroy() {
        const frustum = toRaw(this)
        frustum.O.map.V.scene.primitives.remove(frustum.geo)
        frustum.O.map.V.scene.primitives.remove(frustum.outline)
    }
}

export { Frustum }