import { Atlas } from "../Atlas";
import { Entity } from "./Entity";

interface ILineOptions {
    atlas: Atlas,
    parent?: Entity | null,
}

class Line extends Entity {
    constructor(options: ILineOptions) {
        super(options.atlas, options.parent)
        this.Create()
    }

    public body!: Cesium.Entity

    public Create(): void {
        this.body = this.atlas.viewer.entities.add({
            name: "Line",
            position: new Cesium.Cartesian3(),
            polyline: {
                positions: [],
                width: 4,
                // clampToGround: true,
                material: new Cesium.ImageMaterialProperty({ color: new Cesium.Color(1, 1, 0, 1) }),
                depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 1,
                    color: new Cesium.Color(1, 1, 0, 1),
                }),
            },
        })
        // 因为 Cesium 并没有有效的添加自定义属性方法 虽然有 entity.properties.addProperty 但其实还不如我直接用下面的
        //@ts-ignore
        this.body.type = 'Line'
        //@ts-ignore
        this.body.body = this
    }

    public Destroy(): void {

    }

    public Update(e: Array<Cesium.Cartesian3>): void {
        //@ts-ignore
        this.body.polyline.positions = e
    }
}

export { Line }