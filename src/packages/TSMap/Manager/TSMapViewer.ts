import { EventSystem } from "@/libs/EventSystem";
import { TSMap } from "../Type";

class TSMapViewer extends EventSystem {
    constructor(options: TSMap.ITMapViewerConstructor) {
        super()
        this.options = options
        this.InitViewer()
    }

    private options!: TSMap.ITMapViewerConstructor

    private viewer!: Cesium.Viewer

    /**
     * 容器原始对象
     */
    public get V() {
        return this.viewer
    }

    private InitViewer() {
        this.viewer = new Cesium.Viewer(this.options.container, {
            useDefaultRenderLoop: true, // 是否让Cesium自己刷新
            geocoder: false, //右上角 搜索
            homeButton: false, //右上角 Home
            sceneModePicker: false, //右上角 2D/3D切换
            baseLayerPicker: false, //右上角 地形
            navigationHelpButton: false, //右上角 Help
            animation: false, // 左下角 圆盘动画控件
            timeline: false, //时间轴
            fullscreenButton: false, //右下角 全屏控件
            vrButton: false, // 如果设置为true，将创建VRButton小部件。
            scene3DOnly: this.options.type != Cesium.SceneMode.SCENE2D, // 每个几何实例仅以3D渲染以节省GPU内存
            infoBox: false, //隐藏点击要素后的提示信息
            shouldAnimate: true,
            // 下面为LOD配置加载 和一些选项  在加载B3DM也会有一些配置项
            selectionIndicator: false,
            navigationInstructionsInitiallyVisible: false,
            contextOptions: {
                webgl: {
                    alpha: false,
                    antialias: true,
                    preserveDrawingBuffer: true,
                    failIfMajorPerformanceCaveat: false,
                    depth: true,
                    stencil: false,
                    anialias: false
                }
            },
            sceneMode: this.options.type,
            // mapMode2D: Cesium.MapMode2D.ROTATE,
            shadows: false,
            showRenderLoopErrors: false,
            orderIndependentTranslucency: true,
            automaticallyTrackDataSourceClocks: false,
            projectionPicker: false,
            requestRenderMode: false,
        })

        this.viewer.scene.debugShowFramesPerSecond = false
        this.viewer.scene.postProcessStages.fxaa.enabled = false
        this.viewer.scene.globe.depthTestAgainstTerrain = true
    }
}

export { TSMapViewer }