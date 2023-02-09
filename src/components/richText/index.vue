<template lang="pug">
.richText-container
  div(ref="editorElem")
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, onMounted, ref, toRefs, watch } from 'vue'
import E from 'wangeditor'

export default defineComponent({
  name: 'richText',
  props: ['toRichText'],
  setup(props) {
    const { proxy }:any = getCurrentInstance();
    const editorElem:any = ref(null)
    const state: any = reactive({
      editor: null,
      isNew: true
    })

    watch(
      () => props.toRichText,
      (newValues) => {
        if (state.editor && state.isNew) {
          state.isNew = false
          state.editor.txt.html(newValues)
        }
      }
    )

    onMounted(() => {
      state.editor = new E(editorElem.value)
      state.editor.config.zIndex = 20
      state.editor.config.uploadImgShowBase64 = true
      state.editor.config.menus = [
        'head',  // 标题
        'bold',  // 粗体
        'fontSize',  // 字号
        'fontName',  // 字体
        'italic',  // 斜体
        'underline',  // 下划线
        'strikeThrough',  // 删除线
        'foreColor',  // 文字颜色
        'backColor',  // 背景颜色
        'link',  // 插入链接
        'list',  // 列表
        'justify',  // 对齐方式
        'quote',  // 引用
        'image',  // 插入图片
        'table',  // 表格
        'code',  // 插入代码
        'undo',  // 撤销
        'redo'  // 重复
      ]
      state.editor.create()
      if (props.toRichText) {
        state.editor.txt.html(props.toRichText)
      }
      state.editor.config.onchange = (html:any) => {
        proxy.$emit('editorChange', html) // 将内容同步到父组件中
      }
    })

    return {
      ...toRefs(state),
      editorElem
    }
  }
})
</script>