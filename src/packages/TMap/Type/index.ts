import { Actor } from "../Core/Actor"
import { TMapViewer } from "../Manager/TMapViewer"

namespace TMap {
    export interface ITMapViewerConstructor {
        /**
         * 容器
         */
        container: HTMLElement,
        /**
         * 地形地址
         */
        terrainUrl?: string,
        /**
         * 是否在线
         */
        online?: boolean,
        /**
         * 地图类型
         */
        type: Cesium.SceneMode.SCENE2D | Cesium.SceneMode.SCENE3D,
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

    export enum PickType {
        None,
        Entity,
        Primitive,
    }

    export interface ITMapImageryProvider {
        url: string,
        crs: Coordinate
    }

    export interface IActor {
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
        parent?: Actor,
        /**
         * 默认位置
         */
        position?: Cesium.Cartesian3
    }

    export interface IPoint extends IActor {
        icon: string,
        scale?: number
    }

    export interface ILine extends IActor {
        polyline: Array<Cesium.Cartesian3>
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

    export interface IText extends IActor {
        label?: string,
        color?: string,
        fillColor?: string
    }

    export interface IParticleSystem extends IActor {
        texture?: string
    }

    export interface IFlatModel extends IActor {
        url: string,
        bounds: [number, number, number, number],
        zoom?: boolean
    }

    export interface ISpatialModel extends IActor {
        url: string,
        definition?: number,
        zoom?: boolean
    }

    export interface ISector extends IActor {
        radius?: number,
        offset?: number,
        angle?: number
        color?: string,
        fillColor?: string,
        width?: number
    }

    type ImageryProvider = IActor & ITMapImageryProvider

    export interface IImageryProvider extends ImageryProvider {

    }

    export interface IGltfModel extends IActor {
        url: string,
        scale?: number
    }

    export interface IVideoLayer extends IActor {
        video: HTMLVideoElement,
        size?: Cesium.Cartesian2,
        normal?: Cesium.Cartesian3
    }

    export enum StartDirection {
        Left,
        Right
    }

    export interface ITourPath extends IActor {
        startDirection: StartDirection,
        boundPadding?: number,
        width?: number,
        wayWidth?: number,
        wayColor?: string,
        color?: string,
        pointScale?: number,
        polyline: Array<Cesium.Cartesian3>,
        turnExtend?: number,
        turnPadding?: number,
    }
}

export { TMap }