import { onMounted, onUnmounted } from "vue"
import { AActor } from "@/libs/AActor"
class Vessel extends AActor {
    public constructor() { super() }

    public InitStates() {
        return {}
    }

    public InitHooks() {

    }

    public Run() {
        onMounted(() => {

        })
        onUnmounted(() => {
            this.Destroy()
        })
    }

    protected Destroy() {

    }

    public Test() {
        Message.success("Together丨233")
    }
}

export { Vessel }