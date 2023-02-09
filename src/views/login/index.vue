<template lang="pug">
.lgoin-container
  .login-box(@keyup.enter="login")
    .box-item
      el-select(v-model="selectVal" placeholder="请选择"  @change="cityChange")
        el-option(v-for="item in cityList" :key="item.dbCity" :label="item.connectName"  :value="item.dbCity")
    .box-item
      el-input(v-model="userName" placeholder="帐号" clearable)
    .box-item
      el-input(v-model="password" type="password" placeholder="密码" clearable)
    .box-item
      el-input(v-model="captcha" placeholder="验证码" clearable)
      img(class="captcha-img" :src="captchaPath" @click="getCaptcha")
    .box-item
      el-button(type="primary" @click="login") 登录
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, onMounted, toRefs } from 'vue'
import { useStore } from 'vuex'
import { key } from '../../store'
import { ElMessage } from 'element-plus'
export default defineComponent({
  name: 'layout',
  setup() {
    const { proxy }:any = getCurrentInstance();
    const store:any = useStore(key)
    const state:any = reactive({
      uid: "",
      selectVal: "", // 地区
      userName: "", // 账号
      password: "", // 密码
      captcha: "", // 验证码
      captchaPath: "", // 验证码图片
      cityName: "",
      cityList: [] // 地区列表
    })
    onMounted(() => {
      testHttp()
      getCaptcha()
    })
    // 选择器切换
    const cityChange:any = (data:any) => {
      let attr = state.cityList.find((item: any) => { return item.dbCity === data })
      if (attr) {
        state.cityName = attr['connectName']
      } else {
        state.cityName = ""
      }
    }
    // 获取地区列表
    const testHttp:any = async () => {
      state.cityList = [
        {connectName: '长沙', dbCity: 'wuhan'}
      ]
    }
    // 获取验证码
    const getCaptcha:any = () => {
      state.uid = ""
      state.captchaPath = ``
    }
    // 登录
    const login:any = async () => {
      store.commit('userTokenFun', 'bearer')
      store.commit('cityKeyFun', state.selectVal)
      store.commit('cityNameFun', "长沙")
      proxy.$router.replace('home')
    }
    
    return {
      ...toRefs(state),
      getCaptcha,
      login,
      cityChange
    }
  }
})
</script>
<style lang="stylus">
  @import './index.styl'
</style>