import { TMap } from "../Type";
import { Entity } from "./Entity";
import { toRaw } from "vue";
import psIcon from '../Assets/Icon/ps.png'
import fireIcon from '../Assets/Icon/fire.png'

class ParticleSystem extends Entity {
    constructor(options: TMap.IParticleSystem) {
        super(options)
        this.type = "ParticleSystem"
        this.CreateRoot()
    }

    private ps!: Cesium.ParticleSystem

    private get O() {
        return this.options as TMap.IParticleSystem
    }

    public override CreateRoot() {
        this.root = this.O.map.V.entities.add({
            name: "ParticleSystemRoot",
            position: this.O.position,
            billboard: {
                image: psIcon,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                scale: 1,
                disableDepthTestDistance: 50000,
            }
        })
        //@ts-ignore
        this.root.type = 'ParticleSystemRoot'
        //@ts-ignore
        this.root.body = this

        this.ps = new Cesium.ParticleSystem({
            image: this.O.texture || fireIcon,
            startColor: Cesium.Color.RED.withAlpha(0.5),
            endColor: Cesium.Color.YELLOW.withAlpha(0.1),
            startScale: 10,
            endScale: 0.1,
            minimumParticleLife: 1.5,
            maximumParticleLife: 4,
            minimumSpeed: 20,
            maximumSpeed: 80,
            imageSize: new Cesium.Cartesian2(3, 3),
            sizeInMeters: false,
            emissionRate: 40,
            emitter: new Cesium.CircleEmitter(50),
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(this.O.position || Cesium.Cartesian3.ZERO),
            emitterModelMatrix: this.GenerateDefaultEmitterMatrix()
        })
        this.O.map.V.scene.primitives.add(this.ps)
    }

    private GenerateDefaultEmitterMatrix() {
        let hpr = Cesium.HeadingPitchRoll.fromDegrees(0, 0, 0)
        let trs = new Cesium.TranslationRotationScale()
        trs.translation = Cesium.Cartesian3.fromElements(0, 0, 0)
        trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr)
        return Cesium.Matrix4.fromTranslationRotationScale(trs)
    }

    public override Show() {
        const ps = toRaw(this)
        ps.show.value = true
        ps.root.show = true
        ps.ps.show = true
    }

    public override Hide() {
        const ps = toRaw(this)
        ps.show.value = false
        ps.root.show = false
        ps.ps.show = false
    }

    public override Destroy() {
        const ps = toRaw(this)
        ps.O.map.V.entities.remove(ps.root)
        ps.O.map.V.scene.primitives.remove(ps.ps)
    }

    public override OnDragging(e: Cesium.Cartesian3, id: string, name: string): void {
        const ps = toRaw(this)
        if (ps.O.dragable == undefined || ps.O.dragable) {
            if (name == 'ParticleSystemRoot') {
                ps.ChangePosition(e)
            }
        }
    }

    public override OnDraggingEnd(e: Cesium.Cartesian3, id: string, name: string): void {
        const ps = toRaw(this)
        ps.OnDragging(e, id, name)
    }

    public ChangePosition(e: Cesium.Cartesian3) {
        const ps = toRaw(this)
        ps.root.position = e as unknown as Cesium.PositionProperty
        ps.ps.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(e)
    }

    public GetPosition() {
        const ps = toRaw(this)
        return ps.root.position?.getValue(new Cesium.JulianDate()) as Cesium.Cartesian3
    }

}

export { ParticleSystem }