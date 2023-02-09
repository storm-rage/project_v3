<template lang="pug">
.home-container
  .home-head
    .head-left
      div 招商管理平台
    .head-right
      div 项目信息库
  .home-main
    img(src="@/assets/homecont.png")
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'home'
})
</script>
<style lang="stylus" scoped>
.home-container
  position absolute
  top 0px
  left 0px
  right 0px
  bottom 0px
  overflow hidden
  display flex
  flex-direction column
  .home-head
    flex none
    padding 20px
    position relative
    .head-left
      padding-top 10px
      padding-left 10px
      line-height 30px
      border-left 6px solid #59b2ff
      div:first-child
        font-size 24px
        font-weight bold
        color #3da4fd
      div:last-child
        font-size 14px
        font-weight bold
        color #9ad0ff
    .head-right
      position absolute
      top calc(50% - 35px)
      right 0px
      line-height 60px
      padding 0px 60px 0px 50px
      background linear-gradient(280deg,#fff 0%, #3da4fd 100%)
      border-radius 100px 0px 0px 100px
      div
        color #fff
        font-size 20px
  .home-main
    flex 1
    img 
      position absolute
      left 0px
      bottom 0px
      width 100%
      height auto
</style>