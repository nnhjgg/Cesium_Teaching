import { onMounted, onUnmounted, ref } from "vue"
import { AActor } from "@/libs/AActor"
import * as TMap from '@/packages/TMap/index'

class Vessel extends AActor {
    public constructor() { super() }

    private dom = ref<HTMLElement | null>(null)

    private viewer!: TMap.TMapViewer

    public InitStates() {
        return {
            dom: this.dom,
        }
    }

    public InitHooks() {

    }

    public Run() {
        onMounted(() => {
            this.CreateViewer()
            this.CreateEntity()
        })
        onUnmounted(() => {
            this.Destroy()
        })
    }

    protected Destroy() {

    }

    private CreateViewer() {
        if (this.dom.value) {
            this.viewer = new TMap.TMapViewer({ container: this.dom.value, type: Cesium.SceneMode.SCENE3D })
        }
    }

    private CreateEntity() {
        this.viewer.ToTargetPosition({ lng: 117.223, lat: 31.823, height: 1600 })

        const point = new TMap.Point({
            map: this.viewer,
            position: this.viewer.GetC3FromLngLat(117.223, 31.823, 100)
        })

        const line = new TMap.Line({
            map: this.viewer,
            totalDragable: true,
            polyline: [this.viewer.GetC3FromLngLat(117.223, 31.822, 100), this.viewer.GetC3FromLngLat(117.224, 31.823, 100), this.viewer.GetC3FromLngLat(117.224, 31.824, 100)]
        })

        const rect = new TMap.Rect({
            map: this.viewer,
            totalDragable: true,
            polyline: [this.viewer.GetC3FromLngLat(117.226, 31.822, 100), this.viewer.GetC3FromLngLat(117.227, 31.823, 100), this.viewer.GetC3FromLngLat(117.227, 31.824, 100)]
        })

        const text = new TMap.Text({
            map: this.viewer,
            label: "Together",
            position: this.viewer.GetC3FromLngLat(117.223, 31.826, 100)
        })

        const ps = new TMap.ParticleSystem({
            map: this.viewer,
            position: this.viewer.GetC3FromLngLat(117.221, 31.826, 100)
        })

        const sector = new TMap.Sector({
            map: this.viewer,
            offset: 10,
            angle: 80,
            radius: 500,
            position: this.viewer.GetC3FromLngLat(117.221, 31.826, 100)
        })
    }
}

export { Vessel }