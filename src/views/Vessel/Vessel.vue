<script lang="ts" setup>
// console.log(import.meta.env.VITE_APP_NAME)
import { provide } from 'vue';
import { Vessel } from './Vessel';
import SpacialVue from '@/common/Spacial/Spacial.vue';

const instance = new Vessel()
provide('instance', instance)
const { } = instance.InitStates()
instance.InitHooks()
instance.Run()
</script>

<template>
    <div class="Vessel">
        <SpacialVue></SpacialVue>
    </div>
</template>

<style lang="scss" scoped>
@import "./Vessel.scss";
</style>
