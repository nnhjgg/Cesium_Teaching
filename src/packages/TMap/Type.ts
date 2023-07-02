import { Entity } from "./Core/Entity"
import { TMapViewer } from "./Manager/TMapViewer"

namespace TMap {
    export interface ITMapViewerConstructor {
        /**
         * 容器
         */
        container: HTMLElement,
        /**
         * 是否填充默认底图 [ true ]
         */
        fillDefaultImagery?: boolean,
        /**
         * 是否生成地形 [ false ]
         */
        isTerrain?: boolean,
        /**
         * 地图类型
         */
        type: Cesium.SceneMode,
        /**
         * 是否生成房屋 [ false ]
         */
        buildings?: boolean,
        /**
         * 目标渲染帧率 [ 30 ]
         */
        targetFrameRate?: number,
        /**
         * 目标事件触发间隔 [ 10 ]
         */
        draggingThreshold?: number,
        OnLeftClick?: (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => void,
        OnMidClick?: (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => void,
        OnMidDown?: (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => void,
        OnMidUp?: (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => void,
        OnLeftDown?: (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => void,
        OnLeftUp?: (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => void,
        OnRightClick?: (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => void,
        OnRightDown?: (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => void,
        OnRightUp?: (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => void,
        OnMove?: (e: Cesium.ScreenSpaceEventHandler.MotionEvent) => void,
    }

    export enum Coordinate {
        Wsg84,
        Gcj02,
        Bd09,
    }

    export interface ITMapImageryProvider {
        url: string,
        crs: Coordinate
    }

    export interface IEntity {
        /**
         * 容器
         */
        map: TMapViewer
        /**
         * 是否可拖拽 [ true ]
         */
        dragable?: boolean,
        /**
         * 父元素
         */
        parent?: Entity,
        /**
         * 默认位置
         */
        position?: Cesium.Cartesian3
    }

    export interface IPoint extends IEntity {
        icon?: number,
        scale?: number
    }

    export interface ILine extends IEntity {
        polyline?: Array<Cesium.Cartesian3>
        width?: number
        color?: string,
        pointScale?: number,
        /**
         * 是否可整体拖拽 [ false ]
         */
        totalDragable?: boolean
    }

    export interface IRect extends ILine {
        fillColor?: string
    }

    export interface IText extends IEntity {
        label?: string,
        color?: string,
        fillColor?: string
    }

    export interface IParticleSystem extends IEntity {
        texture?: string
    }

    export interface IFlatModel extends IEntity {
        url: string,
        bounds: [number, number, number, number],
        zoom?: boolean
    }

    export interface ISpatialModel extends IEntity {
        url: string,
        definition?: number,
        zoom?: boolean
    }

    export interface ISector extends IEntity {
        radius?: number,
        offset?: number,
        angle?: number
        color?: string,
        fillColor?: string,
        width?: number
    }

    type ImageryProvider = IEntity & ITMapImageryProvider

    export interface IImageryProvider extends ImageryProvider {

    }

    export interface IGltfModel extends IEntity {
        url: string,
        scale?: number
    }
}

export { TMap }