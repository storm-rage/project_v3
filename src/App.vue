<template lang="pug">
router-view
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'App'
})
</script>
<style lang="stylus">
  #app
    position fixed
    top 0px
    bottom 0px
    left 0px
    right 0px
    overflow hidden
  .el-table 
    .el-table__header
      th
        color #000000
    td,th
      text-align center !important
    .table-ellipsis
      width 100%
      display inline-block
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
  .map-servce-dialog
    width 70% !important
    min-width 1000px !important
    height 800px !important
  .region-tree
    min-height 200px
    max-height 300px
    overflow auto
    padding 20px
</style>
