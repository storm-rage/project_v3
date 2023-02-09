<template lang="pug">
.land-container(v-loading="loading" element-loading-text="正在查询...")
  .search-box
    span 地块名称
    el-input(v-model="searchVal" placeholder="请输入搜索内容" clearable @keyup.enter.native="getDataList")
    span 所属区域
    el-select(v-model="regionVal" clearable placeholder="请选择")
      el-option(v-for="item in regionList" :key="item.areaId" :label="item.areaName" :value="item.areaId")
    el-button(type="primary" icon="el-icon-search" size="small" @click="getDataList") 搜索
    el-button(icon="el-icon-delete" size="small" @click="emptyInput") 清空
  .control-box
    el-button(type="primary" icon="el-icon-plus" size="small" @click="editClick()") 新增
    el-button(type="danger" icon="el-icon-delete" size="small" :disabled="multipleSelection.length <= 0" @click="delectTable()") 批量删除
  .table-box
    .tips
      span 当前表格已选
      span.number {{multipleSelection.length}}
      span 项
      span.empty(@click="selectEmpty") 清空
    .table
      el-table(:data="tabtData" stripe border height="100%" @select="rowSelect" @select-all="rowSelectAll" ref="multipleTable")
        el-table-column(type="selection", width="60")
        el-table-column(prop="name" label="地块名称", min-width="200" sortable)
          template(#default="scope")
            span.table-ellipsis(:title="scope.row.name") {{scope.row.name}}
        el-table-column(prop="usable" label="可用地情况", min-width="160" sortable)
          template(#default="scope")
            span.table-ellipsis(:title="scope.row.usable") {{scope.row.usable}}
        el-table-column(prop="area" label="面积", width="130" sortable)
          template(#default="scope")
            span.table-ellipsis(:title="scope.row.area") {{scope.row.area}}
        el-table-column(prop="unit" label="单位", width="130" sortable)
          template(#default="scope")
            span.table-ellipsis(:title="scope.row.unit") {{scope.row.unit}}
        el-table-column(prop="areaName" label="所属地区", width="150" sortable)
          template(#default="scope")
            span.table-ellipsis(:title="scope.row.areaName") {{scope.row.areaName}}
        el-table-column(prop="fileUrl" label="封面图", width="130" sortable)
          template(#default="scope")
            img(:src="scope.row.fileUrl" style="max-width: 60px; max-height: 20px" v-if="scope.row.fileUrl")
        el-table-column(prop="longitudeLatitude" label="中心经纬度", width="130" sortable)
          template(#default="scope")
            span.table-ellipsis(:title="scope.row.longitudeLatitude") {{scope.row.longitudeLatitude}}
        el-table-column(label="操作", width="420" fixed="right")
          template(#default="scope")
            el-button(type="primary" icon="el-icon-plus" size="small" @click="editClick(scope.row.id)") 编辑
            el-button(type="primary" plain icon="el-icon-delete" size="small" @click="picManageClick(scope.row)") 图片管理
            el-button(type="success" icon="el-icon-plus" size="small" @click="recommendHandle(scope.row.id, 1)" v-if="scope.row.recommend == 0") 推荐
            el-button(type="warning" icon="el-icon-plus" size="small" @click="recommendHandle(scope.row.id, 0)" v-if="scope.row.recommend == 1") 取消推荐
            el-button(type="danger" icon="el-icon-delete" size="small" @click="delectTable(scope.row.id)") 删除
    .pagination
      el-pagination(
        layout="total, sizes, prev, pager, next, jumper",
        :page-size="pageSize", 
        :page-sizes="pageSizeList",
        :total="totalNumber"
        :current-page="targetPage",
        @size-change="sizeChange"
        @current-change="acurrentChange"
      )
  el-dialog(
    :title="editId ? '修改' : '新增'" 
    top="4vh"
    width="800px"
    custom-class="edit-dialog"
    v-model="editDialog" 
    :close-on-press-escape="false" 
    :destroy-on-close="true" 
    :close-on-click-modal="false")
    CLandEdit(@close="editClose" :editId="editId")
  el-dialog(
    title="VR/实景管理" 
    top="4vh"
    width="1000px"
    v-model="picDialog" 
    :close-on-press-escape="false" 
    :destroy-on-close="true" 
    :close-on-click-modal="false")
    CPicManage(ptype="LAND" :picManageData="picManageData" @toPicDialog="picDialog = false")
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, onMounted, onActivated, ref, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import CLandEdit from './components/c-edit/index.vue'
import CPicManage from '@/components/picManage/index.vue'
export default defineComponent({
  name: 'investment-land',
  components: { CLandEdit, CPicManage },
  setup() {
    const { proxy }:any = getCurrentInstance();
    const multipleTable:any = ref(null);
    const state:any = reactive({
      loading: false,
      editDialog: false, // 编辑弹框
      picDialog: false, // 图片管理弹框
      picManageData: {}, // 图片管理数据
      editId: "", // 编集的列表ID
      searchVal: "", // 搜索名称
      regionVal: "", // 搜索地区
      regionList: JSON.parse(sessionStorage.getItem('regionList') || "[]"), // 地区列表数据
      tabtData:[], // 表格列表数据
      pageSize: 10, // 每页显示条数
      pageSizeList: [10, 50, 100, 500, 1000, 10000], // 每页显示条数选择列表
      totalNumber: 0, // 表格总条数
      targetPage: 1, // 当前页码
      multipleSelection: []
    })

    onMounted(() => {
      getDataList()
    })

    // 清空查询条件
    const emptyInput:any = () => {
      state.searchVal = '';
      state.regionVal = '';
    }

    // 设置每页条数
    const sizeChange:any = (val:any) => {
      state.pageSize = val;
      getDataList("input")
    }

    // 翻页
    const acurrentChange:any = (val:any) => {
      state.targetPage = val;
      getDataList("input")
    }

    // 列单选
    const rowSelect:any = (list: any, data:any) => {
      let targetObj = state.multipleSelection.findIndex((item: any) => { return item.id == data.id })
      if (targetObj > -1) {
        state.multipleSelection.splice(targetObj, 1)
      } else {
        state.multipleSelection.splice(state.multipleSelection.length, 0, data)
      }
    }

    // 列全选
    const rowSelectAll:any = (data:any) => {
      state.tabtData.forEach((item: any) => {
        let targetObj = state.multipleSelection.findIndex((val: any) => { return val.id == item.id })
        if (data.length < 1 && targetObj > -1) {
          state.multipleSelection.splice(targetObj, 1)
        } else if (data.length > 0 && targetObj < 0) {
          state.multipleSelection.splice(state.multipleSelection.length, 0, item)
        }
      })
    }

    // 列选择清空
    const selectEmpty:any = () => {
      state.multipleSelection = []
      multipleTable.value.clearSelection()
    }

    // 查询列表
    const getDataList:any = async (type: any) => {
      if (type !== "input") {
        state.pageSize = 10
        state.targetPage = 1
      }
      state.loading = true
      // let res = await proxy.$ajaxRequest({
      //   url: '', // 请求地址
      //   method: "get",
      //   params: {
      //     areaId: state.regionVal || undefined,
      //     name: state.searchVal,
      //     current: state.targetPage,
      //     size: state.pageSize
      //   }
      // });
      let res:any = {
        total: 1,
        records: [{
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
          usable: "已批回、已拆迁",
        }]
      }
      if (res && res.records) {
        let regionList = JSON.parse(sessionStorage.getItem('regionList') || "[]")
        state.totalNumber = res.total
        state.tabtData = res.records.map((item: any) => {
          let arr = regionList.find((val: any) => { return val.areaId === item.areaId })
          item.areaName = arr ? arr.areaName : ''

          item.fileUrl = item.coverFile ? JSON.parse(item.coverFile).url : ""
          return item
        })
        proxy.$nextTick(() => {
          if (state.multipleSelection.length > 0) {
            multipleTable.value.toggleRowSelection(state.multipleSelection)
          }
          state.multipleSelection.forEach((item: any) => {
            let targetObj = state.tabtData.findIndex((val: any) => { return val.id == item.id })
            if (targetObj > -1) {
              multipleTable.value.toggleRowSelection(state.tabtData[targetObj], true)
            }
          })
          state.loading = false
        })
      } else {
        state.loading = false
        state.totalNumber = 0
        state.tabtData = []
      }
    }

    // 编辑
    const editClick:any = (res:any) => {
      state.editId = res
      state.editDialog = true
    }

    // 编辑完成
    const editClose:any = (res:any) => {
      if (res) {
        getDataList(res)
      }
      state.editDialog = false
    }

    // 图片管理
    const picManageClick:any = (res:any) => {
      state.picManageData = res
      state.picDialog = true
    }

    // 删除
    const delectTable:any = async (id: any) => {
      let landIds = id ? [id] : state.multipleSelection.map((item: any) => { return item.id; });
      proxy.$confirm('确定删除选择的项吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        ElMessage.success('删除成功');
          // let res = await proxy.$ajaxRequest({
          //   url: "", // 请求地址
          //   method: "delete",
          //   data: landIds
          // });
          // if (res && res.code === 1) {
          //   getDataList("input")
          //   ElMessage.success(res.msg || '删除成功');
          // } else {
          //   proxy.$alert(res.msg || '删除失败', '请求失败');
          // }
      }).catch(() => {});
    }

    // 推荐&取消推荐
    const recommendHandle:any = async (id: any, type: any) => {
      ElMessage.success('操作成功');
      // let res = await proxy.$ajaxRequest({
      //   url: "/api/admin/recommend/", // 请求地址
      //   method: "put",
      //   data: {
      //     ids: [id],
      //     recommend: type,
      //     type: 1
      //   }
      // });
      // if (res && res.code === 1) {
      //   getDataList("input")
      //   ElMessage.success(res.msg || '操作成功');
      // } else {
      //   proxy.$alert(res.msg || '操作失败', '请求失败');
      // }
    }

    return {
      ...toRefs(state),
      multipleTable,
      getDataList,
      emptyInput,
      sizeChange,
      acurrentChange,
      rowSelect,
      rowSelectAll,
      selectEmpty,
      delectTable,
      recommendHandle,
      editClick,
      editClose,
      picManageClick
    }
  }
})
</script>
<style lang="stylus">
  @import './index.styl'
</style>