<template lang="pug">
.map-screenshot-container
  .screenshot-head
    .head-text 选取封面图
    .radio-box
      el-radio-group(v-model="mapType" size="small" @change="mapTypeChange")
        el-radio-button(label="高德" v-if="false")
        el-radio-button(label="腾讯")
        el-radio-button(label="天地图")
      el-radio-group(v-model="layerType" size="small" @change="layerTypeChange")
        el-radio-button(label="矢量")
        el-radio-button(label="卫星")
  .screenshot-main
    div(id="amap" style="width: 100%; height: 100%;" v-show="mapType === '高德'")
    div(id="qmap" style="width: 100%; height: 100%;" v-show="mapType === '腾讯'")
    div(id="tmap" style="width: 100%; height: 100%;" v-show="mapType === '天地图'")
  .screenshot-btn(ref="textContainer")
    .tips 请手动截图至粘贴板后，按 ctrl + V 贴入封面图。
    input(class="screenshot-input" ref="myInput", @paste="inputPaste" @blur="inputBlur")
    el-button(@click="closeCover") 关闭
    el-button(type="primary" @click="interceptCover" v-show="mapType === '高德'") 截取
</template>
<script lang="ts">
declare const AMap: any;
declare const T: any;
declare const qq: any;
import { defineComponent, getCurrentInstance, reactive, onMounted, ref, toRefs } from 'vue'
export default defineComponent({
  name: 'mapScreenshot',
  props: ['contourPoints', 'imgName', 'points'],
  setup(props) {
    const { proxy }:any = getCurrentInstance();
    const myInput:any = ref(null)
    const state:any = reactive({
      isClose: false,
      AmapObj: null, // 高德地图对象
      QmapObj: null, // 腾讯地图对象
      TmapObj: null, // 天地图对象
      mapType: "腾讯", // 当前地图
      layerType: "卫星", // 当初图层类型
      posit: [116.40969, 39.89945] // 初始定位
    })
    onMounted(() => {
      proxy.$nextTick(() => {
        myInput.value.focus();
      })
      if (props.points && typeof props.points === "string" && props.points.indexOf(',') > -1) {
        state.posit = props.points.split(','); 
      } else {
        let location = JSON.parse(sessionStorage.getItem('regionList') || '[]')
        let attr = location.find((item: any) => { return item.level === 1 })
        if (attr && attr.longitudeLatitude) {
            state.posit = attr.longitudeLatitude.split(','); 
        }
      }
      // QMapInit() // 腾讯地图
    })

    // 高德地图初始化
    const AMapInit = () => {
      state.AmapObj = new AMap.Map('amap', {
        zoom: 13,//级别
        center: state.posit,//中心点坐标
        layers: [new AMap.TileLayer.Satellite()],
        // viewMode: '3D' //使用3D视图
      });

      if (props.contourPoints && props.contourPoints.indexOf('[') > -1) {
        let attr = JSON.parse(props.contourPoints)
        attr.forEach((item:any) => {
          let latList:any = []
          item.map((item:any) => {
            let posit = proxy.$gcoord.transform([ item.logi, item.lati ], proxy.$gcoord.WGS84, proxy.$gcoord.GCJ02);
            latList.push(posit)
          })
          var hole = new AMap.Polygon({
              path: latList,
              strokeColor: 'red',
              strokeWeight: 2,
              fillOpacity: 0
          });
          state.AmapObj.add(hole);
        })
        proxy.$nextTick(() => {
          state.AmapObj.setFitView();
        })
      }
    }

    // 腾讯地图初始化
    const QMapInit = () => {
      state.QmapObj = new qq.maps.Map("qmap", {
          center: new qq.maps.LatLng(state.posit[1], state.posit[0]),
          zoom: 13,
          disableDefaultUI: true,
          viewMode: '3D', //使用3D视图
          mapTypeId: state.layerType === "卫星" ? qq.maps.MapTypeId.HYBRID : qq.maps.MapTypeId.ROADMAP
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
    }

    // 天地图初始化
    const TMapInit = () => {
      state.TmapObj = new T.Map("tmap", {
        datasourcesControl: true
      });
      state.TmapObj.centerAndZoom(new T.LngLat(state.posit[0], state.posit[1]), 10);
      if (props.contourPoints && props.contourPoints.indexOf('[') > -1) {
        let attr:any = JSON.parse(props.contourPoints)
        let viewport:any = []
        attr.forEach((item:any) => {
          let latList:any = []
          item.map((item:any) => {
            let posit:any = new T.LngLat(item.logi, item.lati)
            viewport.push(posit)
            latList.push(posit)
          })
          let hole:any = new T.Polygon(latList, {
            color: '#ff0000',
            opacity: 1,
            weight: 4,
            fillOpacity: 0
          });
          state.TmapObj.addOverLay(hole);
        })
        proxy.$nextTick(() => {
          state.TmapObj.setViewport(viewport);
        })
      }
      if (state.layerType === "卫星") {
        // @ts-ignore：处理TS报错
        state.TmapObj.setMapType(TMAP_HYBRID_MAP)
      }
    }

    // 地图切换
    const mapTypeChange = () => {
      if (state.mapType === "高德") {
        if (!state.AmapObj) {
            AMapInit()
        }
      } else if (state.mapType === "天地图") {
        if (!state.TmapObj) {
            TMapInit()
        }
      } else if (state.mapType === "腾讯") {
        if (!state.QmapObj) {
          QMapInit()
        }
      }
    }

    // 图形切换
    const layerTypeChange = (res: any) => {
      if (res === "矢量") {
          if (state.AmapObj) {
            state.AmapObj.setLayers([new AMap.TileLayer]);
          }
          if (state.QmapObj) {
            state.QmapObj.setMapTypeId(qq.maps.MapTypeId.ROADMAP);
          }
          if (state.TmapObj) {
            // @ts-ignore：处理TS报错
            state.TmapObj.setMapType(TMAP_NORMAL_MAP);
          }
      } else {
          if (state.AmapObj) {
            state.AmapObj.setLayers([new AMap.TileLayer.Satellite()]);
          }
          if (state.QmapObj) {
            state.QmapObj.setMapTypeId(qq.maps.MapTypeId.HYBRID);
          }
          if (state.TmapObj) {
            // @ts-ignore：处理TS报错
            state.TmapObj.setMapType(TMAP_HYBRID_MAP);
          }
      }
    }

    // 截图
    const interceptCover = () => {
      state.isClose = true
      let canvas:any = document.querySelector("#amap canvas");
      if (canvas) {
        let blobObj:any = convertBase64UrlToBlob(canvas.toDataURL('image/png'))
        let newfile:any = new window.File([blobObj], state.imgName + '.png', { type: blobObj.type })
        newfile.uid = Date.now()
        proxy.$emit('interceptCover', newfile)
      } else {
        proxy.$emit('close')
        proxy.$alert('截取失败，请重试。', '操作失败');
      }

      // html2canvas(document.querySelector("#tmap"), {
      //     useCORS : true,
      //     foreignObjectRendering: false,
      //     allowTaint: true
      // }).then(function(canvas: any) {
      //     let blobObj = convertBase64UrlToBlob(canvas.toDataURL('image/png'))
      //     let newfile = new window.File([blobObj], state.imgName + '.png', { type: blobObj.type })
      //     console.log(window.URL.createObjectURL(newfile))
      // }).catch(function() {
      //     proxy.$emit('close')
      //     proxy.$alert('截取失败，请重试。', '操作失败');
      // });
    }

    // 关闭
    const closeCover = () => {
      state.isClose = true
      proxy.$emit('closeScreenshot')
    }

    // base64转blob
    const convertBase64UrlToBlob = (dataurl: any) => {
      const bytes = window.atob(dataurl.split(',')[1]) // 去掉url的头，并转换为byte
      // 处理异常,将ascii码小于0的转换为大于0
      const ab = new ArrayBuffer(bytes.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < bytes.length; i++) {
          ia[i] = bytes.charCodeAt(i)
      }
      return new Blob([ab], { type: 'image/png' })
    }

    const inputBlur = () => {
      if (!state.isClose) {
        myInput.value.focus();
      }
    }

    const inputPaste = (e: any) => {
      if (!(e.clipboardData && e.clipboardData.items)) {
          return ;
      }
      let pasteFile = null
      for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
          var item = e.clipboardData.items[i];
          if (item.kind === "file") {
              pasteFile = item.getAsFile();
          }
      }
      if (pasteFile) {
          var reader = new FileReader()
          reader.onload = function (event: any) {
            state.isClose = true
            let blobObj:any = convertBase64UrlToBlob(event.target.result)
            let newfile:any = new window.File([blobObj], props.imgName + '.png', { type: blobObj.type })
            newfile.uid = Date.now()
            proxy.$emit('interceptCover', newfile)
          }
          reader.readAsDataURL(pasteFile)
      } else {
          alert("没有获取到截图数据")
      }
    }

    return {
      ...toRefs(state),
      myInput,
      layerTypeChange,
      inputBlur,
      interceptCover,
      inputPaste,
      closeCover,
      mapTypeChange
    }
  }
})
</script>
<style lang="stylus">
  @import './index.styl'
</style>