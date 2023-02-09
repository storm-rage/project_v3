<template lang="pug">
<p class="index-container">没有找到页面</p>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, onMounted } from 'vue'
export default defineComponent({
  name: '404',
  setup() {
    const { proxy }:any = getCurrentInstance();
    const state = reactive({})

    onMounted(() => {})
  }
})
</script>