<template>
	<router-view />
	<cool />
</template>

<script setup lang="ts">
import Cool from '/@/cool/index.vue';
</script>

<style>
html, body, #app {
  height: 100% !important;
  min-height: 100% !important;
  overflow-y: auto !important;
}
</style>
