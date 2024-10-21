<template>
  <div style="border: 1px solid #ccc" class="container-box">
    <div class="btn-box">
      <van-button type="primary" plain size="mini" @click="onFinish"
        >小记一下</van-button
      >
    </div>
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 500px; overflow-y: hidden"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, ref, shallowRef, onMounted } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { postImgAPI } from '@/apis/edit'

const mode = ref('simple')
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('<p><br></p>')
// 工具栏配置
const toolbarConfig = {
  toolbarKeys: [
    'todo',
    'blockquote',
    'divider',
    'bulletedList',
    'numberedList',
    'bold',
    'uploadImage',
    'redo',
  ],
}

// 已上传的文件
const imgArray = ref([])

// 文件上传
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    // 图片上传
    uploadImage: {
      server: ' http://localhost:3000/api/v1/edit/img', // 上传路径
      maxFileSize: 2 * 1024 * 1024, // 文件大小
      maxNumberOfFiles: 5, // 最多上传文件数量
      allowedFileTypes: ['image/*'], // 文件类型
      metaWithUrl: false,
      timeout: 5 * 1000,
      async customUpload(file, insertFn) {
        console.log('信息', file)
        const fileName = file.name
        const fd = new FormData()
        fd.append('name', new Date().getTime() + fileName)
        fd.append('file', file)
        const { data } = await postImgAPI(fd)
        insertFn(data.url, data.href)
      },
    },
    // 图片插入
    insertImage: {
      onInsertedImage(imageNode) {
        if (imageNode == null) return
        const { src } = imageNode
        // 将已上传的图片保存下来，在保存编辑器内容之前，使用 editor.getElemsByType('image') 获取当前编辑器的所有图片
        imgArray.value.push(src)
      },
    },
  },
}

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
  // 获取工具栏配置
  // console.log(editor.getAllMenuKeys())
}

// 自定义事件，通知父组件关闭
const emits = defineEmits(['finish'])

// 保存内容
const onFinish = () => {
  emits('finish', valueHtml.value)
  // 清空数据
  valueHtml.value = ''
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style lang="scss" scoped>
.container-box {
  position: relative;
}
.btn-box {
  position: absolute;
  top: 8px;
  right: 7px;
  z-index: 99999;
}
</style>
