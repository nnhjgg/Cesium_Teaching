import { onMounted, onUnmounted, ref } from "vue"
import { AActor } from "@/libs/AActor"
import * as TMap from '@/packages/TMap/index'
import icon from '@/assets/logo.png'
import * as TSMap from '@/packages/TSMap/index'

class Vessel extends AActor {
    public constructor() { super() }

    private dom = ref<HTMLElement | null>(null)

    private viewer!: TMap.Manager.TMapViewer

    private sviewer!: TSMap.Manager.TSMapViewer

    private video = ref<HTMLVideoElement | null>(null)

    public InitStates() {
        return {
            dom: this.dom,
            video: this.video,
        }
    }

    public InitHooks() {

    }

    public Run() {
        onMounted(() => {
            this.CreateViewer()
            this.CreateEntity()
            // this.CreateSViewer()
        })
        onUnmounted(() => {
            this.Destroy()
        })
    }

    protected Destroy() {

    }

    private CreateViewer() {
        if (this.dom.value) {
            Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMmEzNjY1My1iNTE0LTQ4MDctYjMyNy00ZGM5ZDU5MGQxZGYiLCJpZCI6Njc2OTYsImlhdCI6MTYzMTk0NjY0Mn0.RDGEPdwy5l3NuDiTWPem_b38M7fHImVZUPSui0D7Q80'
            this.viewer = new TMap.Manager.TMapViewer({
                container: this.dom.value,
                type: Cesium.SceneMode.SCENE3D,
                targetFrameRate: 60,
            })
            this.viewer.V.scene.globe.terrainProvider = Cesium.createWorldTerrain()
        }
    }

    private CreateEntity() {
        this.viewer.ToTargetPosition({ lng: 117.170, lat: 31.840, height: 1600 })

        const point = new TMap.Core.Point({
            map: this.viewer,
            position: this.viewer.GetC3FromLngLat(117.170, 31.840, 500),
            scale: 0.2,
            icon: icon
        })

        const cp = new TMap.Core.ClippingPlane({
            map: this.viewer,
            polyline: [
                this.viewer.GetC3FromLngLat(117.170, 31.840, 500),
                this.viewer.GetC3FromLngLat(117.172, 31.840, 500),
                this.viewer.GetC3FromLngLat(117.172, 31.842, 500),
                this.viewer.GetC3FromLngLat(117.170, 31.842, 500),
            ],
        })

        // const line = new TMap.Core.Line({
        //     map: this.viewer,
        //     totalDragable: true,
        //     polyline: [this.viewer.GetC3FromLngLat(117.223, 31.822, 100), this.viewer.GetC3FromLngLat(117.224, 31.823, 100), this.viewer.GetC3FromLngLat(117.224, 31.824, 100)]
        // })

        // const rect = new TMap.Core.Rect({
        //     map: this.viewer,
        //     totalDragable: true,
        //     polyline: [this.viewer.GetC3FromLngLat(117.226, 31.822, 100), this.viewer.GetC3FromLngLat(117.227, 31.823, 100), this.viewer.GetC3FromLngLat(117.227, 31.824, 100)]
        // })

        // const text = new TMap.Core.Text({
        //     map: this.viewer,
        //     label: "Together",
        //     position: this.viewer.GetC3FromLngLat(117.223, 31.826, 100)
        // })

        // const ps = new TMap.Core.ParticleSystem({
        //     map: this.viewer,
        //     position: this.viewer.GetC3FromLngLat(117.221, 31.826, 100)
        // })

        // const sector = new TMap.Core.Sector({
        //     map: this.viewer,
        //     offset: 10,
        //     angle: 60,
        //     radius: 500,
        //     position: this.viewer.GetC3FromLngLat(117.221, 31.826, 100)
        // })

        // const gm = new TMap.Core.GltfModel({
        //     map: this.viewer,
        //     url: '/Resource/Kq/kq.glb',
        //     position: this.viewer.GetC3FromLngLat(117.219, 31.828, 100),
        //     scale: 200
        // })

        // const vl = new TMap.Core.VideoLayer({
        //     map: this.viewer,
        //     position: this.viewer.GetC3FromLngLat(117.215, 31.823, 500),
        //     video: this.video.value as HTMLVideoElement
        // })

        // const tp = new TMap.Core.TourPath({
        //     map: this.viewer,
        //     turnExtend: 50,
        //     turnPadding: 50,
        //     rotate: 70,
        //     position: this.viewer.GetC3FromLngLat(117.225, 31.822, 100),
        //     polyline: [this.viewer.GetC3FromLngLat(117.221, 31.820, 100), this.viewer.GetC3FromLngLat(117.224, 31.817, 100), this.viewer.GetC3FromLngLat(117.229, 31.820, 100), this.viewer.GetC3FromLngLat(117.227, 31.821, 100)]
        // })
    }

    private CreateSViewer() {
        if (this.dom.value) {
            this.sviewer = new TSMap.Manager.TSMapViewer({
                container: this.dom.value,
                type: Cesium.SceneMode.SCENE3D,
            })
        }
    }
}

export { Vessel }