<template lang="pug">
.layout-container(:class="{'nav-isCollapse': isCollapse}")
  .layout-nav
    .logo-box
      img(src="@/assets/homecont.png")
    .nav-box
      el-menu(
        :default-active="pageTabActive" 
        class="el-menu-vertical-demo"
        background-color="#263238"
        text-color="#fff"
        active-text-color="#ffd04b"
        :collapse="isCollapse")
        el-menu-item(@click="gotoHome" index="-1")
          template(#title)
            i(class="el-icon-location")
            span 首页
        el-submenu(v-for="item in navList" :key="item.menuId" :index="item.menuId + ''")
          template(#title)
            i(class="el-icon-location")
            span {{item.name}}
          el-menu-item(v-for="item2 in item.list" :key="item2.menuId" :index="item2.menuId + ''" @click="gotoPage(item2)") {{item2.name}}
  .layout-main
    .head-box
      .head-nav-control(@click="navCollapse")
        i(class="el-icon-s-fold")
      .head-user-control 
        el-popover(placement="bottom" trigger="hover")
          template(#reference) 
            .control-span {{cityName}}，{{username}}
          .popover-content
            .content-item 修改密码
            .content-item(@click="logout") 退出登录
    .page-box
      el-tabs(v-model="pageTabActive" closable @tab-remove="tabRemove" @tab-click="tabClick")
        el-tab-pane(v-for="item in tabsList" :key="item.menuId" :label="item.name" :name="item.menuId")
      .router-box
        router-view(v-slot="{ Component }")
          keep-alive(:include="keepAliveList")
            Component(:is="Component")
      .tab-control(v-show="tabsList.length > 0")
        el-dropdown
          .icon-box
              i(class="el-icon-arrow-down")
          template(#dropdown)
            el-dropdown-menu
              el-dropdown-item(@click="tabPageControl('close')") 关闭当前标签页
              el-dropdown-item(@click="tabPageControl('closeElse')") 关闭其他标签页
              el-dropdown-item(@click="tabPageControl('closeAll')") 关闭全部标签页
              //- el-dropdown-item(@click="tabPageControl('refresh')") 刷新当前标签页
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, onMounted, watch, toRefs } from 'vue'
import { getDataByKey } from '../../utils'
import { useStore } from 'vuex'
import { key } from '../../store'
export default defineComponent({
  name: 'layout',
  setup() {
    const { proxy }:any = getCurrentInstance();
    const store:any = useStore(key)
    const state:any = reactive({
      keepAliveList: [], // 加入缓存的页面
      pageTabActive: "-1", // 当前展示的tab页
      cityName: store.state.cityName, // 当前地区名称
      username: "", // 用户名称
      tabsList: [], // tab页列表
      navList: [], // 导航菜单列表
      isCollapse: false // 导航菜单展开收起
    })

    watch(
      () => [...state.tabsList],
      (newValues) => {
        state.keepAliveList = getDataByKey(newValues, 'urlName')
      }
    )

    onMounted(() => {
      getUserData()
      getNavData()
      getRegion()
      getDictionary()
    })
    // 获取当前用户信息
    const getUserData:any = async () => {
      // let res = await proxy.$ajaxRequest({
      //   url: "", // 请求地址
      //   method: "GET"
      // });
      // if (res && res.username) {
      //   state.username = res.username
      // }
      state.username = "kechong"
    }
    // 获取菜单列表
    const getNavData:any = async () => {
      // let res = await proxy.$ajaxRequest({
      //   url: "", // 请求地址
      //   method: "GET"
      // });
      let menuList:any = [
        {
          "menuId":317,
          "parentId":0,
          "parentName":null,
          "name":"招商管理",
          "url":"",
          "perms":null,
          "type":0,
          "icon":"dangdifill",
          "orderNum":0,
          "list":[
            {"menuId":318,"parentId":317,"parentName":null,"name":"地块管理", "url":"investment/land","perms":null,"type":1,"icon":"daohang","orderNum":2,"list":null},
            {"menuId":322,"parentId":317,"parentName":null,"name":"产业管理","url":"api/industry/index","perms":null,"type":1,"icon":"mudedi","orderNum":6,"list":null}
          ]
        },
        {
          "menuId":1,
          "parentId":0,
          "parentName":null,
          "name":"系统管理",
          "url":"",
          "perms":null,
          "type":0,
          "icon":"system",
          "orderNum":3,
          "list":[
            {"menuId":3,"parentId":1,"parentName":null,"name":"角色管理","url":"sys/role","perms":null,"type":1,"icon":"role","orderNum":2,"list":null},
            {"menuId":4,"parentId":1,"parentName":null,"name":"菜单管理","url":"sys/menu","perms":null,"type":1,"icon":"menu","orderNum":3,"list":null}
          ]
        }
      ]
      if (menuList && menuList.length > 0) {
        state.pageTabActive = sessionStorage.getItem('pageTabActive')
        let openPage:any = null
        state.navList = menuList.map((item:any) => {
          item.list.forEach((childItem:any) => {
            let name = childItem.url.replace(/\//g, "-")
            const modules = import.meta.glob('../../views/**/*.vue')
            childItem.urlName = name
            childItem.menuId = childItem.menuId + ""
            let modulesKey = modules[`../../views/${childItem.url}/index.vue`]
            if (childItem.url.indexOf("api/") > -1) {
              modulesKey = modules[`../../views/${childItem.url}.vue`]
            }
            if (modulesKey) {
              // 添加路由
              proxy.$router.addRoute('layout', {
                path: `/${name}`,
                name: name,
                meta: {
                  title: childItem.name,
                  keepAlive: true
                },
                component: modulesKey
              })
            }
            if (childItem.menuId == state.pageTabActive) {
              openPage = childItem
            }
          })
          return item
        })
        if (openPage) {
          state.tabsList = [openPage]
          proxy.$router.push(openPage.urlName)
        }
      }
    }

    // 获取区域
    const getRegion:any = async () => {
      // let res = await proxy.$ajaxRequest({
      //   url: "", // 请求地址
      //   method: "GET"
      // });
      // if (res && res.length > 0) {
      //   store.commit('regionListFun', JSON.stringify(res))
      // } else {
      //   store.commit('regionListFun', "[]")
      // }
      let regionList:any = [
        {areaId: 4301, areaName: "长沙", contactpeople: "长沙市商务局", contactphone: "0755-88888888", level: 1, contourPoints: "", longitudeLatitude: "112.97670239,28.19749421"},
        {areaId: 430102, areaName: "芙蓉区", contactpeople: "长沙市商务局", contactphone: "0755-88888888", level: 2, contourPoints: "", longitudeLatitude: "113.02249638,28.20949306"},
        {areaId: 430103, areaName: "天心区", contactpeople: "长沙市商务局", contactphone: "0755-88888888", level: 2, contourPoints: "", longitudeLatitude: "112.94752575,28.09580520"}
      ]
      store.commit('regionListFun', JSON.stringify(regionList))
    }

    // 获取数据字典
    const getDictionary:any = async () => {
      // let res = await proxy.$ajaxRequest({
      //   url: "", // 请求地址
      //   method: "GET"
      // });
      // if (res && res.obj && res.obj.length > 0) {
      //   store.commit('dictionaryListFun', JSON.stringify(res.obj))
      // } else {
      //   store.commit('dictionaryListFun', "[]")
      // }
      store.commit('dictionaryListFun', "[]")
    }

    // 导航展开收起
    const navCollapse:any = () => {
      state.isCollapse = !state.isCollapse
    }
    // 点击首页
    const gotoHome:any = () => {
      state.pageTabActive = "-1"
      state.tabsList = []
      proxy.$router.push("home")
      sessionStorage.setItem('pageTabActive', state.pageTabActive)
    }
    // 导航菜单切换
    const gotoPage:any = (res: any) => {
      proxy.$router.push(res.urlName)
      let attr = state.tabsList.find((item:any) => { return item.menuId == res.menuId })
      if (!attr) {
        state.tabsList.splice(state.tabsList.length, 0, res)
      }
      state.pageTabActive = res.menuId
      sessionStorage.setItem('pageTabActive', state.pageTabActive)
    }
    // tabs切换
    const tabClick:any = (res: any) => {
      let attr = state.tabsList.find((item:any) => { return item.menuId == res.props.name })
      if (attr && attr.urlName) {
        proxy.$router.push(attr.urlName)
      }
    }
    // 移除tab
    const tabRemove:any = (res: any) => {
      let attr = state.tabsList.findIndex((item:any) => { return item.menuId == res })
      if (attr > -1) {
        state.tabsList.splice(attr, 1)
        if (state.tabsList.length < 1) {
          gotoHome()
        } else  if (state.pageTabActive == res && attr > 0) {
          state.pageTabActive = state.tabsList[attr - 1].menuId
          proxy.$router.push(state.tabsList[attr - 1].urlName)
        } else if (state.pageTabActive == res){
          state.pageTabActive = state.tabsList[0].menuId
          proxy.$router.push(state.tabsList[0].urlName)
        }
      }
      sessionStorage.setItem('pageTabActive', state.pageTabActive)
    }
    // tab页操作
    const tabPageControl:any = (res: any) => {
      if (res === "close") {
        tabRemove(state.pageTabActive)
      } else if (res === "closeElse") {
        let attr = state.tabsList.find((item:any) => { return item.menuId == state.pageTabActive })
        if (attr) {
          state.pageTabActive = attr.menuId
          state.tabsList = [attr]
        }
      } else if (res === "closeAll") {
        gotoHome()
      } else if (res === "refresh") {
        let attr = state.tabsList.findIndex((item:any) => { return item.menuId == state.pageTabActive })
        let attr2 = state.tabsList.find((item:any) => { return item.menuId == state.pageTabActive })
        if (attr > -1) {
          state.tabsList.splice(attr, 1)
          proxy.$nextTick(() => {
            state.tabsList.push(attr2)
            proxy.$router.push(attr2.urlName)
            state.pageTabActive = attr2.menuId
          })
        }
      }
      sessionStorage.setItem('pageTabActive', state.pageTabActive)
    }
    // 退出登录
    const logout:any = () => {
      proxy.$confirm('确定退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
          // await proxy.$ajaxRequest({
          //   url: "", // 请求地址
          //   method: "post"
          // });
          sessionStorage.clear();
          proxy.$router.replace('login')
      }).catch(() => {});
    }
    
    return {
      ...toRefs(state),
      navCollapse,
      logout,
      gotoHome,
      gotoPage,
      tabRemove,
      tabClick,
      tabPageControl
    }
  }
})
</script>
<style lang="stylus">
  @import './index.styl'
</style>