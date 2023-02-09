<template lang="pug">
.industry-container(v-loading="loading" element-loading-text="正在查询...")
  .industry-head
    el-button(type="primary" size="small" @click="addClass") 新增产业分类
    el-button(type="primary" size="small" plain @click="shrinkAll") 全部收起
  .industry-tab
    el-table(
      ref="multipleTable"
      :data="tableData" 
      :expand-row-keys="expand"
      :row-key="getRowKeys" 
      height="100%"
      stripe
      border
      row-key="id" 
      @expand-change="ecpandChange"
      @row-click="rowSelectClick" 
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}")
      el-table-column(prop="name" label="名称")
      el-table-column(label="操作" width="460")
        template(#default="scope")
          div
            el-button(type="primary" size="medium" @click="editIndustry(scope.row, 'add')") 新增子级
            el-button(type="primary" size="medium" @click="editIndustry(scope.row, 'modify')") 修改
            el-button(type="success" size="medium" v-if="scope.row.parentId !== 0" @click="relationHandle(scope.row)") 关联
            el-button(type="danger" size="medium" v-if="scope.row.parentId !== 0 || !scope.row.children" @click="deleteHandle(scope.row.id)") 删除
  el-dialog(:title="editTitle" :close-on-click-modal="false" v-model="editClassVisible" width="600px")
    el-form(:model="updataClass" :rules="classRule" ref="classForm" label-width="90px")
      el-form-item(label="产业名称" prop="name")
        el-input(placeholder="请输入产业分类" v-model="updataClass.name" clearable)
    .edit-btn
      el-button(@click="editClassVisible = false") 取消
      el-button(type="primary" @click="classSubmit") 确定
  el-dialog(:title="editTitle" :close-on-click-modal="false" v-model="editIndustryVisible")
    el-form(:model="updataIndustry" :rules="IndustryRule" ref="industryForm" label-width="90px")
      el-form-item(label="产业名称" prop="name")
        el-input(placeholder="请输入名称" v-model="updataIndustry.name" clearable)
      el-form-item(label="父级产业" prop="parentName")
        el-input(v-model="updataIndustry.parentName" readonly)
      el-form-item
        el-radio-group(v-model="radio")
          el-radio(:label="3") icon图标
          el-radio(:label="6") 上传图片
          el-radio(:label="9") 其他
      el-form-item(label="图标名称" prop="icoFile" v-if="radio==3") 
        el-input(placeholder="请输入图标名称，来源于iconfont" v-model="updataIndustry.icoFile")
      el-form-item(label="其他" prop="icoFile" v-if="radio==9") 
        el-input(v-model="updataIndustry.icoFile")
      el-form-item(label="产业图标" prop="imgFile" v-if="radio==6")
        el-upload(
          name="fileName"
          ref="uploadRef"
          class="coverFile-uploader"
          accept="image/*"
          :show-file-list="false"
          :auto-upload="false"
          :multiple="false"
          :file-list="fileList"
          action=""
          :headers="{Authorization: userToken, cityKey: cityKey}"
          :on-change="changeFile"
          :on-success="successFile"
          :on-error="errorFile")
          i(v-if="!updataIndustry.imgUrl"  class="el-icon-plus")
          img(v-else :src="updataIndustry.imgUrl")
      el-form-item(label="产业简介" prop="description") 
        el-input(v-model="updataIndustry.description" type="textarea" :rows="8")
    .edit-btn
      el-button(@click="editIndustryVisible = false") 取消
      el-button(type="primary" @click="formUpdata") 确定
  el-drawer(
    size="800px" 
    direction="rtl" 
    v-model="relationVisible" 
    :with-header="false"
    :destroy-on-close="true"
    :close-on-press-escape="false"
    :close-on-click-modal="false")
    CRelation(@close="relationVisible=false" :relationData="relationData")
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, onMounted, ref, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import { treeDataTranslate } from '../../../utils'
export default defineComponent({
  name: 'api-industry-index',
  setup() {
    const { proxy }:any = getCurrentInstance();
    const industryForm:any = ref(null)
    const classForm:any = ref(null)
    const uploadRef:any = ref(null)
    const multipleTable:any = ref(null)
    const state:any = reactive({
      loading: false,
      userToken: sessionStorage.getItem('userToken'),
      cityKey: sessionStorage.getItem('cityKey'),
      radio: 3,
      editClassVisible: false,
      relationVisible: false,
      editIndustryVisible: false,
      editTitle: '新增产业',
      updataClass: {
        id: '',
        name: ''
      },
      classRule: {
        name: [{required: true, message: '请输入产业名称', trigger: 'blur'}]
      },
      updataIndustry: {
        id: '', // ID
        parentName: '', // 父名称
        parentId: '', // 父ID
        name: '', // 名称
        level: '', // 阶级
        icoFile: '', // icon名称
        imgFile: '', // 图片文件
        imgUrl: '', // 图片预览路径
        description: '' // 产业简介
      },
      IndustryRule: {
        name: [{required: true, message: '请输入产业名称', trigger: 'blur'}]
      }, // 表单验证
      editData: null,
      relationData: {},
      tableData: [],
      expand: [],
      fileList: []
    })

    onMounted(() => {
      getDataList()
    })

    // 清空
    const initUpdata:any = () => {
      state.updataIndustry.id = '';
      state.updataIndustry.parentName = '';
      state.updataIndustry.parentId = '';
      state.updataIndustry.name = '';
      state.updataIndustry.level = '';
      state.updataIndustry.icoFile = '';
      state.updataIndustry.imgFile = '';
      state.updataIndustry.description = '';
      state.updataIndustry.imgUrl = '';
    }

    // 新增产业分类
    const addClass:any = () => {
      state.editData = null;
      state.updataClass.id = ''
      state.updataClass.name = ''
      state.editTitle = '新增产业分类';
      state.editClassVisible = true
    }

    // 新增产业
    const editIndustry:any = (data:any, type:any) => {
      initUpdata()
      state.editData = data
      state.editTitle = '修改产业信息';
      if (type === 'add') {
        state.updataIndustry.parentName = data.name;
        state.updataIndustry.parentId = data.id;
        state.updataIndustry.level = data.level + 1;
        state.editIndustryVisible = true
      } else {
        if (data.parentId === 0) {
          state.updataClass.id = data.id
          state.updataClass.name = data.name
          state.editClassVisible = true
        } else {
          state.updataIndustry = data;
          state.editIndustryVisible = true
          if (data.icoFile && data.icoFile.indexOf('{') > -1 && data.icoFile.indexOf('}') > -1) {
            state.radio = 6
            state.updataIndustry.icoFile = "";
            state.updataIndustry.imgFile = data.icoFile;
            state.updataIndustry.imgUrl = JSON.parse(data.icoFile).url;
          } else {
            state.radio = 3
            state.updataIndustry.icoFile = data.icoFile;
          }  
        }
      }
    }

    // 关联管理
    const relationHandle:any = (data:any) => {
      //
    }

    // 删除
    const deleteHandle:any = (id:any) => {
      proxy.$confirm(`确定对进行[删除]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        ElMessage.success('删除成功');
        // let res = await proxy.$ajaxRequest({
        //   url: "" + id, // 请求地址
        //   method: "delete"
        // });
        // if (res && res.code === 1) {
        //   getDataList()
        //   ElMessage.success(res.msg || '删除成功');
        // } else {
        //   proxy.$alert(res.msg || '删除失败', '请求失败');
        // }
      }).catch(() => {
      })
    }

    // 提交产业分类
    const classSubmit:any = () => {
      classForm.value.validate((valid:any) => {
        if (valid) {
          let data:any = {
            name: state.updataClass.name
          }
          if (state.updataClass.id) {
            data.id = state.updataClass.id
            let url = ''
            editSubmit(url, data)
          } else {
            let url = ''
            editSubmit(url, data)
          }
        }
      })
    }

    // 提交子产业
    const industrySubmit:any = () => {
      let data:any = {
          parentId: state.updataIndustry.parentId,
          name: state.updataIndustry.name,
          level: state.updataIndustry.level,
          icoFile: state.radio === 6 ? state.updataIndustry.imgFile : state.updataIndustry.icoFile,
          description: state.updataIndustry.description
      }
      if (state.updataIndustry.id) {
          data.id = state.updataIndustry.id
          let url = ''
          editSubmit(url, data)
      } else {
          let url = ''
          editSubmit(url, data)
      }
    }

    // 编辑产业信息
    const editSubmit:any = async (url:any, parameter:any) => {
      ElMessage.success(parameter.id ? "修改成功" : "新增成功");
      // let res = await proxy.$ajaxRequest({
      //   url: url, // 请求地址
      //   method: "POST",
      //   data: parameter
      // });
      // if (res && res.code === 1) {
      //   getDataList();
      //   state.fileList = []
      //   if (!parameter.id && parameter.parentId) {
      //     state.updataIndustry.name = '';
      //     state.updataIndustry.icoFile = '';
      //     state.updataIndustry.imgFile = '';
      //     state.updataIndustry.imgUrl = '';
      //     state.updataIndustry.description = '';
      //   } else {
      //     state.editClassVisible = false
      //     state.editIndustryVisible = false
      //   }
      //   ElMessage.success(res.msg || parameter.id ? "修改成功" : "新增成功");
      // } else {
      //   proxy.$alert(res.msg || '请联系管理员', '请求失败');
      // }
    }

    // 查询列表
    const getDataList:any = async () => {
      state.tableData = []
      state.loading = true
      // let res = await proxy.$ajaxRequest({
      //   url: "", // 请求地址
      //   method: "get"
      // });
      let res:any = [
        {"id":1,"parentId":0,"name":"产业地图","sort":1,"level":0,"icoFile":""},
        {"id":2,"parentId":1,"name":"汽车","sort":1,"level":1,"icoFile":"icon-qiche","parentName":"产业地图"},
        {"id":3,"parentId":1,"name":"工程机械","sort":1,"level":1,"icoFile":"icon-zhizao","parentName":"产业地图"},
        {"id":4,"parentId":1,"name":"电子信息","sort":1,"level":1,"icoFile":"icon-dianzixinxi","parentName":"产业地图"},
        {"id":5,"parentId":1,"name":"文化创意","sort":1,"level":1,"icoFile":"icon-dashuju","parentName":"产业地图"},
        {"id":6,"parentId":1,"name":"旅游","sort":1,"level":1,"icoFile":"icon-lvyou1","parentName":"产业地图"},
        {"id":7,"parentId":1,"name":"新材料","sort":1,"level":1,"icoFile":"icon-keji2","parentName":"产业地图"},
        {"id":8,"parentId":1,"name":"食品","sort":1,"level":1,"icoFile":"icon-shipin","parentName":"产业地图"}
      ]
      if (res && res.length > 0) {
        state.tableData = treeDataTranslate(res, 'id', 'parentId')
        proxy.$nextTick(() => {
          state.loading = false
          if (state.expand.length < 1) {
            state.tableData.forEach((item:any) => {
              state.expand.push(item.id + '')
            });
          } else {
            res.forEach((item: any) => {
              if (state.expand.indexOf(item.id) > -1) {
                multipleTable.value.toggleRowExpansion(item, true)
              }
            });
          }
        })
      } else {
        state.loading = false
      }
    }

    // 选中图片
    const changeFile:any = (file:any) => {
      state.fileList = [file]
      if (file && file.raw) {
          state.updataIndustry.imgUrl = window.URL.createObjectURL(file.raw);
      } else {
          state.updataIndustry.imgUrl = ''
      }
    }

    // 图片提交
    const formUpdata:any = () => {
      industryForm.value.validate((valid:any) => {
          if (valid) {
              if (state.fileList.length > 0) {
                  uploadRef.value.submit();
              } else {
                  industrySubmit()
              }
          }
      })
      state.editClassVisible = false
    }

    // 图片上传成功
    const successFile:any = (response:any) => {
      let fileData:any = {}
      if (response && response.obj && response.obj.name) {
        fileData =  {
          name: response.obj.name + '.' + response.obj.suffix,
          id: response.obj.id,
          type: response.obj.type,
          url: response.obj.url
        }
        state.updataIndustry.imgFile = JSON.stringify(fileData)
      } else {
        state.updataIndustry.imgFile = ""
      }
      industrySubmit()
    }

    // 图片上传失败
    const errorFile:any = () => {
      state.updataIndustry.imgFile = ""
      industrySubmit()
    }

    // 默认展开
    const getRowKeys:any = (row:any) => {
      return row.id
    }

    // 全部收起
    const shrinkAll:any = () => {
      state.tableData.forEach((item:any) => {
        multipleTable.value.toggleRowExpansion(item, false)
      })
    }

    // 表格列展开收起监听
    const ecpandChange:any = (data:any) => {
      let attrIndex = state.expand.findIndex((item:any) => { return item == data.id })
      if (attrIndex > -1) {
        state.expand.splice(attrIndex, 1)
      } else {
        state.expand.splice(state.expand.length, 0, data.id + '')
      }
    }

    // 点击表格列
    const rowSelectClick:any = (data:any, column:any) => {
      if (column.label === "名称" && data.children) {
        let attrIndex = state.expand.findIndex((item:any) => { return item == data.id })
        if (attrIndex > -1) {
          multipleTable.value.toggleRowExpansion(data, false)
        } else {
          multipleTable.value.toggleRowExpansion(data, true)
        }
      }
    }

    return {
      ...toRefs(state),
      industryForm,
      multipleTable,
      classForm,
      uploadRef,
      getDataList,
      addClass,
      editIndustry,
      relationHandle,
      deleteHandle,
      classSubmit,
      industrySubmit,
      changeFile,
      formUpdata,
      successFile,
      errorFile,
      getRowKeys,
      shrinkAll,
      ecpandChange,
      rowSelectClick
    }
  }
})
</script>
<style lang="stylus">
  @import './index.styl'
</style>