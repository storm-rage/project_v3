<template lang="pug">
.map-servce-container
  .map-search-box
    el-radio-group(v-model="mapType" @change="mapTypeChange" v-if="false")
      el-radio-button(label="腾讯")
      el-radio-button(label="高德")
      el-radio-button(label="天地图")
    el-input(v-model="logOrLatVal" readonly placeholder="请在地图上拾取经纬度")
    el-input(v-model="placeNameVal" clearable placeholder="输入地点名称搜索" @keyup.enter="placeSearch")
    el-button(type="primary" @click="placeSearch") 搜索
  .map-main-box
    .map-box(id="qmap-container" v-show="mapType === '腾讯'")
    .map-box(id="amap-container" v-show="mapType === '高德'")
    .map-box(id="tmap-container" v-show="mapType === '天地图'")
    .place-box(v-if="placeList.length > 0")
      .place-title 根据关键字搜索地址：
      .place-main
        .place-item(:class="{'item-active': placeActive == item.id}" v-for="(item, index) in placeList" :key="item.id" @click="placeClick(item)")
          .item-index {{index + 1}}、
          .item-content {{item.name}} - {{item.address}}
  .map-btn-box
    el-button(@click="closePosit") 取消
    el-button(type="primary" @click="confirmPosit") 确定
</template>
<script lang="ts">
declare const qq: any;
declare const T: any;
declare const AMap: any;
import { defineComponent, getCurrentInstance, reactive, onMounted, ref, toRefs } from 'vue'
export default defineComponent({
  name: 'mapServce',
  props: ['lonLatPosit', 'contourPoints'],
  setup(props) {
    const { proxy }:any = getCurrentInstance();
    const regionList = JSON.parse(sessionStorage.getItem('regionList') || '[]')
    const targetRegion = regionList.find((item: any) => { return item.level === 1 })
    const state:any = reactive({
      QmapObj: null, // 腾讯地图对象
      AmapObj: null, // 高德地图对象
      TmapObj: null, // 天地图对象
      mapType: "腾讯",
      QMapMarker: null, // 腾讯地图点对象
      AMapMarker: null, // 高德地图点对象
      TMapMarker: null, // 天地图点对象
      logOrLatVal: "116.397128, 39.916527", // 当前选择点的经纬度
      placeNameVal: "", // 当前搜索的地址
      placeList: [], // 地址搜索结果
      placeActive: "", // 选择的搜索结果
      posit: [116.397128, 39.916527], // 地图中心点
      regionPosit: targetRegion ? targetRegion.longitudeLatitude.split(',') : [116.397128, 39.916527]
    })

    onMounted(() => {
      if (props.lonLatPosit && typeof props.lonLatPosit === "string" && props.lonLatPosit.indexOf(',') > -1) {
        state.posit = proxy.$gcoord.transform(props.lonLatPosit.split(","), proxy.$gcoord.WGS84, proxy.$gcoord.GCJ02);
      } else {
        let location = JSON.parse(sessionStorage.getItem('regionList') || '[]')
        let attr = location.find((item: any) => { return item.level === 1 })
        if (attr && attr.longitudeLatitude) {
          state.posit = proxy.$gcoord.transform(attr.longitudeLatitude.split(','), proxy.$gcoord.WGS84, proxy.$gcoord.GCJ02);
        }
      }
      state.logOrLatVal = state.posit.join(",")
      // QMapInit() // 腾讯地图
      // AMapInit() // 高德地图
      // TMapInit() // 天地图
    })
    
    // 地图切换
    const mapTypeChange:any = () => {
      state.placeList = []
      state.placeActive = ""
      if (state.mapType === "高德") {
        if (!state.AmapObj) {
          AMapInit()
        }
      } else if (state.mapType === "腾讯") {
        if (!state.QmapObj) {
          QMapInit()
        }
      }
    }

    // 腾讯地图初始化
    const QMapInit:any = () => {
      // 初始化地图
      state.QmapObj = new qq.maps.Map("qmap-container", {
          center: new qq.maps.LatLng(state.posit[1], state.posit[0]),
          zoom: 13,
          disableDefaultUI: true
      });
      // 初始化坐标
      state.QMapMarker = new qq.maps.Marker({
        position: new qq.maps.LatLng(state.posit[1], state.posit[0]), 
        map: state.QmapObj
      });

      if (props.contourPoints && props.contourPoints.indexOf('[') > -1) {
        let attr:any = JSON.parse(props.contourPoints)
        let latlngBounds:any = new qq.maps.LatLngBounds();
        attr.forEach((item:any) => {
          let latList:any = []
          item.map((item:any) => {
            let posit = proxy.$gcoord.transform([ item.logi, item.lati ], proxy.$gcoord.WGS84, proxy.$gcoord.GCJ02);
            latList.push(new T.LngLat(posit[0], posit[1]))

            latlngBounds.extend(new T.LngLat(posit[0], posit[1]));  
          })
          new qq.maps.Polygon({
            path: latList,
            strokeColor: '#ff0000',
            strokeWeight: 4,
            fillColor: new qq.maps.Color(0, 0, 0, 0),
            map: state.QmapObj
          });
        })
        proxy.$nextTick(() => {
          state.QmapObj.fitBounds(latlngBounds);
        })
      }

      // 添加鼠标点击事件
      qq.maps.event.addListener(state.QmapObj, 'click', function(event:any) {
        state.logOrLatVal = `${event.latLng.lng},${event.latLng.lat}`
        state.QMapMarker.setPosition(event.latLng); 
      }) 
    }

    // 高德地图初始化
    const AMapInit:any = () => {
      state.AmapObj = new AMap.Map('amap-container', {
        zoom: 13,//级别
        center: state.posit //中心点坐标
      });

      // 初始化坐标
      state.AMapMarker = new AMap.Marker({
        position: state.posit,
      });
      state.AmapObj.add(state.AMapMarker);
      // state.AMapMarker.setMap(state.AmapObj);

      // 添加鼠标点击事件
      state.AmapObj.on('click', (event:any) => {
        state.logOrLatVal = `${event.lnglat.lng},${event.lnglat.lat}`
        state.AMapMarker.setPosition([event.lnglat.lng, event.lnglat.lat]);
      })
    }

    // 天地图初始化
    const TMapInit:any = () => {
      let posit = proxy.$gcoord.transform(state.posit, proxy.$gcoord.GCJ02, proxy.$gcoord.WGS84);
      state.TmapObj = new T.Map("tmap-container", {
        center: new T.LngLat(posit[0], posit[1]),
        zoom: 13
      });
      var marker = new T.Marker(new T.LngLat(posit[0], posit[1]));
            //向地图上添加标注
      state.TmapObj.addOverLay(marker);
    }

    // 按名称搜索地址
    const placeSearch:any = async () => {
      state.placeList = []
      state.placeActive = ""
      if (state.mapType === "高德") {
        AMapSearch()
      } else if (state.mapType === "腾讯") {
        QMapSearch()
      }
    }

    // 腾讯地图搜索
    const QMapSearch:any = async () => {
      let urlParameter:String = `boundary=region(${targetRegion.areaName},1)&keyword=${state.placeNameVal}`
      let res = await proxy.$ajaxRequest({
        url: "qqMap/ws/place/v1/search?page_size=20&page_index=1&key=请填写密钥" + urlParameter, // 请求地址
        method: "GET"
      });
      if (res && res.data && res.data.length > 0) {
        state.placeList = res.data.map((item:any) => {
          item.name = item.title
          return item
        })
      }
    }

    // 高德地图搜索
    const AMapSearch:any = async () => {
      AMap.plugin('AMap.PlaceSearch', function(){
        let placeSearch = new AMap.PlaceSearch({
          pageIndex: 1,
          pageSize: 20,
          city: targetRegion.areaName
        });
        placeSearch.search(state.placeNameVal, function(status:any, result:any) {
          if (result && result.poiList && result.poiList.pois) {
            state.placeList = result.poiList.pois
          }
        })
      })
    }

    // 选择地址
    const placeClick:any = (res: any) => {
      state.placeActive = res.id
      state.logOrLatVal = `${res.location.lng},${res.location.lat}`
      if (state.mapType === "腾讯") {
        let posit:any = new qq.maps.LatLng(res.location.lat, res.location.lng)
        state.QmapObj.panTo(posit)
        state.QMapMarker.setPosition(posit);
      } else if (state.mapType === "高德") {
        let posit:any = [res.location.lng, res.location.lat]
        state.AmapObj.panTo(posit)
        state.AMapMarker.setPosition(posit);
      }
    }

    // 确定选择
    const confirmPosit:any = () => {
      let posit = proxy.$gcoord.transform(state.logOrLatVal.split(','), proxy.$gcoord.GCJ02, proxy.$gcoord.WGS84);
      proxy.$emit('confirmPosit', posit)
    }

    // 取消
    const closePosit:any = () => {
      proxy.$emit('closePosit')
    }

    return {
      ...toRefs(state),
      confirmPosit,
      closePosit,
      placeSearch,
      placeClick,
      mapTypeChange
    }
  }
})
</script>
<style lang="stylus">
  @import './index.styl'
</style>