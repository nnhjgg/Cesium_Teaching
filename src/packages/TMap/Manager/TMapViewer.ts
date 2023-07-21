import { EventSystem } from "@/libs/EventSystem";
import { TMap } from "../Type";
import { Actor } from "../Core/Actor";
import { ImageryProvider } from "../Core/ImageryProvider";

class TMapViewer extends EventSystem {
    constructor(options: TMap.ITMapViewerConstructor) {
        super()
        this.options = options
        this.InitViewer()
        this.InitController()
        this.InitHandler()
    }

    static entityMutually = ['PointRoot', 'LineRoot', 'LinePoint', 'RectRoot', 'RectPoint', 'TextRoot', 'ParticleSystemRoot', 'SectorRoot', 'VideoLayerRoot', 'TourPathPoint']

    static primitiveMutually = ['GltfModelRoot']

    private options!: TMap.ITMapViewerConstructor

    private viewer!: Cesium.Viewer

    private handler!: Cesium.ScreenSpaceEventHandler

    private currentFocus: { type: string, actor: Actor | null, origin: Cesium.Entity | null } = {
        type: '',
        actor: null,
        origin: null,
    }

    private isDragging = false

    private isDown = false

    private draggingDelta = -1

    private currentLayer = TMap.BaseMapType.Sate

    private vectorMap: Array<ImageryProvider> = []

    private sateMap: Array<ImageryProvider> = []

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
            targetFrameRate: this.options.targetFrameRate || 60,
            orderIndependentTranslucency: true,
            automaticallyTrackDataSourceClocks: false,
            projectionPicker: false,
            requestRenderMode: false,
        })

        if (Config.mapType == 0) {
            const v1 = new ImageryProvider({
                map: this,
                url: 'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
                crs: TMap.Coordinate.Gcj02,
            })
            this.vectorMap.push(v1)

            const s1 = new ImageryProvider({
                map: this,
                url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
                crs: TMap.Coordinate.Gcj02,
            })
            const s2 = new ImageryProvider({
                map: this,
                url: 'https://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
                crs: TMap.Coordinate.Gcj02,
            })
            this.sateMap.push(s1, s2)
        }
        else {
            const v1 = new ImageryProvider({
                map: this,
                url: `${location.origin}/mapabc/overlay/{z}/{x}/{y}.png`,
                crs: TMap.Coordinate.Gcj02,
            })

            this.vectorMap.push(v1)

            const s1 = new ImageryProvider({
                map: this,
                url: `${location.origin}/mapabc/satellite/{z}/{x}/{y}.jpg`,
                crs: TMap.Coordinate.Gcj02,
            })
            const s2 = new ImageryProvider({
                map: this,
                url: `${location.origin}/mapabc/overlay/{z}/{x}/{y}.png`,
                crs: TMap.Coordinate.Gcj02,
            })
            this.sateMap.push(s1, s2)
        }

        this.SwitchBaseMapType()

        this.viewer.scene.debugShowFramesPerSecond = false
        this.viewer.scene.postProcessStages.fxaa.enabled = false
        this.viewer.scene.globe.depthTestAgainstTerrain = true
        this.viewer.scene.globe.backFaceCulling = true;
        this.viewer.scene.globe.showSkirts = false;
    }

    private InitController() {
        this.viewer.scene.screenSpaceCameraController.zoomEventTypes = [
            Cesium.CameraEventType.WHEEL,
            Cesium.CameraEventType.PINCH
        ]
        this.viewer.scene.screenSpaceCameraController.tiltEventTypes = [
            Cesium.CameraEventType.PINCH,
            Cesium.CameraEventType.RIGHT_DRAG
        ]
        this.viewer.trackedEntityChanged.addEventListener(() => {
            this.viewer.trackedEntity = undefined
        })
    }

    private InitHandler() {
        this.handler = new Cesium.ScreenSpaceEventHandler(
            this.viewer.scene.canvas
        )

        this.handler.setInputAction(
            (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
                this.OnLeftClick(e)
            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK,
        )

        this.handler.setInputAction(
            (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
                this.OnLeftDown(e)
            },
            Cesium.ScreenSpaceEventType.LEFT_DOWN
        )

        this.handler.setInputAction(
            (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
                this.OnLeftUp(e)
            },
            Cesium.ScreenSpaceEventType.LEFT_UP
        )

        this.handler.setInputAction(
            (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
                this.OnMidClick(e)
            }, Cesium.ScreenSpaceEventType.MIDDLE_CLICK
        )

        this.handler.setInputAction(
            (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
                this.OnMidDown(e)
            },
            Cesium.ScreenSpaceEventType.RIGHT_DOWN
        )

        this.handler.setInputAction(
            (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
                this.OnMidUp(e)
            },
            Cesium.ScreenSpaceEventType.RIGHT_UP
        )

        this.handler.setInputAction(
            (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
                this.OnRightClick(e)
            },
            Cesium.ScreenSpaceEventType.RIGHT_CLICK
        )

        this.handler.setInputAction(
            (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
                this.OnRightDown(e)
            },
            Cesium.ScreenSpaceEventType.RIGHT_DOWN
        )

        this.handler.setInputAction(
            (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
                this.OnRightUp(e)
            },
            Cesium.ScreenSpaceEventType.RIGHT_UP
        )

        this.handler.setInputAction(
            (e: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
                this.OnMovePre(e)
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE,
        )

        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }

    /**
     * 获取经纬度 ( 输入c3 )
     */
    public GetLngLatFromC3(c3: Cesium.Cartesian3) {
        let cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(c3)
        let R = Cesium.Math.toDegrees(cartographic.longitude)
        let Q = Cesium.Math.toDegrees(cartographic.latitude)
        return { R, Q, H: cartographic.height }
    }

    /**
     * 获取c3 ( 输入经纬度 )
     */
    public GetC3FromLngLat(lng: number, lat: number, height?: number) {
        return Cesium.Cartesian3.fromDegrees(lng, lat, height)
    }

    public ToTargetPosition(position: { lng: number, lat: number, height?: number }, onComplete: Function = () => { }) {
        let result = Cesium.Cartesian3.fromDegrees(position.lng, position.lat, position.height)
        this.viewer.scene.camera.flyTo({
            destination: result, duration: 0, complete: () => {
                onComplete()
            }
        })
    }

    /**
     * 根据屏幕坐标获取捕获信息
     */
    public GetPositionPick(wp: Cesium.Cartesian2) {
        try {
            let pick = this.viewer.scene.pick(wp)
            let c3 = this.GetC3FromWindowPosition(wp)
            let ll = this.GetLngLatFromC3(c3)
            if (pick) {
                if (pick.id && pick.id.type) {
                    return { type: TMap.PickType.Entity, target: { entity: pick.id, primitive: null }, c3, ll }
                }
                else if (pick.primitive && pick.primitive.type) {
                    return { type: TMap.PickType.Primitive, target: { entity: null, primitive: pick.primitive }, c3, ll }
                }
            }
            else {
                return { type: TMap.PickType.None, target: { entity: null, primitive: null }, c3, ll }
            }
        } catch (error) {
            return { type: TMap.PickType.None, target: { entity: null, primitive: null }, c3: Cesium.Cartesian3.ZERO, ll: { R: 0, Q: 0, H: 0 } }
        }

    }

    /**
     * 根据世界坐标得到屏幕坐标
     */
    public GetWindowPositionFromC3(scene: Cesium.Scene, c3: Cesium.Cartesian3) {
        return Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, c3);
    }

    /**
     * 根据屏幕坐标得到世界坐标
     */
    public GetC3FromWindowPosition(wp: Cesium.Cartesian2) {
        return this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(wp) as Cesium.Ray, this.viewer.scene) as Cesium.Cartesian3
    }

    /**
     * 禁止地图移动
     */
    public DisableMapMove() {
        this.viewer.scene.screenSpaceCameraController.enableTranslate = false
        this.viewer.scene.screenSpaceCameraController.enableRotate = false
        this.viewer.scene.screenSpaceCameraController.enableZoom = false
        this.viewer.scene.screenSpaceCameraController.enableTilt = false
        this.viewer.scene.screenSpaceCameraController.enableLook = false
    }

    /**
     * 开启地图移动
     */
    public EnableMapMove() {
        this.viewer.scene.screenSpaceCameraController.enableTranslate = true
        this.viewer.scene.screenSpaceCameraController.enableRotate = true
        this.viewer.scene.screenSpaceCameraController.enableZoom = true
        this.viewer.scene.screenSpaceCameraController.enableTilt = true
        this.viewer.scene.screenSpaceCameraController.enableLook = true
    }

    /**
     * 切换地图底图
     */
    public SwitchBaseMapType() {
        if (this.currentLayer == TMap.BaseMapType.Vector) {
            this.currentLayer = TMap.BaseMapType.Sate
            for (let v of this.vectorMap) {
                v.Hide()
            }
            for (let s of this.sateMap) {
                s.Show()
            }
        }
        else if (this.currentLayer == TMap.BaseMapType.Sate) {
            this.currentLayer = TMap.BaseMapType.Vector
            for (let v of this.vectorMap) {
                v.Show()
            }
            for (let s of this.sateMap) {
                s.Hide()
            }
        }
    }

    public ZoomIn() {
        this.V.camera.zoomIn(100)
    }

    public ZoomOut() {
        this.V.camera.zoomOut(100)
    }

    private OnLeftClick(e: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
        const p = this.GetPositionPick(e.position)
        if (p) {
            if (p.type == TMap.PickType.Entity) {
                Debug.Log(p.target.entity.body)
                if (TMapViewer.entityMutually.indexOf(p.target.entity.type) != -1 && p.target.entity.body.sign == 'Core') {
                    this.currentFocus.type = p.target.entity.type
                    this.currentFocus.actor = p.target.entity.body
                    this.currentFocus.origin = p.target.entity
                    const actor = p.target.entity.body as Actor
                    actor.OnClick(p.c3, p.target.entity.id || '', p.target.entity.type)
                }
            }
            else if (p.type == TMap.PickType.Primitive) {
                if (TMapViewer.primitiveMutually.indexOf(p.target.primitive.type) != -1 && p.target.primitive.body.sign == 'Core') {
                    this.currentFocus.type = p.target.primitive.type
                    this.currentFocus.actor = p.target.primitive.body
                    this.currentFocus.origin = p.target.primitive
                    const actor = p.target.primitive.body as Actor
                    actor.OnClick(p.c3, '', p.target.primitive.type)
                }
            }
        }
        this.currentFocus.type = ''
        this.currentFocus.actor = null
        this.currentFocus.origin = null
        this.options.OnLeftClick && this.options.OnLeftClick(e)
    }

    private OnMidClick(e: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
        this.options.OnMidClick && this.options.OnMidClick(e)
    }

    private OnMidDown(e: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
        this.options.OnMidDown && this.options.OnMidDown(e)
    }

    private OnMidUp(e: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
        this.options.OnMidUp && this.options.OnMidUp(e)
    }

    private OnLeftDown(e: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
        this.isDown = true
        const p = this.GetPositionPick(e.position)
        if (p) {
            if (p.type == TMap.PickType.Entity) {
                if (TMapViewer.entityMutually.indexOf(p.target.entity.type) != -1 && p.target.entity.body.sign == 'Core') {
                    this.currentFocus.type = p.target.entity.type
                    this.currentFocus.actor = p.target.entity.body
                    this.currentFocus.origin = p.target.entity
                    this.DisableMapMove()
                    const actor = p.target.entity.body as Actor
                    actor.OnMouseDown(p.c3, p.target.entity.id || '', p.target.entity.type)
                }
            }
            else if (p.type == TMap.PickType.Primitive) {
                if (TMapViewer.primitiveMutually.indexOf(p.target.primitive.type) != -1 && p.target.primitive.body.sign == 'Core') {
                    this.currentFocus.type = p.target.primitive.type
                    this.currentFocus.actor = p.target.primitive.body
                    this.currentFocus.origin = p.target.primitive
                    this.DisableMapMove()
                    const actor = p.target.primitive.body as Actor
                    actor.OnMouseDown(p.c3, p.target.primitive.id || '', p.target.primitive.type)
                }
            }
        }
        this.options.OnLeftDown && this.options.OnLeftDown(e)
    }

    private OnLeftUp(e: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
        this.isDown = false
        if (this.currentFocus.type && this.currentFocus.actor && this.currentFocus.origin) {
            if (TMapViewer.entityMutually.indexOf(this.currentFocus.type) != -1 || TMapViewer.primitiveMutually.indexOf(this.currentFocus.type) != -1) {
                const actor = this.currentFocus.actor as Actor
                actor.OnMouseUp(this.GetC3FromWindowPosition(e.position), this.currentFocus.origin.id || '', this.currentFocus.type)
                if (this.isDragging) {
                    actor.OnDraggingEnd(this.GetC3FromWindowPosition(e.position), this.currentFocus.origin.id || '', this.currentFocus.type)
                }
            }
        }
        this.currentFocus.type = ''
        this.currentFocus.actor = null
        this.currentFocus.origin = null
        this.isDragging = false
        this.EnableMapMove()
        this.options.OnLeftUp && this.options.OnLeftUp(e)
    }

    private OnRightClick(e: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
        this.options.OnRightClick && this.options.OnRightClick(e)
    }

    private OnRightDown(e: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
        this.options.OnRightDown && this.options.OnRightDown(e)
    }

    private OnRightUp(e: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
        this.options.OnRightUp && this.options.OnRightUp(e)
    }

    private OnMovePre(e: Cesium.ScreenSpaceEventHandler.MotionEvent) {
        if (this.isDown) {
            if (this.draggingDelta < 0) {
                this.OnMove(e)
            }
            this.draggingDelta++
            if (this.draggingDelta > (this.options.draggingThreshold || 5)) {
                this.draggingDelta = -1
            }
        }
    }

    private OnMove(e: Cesium.ScreenSpaceEventHandler.MotionEvent) {
        if (this.currentFocus.type && this.currentFocus.actor && this.currentFocus.origin) {
            if (TMapViewer.entityMutually.indexOf(this.currentFocus.type) != -1 || TMapViewer.primitiveMutually.indexOf(this.currentFocus.type) != -1) {
                const actor = this.currentFocus.actor as Actor
                if (!this.isDragging) {
                    actor.OnDraggingStart(this.GetC3FromWindowPosition(e.endPosition), this.currentFocus.origin.id || '', this.currentFocus.type)
                    this.isDragging = true
                }
                else {
                    actor.OnDragging(this.GetC3FromWindowPosition(e.endPosition), this.currentFocus.origin.id || '', this.currentFocus.type)
                }
            }
        }
        this.options.OnMove && this.options.OnMove(e)
    }

}

export { TMapViewer }