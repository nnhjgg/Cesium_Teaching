<script lang="ts" setup>
import { inject } from 'vue';
import { Spacial } from '../../Spacial';

const instance = inject('instance') as Spacial

const {
    dom
} = instance.atlas.InitStates()
instance.atlas.InitHooks()
instance.atlas.Run()
</script>

<template>
    <div class="Atlas">
        <span class="CesiumDom" ref="dom"></span>
    </div>
</template>

<style lang="scss" scoped>
@import "./Atlas.scss"
</style>