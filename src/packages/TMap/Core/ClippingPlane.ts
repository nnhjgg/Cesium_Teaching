import { toRaw } from "vue";
import { TMap } from "../Type";
import { Actor } from "./Actor";

class ClippingPlane extends Actor {
    constructor(options: TMap.IClippingPlane) {
        super(options)
        this.CreateRoot()
    }

    private get O() {
        return this.options as TMap.IClippingPlane
    }

    public CreateRoot(): void {
        const pointsLength = this.O.polyline.length;

        const clippingPlanes = []

        for (let i = 0; i < pointsLength; ++i) {
            const nextIndex = (i + 1) % pointsLength;
            let midpoint = Cesium.Cartesian3.add(
                this.O.polyline[i],
                this.O.polyline[nextIndex],
                new Cesium.Cartesian3()
            )
            midpoint = Cesium.Cartesian3.multiplyByScalar(
                midpoint,
                0.5,
                midpoint
            );

            const up = Cesium.Cartesian3.normalize(
                midpoint,
                new Cesium.Cartesian3()
            )
            let right = Cesium.Cartesian3.subtract(
                this.O.polyline[nextIndex],
                midpoint,
                new Cesium.Cartesian3()
            );
            right = Cesium.Cartesian3.normalize(right, right);

            let normal = Cesium.Cartesian3.cross(
                right,
                up,
                new Cesium.Cartesian3()
            )

            normal = Cesium.Cartesian3.normalize(normal, normal);

            const originCenteredPlane = new Cesium.Plane(normal, 0.0);
            const distance = Cesium.Plane.getPointDistance(
                originCenteredPlane,
                midpoint
            );

            clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
        }

        this.O.map.V.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: clippingPlanes,
            edgeWidth: this.O.width || 5,
            edgeColor: Cesium.Color.fromCssColorString(this.O.color || '#ff0000'),
        });
    }

    public Show(): void {
        const cp = toRaw(this)
        cp.O.map.V.scene.globe.clippingPlanes.enabled = true
    }

    public Hide(): void {
        const cp = toRaw(this)
        cp.O.map.V.scene.globe.clippingPlanes.enabled = false
    }

    public Destroy(): void {
        const cp = toRaw(this)
        //@ts-ignore
        cp.O.map.V.scene.globe.clippingPlanes = undefined
    }
}

export { ClippingPlane }