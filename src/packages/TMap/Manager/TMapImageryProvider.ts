import { TMap } from '../Type'
import { Coordtransform } from './Coordtransform'

class TilingScheme extends Cesium.WebMercatorTilingScheme {
    constructor(crs: TMap.Coordinate) {
        super()
        this.currentCoordinate = crs
        this.Generate()
    }

    private currentCoordinate!: TMap.Coordinate

    private pro = new Cesium.WebMercatorProjection()

    private Generate() {
        this.projection.project = (cartographic: Cesium.Cartographic, result?: Cesium.Cartesian3) => {
            let t!: Array<number>
            if (this.currentCoordinate == TMap.Coordinate.Gcj02) {
                t = Coordtransform.Wgs84ToGcj02(
                    Cesium.Math.toDegrees(cartographic.longitude),
                    Cesium.Math.toDegrees(cartographic.latitude)
                )
            }
            else if (this.currentCoordinate == TMap.Coordinate.Bd09) {
                t = Coordtransform.Wgs84toBd09(
                    Cesium.Math.toDegrees(cartographic.longitude),
                    Cesium.Math.toDegrees(cartographic.latitude)
                )
            }
            else if (this.currentCoordinate == TMap.Coordinate.Wsg84) {
                t = [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)]
            }

            result = this.pro.project(
                new Cesium.Cartographic(
                    Cesium.Math.toRadians(t[0]), Cesium.Math.toRadians(t[1])
                )
            )

            return new Cesium.Cartesian3(result.x, result.y)
        }

        this.projection.unproject = (cartesian: Cesium.Cartesian3, result?: Cesium.Cartographic) => {
            const cartographic = this.pro.unproject(cartesian)

            let t!: Array<number>
            if (this.currentCoordinate == TMap.Coordinate.Gcj02) {
                t = Coordtransform.Gcj02ToWgs84(
                    Cesium.Math.toDegrees(cartographic.longitude),
                    Cesium.Math.toDegrees(cartographic.latitude)
                )
            }
            else if (this.currentCoordinate == TMap.Coordinate.Bd09) {
                t = Coordtransform.Bd09ToWgs84(
                    Cesium.Math.toDegrees(cartographic.longitude),
                    Cesium.Math.toDegrees(cartographic.latitude)
                )
            }
            else if (this.currentCoordinate == TMap.Coordinate.Wsg84) {
                t = [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)]
            }

            return new Cesium.Cartographic(Cesium.Math.toRadians(t[0]), Cesium.Math.toRadians(t[1]))
        }
    }
}

class TMapImageryProvider extends Cesium.UrlTemplateImageryProvider {
    constructor(options: Cesium.UrlTemplateImageryProvider.ConstructorOptions & TMap.ITMapImageryProvider) {
        options.tilingScheme = new TilingScheme(options.crs)
        super({
            ...options,
            minimumLevel: 1,
            maximumLevel: 18,
            subdomains: TMapImageryProvider.subdomains,
        })
        this.defaultBrightness = options.brightness
        this.defaultContrast = options.contrast
        this.defaultHue = options.hue
        this.defaultSaturation = options.saturation
        this.defaultGamma = options.gamma
    }

    static subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
}

export { TMapImageryProvider }