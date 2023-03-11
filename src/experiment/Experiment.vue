<script lang="ts" setup>
import { Experiment } from './Experiment'
const {
    canvas,
} = Experiment.Instance.InitStates()
Experiment.Instance.InitHooks()
Experiment.Instance.Run()
</script>

<template>
    <div class="Experiment">
        <canvas class="Canvas" ref="canvas" tabindex="1"></canvas>
    </div>
</template>

<style lang="scss" scoped>
@import "./Experiment.scss";
</style>