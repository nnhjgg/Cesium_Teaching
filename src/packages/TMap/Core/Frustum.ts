import { toRaw } from "vue";
import { TMap } from "../Type";
import { Actor } from "./Actor";

class Frustum extends Actor {
    constructor(options: TMap.IFrustum) {
        super(options)
        this.type = "Frustum"
        this.CreateRoot()
    }

    private get O() {
        return this.options as TMap.IFrustum
    }

    public CreateRoot(): void {
        this.root = this.O.map.V.entities.add({
            name: "FrustumRoot",
        })
        //@ts-ignore
        this.root.type = 'FrustumRoot'
        //@ts-ignore
        this.root.body = this
    }

    public override Show() {
        const point = toRaw(this)
        point.show.value = true
        point.root.show = true
    }

    public override Hide() {
        const point = toRaw(this)
        point.show.value = false
        point.root.show = false
    }

    public override Destroy() {
        const point = toRaw(this)
        point.O.map.V.entities.remove(point.root)
    }

}

export { Frustum }