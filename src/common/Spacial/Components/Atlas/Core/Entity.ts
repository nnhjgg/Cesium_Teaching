import { Time } from "@/libs/Time";
import { Atlas } from "../Atlas";

abstract class Entity {
    public constructor(atlas: Atlas, parent: Entity | null = null) {
        this.atlas = atlas
        this.parent = parent
    }

    public atlas!: Atlas

    public parent: Entity | null = null

    private uuid = Time.GenerateRandomUid()

    public get UID(): string {
        if (this.parent) {
            return this.parent.UID
        }
        else {
            return this.uuid
        }
    }

    public abstract Create(...args: any[]): void

    public abstract Destroy(...args: any[]): void

    public abstract Update(...args: any[]): void
}

export { Entity }