<template lang="pug">
.c-menu-edit-container(v-loading="loading" element-loading-text="拼命加载中...")
  .form-box
    el-form(:model="dataForm" :rules="rules" ref="formRef" label-position="right" label-width="100px")
      el-form-item(label="类型" prop="type")
        el-radio-group(v-model="dataForm.type")
          el-radio(:label="0") 目录
          el-radio(:label="1") 菜单
      el-form-item(label="菜单名称" prop="name")
        el-input(v-model="dataForm.name" placeholder="菜单名称")
      el-form-item(label="上级菜单" prop="remark")
        el-cascader(:options="menuList" :props="cascaderProps" clearable v-model="selectedMenu" @change="cascaderChange")
      el-form-item(label="菜单路由" prop="url")
        el-input(v-model="dataForm.url" placeholder="菜单路由")
      el-form-item(label="授权标识" prop="perms")
        el-input(v-model="dataForm.perms" placeholder="多个用逗号分隔, 如: user:list,user:create")
      el-form-item(label="排序号" prop="orderNum")
        el-input-number(v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序号")
      el-form-item(label="菜单图标" prop="icon")
        el-input(v-model="dataForm.icon" placeholder="列：icon-menu")
  .btn-box
    el-button(@click="closeEdit") 取消
    el-button(type="primary" @click="formUpdata") 确定
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, onMounted, ref, toRefs } from 'vue'
import { idList } from '../../../../../utils'
import { ElMessage } from 'element-plus'
export default defineComponent({
  name: 'editMenu',
  props: ['editId', 'menuList'],
  setup(props) {
    const { proxy }:any = getCurrentInstance();
    const formRef:any = ref(null);
    const menuTree:any = ref(null);
    const state:any = reactive({
      loading: false,
      selectedMenu: [],
      dataForm: {
        type: 1, // 菜单类型
        name: '', // 菜单名称
        remark: '', // 上级菜单
        parentId: 0,　// 上级菜单ID
        url: '', // 菜单路由
        perms: '', // 授权标识
        orderNum: 0, // 排序号
        icon: '', // 菜单图标
      },
      rules: {
        name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
        url: [{ required: true, message: '请输入菜单路由', trigger: 'blur' }]
      }, // 表单验证项
      cascaderProps: {
        value: 'menuId',
        label: 'name',
        checkStrictly: true
      },
    })

    onMounted(() => {
      if (props.editId) {
        getEditData()
      }
    })

    // 上级菜单选择
    const cascaderChange:any = (res:any) => {
      if (res && res.length > 0) {
        state.dataForm.parentId = res[res.length - 1]
      } else {
        state.dataForm.parentId = 0
      }
    }

    // 表单提交
    const formUpdata:any = () => {
      formRef.value.validate((valid: any) => {
        if (valid) {
          dataFormSubmit()
        }
      })
    }

    // 保存提交
    const dataFormSubmit:any = async () => {
      proxy.$emit('close', "success")
      ElMessage.success(props.editId ? "修改成功" : "新增成功");
      // state.loading = true
      // let res = await proxy.$ajaxRequest({
      //   url: "", // 请求地址
      //   method: props.editId ? 'put' : 'post',
      //   data: {
      //     'menuId': props.editId || undefined,
      //     'type': state.dataForm.type,
      //     'name': state.dataForm.name,
      //     'parentId': state.dataForm.parentId,
      //     'url': state.dataForm.url,
      //     'perms': state.dataForm.perms,
      //     'orderNum': state.dataForm.orderNum,
      //     'icon': state.dataForm.icon
      //   }
      // });
      // state.loading = false
      // if (!res || !res.error) {
      //   proxy.$emit('close', "success")
      //   ElMessage.success(props.editId ? "修改成功" : "新增成功");
      // }
    }

    // 获取列修改数据
    const getEditData:any = async () => {
      // state.loading = true
      // let res = await proxy.$ajaxRequest({
      //   url: ``, // 请求地址
      //   method: "get"
      // });
      // state.loading = false
      // if (res) {
      //   state.dataForm.type = res.type
      //   state.dataForm.name = res.name
      //   state.dataForm.parentId = res.parentId
      //   state.dataForm.url = res.url
      //   state.dataForm.perms = res.perms
      //   state.dataForm.orderNum = res.orderNum
      //   state.dataForm.icon = res.icon
      //   state.selectedMenu = idList(props.menuList, res.parentId, 'menuId', 'children').reverse()
      // } else {
      //   state.selectedMenu = []
      // }
    }

    // 取消
    const closeEdit:any = () => {
      proxy.$emit('close')
    }

    return {
      ...toRefs(state),
      formRef,
      menuTree,
      closeEdit,
      formUpdata,
      cascaderChange
    }
  }
})
</script>
<style lang="stylus">
  @import './index.styl'
</style>