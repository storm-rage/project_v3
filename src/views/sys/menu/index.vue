<template lang="pug">
.menu-container(v-loading="loading" element-loading-text="正在查询...")
  .control-box
    el-button(type="primary" icon="el-icon-plus" size="small"  @click="editClick()") 新增
  .table-box
    el-table(
      :data="tabtData"
      border
      height="100%"
      row-key="menuId")
      el-table-column(prop="name" label="名称" width="160")
      el-table-column(prop="icon" label="图标" min-width="120")
      el-table-column(prop="type" label="类型" min-width="120")
        template(#default="scope")
          el-tag(size="small" v-if="scope.row.type === 0") 目录
          el-tag(type="success" size="small" v-if="scope.row.type === 1") 菜单
          el-tag(type="info" size="small" v-if="scope.row.type === 2") 按钮
      el-table-column(prop="orderNum" label="排序号" min-width="120")
      el-table-column(prop="url" label="菜单URL" min-width="200")
      el-table-column(prop="perms" label="授权标识" min-width="120")
        template(#default="scope")
          span.table-ellipsis(:title="scope.row.perms") {{scope.row.perms}}
      el-table-column(label="操作" width="280" fixed="right")
        template(#default="scope")
          el-button(type="primary" size="medium" @click="editClick(scope.row.menuId)") 修改
          el-button(type="danger" size="medium" @click="delectTable(scope.row.menuId)") 删除
  el-dialog(
    :title="editId ? '修改' : '新增'" 
    top="10vh"
    width="800px"
    v-model="editDialog" 
    :close-on-press-escape="false" 
    :destroy-on-close="true" 
    :close-on-click-modal="false")
    CMenuEdit(@close="editClose" :editId="editId" :menuList="menuList")
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, onMounted, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import CMenuEdit from './components/c-edit/index.vue'
import { treeDataTranslate } from '../../../utils'
export default defineComponent({
  name: "menuRun",
  components: { CMenuEdit },
  setup() {
    const { proxy }:any = getCurrentInstance();
    const state:any = reactive({
      loading: false,
      editDialog: false, // 编辑弹框
      editId: "", // 编集的列表ID
      tabtData: [],
      menuList: []
    })
    onMounted(() => {
      getMenuDate()
      getTableData()
    })

    // 获取菜单权限列表
    const getMenuDate:any = async () => {
      state.menuList = []
      // let res = await proxy.$ajaxRequest({
      //   url: ``, // 请求地址
      //   method: "get"
      // });
      // if (res && res.length > 0) {
      //   state.menuList = treeDataTranslate(res, 'menuId')
      // }
    }

    // 获取菜单列表数据
    const getTableData = async () => {
      state.tabtData = []
      // state.loading = true
      // let res = await proxy.$ajaxRequest({
      //   url: "", // 请求地址
      //   method: "GET"
      // });
      // state.loading = false
      // if (res && res.length > 0) {
      //   state.tabtData = treeDataTranslate(res, 'menuId')
      // } else {
      //   state.tabtData = []
      // }
    }

    // 编辑
    const editClick:any = (res:any) => {
      state.editId = res
      state.editDialog = true
    }

    // 编辑完成
    const editClose:any = (res:any) => {
      if (res) {
        getMenuDate()
        getTableData()
      }
      state.editDialog = false
    }

    // 删除
    const delectTable:any = async (id: any) => {
      proxy.$confirm('确定删除选择的项吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        ElMessage.success('删除成功');
          // let res = await proxy.$ajaxRequest({
          //   url: "/api/sys/menu/" + id, // 请求地址
          //   method: "delete"
          // });
          // if (!res) {
          //   getMenuDate()
          //   getTableData()
          //   ElMessage.success('删除成功');
          // } else {
          //   ElMessage.warning(res);
          // }
      }).catch(() => {});
    }

    return {
      ...toRefs(state),
      editClose,
      editClick,
      delectTable
    }
  }
})
</script>
<style lang="stylus">
  @import './index.styl'
</style>