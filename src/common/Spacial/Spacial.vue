<script lang="ts" setup>
import { provide } from 'vue';
import { Spacial } from './Spacial';
import AtlasVue from './Components/Atlas/Atlas.vue';

const instance = new Spacial()
provide('instance', instance)
const {

} = instance.InitStates()
instance.InitHooks()
instance.Run()
</script>

<template>
    <div class="Spacial">
        <AtlasVue></AtlasVue>
    </div>
</template>

<style lang="scss" scoped>
@import "./Spacial.scss"
</style>