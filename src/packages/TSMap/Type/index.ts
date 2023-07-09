import { Actor } from "../Core/Actor"
import { TSMapViewer } from "../Manager"

namespace TSMap {
    export interface ITMapViewerConstructor {
        container: HTMLElement,
        type: Cesium.SceneMode.SCENE2D | Cesium.SceneMode.SCENE3D,
    }

    export interface IActor {
        /**
         * 容器
         */
        map: TSMapViewer
        /**
         * 父元素
         */
        parent?: Actor,
        /**
         * 默认位置
         */
        position?: Cesium.Cartesian3
    }
}

export { TSMap }