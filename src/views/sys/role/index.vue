<template lang="pug">
.role-container
  .search-box
    span 角色名称
    el-input(v-model="searchVal" placeholder="请输入搜索内容" @keyup.enter.native="getDataList" clearable)
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
      el-table(
        :data="tabtData", 
        stripe, 
        border, 
        height="100%",
        @select="rowSelect"
        @select-all="rowSelectAll" 
        ref="multipleTable")
        el-table-column(type="selection", width="60")
        el-table-column(label="角色名称", min-width="160")
          template(#default="scope")
            span.table-ellipsis(:title="scope.row.roleName") {{scope.row.roleName}}
        el-table-column(label="备注", min-width="160")
          template(#default="scope")
            span.table-ellipsis(:title="scope.row.remark") {{scope.row.remark}}
        el-table-column(label="创建时间", min-width="160")
          template(#default="scope")
            span.table-ellipsis(:title="scope.row.createTime") {{scope.row.createTime}}
        el-table-column(label="操作", width="320" fixed="right")
          template(#default="scope")
            el-button(type="primary" icon="el-icon-plus" size="small" @click="editClick(scope.row.roleId)") 编辑
            el-button(type="danger" icon="el-icon-delete" size="small" @click="delectTable(scope.row.roleId)") 删除
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
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, onMounted, ref, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import { treeDataTranslate } from '../../../utils'
export default defineComponent({
  name: "roleRun",
  setup() {
    const { proxy }:any = getCurrentInstance();
    const multipleTable:any = ref(null);
    const state:any = reactive({
      editDialog: false, // 编辑弹框
      editId: "", // 编集的列表ID
      searchVal: "", // 搜索名称
      regionVal: "", // 搜索地区
      regionList: JSON.parse(sessionStorage.getItem('regionList') || "[]"), // 地区列表数据
      menuList: [], // 菜单权限列表
      tabtData:[], // 表格列表数据
      pageSize: 10, // 每页显示条数
      pageSizeList: [10, 50, 100, 500, 1000, 10000], // 每页显示条数选择列表
      totalNumber: 0, // 表格总条数
      targetPage: 1, // 当前页码
      multipleSelection: []
    })

    onMounted(() => {
      getMenuDate()
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
      let targetObj = state.multipleSelection.findIndex((item: any) => { return item.roleId == data.roleId })
      if (targetObj > -1) {
        state.multipleSelection.splice(targetObj, 1)
      } else {
        state.multipleSelection.splice(state.multipleSelection.length, 0, data)
      }
    }

    // 列全选
    const rowSelectAll:any = (data:any) => {
      state.tabtData.forEach((item: any) => {
        let targetObj = state.multipleSelection.findIndex((val: any) => { return val.roleId == item.roleId })
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

    // 获取菜单权限列表
    const getMenuDate:any = async () => {
      state.menuList = []
      // let res = await proxy.$ajaxRequest({
      //   url: ``, // 请求地址
      //   method: "get"
      // });
      // if (res && res.length > 0) {
      //   state.menuList = treeDataTranslate(res, 'menuId', 'parentId')
      // }
    }

    // 获取菜单列表数据
    const getDataList:any = async (type: any) => {
      if (type !== "input") {
        state.pageSize = 10
        state.targetPage = 1
      }
      state.tableData = []
      // let res = await proxy.$ajaxRequest({
      //   url: '', // 请求地址
      //   method: "get",
      //   params: {
      //     roleName: state.searchVal,
      //     current: state.targetPage,
      //     size: state.pageSize
      //   }
      // });
      let res:any = null
      if (res && res.records) {
        state.totalNumber = res.total
        state.tabtData = res.records
        proxy.$nextTick(() => {
          if (state.multipleSelection.length > 0) {
            multipleTable.value.toggleRowSelection(state.multipleSelection)
          }
          state.multipleSelection.forEach((item: any) => {
            let targetObj = state.tabtData.findIndex((val: any) => { return val.roleId == item.roleId })
            if (targetObj > -1) {
              multipleTable.value.toggleRowSelection(state.tabtData[targetObj], true)
            }
          })
        })
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

    // 删除
    const delectTable:any = async (id: any) => {
      let landIds = id ? [id] : state.multipleSelection.map((item: any) => { return item.roleId; });
      proxy.$confirm('确定删除选择的项吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
          let res = await proxy.$ajaxRequest({
            url: "/api/sys/role", // 请求地址
            method: "delete",
            data: landIds
          });
          if (!res || !res.error) {
            getDataList("input")
            ElMessage.success('删除成功');
          } else {
            proxy.$alert(res.msg || '删除失败', '请求失败');
          }
      }).catch(() => {});
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
      editClick,
      editClose
    }
  }
})
</script>
<style lang="stylus">
  @import './index.styl'
</style>