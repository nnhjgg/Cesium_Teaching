<script lang="ts" setup>
import { provide } from 'vue';
import { Vessel } from './Vessel';

const instance = new Vessel()
provide('instance', instance)
const {
    dom,
    video,
} = instance.InitStates()
instance.InitHooks()
instance.Run()
</script>

<template>
    <div class="Vessel">
        <span class="Map" ref="dom"></span>
        <!-- <video class="Video" ref="video" muted autoplay loop crossorigin="" controls src="/Resource/Ma.mp4">
        </video> -->
    </div>
</template>

<style lang="scss" scoped>
@import "./Vessel.scss";
</style>
