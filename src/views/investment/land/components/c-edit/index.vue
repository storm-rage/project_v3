<template lang="pug">
.c-land-edit-container(v-loading="loading" element-loading-text="拼命加载中...")
  .form-box
    el-form(:model="dataForm" :rules="rules" ref="formRef" label-position="right" label-width="100px")
      el-form-item(label="地块名称" prop="name")
        el-input(v-model="dataForm.name")
      el-form-item(label="封面图" prop="coverFile")
        el-upload(
          name="fileName"
          ref="uploadRef"
          class="coverFile-uploader"
          accept="image/*"
          :show-file-list="false"
          :auto-upload="false"
          :multiple="false"
          :file-list="fileList"
          action="请填入文件上传地址"
          :headers="{Authorization: userToken, cityKey: cityKey}"
          :on-change="changeFile"
          :on-success="successFile"
          :on-error="errorFile")
          i(v-if="!dataForm.imgUrl" class="el-icon-plus")
          img(v-if="dataForm.imgUrl"  :src="dataForm.imgUrl")
        el-button(type="primary" class="select-cover-map" @click="screenshotDialog = true") 选取封面图
      el-form-item(label="用途" prop="purpose")
        el-select(v-model="dataForm.purpose" placeholder="请选择用途")
          el-option(v-for="item in purposeList" :key="item.identify" :label="item.content" :value="item.identify")
      el-form-item(label="面积" prop="area")
        el-input(v-model="dataForm.area")
      el-form-item(label="已供面积" prop="suppliedarea")
        el-input(v-model="dataForm.suppliedarea")
      el-form-item(label="面积单位" prop="unit")
        el-select(v-model="dataForm.unit" placeholder="请选择面积单位")
          el-option(v-for="item in unitList" :key="item.identify" :label="item.content" :value="item.content")
      el-form-item(label="批准日期" prop="approvalDate")
        el-date-picker(v-model="dataForm.approvalDate" type="date" placeholder="选择日期" format="YYYY-MM-DD" :editable="false" @change="pickerChange")
      el-form-item(label="所属地区" prop="areaId")
        el-popover(:visible="regionVisible" width="600px" trigger="click")
          template(#reference)
            el-input(
              readonly 
              v-model="dataForm.areaName" 
              placeholder="请选择所属区域" 
              suffix-icon="el-icon-arrow-down" 
              @click="regionVisible = !regionVisible"
               @blur="regionVisible = false")
          .region-tree
            el-tree(:data="regionList" :props="defaultProps" @node-click="handleNodeClick" :default-expand-all="true" :expand-on-click-node="false")
      el-form-item(label="可用地情况" prop="usable")
        el-input(v-model="dataForm.usable")
      el-form-item(label="联系人" prop="contactPeople")
        el-input(v-model="dataForm.contactPeople")
      el-form-item(label="联系号码" prop="contactPhone")
        el-input(v-model="dataForm.contactPhone")
      el-form-item(label="地址" prop="address")
        el-input(v-model="dataForm.address")
      el-form-item(label="产业" prop="industry")
        el-select(v-model="dataForm.industry" placeholder="请选择产业")
          el-option(v-for="item in industryList" :key="item.identify" :label="item.content" :value="item.identify")
      el-form-item(label="中心经纬度" prop="longitudeLatitude")
        el-input(v-model="dataForm.longitudeLatitude" readonly placeholder="请输入经纬度" style="width:75%; margin-right: 10px;")
        el-button(type="primary" @click="positDialog = true") 选取经纬度
      el-form-item(label="轮廓经纬度" prop="contourPoints")
        el-input(v-model="dataForm.contourPoints" type="textarea" :rows="8" placeholder="请输入经纬度")
  .btn-box
    el-button(@click="closeEdit") 取消
    el-button(type="primary" @click="formUpdata") 确定
  el-dialog(
    title="选取坐标点"
    custom-class="map-servce-dialog" 
    top="2vh"
    v-model="positDialog" 
    :close-on-press-escape="false" 
    :destroy-on-close="true" 
    :close-on-click-modal="false")
    mapServce(@closePosit="closePosit" @confirmPosit="confirmPosit" :lonLatPosit="dataForm.longitudeLatitude" :contourPoints="dataForm.contourPoints")
  el-dialog(
    custom-class="land-screenshot-dialog" 
    :show-close="false"
    top="2vh"
    v-model="screenshotDialog" 
    :close-on-press-escape="false" 
    :destroy-on-close="true" 
    :close-on-click-modal="false")
    mapScreenshot(@closeScreenshot="screenshotDialog = false" @interceptCover="confirmScreenshot" :contourPoints="dataForm.contourPoints" :points="dataForm.longitudeLatitude" :imgName="dataForm.name")
</template>
<script lang="ts">
import mapServce from '@/components/mapServce/index.vue'
import mapScreenshot from '@/components/mapScreenshot/index.vue'
import { defineComponent, getCurrentInstance, reactive, onMounted, ref, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import { treeDataTranslate } from '../../../../../utils'
export default defineComponent({
  name: 'editLand',
  props: ['editId'],
  components: { mapServce, mapScreenshot },
  setup(props) {
    const { proxy }:any = getCurrentInstance();
    const formRef:any = ref(null);
    const uploadRef:any = ref(null);
    const dictionary: any = JSON.parse(sessionStorage.getItem('dictionaryList') || "[]")
    const regionData: any = JSON.parse(sessionStorage.getItem('regionList') || "[]")
    const state:any = reactive({
      loading: false,
      positDialog: false,
      userToken: sessionStorage.getItem('userToken'),
      cityKey: sessionStorage.getItem('cityKey'),
      screenshotDialog: false, // 地图截图弹框
      regionVisible: false, // 所属地区选择框
      regionList: treeDataTranslate(regionData, 'areaId', 'parentId'), // 地区列表
      industryList: dictionary.filter((item: any) => { return item.attriuteCode === 'INDUSTRY' }), // 产业列表
      purposeList: dictionary.filter((item: any) => { return item.attriuteCode === 'LANDUSE' }), // 土地用途列表
      unitList: dictionary.filter((item: any) => { return item.attriuteCode === 'AREAUNIT' }), // 面积单位列表
      mapCoordinateList: dictionary.filter((item: any) => { return item.attriuteCode === 'COORDINATETYPE' }), // 坐标系类型列表
      dataForm: {
        name: "", // 土地名称
        coverFile: "", // 封面图
        imgUrl: "", // 封面图路径
        purpose: "", // 土地用途
        area: "", // 面积
        suppliedarea: "", // 已供面积
        unit: "", // 面积单位
        approvalDate: "", // 批准日期
        areaId: "", // 所属地区ID
        areaName: "", // 所属地区名称
        usable: "", // 可用地情况
        contactPeople: "", // 联系人
        contactPhone: "", // 联系电话
        address: "", // 地址
        industry: "", // 产业类型
        contourPoints: "", // 轮廓经纬度
        longitudeLatitude: "" // 经纬度
      }, // 表单数据对象
      rules: {
        name: [{ required: true, message: '请输入地块名称', trigger: 'blur' }],
        areaId: [{ required: true, message: '请选择所属区域', trigger: 'blur' }],
        region: [{ required: true, message: '请输入所属地区', trigger: 'blur' }],
        usable: [{ required: true, message: '请输入可用地情况', trigger: 'blur' }]
      }, // 表单验证项
      defaultProps: {
        children: 'children',
        label: 'areaName'
      }, // 树结构
      fileList: [] // 文件列表
    })
    onMounted(() => {
      if (props.editId) {
        getEditData()
      }
    })

    // 所属地区选择
    const handleNodeClick:any = (data: any) => {
      if (data && data.areaId) {
          state.dataForm.areaId = data.areaId
          state.dataForm.areaName = data.areaName
      } else {
          state.dataForm.areaId = ''
          state.dataForm.areaName = ''
      }
      formRef.value.validateField('areaId')
    }

    // 取消经纬度选择
    const closePosit:any = () => {
      state.positDialog = false
    }

    // 确认经纬度选择
    const confirmPosit:any = (res:any) => {
      state.dataForm.longitudeLatitude = res.join(",")
      state.positDialog = false
    }

    // 取消
    const closeEdit:any = () => {
      proxy.$emit('close')
    }

    // 确定截图
    const confirmScreenshot:any = (res:any) => {
      state.screenshotDialog = false
      let tarFile = {
        name: res.name,
        raw: res,
        size: res.size,
        status: "ready",
        uid: res.uid
      }
      state.fileList = [tarFile]
      if (res) {
          state.dataForm.imgUrl = window.URL.createObjectURL(res);
      } else {
          state.dataForm.imgUrl = ''
      }
    }

    // 表单提交
    const formUpdata:any = () => {
      formRef.value.validate((valid: any) => {
        if (valid) {
          // state.loading = true
          // if (state.fileList.length > 0) {
          //   uploadRef.value.submit();
          // } else {
          //   dataFormSubmit()
          // }
          dataFormSubmit()
        }
      })
    }

    // 选中图片
    const changeFile:any = (file: any) => {
      state.fileList = [file]
      if (file && file.raw) {
          state.dataForm.imgUrl = window.URL.createObjectURL(file.raw);
      } else {
          state.dataForm.imgUrl = ''
      }
    }

    // 图片上传成功
    const successFile:any = (response: any) => {
      let fileData:any = {}
      if (response && response.obj && response.obj.name) {
        fileData =  {
          name: response.obj.name + '.' + response.obj.suffix,
          id: response.obj.id,
          type: response.obj.type,
          url: response.obj.url
        }
        state.dataForm.coverFile = JSON.stringify(fileData)
      } else {
        state.dataForm.coverFile = ""
      }
      dataFormSubmit()
    }

    // 图片上传失败
    const errorFile:any = () => {
      state.dataForm.coverFile = ""
      dataFormSubmit()
    }

    // 保存提交
    const dataFormSubmit:any = async () => {
      if (props.editId) {
        proxy.$emit('close', "input")
      } else {
        proxy.$emit('close', "success")
      }
      ElMessage.success(props.editId ? "修改成功" : "新增成功");
      // let res = await proxy.$ajaxRequest({
      //   url: props.editId ? "" : "", // 请求地址
      //   method: props.editId ? 'put' : 'post',
      //   data: {
      //     'id': props.editId || undefined,
      //     'name': state.dataForm.name,
      //     'purpose': state.dataForm.purpose,
      //     'area': state.dataForm.area,
      //     'suppliedarea': state.dataForm.suppliedarea,
      //     'region': state.dataForm.region,
      //     'areaId': state.dataForm.areaId,
      //     'usable': state.dataForm.usable,
      //     'approvalDate': state.dataForm.approvalDate,
      //     'contactPeople': state.dataForm.contactPeople,
      //     'contactPhone': state.dataForm.contactPhone,
      //     'address': state.dataForm.address,
      //     'industry': state.dataForm.industry,
      //     'unit': state.dataForm.unit,
      //     'recommend': 0,
      //     "longitudeLatitude": state.dataForm.longitudeLatitude,
      //     "contourPoints": state.dataForm.contourPoints,
      //     "coverFile": state.dataForm.coverFile
      //   }
      // });
      // state.loading = false
      // if (res.code === 1) {
      //   if (props.editId) {
      //     proxy.$emit('close', "input")
      //   } else {
      //     proxy.$emit('close', "success")
      //   }
      //   ElMessage.success(res.msg || props.editId ? "修改成功" : "新增成功");
      // } else {
      //   proxy.$alert(res.msg || props.editId ? "修改失败" : "新增失败", '请求失败');
      // }
    }

    // 获取列修改数据
    const getEditData:any = async () => {
      state.loading = true
      // let res = await proxy.$ajaxRequest({
      //   url: ``, // 请求地址
      //   method: "get"
      // });
      state.loading = false
      let res:any = {
        obj: {
          address: "",
          approvalDate: null,
          area: 12,
          areaId: 430104,
          areaName: null,
          areaSum: null,
          contactPeople: "",
          contactPhone: "",
          content: null,
          contourPoints: null,
          coverFile: "",
          id: 117,
          industry: null,
          landStates: null,
          latitude: null,
          longitude: null,
          longitudeLatitude: "",
          longitudeType: null,
          name: "青山铺社区富强路以西物流用地",
          notArea: null,
          purpose: 10003,
          recommend: 0,
          recommendS: "未推荐",
          region: null,
          suppliedarea: 10,
          unit: "",
          usable: "已批回、已拆迁"
        }
      }
      if (res && res.obj) {
        state.dataForm = res.obj
        let targetRegion = regionData.find((item: any) => { return item.areaId == res.obj.areaId })
        state.dataForm.areaName = targetRegion ? targetRegion.areaName : ''
        state.dataForm.industry = res.obj.industry ? parseInt(res.obj.industry) : '';
        state.dataForm.coverFile = res.obj.coverFile;
        state.dataForm.imgUrl = res.obj.coverFile ? JSON.parse(res.obj.coverFile).url : '';
      }
    }

    const pickerChange:any = (res:any) => {
      state.dataForm.approvalDate = proxy.$moment(res).format("YYYY-MM-DD")
    }

    return {
      ...toRefs(state),
      formRef,
      uploadRef,
      changeFile,
      successFile,
      errorFile,
      handleNodeClick,
      closeEdit,
      formUpdata,
      confirmScreenshot,
      pickerChange,
      closePosit,
      confirmPosit
    }
  }
})
</script>
<style lang="stylus">
  @import './index.styl'
</style>
