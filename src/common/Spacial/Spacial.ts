import { AActor } from "@/libs/AActor"
import { onMounted, onUnmounted, ref } from "vue"
import { Atlas } from "./Components/Atlas/Atlas"

class Spacial extends AActor {
    public constructor() {
        super()
    }

    public atlas = new Atlas(this)

    public InitStates() {
        return {

        }
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

}

export { Spacial }