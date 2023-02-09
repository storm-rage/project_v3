<template lang="pug">
.pic-manage-container
    .choose-box
        el-radio-group(v-model="radio" @change="getData")
            el-radio(label="1") VR
            el-radio(label="2") 实景
    .tab-box
        el-table(:data="tabData", stripe, border, height="100%", :header-cell-style="{background:'#eef5ff'}")
            el-table-column(:label="ptype")
                template(#default="scope")
                    span.table-ellipsis(:title="scope.row.massifName") {{scope.row.massifName}}
            el-table-column(:label="name")
                template(#default="scope")
                    span.table-ellipsis(:title="scope.row.PicName") {{scope.row.PicName}}
            el-table-column(property="sort", label="显示顺序", width="100")
            el-table-column(label="操作", width="270")
                template(#default="scope") 
                    el-button(type="primary" plain size="medium" @click="upperTab(scope.row)") 上移
                    el-button(type="primary" plain size="medium" @click="lowerTab(scope.row)") 下移
                    el-button(type="danger" plain size="medium" @click="deleteTab(scope.row)") 移除
    .pic-box
        el-upload(
            name="fileName" 
            :auto-upload="true"
            :multiple="true"
            :headers="{Authorization: userToken, cityKey: cityKey}"
            action="/api/admin/file/uploadFile"
            accept="image/*"
            list-type="picture-card"
            :file-list="fileList"
            :before-remove="beforeRemove"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="successFile")
            i.el-icon-plus
        el-dialog(v-model="imgVisible" top="5vh" width="800px" :modal="false")
            img(style="width: 100%;" :src="dialogImageUrl")
    .btn-box
        el-button(@click="closeDrawer") 取消
        el-button(type="primary" @click="formUpdata") 确定
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, getCurrentInstance, toRefs } from 'vue'
import { getDataByKey } from '../../utils/index'
export default defineComponent({
    name: 'picManage',
    props: ['picManageData', 'ptype'],
    setup(props, ctx) {
        const { proxy }:any = getCurrentInstance()
        const state:any = reactive({
            userToken: sessionStorage.getItem('userToken'),
            cityKey: sessionStorage.getItem('cityKey'),
            tabData: [],
            fileList: [],
            delectList: [],
            fileNumber: 0, // 图片上传的数量
            imgVisible: false,
            isUpdata: false, // 是否正在上传
            radio: '1', // 单选VR或实景管理
            name: '',
            dialogImageUrl: ''
        })

        onMounted(() => {
            getData()
        })

        // 查询数据
        const getData:Function = async () => {
            state.tabData = []
            state.fileList = []
            // state.radio === '1' ? state.name = 'VR名称' : state.name = '实景名称'
            // let res = await proxy.$ajaxRequest({
            //     url: ``,
            //     method: 'get'
            // })
            // if(res && res.obj && res.obj.length>0) {
            //     res.obj.sort((a:any,b:any) => { return a.sort - b.sort })
            //     state.tabData = res.obj.map((item:any) => {
            //         item.updataObj = {
            //             fileMap: item.fileMap,
            //             id: item.id,
            //             pname: item.pname,
            //             ptype: state.ptype,
            //             resourceId: props.picManageData.id,
            //             sort: item.sort
            //         }
            //         if (item.coverFile) {
            //             item.coverFile = JSON.parse(item.coverFile)
            //             item.PicName = item.coverFile.name
            //             state.fileList.push(item.coverFile)
            //         }
            //         item.massifName = props.picManageData.name
            //         return item
            //     })
            // }
        }

        // 上移
        const upperTab:any = (data:any) => {
            if (data.sort != 1) {
                let targetIndex = state.tabData.findIndex((item:any) => { return item.id ==  data.id})
                if (targetIndex > -1) {
                    let tabAttr = JSON.parse(JSON.stringify(state.tabData[targetIndex]))
                    state.tabData.splice(targetIndex, 1)
                    state.tabData.splice(targetIndex - 1, 0, tabAttr)
                    state.tabData.map((item:any,index:any) => {
                        item.sort = index+1
                        item.updataObj.sort = index+1
                        return item
                    })
                    let imgAttr = JSON.parse(JSON.stringify(state.fileList[targetIndex]))
                    state.fileList.splice(targetIndex, 1)
                    state.fileList.splice(targetIndex - 1, 0, imgAttr)
                }
            }
        }

        //下移
        const lowerTab:any = (data:any) => {
            if (data.sort != state.tabData.length) {
                let targetIndex = state.tabData.findIndex((item:any) => { return item.id ==  data.id})
                if (targetIndex > -1) {
                    let tabAttr = JSON.parse(JSON.stringify(state.tabData[targetIndex]))
                    state.tabData.splice(targetIndex, 1)
                    state.tabData.splice(targetIndex + 1, 0, tabAttr)
                    state.tabData.map((item:any,index:any) => {
                        item.sort = index+1
                        item.updataObj.sort = index+1
                        return item
                    })
                    let imgAttr = JSON.parse(JSON.stringify(state.fileList[targetIndex]))
                    state.fileList.splice(targetIndex, 1)
                    state.fileList.splice(targetIndex + 1, 0, imgAttr)
                }
            }
        }

        // 移除
        const deleteTab:any = (data:any) => {
            proxy.$confirm(`确认删除：${data.PicName} ?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                if (data.id) {
                    state.delectList.push(data.id)
                }
                let targetIndex = state.tabData.findIndex((item:any) => { return item.coverFile.uid ==  data.coverFile.uid})
                if (targetIndex > -1) {
                    state.tabData.splice(targetIndex, 1)
                    state.fileList.splice(targetIndex, 1)
                    state.tabData.map((item:any,index:any) => {
                        item.sort = index+1
                        item.updataObj.sort = index+1
                        return item
                    })
                }
            }).catch(() => {
            })
        }

        // 确认移除
        const beforeRemove:any = (file:any, fileList:any) => {
            return proxy.$confirm(`确定移除 ${ file.name }？`)
        }

        // 查看图片
        const handlePictureCardPreview:any = (file:any) => {
            state.dialogImageUrl = file.url;
            state.imgVisible = true;
        }

        // 图片上传成功
        const successFile:any = (response:any, file:any, fileList:any) => {
            state.fileList = fileList
            let fileData:any = {}
            if (response && response.obj && response.obj.name) {
                fileData =  {
                name: response.obj.name + '.' + response.obj.suffix,
                id: response.obj.id,
                type: response.obj.type,
                url: response.obj.url
                }
            }
            state.tabData.splice(state.tabData.length, 0, {
                massifName: props.picManageData.name,
                PicName: file.name,
                sort: state.tabData.length + 1,
                coverFile: file,
                updataObj: {
                    fileMap: fileData,
                    pname: fileData.name,
                    ptype: props.ptype,
                    resourceId: props.picManageData.id,
                    sort: state.tabData.length + 1
                }
            })
        }

        // 图片移除
        const handleRemove:any = (file:any, fileList:any) => {
            state.fileList = fileList
            if (file.uid) {
                let targetIndex = state.tabData.findIndex((item:any) => { return item.coverFile.uid ==  file.uid})
                if (state.tabData[targetIndex].id) {
                    state.delectList.push(state.tabData[targetIndex].id)
                }
                state.tabData.splice(targetIndex, 1)
                state.tabData.map((item:any, index:any) => {
                    item.sort = index+1
                    item.updataObj.sort = index+1
                    return item
                })
            }
        }

        // 数据库上删除图片
        const dataDelectSubmit:any = () => {
            // let res = proxy.$ajaxRequest({
            //     url: ``,
            //     method: 'put',
            //     data: state.delectList
            // })
            state.delectList = []
        }

        // 取消
        const closeDrawer:any = () => {
            ctx.emit('toPicDialog', { picDialog: false })
        }

        // 确定
        const formUpdata:any = () => {
            if (state.delectList && state.delectList.length > 0) {
                dataDelectSubmit()
            }
            if (state.fileList.length == 0) {
                ctx.emit('toPicDialog', { picDialog: false })
            } else {
                proxy.$message({
                    message: '保存成功',
                    type: 'success',
                    duration: 1500
                })
                ctx.emit('toPicDialog', { picDialog: false })
                // proxy.$ajaxRequest({
                //     url: state.radio === '1' ? ('') : (''),
                //     method: 'post',
                //     data: getDataByKey(state.tabData, 'updataObj')
                // }).then((res:any) => {
                //     if (res.code === 1) {
                //         proxy.$message({
                //            message: '保存成功',
                //           type: 'success',
                //          duration: 1500
                //         })
                //         ctx.emit('toPicDialog', { picDialog: false })
                //     } else {
                //         proxy.$alert(res.msg || '请联系管理员', '请求失败');
                //     }
                // })
            }
        }
        
        return {
            ...toRefs(state),
            getData,
            closeDrawer,
            formUpdata,
            upperTab,
            lowerTab,
            deleteTab,
            beforeRemove,
            handlePictureCardPreview,
            handleRemove,
            successFile,
            dataDelectSubmit
        }

    },
})

</script>

<style lang="stylus">
  @import './index.styl'
</style>