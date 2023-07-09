import { ref, toRaw } from "vue";
import { TSMap } from "../Type";
import { Time } from "@/libs/Time";

abstract class Actor {
    constructor(options: TSMap.IActor) {
        this.options = options
        this.type = "Actor"
    }

    public type!: string

    public root!: Cesium.Entity

    public options!: TSMap.IActor

    public show = ref<boolean>(true)

    /**
     * 自身唯一id
     */
    public id = Time.GenerateRandomUid()

    /**
     * 用来确保父子关系
     */
    public get uid(): string {
        if (this.options.parent) {
            return this.options.parent.uid
        }
        else {
            return this.id
        }
    }

    /**
     * 生成函数默认调用
     */
    public abstract CreateRoot(): void

    public abstract Show(): void

    public abstract Hide(): void

    public abstract Destroy(): void

}

export { Actor }