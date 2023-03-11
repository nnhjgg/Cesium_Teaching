<script lang="ts" setup>
import PreloadVue from './preload/Preload.vue';
import ExperimentVue from './experiment/Experiment.vue';
import { zhCN, dateZhCN } from 'naive-ui'
import { themeOverrides } from './naive/index'
import { App } from './App'
import { Experiment } from './experiment/Experiment'

const {
  isShow
} = Experiment.Instance.InitStates()

App.Instance.Run()
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <ExperimentVue v-if="isShow"></ExperimentVue>
        <PreloadVue></PreloadVue>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style lang="scss">
@import "./App.scss";
</style>
